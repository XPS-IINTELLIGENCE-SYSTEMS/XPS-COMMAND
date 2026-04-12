import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// This function processes queued agent tasks in the background
// It is called by a scheduled automation every 5 minutes
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get all queued tasks
    const tasks = await base44.asServiceRole.entities.AgentTask.filter({ status: "Queued" });
    
    if (!tasks || tasks.length === 0) {
      return Response.json({ message: "No queued tasks", processed: 0 });
    }

    const results = [];

    for (const task of tasks) {
      try {
        // Mark as in progress
        await base44.asServiceRole.entities.AgentTask.update(task.id, { status: "In Progress" });

        let result = "";

        if (task.task_type === "Send Email" && task.related_entity_id) {
          // Send the email
          const email = await base44.asServiceRole.entities.OutreachEmail.get(task.related_entity_id);
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: email.to_email,
            subject: email.subject,
            body: email.body,
            from_name: "XPS Intelligence"
          });
          await base44.asServiceRole.entities.OutreachEmail.update(task.related_entity_id, {
            status: "Sent",
            sent_at: new Date().toISOString()
          });
          result = `Email sent to ${email.to_email}`;
        } else if (task.task_type === "Send SMS") {
          // SMS would require a Twilio integration - log the task
          result = "SMS task logged — Twilio integration required for actual sending";
        } else {
          result = `Task type '${task.task_type}' processed — action logged`;
        }

        await base44.asServiceRole.entities.AgentTask.update(task.id, {
          status: "Completed",
          completed_at: new Date().toISOString(),
          result: result
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