import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const action = body.action || "analyze_all";

  // Analyze a single lead
  const analyzeLead = async (lead) => {
    // Gather all outreach emails for this lead
    const emails = await base44.asServiceRole.entities.OutreachEmail.filter({ lead_id: lead.id });
    
    const emailSummary = emails.map(e => 
      `[${e.status}] ${e.email_type || 'Email'} to ${e.to_name || e.to_email} — Subject: "${e.subject}" — Sent: ${e.sent_at || 'not sent'}`
    ).join('\n');

    const prompt = `You are a sales sentiment analyst for Xtreme Polishing Systems (XPS), a flooring solutions company.

Analyze the following lead data and email history to calculate a sentiment/intent score.

LEAD:
- Company: ${lead.company}
- Contact: ${lead.contact_name}
- Stage: ${lead.stage}
- Bid Stage: ${lead.bid_stage || 'N/A'}
- Last Contacted: ${lead.last_contacted || 'Never'}
- Current Score: ${lead.score || 'N/A'}
- AI Insight: ${lead.ai_insight || 'None'}
- Notes: ${lead.notes || 'None'}
- Validation Notes: ${lead.validation_notes || 'None'}

EMAIL HISTORY (${emails.length} emails):
${emailSummary || 'No email history'}

SCORING GUIDE:
- 0-20: Cold — no engagement, no response, stale lead
- 21-40: Lukewarm — minimal engagement, sent but no opens
- 41-60: Warm — some engagement, emails opened, initial interest
- 61-80: Hot — active engagement, replies, meeting scheduled, bid under review
- 81-100: On Fire — high intent, multiple replies, negotiation, close to award

Consider: response rate, email opens, time since last contact, stage progression, deal size signals.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          sentiment_score: { type: "number" },
          sentiment_label: { type: "string" },
          summary: { type: "string" },
          recommended_priority: { type: "number" }
        }
      }
    });

    const score = Math.max(0, Math.min(100, result.sentiment_score || 0));
    const label = result.sentiment_label || (score > 80 ? "On Fire" : score > 60 ? "Hot" : score > 40 ? "Warm" : score > 20 ? "Lukewarm" : "Cold");
    const priority = result.recommended_priority || Math.max(1, Math.min(10, Math.round(score / 10)));

    await base44.asServiceRole.entities.Lead.update(lead.id, {
      sentiment_score: score,
      sentiment_label: label,
      sentiment_notes: result.summary || "",
      priority: priority
    });

    return { lead_id: lead.id, company: lead.company, score, label, priority };
  };

  // ACTION: analyze_one — single lead
  if (action === "analyze_one") {
    const leadId = body.lead_id;
    if (!leadId) return Response.json({ error: 'lead_id required' }, { status: 400 });
    const leads = await base44.asServiceRole.entities.Lead.filter({ id: leadId });
    if (!leads[0]) return Response.json({ error: 'Lead not found' }, { status: 404 });
    const result = await analyzeLead(leads[0]);
    return Response.json({ success: true, result });
  }

  // ACTION: analyze_all — batch analyze leads in active stages
  if (action === "analyze_all") {
    const activeStages = ["Contacted", "Proposal", "Negotiation", "Qualified", "Prioritized"];
    const allLeads = await base44.asServiceRole.entities.Lead.list("-created_date", 200);
    const targetLeads = allLeads.filter(l => activeStages.includes(l.stage) && l.email);
    
    const results = [];
    // Process up to 20 leads to stay within timeout
    const batch = targetLeads.slice(0, 20);
    for (const lead of batch) {
      const r = await analyzeLead(lead);
      results.push(r);
    }

    return Response.json({ success: true, analyzed: results.length, total_eligible: targetLeads.length, results });
  }

  return Response.json({ error: 'Invalid action' }, { status: 400 });
});