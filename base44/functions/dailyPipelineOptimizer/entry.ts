import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");

// Scheduled daily: scores leads, moves pipeline stages, flags hot opportunities
Deno.serve(async (req) => {
  try {
  const base44 = createClientFromRequest(req);
  let user = null;
  try { user = await base44.auth.me(); } catch (_) { /* scheduled run */ }
  // Allow any authenticated user or scheduled automation to run

  const results = { scored: 0, moved: 0, flagged: 0 };

  if (!GROQ_API_KEY) return Response.json({ error: "GROQ_API_KEY not set" }, { status: 500 });

  // 1. Score all unscored leads
  console.log("Fetching leads...");
  let allLeads = [];
  try {
    allLeads = await base44.asServiceRole.entities.Lead.list('-created_date', 50);
  } catch (e) {
    console.error("Lead fetch failed:", e.message);
    return Response.json({ error: "Failed to fetch leads: " + e.message }, { status: 500 });
  }
  const unscored = allLeads.filter(l => !l.score || l.score === 0);
  console.log(`Found ${allLeads.length} total leads, ${unscored.length} unscored`);
  for (const lead of unscored.slice(0, 30)) {
    const prompt = `Score this lead 1-100 for a commercial flooring company selling epoxy, polished concrete, equipment, and coatings. Return JSON: {"score": number, "priority": 1-10, "recommendation": "string"}

Lead: ${lead.company} | ${lead.contact_name} | ${lead.vertical || "Unknown"} | ${lead.location || "Unknown"} | ${lead.specialty || ""} | Employees: ${lead.employee_count || "?"} | Revenue: ${lead.estimated_revenue || "?"}`;

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2, max_tokens: 300
        })
      });
      const data = await res.json();
      const raw = data.choices?.[0]?.message?.content || "{}";
      const parsed = JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());

      await base44.asServiceRole.entities.Lead.update(lead.id, {
        score: parsed.score || 50,
        priority: parsed.priority || 5,
        ai_recommendation: parsed.recommendation || "",
        pipeline_status: parsed.score >= 70 ? "Qualified" : parsed.score >= 40 ? "Validated" : "Incoming"
      });
      results.scored++;
      if (parsed.score >= 70) results.flagged++;
    } catch (e) {
      console.error(`Score failed for ${lead.company}:`, e.message);
    }
  }

  // 2. Auto-advance pipeline stages for contacted leads
  const contacted = allLeads.filter(l => l.stage === "Contacted");
  const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString();
  for (const lead of contacted) {
    if (lead.last_contacted && lead.last_contacted < threeDaysAgo) {
      await base44.asServiceRole.entities.Lead.update(lead.id, { stage: "Proposal" });
      results.moved++;
    }
  }

  // 3. Flag stale leads for re-engagement
  const stale = allLeads.filter(l => l.stage === "Incoming");
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  for (const lead of stale) {
    if (lead.created_date < sevenDaysAgo && lead.score > 50) {
      await base44.asServiceRole.entities.Lead.update(lead.id, {
        ai_insight: `⚠️ Hot lead sitting idle for 7+ days. Score: ${lead.score}. Auto-flagged for immediate outreach.`,
        priority: Math.min((lead.priority || 5) + 2, 10)
      });
      results.flagged++;
    }
  }

  await base44.asServiceRole.entities.OvernightRunLog.create({
    run_date: new Date().toISOString().split('T')[0],
    target_market: "All Markets",
    completion_status: "complete",
    executive_summary: `Pipeline Optimizer: Scored ${results.scored}, moved ${results.moved}, flagged ${results.flagged}`,
    leads_created: 0,
    start_time: new Date().toISOString()
  });

  return Response.json({ success: true, ...results });
  } catch (e) {
    console.error("Top-level error:", e.message, e.stack);
    return Response.json({ error: e.message }, { status: 500 });
  }
});