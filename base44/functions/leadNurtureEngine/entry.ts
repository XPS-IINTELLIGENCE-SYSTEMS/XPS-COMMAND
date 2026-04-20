import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const action = body.action || "process_all";

  // Template selection based on sentiment
  const CADENCE_MAP = {
    "On Fire": { interval_days: 1, template_category: "Proposal", priority: 10 },
    "Hot": { interval_days: 2, template_category: "Follow-Up", priority: 8 },
    "Warm": { interval_days: 5, template_category: "Follow-Up", priority: 6 },
    "Lukewarm": { interval_days: 10, template_category: "Reactivation", priority: 4 },
    "Cold": { interval_days: 21, template_category: "Reactivation", priority: 2 },
  };

  const processLead = async (lead) => {
    // Get latest emails for this lead
    const emails = await base44.asServiceRole.entities.OutreachEmail.filter({ lead_id: lead.id });
    const sentEmails = emails.filter(e => e.status === "Sent" || e.status === "Opened" || e.status === "Replied");
    const lastSent = sentEmails.sort((a, b) => new Date(b.sent_at || b.created_date) - new Date(a.sent_at || a.created_date))[0];

    // Run sentiment analysis if no recent score
    let sentiment = lead.sentiment_label || "Cold";
    let sentimentScore = lead.sentiment_score || 0;

    if (!lead.sentiment_score || (lead.last_contacted && (Date.now() - new Date(lead.last_contacted).getTime()) > 3 * 86400000)) {
      // Run fresh sentiment analysis
      const emailSummary = sentEmails.slice(0, 10).map(e =>
        `[${e.status}] "${e.subject}" — ${e.sent_at || 'queued'}`
      ).join('\n');

      const analysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Analyze this lead's communication sentiment for XPS flooring sales:
Lead: ${lead.company} (${lead.contact_name}) — Stage: ${lead.stage}
Last contacted: ${lead.last_contacted || 'Never'}
Email history (${sentEmails.length} sent):
${emailSummary || 'No emails sent yet'}
Notes: ${lead.notes || 'None'}

Score 0-100 and label as: Cold, Lukewarm, Warm, Hot, or On Fire`,
        response_json_schema: {
          type: "object",
          properties: {
            score: { type: "number" },
            label: { type: "string" },
            reason: { type: "string" },
            recommended_action: { type: "string" }
          }
        }
      });

      sentimentScore = Math.max(0, Math.min(100, analysis.score || 0));
      sentiment = analysis.label || "Cold";

      // Update lead with new sentiment
      await base44.asServiceRole.entities.Lead.update(lead.id, {
        sentiment_score: sentimentScore,
        sentiment_label: sentiment,
        sentiment_notes: analysis.reason || "",
        priority: Math.max(1, Math.min(10, Math.round(sentimentScore / 10)))
      });
    }

    // Determine cadence
    const cadence = CADENCE_MAP[sentiment] || CADENCE_MAP["Cold"];

    // Check if it's time to send next follow-up
    const lastContactDate = lastSent ? new Date(lastSent.sent_at || lastSent.created_date) : null;
    const daysSinceContact = lastContactDate ? (Date.now() - lastContactDate.getTime()) / 86400000 : 999;
    const shouldSend = daysSinceContact >= cadence.interval_days;

    if (!shouldSend) {
      return { lead_id: lead.id, company: lead.company, sentiment, action: "waiting", days_until_next: Math.ceil(cadence.interval_days - daysSinceContact) };
    }

    // Find appropriate template
    const templates = await base44.asServiceRole.entities.MessageTemplate.filter({ category: cadence.template_category, channel: "Email", is_active: true });
    const template = templates[0];

    if (!template || !lead.email) {
      return { lead_id: lead.id, company: lead.company, sentiment, action: "no_template_or_email" };
    }

    // Generate personalized email
    const emailContent = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Write a follow-up email for XPS (Xtreme Polishing Systems) to ${lead.contact_name} at ${lead.company}.
Sentiment level: ${sentiment} (score: ${sentimentScore}/100)
Template category: ${cadence.template_category}
Template body: ${template.body}
Lead vertical: ${lead.vertical || 'General'}
Lead specialty interest: ${lead.specialty || 'Epoxy'}
Previous emails sent: ${sentEmails.length}

${sentiment === "On Fire" || sentiment === "Hot" ? "Be enthusiastic, propose a meeting or demo. Mention specific products." : ""}
${sentiment === "Cold" || sentiment === "Lukewarm" ? "Be casual and value-driven. Share a useful resource or industry insight." : ""}

Keep it professional, concise, under 150 words. Include a clear CTA.`,
      response_json_schema: {
        type: "object",
        properties: {
          subject: { type: "string" },
          body: { type: "string" }
        }
      }
    });

    // Create outreach email
    const campaignStage = Math.min(4, sentEmails.length);
    await base44.asServiceRole.entities.OutreachEmail.create({
      to_email: lead.email,
      to_name: lead.contact_name,
      subject: emailContent.subject,
      body: emailContent.body,
      status: "Queued",
      email_type: cadence.template_category,
      lead_id: lead.id,
      campaign_stage: campaignStage,
      send_at: new Date().toISOString(),
      notes: `Auto-generated by Lead Nurture Engine. Sentiment: ${sentiment} (${sentimentScore})`
    });

    return {
      lead_id: lead.id,
      company: lead.company,
      sentiment,
      sentimentScore,
      action: "email_queued",
      subject: emailContent.subject,
      cadence_days: cadence.interval_days,
    };
  };

  if (action === "process_one") {
    const leadId = body.lead_id;
    if (!leadId) return Response.json({ error: "lead_id required" }, { status: 400 });
    const leads = await base44.asServiceRole.entities.Lead.filter({ id: leadId });
    if (!leads[0]) return Response.json({ error: "Lead not found" }, { status: 404 });
    const result = await processLead(leads[0]);
    return Response.json({ success: true, result });
  }

  // Process all active leads
  const activeStages = ["Contacted", "Proposal", "Negotiation", "Qualified", "Prioritized", "Validated"];
  const allLeads = await base44.asServiceRole.entities.Lead.list("-created_date", 500);
  const eligible = allLeads.filter(l => activeStages.includes(l.stage) && l.email);

  const results = [];
  const batch = eligible.slice(0, body.limit || 25);
  for (const lead of batch) {
    const r = await processLead(lead);
    results.push(r);
  }

  const queued = results.filter(r => r.action === "email_queued").length;
  const waiting = results.filter(r => r.action === "waiting").length;

  return Response.json({
    success: true,
    processed: results.length,
    emails_queued: queued,
    waiting,
    total_eligible: eligible.length,
    results
  });
});