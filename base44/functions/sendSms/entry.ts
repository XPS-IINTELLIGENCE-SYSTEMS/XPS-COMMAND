import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { to_phone, to_name, message, lead_id, auto_generate } = await req.json();

    if (!to_phone) return Response.json({ error: 'to_phone is required' }, { status: 400 });

    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    let smsBody = message;

    // If auto_generate, use Claude Sonnet for humanistic message
    if (auto_generate || !message) {
      const contactName = to_name || "there";
      let leadContext = "";
      
      if (lead_id) {
        const lead = await base44.entities.Lead.get(lead_id);
        if (lead) {
          leadContext = `Company: ${lead.company}, Contact: ${lead.contact_name}, Vertical: ${lead.vertical}, Location: ${lead.location}, Stage: ${lead.stage}, Value: $${lead.estimated_value}, Insight: ${lead.ai_insight || ''}`;
        }
      }

      const aiResult = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a warm, personable sales rep for Xtreme Polishing Systems (XPS), a premium epoxy & polished concrete flooring company. Write a SHORT SMS message (under 160 characters) to ${contactName}.

${leadContext ? `Lead context: ${leadContext}` : ''}
${message ? `The intent is: ${message}` : 'This is a friendly check-in or follow-up.'}

Rules:
- Sound like a REAL person, not a bot or corporation
- Use casual but professional tone — like texting a valued business contact
- No emojis overload, maybe 1 at most
- Include a clear but soft call to action
- Sign off with a first name (use "Mike" as the rep name)
- Keep it under 160 chars
- NO quotes around the message`,
        model: "claude_sonnet_4_6"
      });

      smsBody = typeof aiResult === 'string' ? aiResult : aiResult.text || aiResult.content || message || "Hey, wanted to check in about your flooring project. Got a minute? - Mike";
    }

    // Send via Twilio REST API
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const credentials = btoa(`${accountSid}:${authToken}`);

    const formData = new URLSearchParams();
    formData.append("To", to_phone);
    formData.append("From", fromNumber);
    formData.append("Body", smsBody);

    const twilioResp = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const twilioData = await twilioResp.json();

    if (!twilioResp.ok) {
      return Response.json({ error: twilioData.message || "Twilio send failed", details: twilioData }, { status: 400 });
    }

    // Log as outreach email entity (reusing for SMS tracking)
    await base44.entities.OutreachEmail.create({
      to_email: to_phone,
      to_name: to_name || "",
      subject: "SMS",
      body: smsBody,
      status: "Sent",
      email_type: "Custom",
      lead_id: lead_id || "",
      sent_at: new Date().toISOString(),
      notes: `SMS sent via Twilio. SID: ${twilioData.sid}`
    });

    return Response.json({
      success: true,
      message_sid: twilioData.sid,
      body: smsBody,
      to: to_phone,
      message: `SMS sent to ${to_name || to_phone}`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});