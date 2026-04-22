import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { export_type, include_metrics, include_charts } = await req.json();

    const doc = new jsPDF();
    let yPos = 20;

    // Header
    doc.setFontSize(20);
    doc.text('Daily Summary Report', 20, yPos);
    yPos += 15;

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, yPos);
    doc.text(`User: ${user.full_name || user.email}`, 20, yPos + 5);
    yPos += 15;

    // Pipeline Status
    if (export_type === 'pipeline_status' || export_type === 'both') {
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text('Pipeline Status', 20, yPos);
      yPos += 10;

      try {
        const leads = await base44.entities.Lead.list('-updated_date', 50).catch(() => []);
        const stages = {};
        leads.forEach(lead => {
          const stage = lead.stage || 'Unknown';
          stages[stage] = (stages[stage] || 0) + 1;
        });

        doc.setFontSize(10);
        doc.setTextColor(50);
        let stageY = yPos;
        Object.entries(stages).forEach(([stage, count]) => {
          doc.text(`• ${stage}: ${count} leads`, 25, stageY);
          stageY += 5;
        });
        yPos = stageY + 5;
      } catch (e) {
        doc.text('Unable to fetch pipeline data', 25, yPos);
        yPos += 10;
      }

      doc.addPage();
      yPos = 20;
    }

    // Daily Summary
    if (export_type === 'daily_summary' || export_type === 'both') {
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text('Daily Summary', 20, yPos);
      yPos += 10;

      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const calls = await base44.entities.CallLog.filter({ created_by: user.email }, '-created_date', 20).catch(() => []);
        const todaysCalls = calls.filter(c => new Date(c.created_date) >= today);

        doc.setFontSize(10);
        doc.setTextColor(50);
        doc.text(`Calls Made Today: ${todaysCalls.length}`, 25, yPos);
        yPos += 5;

        const wonCalls = todaysCalls.filter(c => c.call_outcome === 'Sold').length;
        doc.text(`Calls Won: ${wonCalls}`, 25, yPos);
        yPos += 5;

        const totalValue = todaysCalls.reduce((sum, c) => sum + (c.deal_value || 0), 0);
        doc.text(`Total Deal Value: $${totalValue.toLocaleString()}`, 25, yPos);
        yPos += 10;
      } catch (e) {
        doc.text('Unable to fetch summary data', 25, yPos);
        yPos += 10;
      }
    }

    // Metrics
    if (include_metrics) {
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text('Key Metrics', 20, yPos);
      yPos += 8;

      doc.setFontSize(9);
      doc.setTextColor(50);
      doc.text('Win Rate: Calculating...', 25, yPos);
      yPos += 4;
      doc.text('Avg Deal Size: Calculating...', 25, yPos);
      yPos += 4;
      doc.text('Pipeline Value: Calculating...', 25, yPos);
      yPos += 10;
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('This is an automated report. Do not reply to this message.', 20, doc.internal.pageSize.height - 10);

    const pdfBytes = doc.output('arraybuffer');
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=daily-summary.pdf'
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});