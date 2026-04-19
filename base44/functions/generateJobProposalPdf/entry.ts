import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { job_id, pricing_tier, custom_price_per_sqft } = await req.json();
  if (!job_id) return Response.json({ error: 'job_id required' }, { status: 400 });

  // Fetch job
  const jobs = await base44.asServiceRole.entities.CommercialJob.filter({ id: job_id });
  const job = jobs[0];
  if (!job) return Response.json({ error: 'Job not found' }, { status: 404 });

  let takeoff = {};
  try { takeoff = JSON.parse(job.takeoff_data || '{}'); } catch {}

  // Optionally run dynamic pricing
  let pricingData = null;
  if (!custom_price_per_sqft) {
    const pricingRes = await base44.asServiceRole.functions.invoke('dynamicPricing', {
      job_id,
      service_type: job.flooring_system_recommendation || 'Epoxy Floor Coating',
      square_footage: job.flooring_sqft || job.total_sqft || 0,
      city: job.city,
      state: job.state,
      project_type: job.project_type,
      complexity: 'medium'
    });
    pricingData = pricingRes?.pricing || null;
  }

  // Determine final price
  const sqft = job.flooring_sqft || job.total_sqft || 0;
  let pricePerSqft = custom_price_per_sqft || 0;
  if (!pricePerSqft && pricingData) {
    const tier = pricing_tier || 'optimal';
    pricePerSqft = pricingData.price_tiers?.[tier]?.price_per_sqft || pricingData.recommended_price_per_sqft || 5;
  }
  if (!pricePerSqft) pricePerSqft = 5;
  const totalBid = Math.round(sqft * pricePerSqft);

  // Generate proposal content via LLM
  const proposalContent = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are a professional proposal writer for Xtreme Polishing Systems (XPS).

PROJECT: ${job.job_name}
LOCATION: ${job.city}, ${job.state}
TYPE: ${job.project_type}
SQFT: ${sqft}
SYSTEM: ${job.flooring_system_recommendation || 'Epoxy Floor Coating'}
PRICE/SQFT: $${pricePerSqft.toFixed(2)}
TOTAL: $${totalBid.toLocaleString()}
RECIPIENT: ${job.gc_name || job.owner_name || 'Client'}
CONTACT: ${job.gc_contact || job.owner_contact || ''}

TAKEOFF ZONES:
${JSON.stringify(takeoff.zones || [], null, 2)}

DYNAMIC PRICING ANALYSIS:
${pricingData ? JSON.stringify({ market_analysis: pricingData.market_analysis, cost_breakdown: pricingData.cost_breakdown, competitor_range: pricingData.competitor_price_range }, null, 2) : 'N/A'}

Write a professional flooring proposal with these sections:
1. Executive Summary (2-3 sentences)
2. Scope of Work (detailed, zone-by-zone from takeoff)
3. Materials Specification (all products, brands, coverage rates)
4. Zone Pricing Table data (zone name, sqft, system, cost per zone)
5. Project Timeline (phases with durations)
6. Terms & Conditions (payment 50% deposit / 50% completion, warranty, insurance)
7. Company Qualifications (XPS: 60+ locations, 200+ techs, 15+ years, licensed/bonded/insured)

