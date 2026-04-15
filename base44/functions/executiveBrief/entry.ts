import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const OWNER_EMAIL = "j.xpsxpress@gmail.com";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Get overnight run data
    const runs = await base44.asServiceRole.entities.OvernightRunLog.list("-run_date", 1);
    const lastRun = runs[0];

    // Get today's pipeline data
    const leads = await base44.asServiceRole.entities.Lead.list("-created_date", 100);
    const proposals = await base44.asServiceRole.entities.Proposal.list("-created_date", 50);
    const competitors = await base44.asServiceRole.entities.CompetitorProfile.filter({ change_detected: true });

    const today = new Date().toISOString().split("T")[0];
    const newLeads = leads.filter(l => l.created_date?.startsWith(today));
    const hotLeads = leads.filter(l => (l.score || 0) >= 80 && !["Won", "Lost"].includes(l.stage));
    const atRisk = leads.filter(l => {
      if (!l.updated_date || ["Won", "Lost"].includes(l.stage)) return false;
      const days = (Date.now() - new Date(l.updated_date).getTime()) / (1000 * 60 * 60 * 24);
      return days > 7;
    });

    const totalPipeline = leads.filter(l => !["Won", "Lost"].includes(l.stage)).reduce((s, l) => s + (l.estimated_value || 0), 0);

    const brief = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Generate today's executive morning brief for Chris Lavin, Owner of Xtreme Polishing Systems.

DATA:
- Last overnight run: ${lastRun ? `${lastRun.run_date} — ${lastRun.completion_status}, ${lastRun.leads_created} leads, ${lastRun.jobs_found} jobs, ${lastRun.bids_generated} bids` : "No recent run"}
- New leads today: ${newLeads.length}
- Hot leads (score 80+): ${hotLeads.length} — ${hotLeads.slice(0, 5).map(l => `${l.company} (${l.score})`).join(", ")}
- At-risk leads (7+ days stale): ${atRisk.length}
- Total active pipeline: $${(totalPipeline / 1000).toFixed(0)}k
- Open proposals: ${proposals.filter(p => ["Sent", "Viewed"].includes(p.status)).length}
- Competitor changes detected: ${competitors.length} — ${competitors.map(c => c.company_name).join(", ")}

FORMAT:
- Start with "Good morning Chris." 
- Section 1: Overnight Results (what the agents accomplished)
- Section 2: Top 3 Opportunities (hottest leads with recommended action)
- Section 3: Risks (stale leads, competitor movements)
- Section 4: Market Signals
- Section 5: Recommended Actions for Today
Keep it under 500 words. Be direct and actionable.`,
    });

    // Send email
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: OWNER_EMAIL,
      subject: `XPS Morning Brief — ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}`,
      body: brief,
      from_name: "XPS Intelligence",
    });

    return Response.json({ success: true, brief });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});