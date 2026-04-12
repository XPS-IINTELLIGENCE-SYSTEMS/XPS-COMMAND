import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { to_phone, to_name, purpose, lead_id, talking_points } = await req.json();

    if (!to_phone) return Response.json({ error: 'to_phone is required' }, { status: 400 });

    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    // Generate humanistic call script using Claude Sonnet
    let leadContext = "";
    if (lead_id) {
      const lead = await base44.entities.Lead.get(lead_id);
      if (lead) {
        leadContext = `Company: ${lead.company}, Contact: ${lead.contact_name}, Vertical: ${lead.vertical}, Location: ${lead.location}, Stage: ${lead.stage}, Estimated Value: $${lead.estimated_value}, Square Footage: ${lead.square_footage || 'unknown'}, AI Insight: ${lead.ai_insight || 'none'}`;
      }
    }

    const scriptResult = await base44.integrations.Core.InvokeLLM({
      prompt: `You are writing a TwiML voice script for an AI phone call from Xtreme Polishing Systems (XPS), a premium epoxy & polished concrete flooring company.

Caller: Mike Rodriguez, Senior Flooring Consultant at XPS
Calling: ${to_name || 'the prospect'}
Purpose: ${purpose || 'Follow up on flooring interest'}
${leadContext ? `Lead Intel: ${leadContext}` : ''}
${talking_points ? `Key Points: ${talking_points}` : ''}

Write a natural, warm, conversational phone script. The voice should sound like a real person — friendly, confident, knowledgeable.

Structure:
1. Warm greeting with name
2. Quick context of why calling (reference something specific about their business)
3. Value proposition — specific to their industry/situation
4. Soft ask / next step
5. Polite close

Keep each <Say> segment SHORT (1-2 sentences max) for natural pacing.
Use <Pause> tags between segments for natural rhythm.

Return ONLY valid TwiML XML starting with <Response> tag. Use voice="Polly.Matthew-Neural" for the most natural male voice.
Example format:
<Response>
  <Say voice="Polly.Matthew-Neural">Hey there, this is Mike from XPS.</Say>
  <Pause length="1"/>
  <Say voice="Polly.Matthew-Neural">I noticed your company was looking into flooring options...</Say>
</Response>`,
      model: "claude_sonnet_4_6"
    });

    let twiml = typeof scriptResult === 'string' ? scriptResult : scriptResult.text || scriptResult.content || '';
    
    // Clean up — ensure it's valid TwiML
    const responseMatch = twiml.match(/<Response>[\s\S]*<\/Response>/);
    if (responseMatch) {
      twiml = responseMatch[0];
    } else {
      // Fallback TwiML
      twiml = `<Response>
  <Say voice="Polly.Matthew-Neural">Hey ${to_name || 'there'}, this is Mike from Xtreme Polishing Systems. I wanted to reach out about your flooring project. We specialize in premium epoxy and polished concrete solutions. I'd love to chat about how we can help. Give us a call back when you get a chance. Talk soon!</Say>
</Response>`;
    }

    // Make the call via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`;
    const credentials = btoa(`${accountSid}:${authToken}`);

    const formData = new URLSearchParams();
    formData.append("To", to_phone);
    formData.append("From", fromNumber);
    formData.append("Twiml", twiml);

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
      return Response.json({ error: twilioData.message || "Twilio call failed", details: twilioData }, { status: 400 });
    }

    // Create a ScheduledCall record
    await base44.entities.ScheduledCall.create({
      title: `AI Call to ${to_name || to_phone}`,
      contact_name: to_name || to_phone,
      phone_number: to_phone,
      scheduled_time: new Date().toISOString(),
      call_type: "AI Phone Call",
      status: "In Progress",
      talking_points: talking_points || purpose || "",
      call_script: twiml,
      lead_id: lead_id || "",
      outcome: `Call SID: ${twilioData.sid}`
    });

    return Response.json({
      success: true,
      call_sid: twilioData.sid,
      status: twilioData.status,
      to: to_phone,
      message: `AI call initiated to ${to_name || to_phone}`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});