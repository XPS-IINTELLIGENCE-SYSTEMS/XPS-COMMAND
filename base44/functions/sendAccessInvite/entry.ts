import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { email, name, code, method } = await req.json();

    if (!email || !code) {
      return Response.json({ error: 'Email and access code are required' }, { status: 400 });
    }

    // Send email invite
    if (method === 'email' || method === 'both') {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        subject: '🔑 You\'ve Been Invited to XPS Intelligence',
        body: `
          <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#0a0a0f;color:#fff;padding:32px;border-radius:16px;">
            <div style="text-align:center;margin-bottom:24px;">
              <h1 style="color:#d4af37;font-size:24px;">XPS Intelligence</h1>
            </div>
            <p>Hi ${name || 'there'},</p>
            <p>You've been invited to join XPS Intelligence. Use the access code below to get started:</p>
            <div style="background:#1a1a2e;border:1px solid #d4af37;border-radius:12px;padding:20px;text-align:center;margin:24px 0;">
              <div style="font-size:28px;font-weight:bold;color:#d4af37;letter-spacing:4px;">${code}</div>
            </div>
            <p style="text-align:center;">
              <a href="${Deno.env.get('APP_URL') || 'https://app.base44.com'}/signin" 
                 style="display:inline-block;background:#d4af37;color:#000;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold;">
                Sign In Now →
              </a>
            </p>
            <hr style="border-color:#333;margin:24px 0;"/>
            <p style="color:#888;font-size:12px;text-align:center;">XPS Intelligence — AI-Powered Sales Platform</p>
          </div>
        `,
      });
    }

    // Send SMS invite
    if (method === 'sms' || method === 'both') {
      const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID");
      const twilioAuth = Deno.env.get("TWILIO_AUTH_TOKEN");
      const twilioFrom = Deno.env.get("TWILIO_PHONE_NUMBER");
      const { phone } = await req.json().catch(() => ({}));

      if (twilioSid && twilioAuth && twilioFrom && phone) {
        await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "Basic " + btoa(`${twilioSid}:${twilioAuth}`),
          },
          body: new URLSearchParams({
            To: phone,
            From: twilioFrom,
            Body: `You've been invited to XPS Intelligence! Your access code: ${code}. Sign in at the app to get started.`,
          }),
        });
      }
    }

    // Also invite them via Base44 auth
    await base44.users.inviteUser(email, "user").catch(() => {});

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});