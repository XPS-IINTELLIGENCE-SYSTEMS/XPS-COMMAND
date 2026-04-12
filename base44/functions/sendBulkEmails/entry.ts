import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { email_ids } = await req.json();
    
    if (!email_ids || !Array.isArray(email_ids) || email_ids.length === 0) {
      return Response.json({ error: 'email_ids array is required' }, { status: 400 });
    }

    const results = [];
    
    for (const email_id of email_ids) {
      try {
        const email = await base44.entities.OutreachEmail.get(email_id);
        
        await base44.integrations.Core.SendEmail({
          to: email.to_email,
          subject: email.subject,
          body: email.body,
          from_name: "XPS Intelligence"
        });

        await base44.asServiceRole.entities.OutreachEmail.update(email_id, {
          status: "Sent",
          sent_at: new Date().toISOString()
        });

        results.push({ email_id, status: "sent", to: email.to_email });
      } catch (err) {
        await base44.asServiceRole.entities.OutreachEmail.update(email_id, {
          status: "Failed"
        });
        results.push({ email_id, status: "failed", error: err.message });
      }
    }

    const sent = results.filter(r => r.status === "sent").length;
    const failed = results.filter(r => r.status === "failed").length;

    return Response.json({ 
      success: true, 
      message: `Sent ${sent} emails, ${failed} failed`,
      results 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});