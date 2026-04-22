import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const fromNumber = Deno.env.get('TWILIO_PHONE_NUMBER');
    const toNumber = Deno.env.get('ADMIN_PHONE');

    if (!accountSid || !authToken || !fromNumber || !toNumber) {
      return Response.json({ error: 'Missing Twilio credentials in secrets' }, { status: 400 });
    }

    const auth = btoa(`${accountSid}:${authToken}`);
    const params = new URLSearchParams({
      From: fromNumber,
      To: toNumber,
      Body: `Test SMS from Base44 app at ${new Date().toLocaleString()}`,
    });

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return Response.json({ error: data.message || 'SMS send failed' }, { status: response.status });
    }

    return Response.json({ 
      success: true, 
      message: 'Test SMS sent successfully',
      sid: data.sid,
      to: data.to,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});