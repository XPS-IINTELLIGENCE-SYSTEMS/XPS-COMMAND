import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const action = body.action || "scan";

  // ACTION: scan — find sent bids with no response after 5 days
  if (action === "scan") {
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
    const bids = await base44.asServiceRole.entities.BidDocument.filter({ send_status: "sent" });
    const stale = bids.filter(b => b.sent_time && b.sent_time < fiveDaysAgo);

    const generated = [];
    for (const bid of stale) {
      // Check if a follow-up email already exists for this bid
      const existingEmails = await base44.asServiceRole.entities.OutreachEmail.filter({ lead_id: bid.job_id });
      const hasFollowUp = existingEmails.some(e => e.email_type === "Follow-Up" && e.status !== "Sent");
      if (hasFollowUp) continue;
      if (!bid.recipient_email) continue;

      const followUpNum = (bid.follow_up_count || 0) + 1;
      const prompt = `You are a professional follow-up email writer for Xtreme Polishing Systems (XPS).

Write a brief, personalized follow-up email for a bid that was sent ${Math.round((Date.now() - new Date(bid.sent_time).getTime()) / 86400000)} days ago with no response.

PROJECT: ${bid.project_name}
RECIPIENT: ${bid.recipient_name} at ${bid.recipient_company}
BID VALUE: $${bid.total_bid_value?.toLocaleString() || 'N/A'}
FOLLOW-UP #: ${followUpNum}

Keep it under 150 words. Be professional but persistent. Reference the specific project.
If this is follow-up #2+, add slight urgency about scheduling availability.`;

      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            subject: { type: "string" },
            body: { type: "string" }
          }
        }
      });

      const email = await base44.asServiceRole.entities.OutreachEmail.create({
        to_email: bid.recipient_email,
        to_name: bid.recipient_name || "",
        subject: result.subject || `Following Up: ${bid.project_name}`,
        body: result.body || "",
        status: "Queued",
        email_type: "Follow-Up",
        lead_id: bid.job_id,
        notes: `Auto-generated follow-up #${followUpNum} for bid ${bid.bid_number}`
      });

      await base44.asServiceRole.entities.BidDocument.update(bid.id, {
        follow_up_count: followUpNum,
        follow_up_scheduled: true,
        follow_up_date: new Date().toISOString(),
        send_status: `follow_up_${Math.min(followUpNum, 3)}`
      });

      generated.push({ email_id: email.id, bid_id: bid.id, project: bid.project_name, to: bid.recipient_email });
    }

    return Response.json({ success: true, scanned: stale.length, generated: generated.length, follow_ups: generated });
  }

  // ACTION: send — send a queued follow-up
  if (action === "send") {
    const emailId = body.email_id;
    if (!emailId) return Response.json({ error: 'email_id required' }, { status: 400 });

    const emails = await base44.asServiceRole.entities.OutreachEmail.filter({ id: emailId });
    const email = emails[0];
    if (!email) return Response.json({ error: 'Email not found' }, { status: 404 });

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: email.to_email,
      subject: email.subject,
      body: email.body,
      from_name: "XPS Follow-Up"
    });

    await base44.asServiceRole.entities.OutreachEmail.update(emailId, {
      status: "Sent",
      sent_at: new Date().toISOString()
    });

    return Response.json({ success: true, sent_to: email.to_email });
  }

  // ACTION: send_all — send all queued follow-ups
  if (action === "send_all") {
    const queued = await base44.asServiceRole.entities.OutreachEmail.filter({ status: "Queued", email_type: "Follow-Up" });
    let sent = 0;
    for (const email of queued) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email.to_email,
        subject: email.subject,
        body: email.body,
        from_name: "XPS Follow-Up"
      });
      await base44.asServiceRole.entities.OutreachEmail.update(email.id, {
        status: "Sent",
        sent_at: new Date().toISOString()
      });
      sent++;
    }
    return Response.json({ success: true, sent });
  }

  return Response.json({ error: 'Invalid action' }, { status: 400 });
});