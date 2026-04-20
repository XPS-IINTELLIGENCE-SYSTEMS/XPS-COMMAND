import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_KEY");
const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { action, to_phone, to_name, message, lead_id, channel, auto_generate, template_category } = await req.json();

  if (!action) return Response.json({ error: "action required: send_sms | send_whatsapp | check_status | generate_message" }, { status: 400 });

  // --- Generate AI message if requested ---
  if (action === "generate_message" || auto_generate) {
    let context = "";
    if (lead_id) {
      try {
        const leads = await base44.asServiceRole.entities.Lead.filter({ id: lead_id });
        if (leads.length > 0) {
          const lead = leads[0];
          context = `Lead: ${lead.company}, Contact: ${lead.contact_name}, Vertical: ${lead.vertical}, Stage: ${lead.stage}, Specialty: ${lead.specialty || "flooring"}`;
        }
      } catch (e) { console.error(e.message); }
    }

    // Check for templates
    let templateHint = "";
    try {
      const templates = await base44.asServiceRole.entities.MessageTemplate.filter({
        channel: channel === "whatsapp" ? "SMS" : "SMS",
        is_active: true,
        ...(template_category ? { category: template_category } : {})
      });
      if (templates.length > 0) {
        templateHint = `\nUse this template style as reference: "${templates[0].body}"`;
      }
    } catch (e) { /* no templates */ }

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{
          role: "system",
          content: `You are a sales rep for Xtreme Polishing Systems, a commercial flooring company. Write a short, professional ${channel === "whatsapp" ? "WhatsApp" : "SMS"} message. Keep it under 300 characters. Be personal and warm.${templateHint}`
        }, {
          role: "user",
          content: `Write a ${template_category || "outreach"} message to ${to_name || "the contact"}. ${context}. ${message || ""}`
        }],
        temperature: 0.7,
        max_tokens: 200
      })
    });

    const groqData = await groqRes.json();
    const generatedMessage = groqData.choices?.[0]?.message?.content || message;

    if (action === "generate_message") {
      return Response.json({ success: true, generated_message: generatedMessage });
    }
    // Fall through to send with generated message
    return await sendAndLog(base44, {
      to_phone, to_name, message: generatedMessage, lead_id,
      channel: channel || "sms"
    });
  }

  // --- Send SMS ---
  if (action === "send_sms") {
    return await sendAndLog(base44, { to_phone, to_name, message, lead_id, channel: "sms" });
  }

  // --- Send WhatsApp ---
  if (action === "send_whatsapp") {
    return await sendAndLog(base44, { to_phone, to_name, message, lead_id, channel: "whatsapp" });
  }

  // --- Check message status ---
  if (action === "check_status") {
    const { message_sid } = await req.json();
    const statusRes = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages/${message_sid}.json`,
      {
        headers: {
          "Authorization": "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)
        }
      }
    );
    const statusData = await statusRes.json();
    return Response.json({ success: true, status: statusData.status, error_code: statusData.error_code });
  }

  return Response.json({ error: "Unknown action" }, { status: 400 });
});

async function sendAndLog(base44, { to_phone, to_name, message, lead_id, channel }) {
  if (!to_phone || !message) {
    return Response.json({ error: "to_phone and message are required" }, { status: 400 });
  }

  // Format the To number for Twilio
  const formattedTo = channel === "whatsapp"
    ? `whatsapp:${to_phone.startsWith("+") ? to_phone : "+" + to_phone}`
    : (to_phone.startsWith("+") ? to_phone : "+" + to_phone);

  const fromNumber = channel === "whatsapp"
    ? `whatsapp:${TWILIO_PHONE_NUMBER}`
    : TWILIO_PHONE_NUMBER;

  // Send via Twilio REST API
  const twilioRes = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: "POST",
      headers: {
        "Authorization": "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        To: formattedTo,
        From: fromNumber,
        Body: message
      })
    }
  );

  const twilioData = await twilioRes.json();
  const success = !twilioData.code && twilioData.sid;

  const logEntry = {
    to_phone,
    to_name: to_name || "",
    message,
    channel,
    lead_id: lead_id || null,
    twilio_sid: twilioData.sid || null,
    status: twilioData.status || "failed",
    error: twilioData.message || null,
    sent_at: new Date().toISOString()
  };

  // Write to Supabase messages table
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      },
      body: JSON.stringify(logEntry)
    });
    console.log("Message logged to Supabase");
  } catch (e) {
    console.error("Supabase log failed:", e.message);
  }

  // Also log to Base44 OutreachEmail entity for UI visibility
  try {
    await base44.asServiceRole.entities.OutreachEmail.create({
      lead_id: lead_id || "",
      subject: `${channel.toUpperCase()} to ${to_name || to_phone}`,
      body: message,
      status: success ? "Sent" : "Failed",
      sent_date: new Date().toISOString(),
      channel: channel === "whatsapp" ? "WhatsApp" : "SMS"
    });
  } catch (e) {
    console.error("Base44 outreach log failed:", e.message);
  }

  // Update lead last_contacted
  if (lead_id && success) {
    try {
      await base44.asServiceRole.entities.Lead.update(lead_id, {
        last_contacted: new Date().toISOString()
      });
    } catch (e) { /* non-critical */ }
  }

  return Response.json({
    success,
    twilio_sid: twilioData.sid,
    status: twilioData.status,
    channel,
    error: success ? null : twilioData.message,
    logged_to: ["supabase", "base44"]
  });
}