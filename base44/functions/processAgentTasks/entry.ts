import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const tasks = await base44.asServiceRole.entities.AgentTask.filter({ status: "Queued" });
    
    if (!tasks || tasks.length === 0) {
      return Response.json({ message: "No queued tasks", processed: 0 });
    }

    const results = [];

    for (const task of tasks) {
      try {
        await base44.asServiceRole.entities.AgentTask.update(task.id, { status: "In Progress" });

        let result = "";

        if (task.task_type === "Send Email") {
          // The agent stores the Lead ID in related_entity_id — NOT an OutreachEmail ID.
          // We need to: 1) Get lead data, 2) Generate email, 3) Create OutreachEmail, 4) Send it.
          const leadId = task.related_entity_id;
          let lead = null;
          
          if (leadId) {
            try {
              lead = await base44.asServiceRole.entities.Lead.get(leadId);
            } catch {
              // Lead not found — try to find OutreachEmail directly as fallback
              try {
                const email = await base44.asServiceRole.entities.OutreachEmail.get(leadId);
                if (email) {
                  // It actually was an OutreachEmail ID — send directly
                  await base44.asServiceRole.integrations.Core.SendEmail({
                    to: email.to_email,
                    subject: email.subject,
                    body: email.body,
                    from_name: "Mike Rodriguez — XPS"
                  });
                  await base44.asServiceRole.entities.OutreachEmail.update(leadId, {
                    status: "Sent",
                    sent_at: new Date().toISOString()
                  });
                  result = `Email sent to ${email.to_email} (OutreachEmail ${leadId})`;
                  await base44.asServiceRole.entities.AgentTask.update(task.id, {
                    status: "Completed",
                    completed_at: new Date().toISOString(),
                    result
                  });
                  results.push({ task_id: task.id, status: "completed", result });
                  continue;
                }
              } catch {
                // Neither Lead nor OutreachEmail found
              }
            }
          }

          if (lead) {
            // Generate email content from the task description & lead data
            const emailContent = await base44.asServiceRole.integrations.Core.InvokeLLM({
              prompt: `Write a professional outreach email for XPS Xtreme Polishing Systems.
Lead: ${lead.company}, Contact: ${lead.contact_name || 'Decision Maker'}
Email: ${lead.email || 'N/A'}
Industry: ${lead.vertical || 'Commercial'}
Location: ${lead.location || lead.city || 'N/A'}
Task: ${task.task_description}

Write a warm, human-sounding email. Sign as Mike Rodriguez, Senior Flooring Consultant, XPS.
Return valid HTML for the body.`,
              response_json_schema: {
                type: "object",
                properties: {
                  subject: { type: "string" },
                  body_html: { type: "string" }
                }
              }
            });

            const toEmail = lead.email || "";
            const toName = lead.contact_name || lead.company;

            // Step 1: Create OutreachEmail record
            const newEmail = await base44.asServiceRole.entities.OutreachEmail.create({
              to_email: toEmail,
              to_name: toName,
              subject: emailContent.subject || `Flooring Solutions for ${lead.company}`,
              body: emailContent.body_html || emailContent.subject || task.task_description,
              status: "Queued",
              email_type: "Initial Outreach",
              lead_id: lead.id,
            });

            // Step 2: Send the email if we have a valid address
            if (toEmail && toEmail.includes("@")) {
              await base44.asServiceRole.integrations.Core.SendEmail({
                to: toEmail,
                subject: newEmail.subject || emailContent.subject,
                body: newEmail.body || emailContent.body_html,
                from_name: "Mike Rodriguez — XPS"
              });
              await base44.asServiceRole.entities.OutreachEmail.update(newEmail.id, {
                status: "Sent",
                sent_at: new Date().toISOString()
              });
              result = `Email sent to ${toEmail}. OutreachEmail ID: ${newEmail.id}`;
            } else {
              await base44.asServiceRole.entities.OutreachEmail.update(newEmail.id, {
                status: "Draft"
              });
              result = `Email drafted (no valid email address). OutreachEmail ID: ${newEmail.id}`;
            }
          } else {
            result = `Send Email failed — no valid Lead or OutreachEmail found for ID: ${leadId || 'none'}`;
          }

        } else if (task.task_type === "Send SMS") {
          result = "SMS task logged — Twilio integration required for actual sending";
        } else {
          result = `Task type '${task.task_type}' processed — action logged`;
        }

        await base44.asServiceRole.entities.AgentTask.update(task.id, {
          status: result.includes("failed") ? "Failed" : "Completed",
          completed_at: new Date().toISOString(),
          result
        });
        results.push({ task_id: task.id, status: "completed", result });
      } catch (err) {
        await base44.asServiceRole.entities.AgentTask.update(task.id, {
          status: "Failed",
          error: err.message
        });
        results.push({ task_id: task.id, status: "failed", error: err.message });
      }
    }

    return Response.json({ 
      message: `Processed ${results.length} tasks`,
      results 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});