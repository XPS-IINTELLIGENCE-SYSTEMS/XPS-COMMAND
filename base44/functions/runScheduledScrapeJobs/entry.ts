import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });

    // Find all active scheduled jobs
    const jobs = await base44.asServiceRole.entities.ScrapeJob.filter({ is_active: true });
    const now = new Date();
    const results = [];

    for (const job of jobs) {
      if (job.schedule === "Manual") continue;

      // Check if it's time to run based on schedule
      const lastRun = job.last_run ? new Date(job.last_run) : new Date(0);
      const diffMinutes = (now - lastRun) / (1000 * 60);

      let shouldRun = false;
      switch (job.schedule) {
        case "Every 15 min": shouldRun = diffMinutes >= 14; break;
        case "Every 30 min": shouldRun = diffMinutes >= 29; break;
        case "Hourly": shouldRun = diffMinutes >= 59; break;
        case "Every 6 hours": shouldRun = diffMinutes >= 359; break;
        case "Daily": shouldRun = diffMinutes >= 1439; break;
        case "Weekly": shouldRun = diffMinutes >= 10079; break;
      }

      if (!shouldRun) continue;

      try {
        const res = await base44.asServiceRole.functions.invoke("scheduledScraper", { job_id: job.id });
        results.push({ job_id: job.id, name: job.name, status: "executed", data: res.data });
      } catch (err) {
        await base44.asServiceRole.entities.ScrapeJob.update(job.id, { status: "Failed" });
        results.push({ job_id: job.id, name: job.name, status: "failed", error: err.message });
      }
    }

    return Response.json({
      success: true,
      jobs_checked: jobs.length,
      jobs_executed: results.length,
      results,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});