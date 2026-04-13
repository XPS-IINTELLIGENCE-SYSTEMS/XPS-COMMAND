import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get active scrape jobs
    const jobs = await base44.asServiceRole.entities.ScrapeJob.filter({ is_active: true, schedule: "Every 30 min" });

    if (!jobs || jobs.length === 0) {
      // Default: run Arizona epoxy scraper
      const result = await base44.asServiceRole.functions.invoke("timedLeadScraper", {
        location: "Arizona",
        industry: "Epoxy, Polished Concrete, Decorative Concrete",
        keywords: "epoxy companies, polished concrete, decorative concrete",
        count: 15,
        max_years: 10,
        sources: "Google Maps, Yelp, State Business Registry"
      });

      return Response.json({
        success: true,
        jobs_run: 1,
        results: [{ job: "Default AZ Scraper", ...result }]
      });
    }

    const results = [];
    for (const job of jobs) {
      // Update job status
      await base44.asServiceRole.entities.ScrapeJob.update(job.id, { status: "Running", last_run: new Date().toISOString() });

      const result = await base44.asServiceRole.functions.invoke("timedLeadScraper", {
        location: job.location || "Arizona",
        industry: job.industry || "Epoxy, Polished Concrete, Decorative Concrete",
        keywords: job.keywords || "epoxy companies, polished concrete, decorative concrete",
        count: 15,
        max_years: 10,
        sources: "Google Maps, Yelp, State Business Registry",
        urls: job.urls || ""
      });

      // Update job with results
      await base44.asServiceRole.entities.ScrapeJob.update(job.id, {
        status: "Completed",
        run_count: (job.run_count || 0) + 1,
        results_count: (job.results_count || 0) + (result?.leads_created || 0)
      });

      results.push({ job: job.name, leads_created: result?.leads_created || 0 });
    }

    return Response.json({ success: true, jobs_run: results.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});