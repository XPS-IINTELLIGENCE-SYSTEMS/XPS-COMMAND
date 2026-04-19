import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { type, name, email, message } = await req.json();

    const ADMIN_EMAIL = "jeremy@shopxps.com";
    const ADMIN_PHONE = Deno.env.get("ADMIN_PHONE") || "";

    // Send email notification
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: ADMIN_EMAIL,
      subject: `🔔 XPS Alert: ${type === 'join_request' ? 'New Join Request' : 'Access Alert'}`,
      body: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;">
          <h2 style="color:#d4af37;">XPS Intelligence Alert</h2>
          <p><strong>Type:</strong> ${type}</p>
          <p><strong>Name:</strong> ${name || 'N/A'}</p>
          <p><strong>Email:</strong> ${email || 'N/A'}</p>
          ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
          <hr/>
          <p style="color:#888;font-size:12px;">Login to your Admin Control panel to review.</p>
        </div>
      `,
    });

    // Send SMS notification via Twilio
    const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuth = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioFrom = Deno.env.get("TWILIO_PHONE_NUMBER");
    const adminPhone = ADMIN_PHONE;

    if (twilioSid && twilioAuth && twilioFrom && adminPhone) {
      const smsBody = `XPS Alert: You have a new ${type === 'join_request' ? 'join request' : 'access alert'} from ${name || email}. Check Admin Control.`;
      
      await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": "Basic " + btoa(`${twilioSid}:${twilioAuth}`),
        },
        body: new URLSearchParams({
          To: adminPhone,
          From: twilioFrom,
          Body: smsBody,
        }),
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});