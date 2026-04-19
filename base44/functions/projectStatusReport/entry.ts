import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { job_id, send_to } = await req.json();
  if (!job_id) return Response.json({ error: 'job_id required' }, { status: 400 });

  const jobs = await base44.asServiceRole.entities.CommercialJob.filter({ id: job_id });
  const job = jobs[0];
  if (!job) return Response.json({ error: 'Job not found' }, { status: 404 });

  let takeoff = {};
  try { takeoff = JSON.parse(job.takeoff_data || "{}"); } catch {}

  let sitePhotos = [];
  try { sitePhotos = JSON.parse(job.site_photos || "[]"); } catch {}

  let workStages = [];
  try { workStages = JSON.parse(job.work_stages || "[]"); } catch {}

  let materialLog = [];
  try { materialLog = JSON.parse(job.material_log || "[]"); } catch {}

  const completedStages = workStages.filter(s => s.done).length;
  const totalStages = workStages.length;
  const progressPct = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

  const prompt = `Generate a professional project status report for a commercial flooring job.

PROJECT: ${job.job_name}
LOCATION: ${job.address || ''} ${job.city}, ${job.state} ${job.zip || ''}
TYPE: ${job.project_type} | SECTOR: ${job.sector || 'Commercial'}
PHASE: ${job.project_phase?.replace(/_/g, ' ')}
SQFT: ${job.flooring_sqft || job.total_sqft || 'TBD'}
GC: ${job.gc_name || 'N/A'} | Owner: ${job.owner_name || 'N/A'}
Start Date: ${job.construction_start_date || 'TBD'}
Flooring System: ${job.flooring_system_recommendation || 'TBD'}

WORK PROGRESS: ${completedStages}/${totalStages} stages complete (${progressPct}%)
${workStages.map(s => `- [${s.done ? 'DONE' : 'PENDING'}] ${s.name}`).join('\n')}

MATERIAL USAGE: ${materialLog.length} entries logged
${materialLog.slice(-5).map(m => `- ${m.material}: ${m.quantity} ${m.unit} on ${m.date}`).join('\n')}

SITE PHOTOS: ${sitePhotos.length} photos uploaded

TAKEOFF DATA:
${JSON.stringify(takeoff, null, 2).substring(0, 1500)}

Write a professional status report with:
1. Executive Summary (2-3 sentences)
2. Progress Overview 
3. Key Milestones & Upcoming Work
4. Materials Summary
5. Any Concerns or Notes
Keep it concise and professional.`;

  const report = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        executive_summary: { type: "string" },
        progress_overview: { type: "string" },
        milestones: { type: "string" },
        materials_summary: { type: "string" },
        concerns: { type: "string" },
        next_steps: { type: "string" }
      }
    }
  });

  // Build HTML report
  const photoHtml = sitePhotos.length > 0
    ? `<h3 style="color:#d4af37;margin-top:20px;">Site Photos</h3>
       <div style="display:flex;flex-wrap:wrap;gap:8px;">
         ${sitePhotos.slice(0, 6).map(p => `<img src="${p.url}" style="width:120px;height:90px;object-fit:cover;border-radius:6px;" />`).join('')}
       </div>`
    : '';

  const stagesHtml = workStages.length > 0
    ? `<h3 style="color:#d4af37;margin-top:20px;">Work Stages</h3>
       <table style="width:100%;border-collapse:collapse;font-size:13px;">
         ${workStages.map(s => `<tr><td style="padding:4px 8px;">${s.done ? '✅' : '⬜'} ${s.name}</td></tr>`).join('')}
       </table>`
    : '';

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family:'Inter',Arial,sans-serif;max-width:650px;margin:0 auto;padding:30px;color:#333;background:#fff;">
  <div style="background:linear-gradient(135deg,#1a1a2e,#16213e);color:white;padding:30px;border-radius:12px;margin-bottom:20px;">
    <h1 style="margin:0;font-size:22px;">Project Status Report</h1>
    <p style="margin:4px 0 0;opacity:0.7;font-size:13px;">${job.job_name} — ${new Date().toLocaleDateString()}</p>
  </div>

  <div style="background:#f8f9fa;padding:16px;border-radius:8px;margin-bottom:16px;">
    <table style="width:100%;font-size:13px;">
      <tr><td style="color:#666;padding:3px 0;">Location</td><td style="font-weight:600;">${job.city}, ${job.state}</td></tr>
      <tr><td style="color:#666;padding:3px 0;">Type</td><td style="font-weight:600;">${(job.project_type || '').replace(/_/g,' ')}</td></tr>
      <tr><td style="color:#666;padding:3px 0;">Phase</td><td style="font-weight:600;">${(job.project_phase || '').replace(/_/g,' ')}</td></tr>
      <tr><td style="color:#666;padding:3px 0;">Sqft</td><td style="font-weight:600;">${(job.flooring_sqft || job.total_sqft || 0).toLocaleString()}</td></tr>
      <tr><td style="color:#666;padding:3px 0;">Progress</td><td style="font-weight:600;">${progressPct}% (${completedStages}/${totalStages} stages)</td></tr>
    </table>
  </div>

  <h3 style="color:#d4af37;">Executive Summary</h3>
  <p style="font-size:14px;line-height:1.6;">${report.executive_summary || ''}</p>

  <h3 style="color:#d4af37;">Progress Overview</h3>
  <p style="font-size:14px;line-height:1.6;">${report.progress_overview || ''}</p>

  ${stagesHtml}

  <h3 style="color:#d4af37;">Key Milestones</h3>
  <p style="font-size:14px;line-height:1.6;">${report.milestones || ''}</p>

  <h3 style="color:#d4af37;">Materials Summary</h3>
  <p style="font-size:14px;line-height:1.6;">${report.materials_summary || ''}</p>

  ${report.concerns ? `<h3 style="color:#e74c3c;">Concerns</h3><p style="font-size:14px;line-height:1.6;">${report.concerns}</p>` : ''}

  <h3 style="color:#d4af37;">Next Steps</h3>
  <p style="font-size:14px;line-height:1.6;">${report.next_steps || ''}</p>

  ${photoHtml}

  <hr style="margin:30px 0;border:none;border-top:1px solid #e0e0e0;" />
  <p style="font-size:11px;color:#999;text-align:center;">
    Generated by XPS Intelligence Platform — Xtreme Polishing Systems<br/>
    Report Date: ${new Date().toLocaleString()}
  </p>
</body>
</html>`;

  // Send email if requested
  if (send_to) {
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: send_to,
      subject: `Project Status Report: ${job.job_name} — ${new Date().toLocaleDateString()}`,
      body: html,
      from_name: "XPS Project Reports"
    });
  }

  return Response.json({
    success: true,
    report: { ...report, html },
    job_name: job.job_name,
    progress_pct: progressPct,
    email_sent: !!send_to
  });
});