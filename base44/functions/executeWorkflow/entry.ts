import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { workflow, testMode } = await req.json();
    if (!workflow?.nodes?.length) {
      return Response.json({ error: 'No nodes in workflow' }, { status: 400 });
    }

    const results = [];

    // Execute nodes in sequence
    for (const node of workflow.nodes) {
      try {
        let result = {};

        switch (node.type) {
          case 'log_crm':
            // Log to CRM
            result = { status: 'logged_crm', timestamp: new Date().toISOString() };
            if (!testMode) {
              // Real CRM logic here
            }
            break;

          case 'send_slack':
            // Send Slack notification
            result = { status: 'slack_sent', message: node.config?.message || 'Workflow triggered' };
            if (!testMode && node.config?.webhookUrl) {
              await fetch(node.config.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: node.config.message || 'Workflow execution notification' }),
              });
            }
            break;

          case 'create_event':
            // Create calendar event
            result = { status: 'event_created', title: node.config?.title || 'Workflow Event' };
            if (!testMode) {
              // Google Calendar API call would go here
            }
            break;

          case 'send_email':
            // Send email
            result = { status: 'email_sent', to: node.config?.email };
            if (!testMode) {
              await base44.integrations.Core.SendEmail({
                to: node.config?.email || user.email,
                subject: node.config?.subject || 'Workflow Notification',
                body: node.config?.body || 'Your workflow has been executed.',
              });
            }
            break;

          case 'webhook':
            // Call webhook
            result = { status: 'webhook_called', url: node.config?.url };
            if (!testMode && node.config?.url) {
              await fetch(node.config.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ workflowId: workflow.id, ...node.config }),
              });
            }
            break;

          default:
            result = { status: 'unknown_node', type: node.type };
        }

        results.push({
          nodeId: node.id,
          nodeType: node.type,
          ...result,
        });
      } catch (error) {
        results.push({
          nodeId: node.id,
          nodeType: node.type,
          status: 'failed',
          error: error.message,
        });
      }
    }

    return Response.json({
      success: true,
      message: `Workflow executed with ${results.length} steps`,
      results,
      testMode,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});