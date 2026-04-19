import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Shadow Browser — monitors competitor websites for pricing/content changes.
 * Uses the internal ScrapeJob scheduling system (category="Competitor Intel").
 *
 * Actions:
 *  - scan_competitor: run a single competitor scan
 *  - run_scheduled:   run all due Shadow Browser ScrapeJobs
 *  - schedule:        create or update a Shadow Browser ScrapeJob
 *  - list_schedules:  list all Shadow Browser ScrapeJobs
 *  - history:         get recent CompetitorIntelligence entries
 */

async function scanCompetitor(base44, competitorName, websiteUrl, scrapeJobId) {
  // 1. Get previous snapshot (most recent scan for this URL)
  const previousScans = await base44.asServiceRole.entities.CompetitorIntelligence.filter(
    { website_url: websiteUrl, status: 'scanned' }, '-scanned_at', 1
  );
  const previousSnapshot = previousScans[0]?.current_snapshot || null;

  // 2. Scrape current state via AI with web context
  const currentData = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are a competitive intelligence analyst for Xtreme Polishing Systems (XPS), an epoxy/polished concrete flooring company.

Analyze this competitor's website thoroughly: ${websiteUrl}
Company: ${competitorName}

Extract ALL of the following:
1. PRICING: Any pricing information, rates, cost calculators, package tiers, per-sqft rates, minimum job sizes
2. PRODUCTS/SERVICES: All flooring services offered, product lines, coatings/systems listed
3. CONTENT: Key marketing messages, slogans, value propositions, case studies, testimonials
4. PROMOTIONS: Any current deals, discounts, seasonal offers, free estimates
5. COVERAGE: Service areas, locations, expansion signals
6. TECHNOLOGY: Any tools, equipment, or techniques they highlight

Return complete structured data.`,
    add_context_from_internet: true,
    response_json_schema: {
      type: "object",
      properties: {
        pricing: { type: "object", properties: {
          has_pricing: { type: "boolean" },
          pricing_details: { type: "string" },
          price_ranges: { type: "string" },
          packages: { type: "string" }
        }},
        services: { type: "array", items: { type: "string" } },
        key_messages: { type: "array", items: { type: "string" } },
        promotions: { type: "array", items: { type: "string" } },
        coverage_areas: { type: "array", items: { type: "string" } },
        technologies: { type: "array", items: { type: "string" } },
        page_title: { type: "string" },
        meta_description: { type: "string" },
        content_hash: { type: "string" }
      }
    },
    model: "gemini_3_flash"
  });

  const currentSnapshot = JSON.stringify(currentData);

  // 3. Detect changes by comparing snapshots
  let changeDetected = false;
  let changeType = "no_change";
  let severity = "low";
  let diffSummary = "No previous scan data — baseline captured.";
  let aiAnalysis = "";
  let recommendations = "";

  if (previousSnapshot) {
    const diffResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Compare these two snapshots of competitor "${competitorName}" (${websiteUrl}).

PREVIOUS SNAPSHOT:
${previousSnapshot.substring(0, 3000)}

CURRENT SNAPSHOT:
${currentSnapshot.substring(0, 3000)}

Analyze:
1. Has anything changed? (pricing, content, services, promotions)
2. What specifically changed?
3. How significant is this for XPS (their competitor)?
4. What should XPS do in response?`,
      response_json_schema: {
        type: "object",
        properties: {
          change_detected: { type: "boolean" },
          change_type: { type: "string" },
          severity: { type: "string" },
          diff_summary: { type: "string" },
          analysis: { type: "string" },
          recommendations: { type: "array", items: { type: "string" } }
        }
      }
    });

    changeDetected = diffResult.change_detected || false;
    const validChangeTypes = ["pricing_change", "new_content", "product_update", "design_change", "removed_content", "no_change"];
    changeType = validChangeTypes.includes(diffResult.change_type) ? diffResult.change_type : (changeDetected ? "new_content" : "no_change");
    const validSeverities = ["low", "medium", "high", "critical"];
    severity = validSeverities.includes(diffResult.severity) ? diffResult.severity : "low";
    diffSummary = diffResult.diff_summary || "No significant changes detected.";
    aiAnalysis = diffResult.analysis || "";
    recommendations = (diffResult.recommendations || []).join("\n• ");
  }

  // 4. Save to CompetitorIntelligence
  const record = await base44.asServiceRole.entities.CompetitorIntelligence.create({
    competitor_name: competitorName,
    website_url: websiteUrl,
    scan_type: "full",
    change_detected: changeDetected,
    change_type: changeType,
    severity,
    previous_snapshot: previousSnapshot ? previousSnapshot.substring(0, 4000) : "",
    current_snapshot: currentSnapshot.substring(0, 4000),
    diff_summary: diffSummary,
    pricing_data: JSON.stringify(currentData.pricing || {}),
    ai_analysis: aiAnalysis,
    recommendations: recommendations ? `• ${recommendations}` : "",
    scrape_job_id: scrapeJobId || "",
    scanned_at: new Date().toISOString(),
    status: "scanned"
  });

  // 5. Update CompetitorProfile if it exists
  const profiles = await base44.asServiceRole.entities.CompetitorProfile.filter({ website: websiteUrl }, '-created_date', 1);
  if (profiles.length > 0) {
    await base44.asServiceRole.entities.CompetitorProfile.update(profiles[0].id, {
      last_crawled: new Date().toISOString(),
      change_detected: changeDetected,
      change_summary: diffSummary,
      pricing_intel: JSON.stringify(currentData.pricing || {}),
    });
    // Link profile
    await base44.asServiceRole.entities.CompetitorIntelligence.update(record.id, { competitor_profile_id: profiles[0].id });
  }

  // 6. Log as AgentJob for Command Center visibility
  await base44.asServiceRole.entities.AgentJob.create({
    agent_type: "Shadow Browser",
    job_description: `Shadow scan: ${competitorName} (${websiteUrl})`,
    goal: `Monitor ${competitorName} for pricing and content changes`,
    status: "complete",
    priority: changeDetected ? 8 : 3,
    trigger_source: scrapeJobId ? "schedule" : "manual",
    started_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    result: JSON.stringify({ change_detected: changeDetected, change_type: changeType, severity, summary: diffSummary }),
    live_output: changeDetected ? `⚠ Change detected: ${changeType} (${severity})` : `✓ No changes — ${competitorName}`
  });

  return { record_id: record.id, change_detected: changeDetected, change_type: changeType, severity, diff_summary: diffSummary };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { action } = body;

    // ── SCAN A SINGLE COMPETITOR ──
    if (action === "scan_competitor") {
      const { competitor_name, website_url, scrape_job_id } = body;
      if (!competitor_name || !website_url) return Response.json({ error: "competitor_name and website_url required" }, { status: 400 });
      const result = await scanCompetitor(base44, competitor_name, website_url, scrape_job_id);
      return Response.json({ success: true, ...result });
    }

    // ── RUN ALL DUE SHADOW BROWSER SCHEDULED JOBS ──
    if (action === "run_scheduled") {
      const scrapeJobs = await base44.asServiceRole.entities.ScrapeJob.filter(
        { category: "Competitor Intel", is_active: true }, '-created_date', 100
      );

      const now = new Date();
      const results = [];

      for (const job of scrapeJobs) {
        // Check if job is due based on schedule
        const lastRun = job.last_run ? new Date(job.last_run) : new Date(0);
        const msElapsed = now - lastRun;
        const scheduleMs = {
          "Every 15 min": 15 * 60 * 1000,
          "Every 30 min": 30 * 60 * 1000,
          "Hourly": 60 * 60 * 1000,
          "Every 6 hours": 6 * 60 * 60 * 1000,
          "Daily": 24 * 60 * 60 * 1000,
          "Weekly": 7 * 24 * 60 * 60 * 1000,
        };

        const requiredMs = scheduleMs[job.schedule] || null;
        if (!requiredMs || msElapsed < requiredMs) continue;

        // Parse URLs from the job
        const urls = (job.urls || "").split(",").map(u => u.trim()).filter(Boolean);
        const name = job.name || "Unknown Competitor";

        await base44.asServiceRole.entities.ScrapeJob.update(job.id, { status: "Running", last_run: now.toISOString() });

        for (const url of urls) {
          try {
            const result = await scanCompetitor(base44, name, url, job.id);
            results.push({ job_id: job.id, url, ...result });
          } catch (err) {
            results.push({ job_id: job.id, url, error: err.message });
          }
        }

        await base44.asServiceRole.entities.ScrapeJob.update(job.id, {
          status: "Completed",
          run_count: (job.run_count || 0) + 1,
          results_count: (job.results_count || 0) + urls.length
        });
      }

      return Response.json({ success: true, scans_run: results.length, results });
    }

    // ── CREATE / UPDATE A SHADOW BROWSER SCHEDULE ──
    if (action === "schedule") {
      const { competitor_name, urls, schedule, id } = body;
      if (id) {
        await base44.asServiceRole.entities.ScrapeJob.update(id, {
          name: competitor_name || undefined,
          urls: (urls || []).join(", "),
          schedule: schedule || "Daily",
          is_active: body.is_active !== false,
        });
        return Response.json({ success: true, id });
      }
      const job = await base44.asServiceRole.entities.ScrapeJob.create({
        name: competitor_name || "Shadow Browser Task",
        urls: (urls || []).join(", "),
        category: "Competitor Intel",
        schedule: schedule || "Daily",
        status: "Scheduled",
        is_active: true,
        destination: "Local",
        mode: "Single"
      });
      return Response.json({ success: true, id: job.id });
    }

    // ── LIST SHADOW BROWSER SCHEDULES ──
    if (action === "list_schedules") {
      const jobs = await base44.asServiceRole.entities.ScrapeJob.filter(
        { category: "Competitor Intel" }, '-created_date', 50
      );
      return Response.json({ schedules: jobs });
    }

    // ── GET RECENT INTEL HISTORY ──
    if (action === "history") {
      const limit = body.limit || 30;
      const filter = {};
      if (body.competitor_name) filter.competitor_name = body.competitor_name;
      if (body.changes_only) filter.change_detected = true;
      const records = await base44.asServiceRole.entities.CompetitorIntelligence.filter(filter, '-scanned_at', limit);
      return Response.json({ records });
    }

    return Response.json({ error: "Invalid action. Use: scan_competitor, run_scheduled, schedule, list_schedules, history" }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});