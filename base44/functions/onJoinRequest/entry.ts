import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { data } = body;

    if (!data || !data.email) {
      return Response.json({ skipped: true });
    }

    const ADMIN_EMAIL = "jeremy@shopxps.com";

    // Send email notification to admin
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: ADMIN_EMAIL,
      subject: `🔔 New Join Request from ${data.name || data.email}`,
      body: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#0a0a0f;color:#fff;padding:24px;border-radius:12px;">
          <h2 style="color:#d4af37;">New Join Request</h2>
          <p><strong>Name:</strong> ${data.name || 'N/A'}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Company:</strong> ${data.company || 'N/A'}</p>
          <p><strong>Type:</strong> ${data.requested_type || 'saas'}</p>
          ${data.message ? `<p><strong>Message:</strong> ${data.message}</p>` : ''}
          <hr style="border-color:#333;"/>
          <p style="color:#888;font-size:12px;">Go to Admin Control → Join Requests to approve or deny.</p>
        </div>
      `,
    });

    // Send SMS notification
    const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuth = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioFrom = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (twilioSid && twilioAuth && twilioFrom) {
      // Note: you'll need to set ADMIN_PHONE secret for SMS to work
      const adminPhone = Deno.env.get("ADMIN_PHONE");
      if (adminPhone) {
        await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "Basic " + btoa(`${twilioSid}:${twilioAuth}`),
          },
          body: new URLSearchParams({
            To: adminPhone,
            From: twilioFrom,
            Body: `XPS Alert: You have a new join request from ${data.name || data.email}. Check Admin Control.`,
          }),
        });
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});