import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { entity_type, entity_id, event_type, entity_data } = await req.json();

    // Get all active triggers
    const triggers = await base44.asServiceRole.entities.EventTrigger.filter({ is_active: true }).catch(() => []);

    for (const trigger of triggers) {
      let shouldFire = false;

      // Check trigger type
      if (trigger.trigger_type === event_type) {
        // Check condition if present
        if (trigger.trigger_condition) {
          const cond = JSON.parse(trigger.trigger_condition);
          shouldFire = evaluateCondition(entity_data, cond);
        } else {
          shouldFire = true;
        }
      }

      if (!shouldFire) continue;

      // Execute action
      if (trigger.action_type === 'create_task') {
        const taskTemplate = trigger.task_template ? JSON.parse(trigger.task_template) : {};
        const taskTitle = trigger.task_title || `Task from trigger: ${trigger.name}`;
        
        // Create task in command notepad
        await base44.asServiceRole.entities.AgentTask.create({
          title: taskTitle,
          description: taskTemplate.description || '',
          priority: taskTemplate.priority || 'medium',
          status: 'pending',
          source: 'event_trigger',
          trigger_id: trigger.id,
          related_entity: entity_type,
          related_entity_id: entity_id
        }).catch(() => {});
      }

      if (trigger.action_type === 'send_alert') {
        const recipients = trigger.alert_recipients ? JSON.parse(trigger.alert_recipients) : [];
        for (const email of recipients) {
          await base44.integrations.Core.SendEmail({
            to: email,
            subject: `Alert: ${trigger.name}`,
            body: `<p>${trigger.alert_message}</p><p>Event: ${event_type} on ${entity_type} #${entity_id}</p>`
          }).catch(() => {});
        }
      }

      // Update trigger stats
      await base44.asServiceRole.entities.EventTrigger.update(trigger.id, {
        trigger_count: (trigger.trigger_count || 0) + 1,
        last_triggered: new Date().toISOString()
      }).catch(() => {});
    }

    return Response.json({ success: true, processed: triggers.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function evaluateCondition(data, condition) {
  const { field, operator, value } = condition;
  const fieldValue = data[field];

  switch (operator) {
    case 'equals': return fieldValue === value;
    case 'not_equals': return fieldValue !== value;
    case 'greater_than': return parseFloat(fieldValue) > parseFloat(value);
    case 'less_than': return parseFloat(fieldValue) < parseFloat(value);
    case 'contains': return String(fieldValue).includes(value);
    default: return false;
  }
}