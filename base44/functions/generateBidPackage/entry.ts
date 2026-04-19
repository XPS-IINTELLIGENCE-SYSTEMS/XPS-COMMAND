import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { job_id, send_email } = await req.json();
  if (!job_id) return Response.json({ error: 'job_id required' }, { status: 400 });

  const jobs = await base44.asServiceRole.entities.CommercialJob.filter({ id: job_id });
  const job = jobs[0];
  if (!job) return Response.json({ error: 'Job not found' }, { status: 404 });

  let takeoff = {};
  try { takeoff = JSON.parse(job.takeoff_data || "{}"); } catch {}

  const recipientEmail = job.gc_email || job.owner_email || "";
  const recipientName = job.gc_contact || job.gc_name || job.owner_contact || job.owner_name || "Project Manager";
  const recipientCompany = job.gc_name || job.owner_name || "";

  const bidNumber = `BID-${Date.now().toString(36).toUpperCase()}`;

  const prompt = `You are a professional bid/proposal writer for Xtreme Polishing Systems (XPS) and National Concrete Polishing (NCP).

COMPANY CREDENTIALS:
- Xtreme Polishing Systems (XPS) — America's premier flooring solutions provider
- National Concrete Polishing (NCP) — Professional installation division
- 60+ franchise locations nationwide
- 200+ certified technicians
- Licensed, bonded, insured in all 50 states
- OSHA compliant, EPA compliant
- Manufacturer of proprietary epoxy and coating systems
- 15+ years industry experience
- Over 10,000 completed commercial projects
- Military/government clearance capable
- Prevailing wage compliant

PROJECT: ${job.job_name}
LOCATION: ${job.address || ''} ${job.city}, ${job.state} ${job.zip || ''}
TYPE: ${job.project_type} | SECTOR: ${job.sector || 'Commercial'}
SQFT: ${job.flooring_sqft || job.total_sqft || 'TBD'}
RECIPIENT: ${recipientName} at ${recipientCompany}

TAKEOFF DATA:
${JSON.stringify(takeoff, null, 2)}

Create a COMPLETE professional bid package including:

1. COVER LETTER — Professional, personalized to the project
2. SCOPE OF WORK — Detailed breakdown of all work to be performed
3. MATERIALS SPECIFICATION — All products with technical specs
4. PRICING — Zone-by-zone pricing with totals
5. TIMELINE — Project schedule
6. TERMS & CONDITIONS — Payment terms, warranty, insurance
7. COMPANY QUALIFICATIONS — Certifications, experience, references
8. WARRANTY — Product and labor warranty details

Also create a professional cover email to send with the bid.

Format the bid document as clean HTML suitable for PDF generation.`;

  const bidResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    model: "claude_sonnet_4_6",
    response_json_schema: {
      type: "object",
      properties: {
        bid_document_html: { type: "string" },
        scope_of_work: { type: "string" },
        materials_spec: { type: "string" },
        cover_email_subject: { type: "string" },
        cover_email_body: { type: "string" },
        total_material_cost: { type: "number" },
        total_labor_cost: { type: "number" },
        overhead_markup: { type: "number" },
        profit_margin: { type: "number" },
        total_bid_value: { type: "number" },
        warranty_terms: { type: "string" },
        payment_terms: { type: "string" },
        timeline_summary: { type: "string" }
      }
    }
  });

  const bidDoc = await base44.asServiceRole.entities.BidDocument.create({
    job_id,
    bid_number: bidNumber,
    bid_date: new Date().toISOString().split('T')[0],
    recipient_name: recipientName,
    recipient_email: recipientEmail,
    recipient_company: recipientCompany,
    project_name: job.job_name,
    project_address: `${job.address || ''} ${job.city}, ${job.state} ${job.zip || ''}`,
    takeoff_data: job.takeoff_data || "",
    scope_of_work: bidResult.scope_of_work || "",
    materials_spec: bidResult.materials_spec || "",
    total_material_cost: bidResult.total_material_cost || takeoff.total_material_cost || 0,
    total_labor_cost: bidResult.total_labor_cost || takeoff.total_labor_cost || 0,
    overhead_markup: bidResult.overhead_markup || 0,
    profit_margin: bidResult.profit_margin || 0,
    total_bid_value: bidResult.total_bid_value || takeoff.total_bid_value || 0,
    bid_document_content: bidResult.bid_document_html || "",
    credentials_included: true,
    cover_email_subject: bidResult.cover_email_subject || `Bid Proposal: ${job.job_name}`,
    cover_email_body: bidResult.cover_email_body || "",
    send_status: "draft",
    validation_passed: true
  });

  await base44.asServiceRole.entities.CommercialJob.update(job_id, {
    bid_status: "bid_generated",
    bid_document_id: bidDoc.id,
    estimated_flooring_value: bidResult.total_bid_value || job.estimated_flooring_value
  });

  if (send_email && recipientEmail) {
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: recipientEmail,
      subject: bidResult.cover_email_subject || `Bid Proposal: ${job.job_name}`,
      body: bidResult.cover_email_body || "",
      from_name: "XPS Bid Department"
    });

    await base44.asServiceRole.entities.BidDocument.update(bidDoc.id, {
      send_status: "sent",
      sent_time: new Date().toISOString()
    });
    await base44.asServiceRole.entities.CommercialJob.update(job_id, { bid_status: "sent" });
  }

  return Response.json({
    success: true,
    bid_id: bidDoc.id,
    bid_number: bidNumber,
    total_bid_value: bidResult.total_bid_value,
    email_sent: send_email && !!recipientEmail
  });
});