Keep it concise and professional. Each section should be a few paragraphs max.`,
    response_json_schema: {
      type: "object",
      properties: {
        executive_summary: { type: "string" },
        scope_of_work: { type: "string" },
        materials_spec: { type: "string" },
        zone_pricing: { type: "array", items: { type: "object", properties: { zone: { type: "string" }, sqft: { type: "number" }, system: { type: "string" }, cost: { type: "number" } } } },
        timeline: { type: "string" },
        terms: { type: "string" },
        qualifications: { type: "string" }
      }
    }
  });

  // Build PDF
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentW = pw - margin * 2;
  let y = 20;

  const checkPage = (needed) => {
    if (y + needed > 270) { doc.addPage(); y = 20; }
  };

  const addSectionTitle = (title) => {
    checkPage(16);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 134, 11);
    doc.text(title, margin, y);
    y += 3;
    doc.setDrawColor(180, 134, 11);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pw - margin, y);
    y += 8;
  };

  const addParagraph = (text) => {
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    const lines = doc.splitTextToSize(text || '', contentW);
    for (const line of lines) {
      checkPage(5);
      doc.text(line, margin, y);
      y += 4.5;
    }
    y += 4;
  };

  // ——— HEADER ———
  doc.setFillColor(15, 15, 25);
  doc.rect(0, 0, pw, 42, 'F');
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(212, 175, 55);
  doc.text('XTREME POLISHING SYSTEMS', margin, 18);
  doc.setFontSize(10);
  doc.setTextColor(180, 180, 180);
  doc.text("America's Premier Flooring Solutions Provider", margin, 26);
  doc.setFontSize(9);
  doc.setTextColor(140, 140, 140);
  doc.text(`Proposal #${Date.now().toString(36).toUpperCase()} | ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, 34);
  y = 52;

  // ——— PROJECT INFO BOX ———
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(margin, y, contentW, 28, 3, 3, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text(job.job_name || 'Project Proposal', margin + 6, y + 8);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`Location: ${job.city || ''}, ${job.state || ''} | Type: ${(job.project_type || '').replace(/_/g, ' ')}`, margin + 6, y + 15);
  doc.text(`Prepared for: ${job.gc_name || job.owner_name || 'Client'} | ${job.gc_email || job.owner_email || ''}`, margin + 6, y + 22);
  y += 36;

  // ——— EXECUTIVE SUMMARY ———
  addSectionTitle('EXECUTIVE SUMMARY');
  addParagraph(proposalContent.executive_summary);

  // ——— SCOPE OF WORK ———
  addSectionTitle('SCOPE OF WORK');
  addParagraph(proposalContent.scope_of_work);

  // ——— MATERIALS ———
  addSectionTitle('MATERIALS SPECIFICATION');
  addParagraph(proposalContent.materials_spec);

  // ——— ZONE PRICING TABLE ———
  addSectionTitle('PRICING BREAKDOWN');

  const zones = proposalContent.zone_pricing || [];
  if (zones.length > 0) {
    // Table header
    checkPage(12);
    doc.setFillColor(30, 30, 45);
    doc.rect(margin, y - 1, contentW, 7, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Zone', margin + 3, y + 4);
    doc.text('Sqft', margin + 70, y + 4);
    doc.text('System', margin + 95, y + 4);
    doc.text('Cost', margin + 145, y + 4);
    y += 9;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    let runningTotal = 0;
    zones.forEach((z, i) => {
      checkPage(7);
      if (i % 2 === 0) { doc.setFillColor(248, 248, 248); doc.rect(margin, y - 3.5, contentW, 6, 'F'); }
      doc.setFontSize(8);
      doc.text((z.zone || '').substring(0, 30), margin + 3, y);
      doc.text(String(z.sqft || ''), margin + 70, y);
      doc.text((z.system || '').substring(0, 25), margin + 95, y);
      doc.text(`$${(z.cost || 0).toLocaleString()}`, margin + 145, y);
      runningTotal += z.cost || 0;
      y += 6;
    });

    // Total row
    checkPage(10);
    doc.setDrawColor(180, 134, 11);
    doc.setLineWidth(0.4);
    doc.line(margin, y, pw - margin, y);
    y += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 134, 11);
    doc.text('TOTAL PROJECT INVESTMENT', margin + 3, y);
    doc.text(`$${totalBid.toLocaleString()}`, margin + 145, y);
    y += 4;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`($${pricePerSqft.toFixed(2)}/sqft x ${sqft.toLocaleString()} sqft)`, margin + 3, y);
    y += 10;
  } else {
    // Simple pricing display
    checkPage(14);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 134, 11);
    doc.text(`$${totalBid.toLocaleString()}`, margin, y);
    y += 6;
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`$${pricePerSqft.toFixed(2)}/sqft x ${sqft.toLocaleString()} sqft`, margin, y);
    y += 12;
  }

  // ——— TIMELINE ———
  addSectionTitle('PROJECT TIMELINE');
  addParagraph(proposalContent.timeline);

  // ——— TERMS ———
  addSectionTitle('TERMS & CONDITIONS');
  addParagraph(proposalContent.terms);

  // ——— QUALIFICATIONS ———
  addSectionTitle('COMPANY QUALIFICATIONS');
  addParagraph(proposalContent.qualifications);

  // ——— SIGNATURE BLOCK ———
  checkPage(50);
  y += 6;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pw - margin, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text('ACCEPTANCE & AUTHORIZATION', margin, y);
  y += 10;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text('By signing below, Client authorizes XPS to proceed with the above scope of work at the stated investment.', margin, y);
  y += 14;

  // Two-column signature
  const col1 = margin;
  const col2 = pw / 2 + 5;
  const sigW = contentW / 2 - 10;

  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.text('CLIENT', col1, y);
  doc.text('XTREME POLISHING SYSTEMS', col2, y);
  y += 14;

  doc.setDrawColor(150, 150, 150);
  doc.line(col1, y, col1 + sigW, y);
  doc.line(col2, y, col2 + sigW, y);
  y += 5;
  doc.text('Signature', col1, y);
  doc.text('Signature', col2, y);
  y += 12;

  doc.line(col1, y, col1 + sigW, y);
  doc.line(col2, y, col2 + sigW, y);
  y += 5;
  doc.text('Printed Name & Title', col1, y);
  doc.text('Printed Name & Title', col2, y);
  y += 12;

  doc.line(col1, y, col1 + sigW, y);
  doc.line(col2, y, col2 + sigW, y);
  y += 5;
  doc.text('Date', col1, y);
  doc.text('Date', col2, y);

  // ——— FOOTER on every page ———
  const pages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    const ph = doc.internal.pageSize.getHeight();
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text('Xtreme Polishing Systems | xtremepolishingsystems.com | Licensed, Bonded & Insured', margin, ph - 8);
    doc.text(`Page ${p} of ${pages}`, pw - margin - 20, ph - 8);
  }

  // Output PDF as bytes
  const pdfBytes = doc.output('arraybuffer');

  // Upload the PDF
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const file = new File([blob], `XPS-Proposal-${job.job_name?.replace(/[^a-zA-Z0-9]/g, '-') || 'project'}.pdf`, { type: 'application/pdf' });
  const { file_url } = await base44.asServiceRole.integrations.Core.UploadFile({ file });

  // Create Proposal entity
  const proposal = await base44.asServiceRole.entities.Proposal.create({
    title: `Proposal: ${job.job_name}`,
    client_name: job.gc_name || job.owner_name || 'Client',
    client_contact: job.gc_contact || job.owner_contact || '',
    client_email: job.gc_email || job.owner_email || '',
    service_type: job.flooring_system_recommendation || 'Epoxy Floor Coating',
    square_footage: sqft,
    price_per_sqft: pricePerSqft,
    total_value: totalBid,
    scope_of_work: proposalContent.scope_of_work || '',
    materials: proposalContent.materials_spec || '',
    timeline: proposalContent.timeline || '',
    terms: proposalContent.terms || '50% deposit, 50% on completion',
    status: 'Draft',
    notes: `PDF: ${file_url}`
  });

  // Update job
  await base44.asServiceRole.entities.CommercialJob.update(job_id, {
    bid_status: 'bid_generated',
    estimated_flooring_value: totalBid
  });

  return Response.json({
    success: true,
    pdf_url: file_url,
    proposal_id: proposal.id,
    total_bid: totalBid,
    price_per_sqft: pricePerSqft,
    zones_count: zones.length,
    pricing_data: pricingData ? {
      recommended: pricingData.recommended_price_per_sqft,
      tiers: pricingData.price_tiers
    } : null
  });
});