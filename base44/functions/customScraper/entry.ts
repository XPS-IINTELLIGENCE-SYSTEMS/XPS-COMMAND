import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const {
      jobId,
      keywords = "epoxy flooring, concrete polishing",
      state = "AZ",
      city = "",
      count = 10,
      industry = "",
      category = "Lead Research",
      urls = "",
    } = body;

    const leadCount = Math.min(parseInt(count) || 10, 50);
    const location = city ? `${city}, ${state}` : state;

    // Build dynamic prompt based on user's configuration
    const scrapeResult = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an advanced lead generation engine for XPS Xtreme Polishing Systems.

TASK: Find ${leadCount} real business leads matching these criteria:

KEYWORDS: ${keywords}
LOCATION: ${location} (state: ${state}${city ? `, city: ${city}` : ""})
INDUSTRY FOCUS: ${industry || "Epoxy flooring, concrete polishing, decorative coatings, general contractors"}
RESEARCH CATEGORY: ${category}
${urls ? `TARGET URLS TO CHECK: ${urls}` : ""}

## WHAT TO FIND:
- Real businesses that match the keywords and location
- Contractors, operators, and service providers in the specified industry
- Prioritize newer businesses (0-5 years), small teams (1-15 employees)
- Include contact details when available

## FOR EACH LEAD PROVIDE:
- company: Exact business name
- contact_name: Owner or key person name
- email: Business email if findable
- phone: Business phone
- website: Company website URL
- city: City name
- state: State abbreviation
- zip: ZIP code
- employee_count: Estimated employees
- existing_material: What products/materials they use
- equipment_used: What equipment they use
- years_in_business: How long in business
- vertical: Industry vertical
- source: Where you found them
- ai_insight: Why this is a good lead for XPS
- estimated_value: Estimated deal value in dollars (0 if unknown)
- score: Lead quality score 0-100`,
      add_context_from_internet: true,
      model: "gemini_3_flash",
      response_json_schema: {
        type: "object",
        properties: {
          leads: {
            type: "array",
            items: {
              type: "object",
              properties: {
                company: { type: "string" },
                contact_name: { type: "string" },
                email: { type: "string" },
                phone: { type: "string" },
                website: { type: "string" },
                city: { type: "string" },
                state: { type: "string" },
                zip: { type: "string" },
                employee_count: { type: "number" },
                existing_material: { type: "string" },
                equipment_used: { type: "string" },
                years_in_business: { type: "number" },
                vertical: { type: "string" },
                source: { type: "string" },
                ai_insight: { type: "string" },
                estimated_value: { type: "number" },
                score: { type: "number" }
              }
            }
          }
        }
      }
    });

    const leads = scrapeResult.leads || [];
    const created = [];

    for (const lead of leads) {
      const record = await base44.asServiceRole.entities.Lead.create({
        company: lead.company || "Unknown",
        contact_name: lead.contact_name || "",
        email: lead.email || "",
        phone: lead.phone || "",
        website: lead.website || "",
        vertical: lead.vertical || industry || "Other",
        city: lead.city || city || "",
        state: lead.state || state,
        zip: lead.zip || "",
        location: `${lead.city || city || ""}, ${lead.state || state}`,
        employee_count: lead.employee_count || 0,
        existing_material: lead.existing_material || "",
        equipment_used: lead.equipment_used || "",
        years_in_business: lead.years_in_business || 0,
        score: Math.min(lead.score || 50, 100),
        priority: lead.score >= 80 ? 9 : lead.score >= 60 ? 7 : 5,
        estimated_value: lead.estimated_value || 0,
        lead_type: "XPress",
        stage: "Incoming",
        pipeline_status: "Incoming",
        ingestion_source: "Scraper",
        source: lead.source || "Custom Scraper",
        ai_insight: lead.ai_insight || "",
        notes: `Custom scraper | ${keywords} | ${location} | ${new Date().toISOString().split("T")[0]}`
      });
      created.push({ id: record.id, company: lead.company, score: lead.score });
    }

    // Update the ScrapeJob record if jobId provided
    if (jobId) {
      try {
        const existing = await base44.asServiceRole.entities.ScrapeJob.filter({ id: jobId });
        if (existing.length > 0) {
          const job = existing[0];
          await base44.asServiceRole.entities.ScrapeJob.update(jobId, {
            status: "Completed",
            last_run: new Date().toISOString(),
            run_count: (job.run_count || 0) + 1,
            results_count: created.length,
          });
        }
      } catch (e) {
        // Non-critical, continue
      }
    }

    return Response.json({
      success: true,
      leads_created: created.length,
      leads: created.sort((a, b) => (b.score || 0) - (a.score || 0)),
      query: { keywords, state, city, industry, count: leadCount }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});