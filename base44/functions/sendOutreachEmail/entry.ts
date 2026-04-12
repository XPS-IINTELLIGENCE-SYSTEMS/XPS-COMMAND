import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { email_id, auto_humanize } = await req.json();
    
    if (!email_id) {
      return Response.json({ error: 'email_id is required' }, { status: 400 });
    }

    const email = await base44.entities.OutreachEmail.get(email_id);
    if (!email) {
      return Response.json({ error: 'Email not found' }, { status: 404 });
    }

    let emailBody = email.body;
    let emailSubject = email.subject;

    // Use Claude Sonnet to humanize the email for natural, warm tone
    if (auto_humanize !== false) {
      let leadContext = "";
      if (email.lead_id) {
        try {
          const lead = await base44.entities.Lead.get(email.lead_id);
          if (lead) leadContext = `Company: ${lead.company}, Contact: ${lead.contact_name}, Vertical: ${lead.vertical}, Location: ${lead.location}, Stage: ${lead.stage}`;
        } catch {}
      }

      const aiResult = await base44.integrations.Core.InvokeLLM({
        prompt: `You are Mike Rodriguez, a Senior Flooring Consultant at Xtreme Polishing Systems (XPS). Rewrite this email to sound natural, warm, and human — like a real person wrote it, not AI.

Original Subject: ${email.subject}
Original Body: ${email.body}
Recipient: ${email.to_name || email.to_email}
${leadContext ? `Lead Context: ${leadContext}` : ''}

Rules:
- Keep the same intent and key information
- Sound conversational and genuine — like a real email from a real person
- Use natural sentence variety (short + medium sentences)
- Include 1-2 personal touches or specific references
- Professional but warm — not corporate or stiff
- End with a clear but soft call to action
- Sign off as Mike Rodriguez, Senior Flooring Consultant, XPS
- Return valid HTML for the body
- Also suggest a better subject line if appropriate`,
        model: "claude_sonnet_4_6",
        response_json_schema: {
          type: "object",
          properties: {
            subject: { type: "string" },
            body_html: { type: "string" }
          }
        }
      });

      if (aiResult.body_html) emailBody = aiResult.body_html;
      if (aiResult.subject) emailSubject = aiResult.subject;
    }

    // Send the email
    await base44.integrations.Core.SendEmail({
      to: email.to_email,
      subject: emailSubject,
      body: emailBody,
      from_name: "Mike Rodriguez — XPS"
    });

    // Update email status
    await base44.asServiceRole.entities.OutreachEmail.update(email_id, {
      status: "Sent",
      sent_at: new Date().toISOString(),
      subject: emailSubject,
      body: emailBody
    });

    return Response.json({ 
      success: true, 
      message: `Email sent to ${email.to_email}`,
      email_id: email_id
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});