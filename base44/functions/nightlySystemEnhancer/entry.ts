import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");

// Scheduled nightly: AI reviews system performance and generates enhancement recommendations
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (user?.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

  // Gather system metrics
  const leads = await base44.asServiceRole.entities.Lead.filter({});
  const bids = await base44.asServiceRole.entities.BidDocument.filter({});
  const jobs = await base44.asServiceRole.entities.CommercialJob.filter({});
  const contractors = await base44.asServiceRole.entities.Contractor.filter({});
  const outreachEmails = await base44.asServiceRole.entities.OutreachEmail.filter({});
  const recentLogs = await base44.asServiceRole.entities.OvernightRunLog.list('-created_date', 10);

  const metrics = {
    total_leads: leads.length,
    leads_by_stage: {},
    leads_scored: leads.filter(l => l.score > 0).length,
    leads_unscored: leads.filter(l => !l.score || l.score === 0).length,
    hot_leads: leads.filter(l => l.score >= 70).length,
    stale_leads: leads.filter(l => l.stage === "Incoming" && new Date(l.created_date) < new Date(Date.now() - 7 * 86400000)).length,
    total_bids: bids.length,
    bids_sent: bids.filter(b => b.send_status === "sent").length,
    bids_won: bids.filter(b => b.outcome === "won").length,
    bids_no_response: bids.filter(b => b.outcome === "no_response" || b.outcome === "pending").length,
    total_jobs: jobs.length,
    total_contractors: contractors.length,
    emails_sent: outreachEmails.filter(e => e.status === "Sent").length,
    emails_queued: outreachEmails.filter(e => e.status === "Queued").length,
    recent_runs: recentLogs.map(l => ({ type: l.run_type, status: l.status, date: l.created_date }))
  };

  // Count leads by stage
  leads.forEach(l => {
    metrics.leads_by_stage[l.stage] = (metrics.leads_by_stage[l.stage] || 0) + 1;
  });

  // Use Groq (free) for analysis and recommendations
  const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are XPS Intelligence System Enhancer. Analyze system performance metrics and generate specific, actionable recommendations to improve lead conversion, pipeline efficiency, and revenue. Focus on concrete actions, not generic advice." },
        { role: "user", content: `Analyze these system metrics and provide 5 specific enhancement recommendations:\n\n${JSON.stringify(metrics, null, 2)}` }
      ],
      temperature: 0.3,
      max_tokens: 2000
    })
  });

  const groqData = await groqRes.json();
  const analysis = groqData.choices?.[0]?.message?.content || "Analysis unavailable";

  // Store the health report
  await base44.asServiceRole.entities.SystemHealth.create({
    run_type: "enhance",
    status: "complete",
    findings: JSON.stringify(metrics),
    recommendations: analysis,
    score: Math.round(
      (metrics.hot_leads / Math.max(metrics.total_leads, 1)) * 30 +
      (metrics.bids_won / Math.max(metrics.total_bids, 1)) * 40 +
      (metrics.emails_sent / Math.max(metrics.emails_sent + metrics.emails_queued, 1)) * 30
    ),
    actions_taken: JSON.stringify([
      `Analyzed ${metrics.total_leads} leads, ${metrics.total_bids} bids, ${metrics.total_contractors} contractors`,
      `Found ${metrics.stale_leads} stale leads needing attention`,
      `${metrics.emails_queued} emails still queued for delivery`
    ])
  });

  // Send summary to admin via SMS
  const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
  const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
  const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER");
  const ADMIN_PHONE = Deno.env.get("ADMIN_PHONE");

  if (ADMIN_PHONE) {
    const summary = `🤖 XPS Nightly Report:\n📊 ${metrics.total_leads} leads (${metrics.hot_leads} hot)\n📋 ${metrics.bids_sent} bids sent (${metrics.bids_won} won)\n🏗️ ${metrics.total_contractors} GCs in database\n📧 ${metrics.emails_sent} emails delivered\n⚠️ ${metrics.stale_leads} leads need attention`;

    await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: "POST",
      headers: {
        "Authorization": "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        To: ADMIN_PHONE.startsWith("+") ? ADMIN_PHONE : "+1" + ADMIN_PHONE.replace(/\D/g, ''),
        From: TWILIO_PHONE_NUMBER,
        Body: summary
      })
    });
  }

  return Response.json({ success: true, metrics, analysis: analysis.slice(0, 500) });
});