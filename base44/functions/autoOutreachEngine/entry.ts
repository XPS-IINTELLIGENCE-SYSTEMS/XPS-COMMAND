import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER");
const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");

// Scheduled daily: auto-messages new leads via SMS, follows up on stale bids
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (user?.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

  const results = { sms_sent: 0, follow_ups: 0, emails_queued: 0, errors: [] };

  // 1. SMS new high-score leads that haven't been contacted
  const hotLeads = await base44.asServiceRole.entities.Lead.filter({ stage: "Incoming" });
  const uncontacted = hotLeads.filter(l => l.phone && !l.last_contacted && (l.score || 0) >= 40);

  for (const lead of uncontacted.slice(0, 5)) {
    // Generate personalized message
    const msgRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{
          role: "system",
          content: "You write short, professional SMS messages for Xtreme Polishing Systems. Under 160 chars. Warm, personal, mention their company."
        }, {
          role: "user",
          content: `Write intro SMS to ${lead.contact_name} at ${lead.company} in ${lead.location}. They do ${lead.vertical || "flooring"}.`
        }],
        temperature: 0.7, max_tokens: 100
      })
    });

    const msgData = await msgRes.json();
    const message = msgData.choices?.[0]?.message?.content || `Hi ${lead.contact_name}, this is Mike from XPS. We help ${lead.vertical || "flooring"} companies with premium epoxy and concrete solutions. Would love to chat!`;

    // Send via Twilio
    const phone = lead.phone.startsWith("+") ? lead.phone : "+1" + lead.phone.replace(/\D/g, '');
    try {
      const twilioRes = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: "POST",
          headers: {
            "Authorization": "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({ To: phone, From: TWILIO_PHONE_NUMBER, Body: message })
        }
      );
      const twilioData = await twilioRes.json();

      if (twilioData.sid) {
        await base44.asServiceRole.entities.Lead.update(lead.id, {
          last_contacted: new Date().toISOString(),
          stage: "Contacted"
        });
        results.sms_sent++;
      }
    } catch (e) {
      results.errors.push(`SMS to ${lead.company}: ${e.message}`);
    }
  }

  // 2. Auto follow-up on stale bids (5+ days no response)
  const fiveDaysAgo = new Date(Date.now() - 5 * 86400000).toISOString();
  const sentBids = await base44.asServiceRole.entities.BidDocument.filter({ send_status: "sent" });
  const staleBids = sentBids.filter(b => b.sent_time && b.sent_time < fiveDaysAgo && (b.follow_up_count || 0) < 3);

  for (const bid of staleBids.slice(0, 3)) {
    if (!bid.recipient_email) continue;

    const followUpNum = (bid.follow_up_count || 0) + 1;
    const emailBody = await generateFollowUp(bid, followUpNum);

    await base44.asServiceRole.entities.OutreachEmail.create({
      to_email: bid.recipient_email,
      to_name: bid.recipient_name || "",
      subject: `Following Up: ${bid.project_name}`,
      body: emailBody,
      status: "Queued",
      email_type: "Follow-Up",
      lead_id: bid.job_id,
      notes: `Auto follow-up #${followUpNum}`
    });

    await base44.asServiceRole.entities.BidDocument.update(bid.id, {
      follow_up_count: followUpNum,
      follow_up_scheduled: true,
      last_follow_up: new Date().toISOString(),
      send_status: `follow_up_${Math.min(followUpNum, 3)}`
    });
    results.follow_ups++;
  }

  // 3. Send all queued emails
  const queued = await base44.asServiceRole.entities.OutreachEmail.filter({ status: "Queued" });
  for (const email of queued.slice(0, 10)) {
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email.to_email,
        subject: email.subject,
        body: email.body,
        from_name: "Mike Rodriguez — XPS"
      });
      await base44.asServiceRole.entities.OutreachEmail.update(email.id, {
        status: "Sent",
        sent_at: new Date().toISOString()
      });
      results.emails_queued++;
    } catch (e) {
      results.errors.push(`Email to ${email.to_email}: ${e.message}`);
    }
  }

  await base44.asServiceRole.entities.OvernightRunLog.create({
    run_type: "auto_outreach",
    status: "success",
    results_summary: JSON.stringify(results),
    started_at: new Date().toISOString(),
    completed_at: new Date().toISOString()
  });

  return Response.json({ success: true, ...results });
});

async function generateFollowUp(bid, num) {
  const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `Write a professional follow-up email #${num} for a flooring bid. Project: ${bid.project_name}. Recipient: ${bid.recipient_name} at ${bid.recipient_company}. Bid value: $${bid.total_bid_value || "N/A"}. Keep under 150 words. ${num >= 2 ? "Add slight urgency about scheduling." : ""}`
      }],
      temperature: 0.7, max_tokens: 300
    })
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || `Hi ${bid.recipient_name}, just following up on our proposal for ${bid.project_name}. Would love to discuss next steps. — Mike, XPS`;
}