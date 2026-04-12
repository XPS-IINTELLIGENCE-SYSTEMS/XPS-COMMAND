import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { job_id, keywords, urls, industry, location, category, destination, mode } = await req.json();

    // If job_id provided, load job config
    let jobConfig = { keywords, urls, industry, location, category, destination, mode };
    
    if (job_id) {
      const job = await base44.entities.ScrapeJob.get(job_id);
      jobConfig = {
        keywords: job.keywords || "",
        urls: job.urls || "",
        industry: job.industry || "",
        location: job.location || "",
        category: job.category || "Company Research",
        destination: job.destination || "Local",
        mode: job.mode || "Single",
      };
      await base44.entities.ScrapeJob.update(job_id, { status: "Running", last_run: new Date().toISOString() });
    }

    // Build query targets from keywords + urls
    const targets = [];
    if (jobConfig.keywords) {
      jobConfig.keywords.split(",").forEach(kw => {
        const keyword = kw.trim();
        if (keyword) {
          let q = keyword;
          if (jobConfig.industry) q += ` ${jobConfig.industry}`;
          if (jobConfig.location) q += ` ${jobConfig.location}`;
          targets.push({ query: q, url: null });
        }
      });
    }
    if (jobConfig.urls) {
      jobConfig.urls.split(",").forEach(u => {
        const url = u.trim();
        if (url) targets.push({ query: null, url });
      });
    }

    if (!targets.length) {
      if (job_id) await base44.entities.ScrapeJob.update(job_id, { status: "Failed" });
      return Response.json({ error: "No targets to scrape" }, { status: 400 });
    }

    const results = [];

    for (const target of targets) {
      try {
        // Create research record
        const research = await base44.entities.ResearchResult.create({
          query: target.query || target.url,
          source_url: target.url || "",
          category: jobConfig.category || "Company Research",
          status: "Scraping",
          stored_to: jobConfig.destination || "Local",
          tags: [jobConfig.industry, jobConfig.location, jobConfig.destination].filter(Boolean).join(", "),
        });

        // Scrape with AI + web context
        const scrapeResult = await base44.integrations.Core.InvokeLLM({
          prompt: `You are a web scraping specialist for Xtreme Polishing Systems (epoxy flooring company).

Research target: "${target.query || target.url}"
${target.url ? `URL: ${target.url}` : ''}
${jobConfig.industry ? `Industry focus: ${jobConfig.industry}` : ''}
${jobConfig.location ? `Location focus: ${jobConfig.location}` : ''}

Extract ALL useful business data: company info, contacts, emails, phones, services, pricing, reviews, square footage estimates, recent projects, decision makers, facility types.
Be extremely thorough.`,
          add_context_from_internet: true,
          model: "gemini_3_flash",
          response_json_schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              source_url: { type: "string" },
              raw_content: { type: "string" },
              key_facts: { type: "array", items: { type: "string" } },
              contacts_found: { type: "array", items: { type: "object", properties: { name: { type: "string" }, title: { type: "string" }, email: { type: "string" }, phone: { type: "string" } } } },
              pricing_data: { type: "string" },
              opportunities: { type: "array", items: { type: "string" } },
              lead_score: { type: "number" },
              estimated_sqft: { type: "string" },
              facility_type: { type: "string" }
            }
          }
        });

        // Analyze
        const analysis = await base44.integrations.Core.InvokeLLM({
          prompt: `Analyze this scraped data for an epoxy flooring sales team. Be concise and actionable.
Data: ${JSON.stringify(scrapeResult)}
Destination: ${jobConfig.destination}

Provide executive summary, key insights, and recommended actions.`,
          response_json_schema: {
            type: "object",
            properties: {
              summary: { type: "string" },
              insights: { type: "string" },
              tags: { type: "array", items: { type: "string" } }
            }
          }
        });

        // Update result
        await base44.entities.ResearchResult.update(research.id, {
          status: "Complete",
          title: scrapeResult.title || target.query || target.url,
          source_url: scrapeResult.source_url || target.url || "",
          raw_content: scrapeResult.raw_content || "",
          key_data_points: JSON.stringify({
            key_facts: scrapeResult.key_facts || [],
            contacts_found: scrapeResult.contacts_found || [],
            pricing_data: scrapeResult.pricing_data || "",
            opportunities: scrapeResult.opportunities || [],
            lead_score: scrapeResult.lead_score,
            estimated_sqft: scrapeResult.estimated_sqft,
            facility_type: scrapeResult.facility_type,
          }),
          ai_summary: analysis.summary || "",
          ai_insights: analysis.insights || "",
          tags: (analysis.tags || []).join(", "),
          stored_to: jobConfig.destination,
        });

        // If destination is Stage or HubSpot Ready, auto-create lead
        if (["Stage", "HubSpot Ready"].includes(jobConfig.destination) && scrapeResult.contacts_found?.length) {
          const contact = scrapeResult.contacts_found[0];
          await base44.entities.Lead.create({
            company: scrapeResult.title || target.query || "",
            contact_name: contact.name || "Unknown",
            email: contact.email || "",
            phone: contact.phone || "",
            vertical: scrapeResult.facility_type || "Other",
            location: jobConfig.location || "",
            square_footage: parseInt(scrapeResult.estimated_sqft) || 0,
            score: scrapeResult.lead_score || 50,
            stage: jobConfig.destination === "HubSpot Ready" ? "Qualified" : "New",
            source: "Shadow Scraper",
            ai_insight: analysis.summary || "",
          });
        }

        results.push({ id: research.id, title: scrapeResult.title, status: "Complete" });
      } catch (err) {
        results.push({ query: target.query || target.url, status: "Failed", error: err.message });
      }
    }

    // Update job if applicable
    if (job_id) {
      const job = await base44.entities.ScrapeJob.get(job_id);
      await base44.entities.ScrapeJob.update(job_id, {
        status: job.schedule === "Manual" ? "Completed" : "Scheduled",
        run_count: (job.run_count || 0) + 1,
        results_count: (job.results_count || 0) + results.filter(r => r.status === "Complete").length,
      });
    }

    return Response.json({
      success: true,
      total: targets.length,
      completed: results.filter(r => r.status === "Complete").length,
      failed: results.filter(r => r.status === "Failed").length,
      results,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});