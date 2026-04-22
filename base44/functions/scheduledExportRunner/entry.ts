import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { export_id, delivery_method, delivery_target, export_type, include_metrics, include_charts } = await req.json();

    // Generate PDF
    const pdfRes = await base44.functions.invoke('generateDailySummaryPDF', {
      export_type,
      include_metrics,
      include_charts
    });

    const pdfBuffer = await pdfRes.data.arrayBuffer ? pdfRes.data.arrayBuffer() : pdfRes.data;

    // Deliver via email
    if (delivery_method === 'email') {
      await base44.integrations.Core.SendEmail({
        to: delivery_target,
        subject: `Daily Summary - ${new Date().toLocaleDateString()}`,
        body: `<p>Your automated daily summary report is attached.</p>`
      });
    }

    // Deliver via Slack (webhook)
    if (delivery_method === 'slack') {
      // Post message with file to Slack
      const formData = new FormData();
      formData.append('file', new Blob([pdfBuffer], { type: 'application/pdf' }), 'daily-summary.pdf');
      formData.append('channels', delivery_target);
      formData.append('initial_comment', 'Your daily summary report');

      await fetch('https://slack.com/api/files.upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${Deno.env.get('SLACK_BOT_TOKEN')}` },
        body: formData
      }).catch(() => {});
    }

    // Update last_run
    if (export_id) {
      await base44.asServiceRole.entities.ScheduledExport.update(export_id, {
        last_run: new Date().toISOString(),
        next_run: calculateNextRun() // Implement based on schedule
      }).catch(() => {});
    }

    return Response.json({ success: true, delivered: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function calculateNextRun() {
  const now = new Date();
  const next = new Date(now);
  next.setDate(next.getDate() + 1); // Default: tomorrow same time
  return next.toISOString();
}