import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { email_id } = await req.json();
    
    if (!email_id) {
      return Response.json({ error: 'email_id is required' }, { status: 400 });
    }

    // Get the email record
    const email = await base44.entities.OutreachEmail.get(email_id);
    if (!email) {
      return Response.json({ error: 'Email not found' }, { status: 404 });
    }

    // Send the email using built-in SendEmail integration
    await base44.integrations.Core.SendEmail({
      to: email.to_email,
      subject: email.subject,
      body: email.body,
      from_name: "XPS Intelligence"
    });

    // Update email status to Sent
    await base44.asServiceRole.entities.OutreachEmail.update(email_id, {
      status: "Sent",
      sent_at: new Date().toISOString()
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