import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * INTEL → OPS ENRICHMENT SYNC
 * Triggered when a new IntelRecord is created.
 * Checks if it can enrich any Lead, ContractorCompany, or CommercialJob.
 * Matches by company name (fuzzy), location, or tags.
 */
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // Automation-triggered — no user auth required
  const body = await req.json().catch(() => ({}));
  const intelData = body.data || {};
  const intelId = intelData.id || body.event?.entity_id;

  if (!intelId) {
    return Response.json({ skipped: true, reason: 'No intel record ID' });
  }

  // Fetch the intel record
  let intel = null;
  try {
    const records = await base44.asServiceRole.entities.IntelRecord.filter({ id: intelId });
    intel = records[0];
  } catch (e) {
    return Response.json({ skipped: true, reason: `Could not fetch IntelRecord: ${e.message}` });
  }
  if (!intel) return Response.json({ skipped: true, reason: 'IntelRecord not found' });

  // Skip if it's a profile record (already linked)
  if (intel.title?.startsWith('Full Profile:')) {
    return Response.json({ skipped: true, reason: 'Profile record — already linked' });
  }

  const results = { intel_id: intelId, title: intel.title, enriched: [] };

  // Extract searchable terms from the intel record
  const searchTerms = [];
  if (intel.title) searchTerms.push(intel.title.toLowerCase());
  if (intel.tags) searchTerms.push(...intel.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean));
  if (intel.industry) searchTerms.push(intel.industry.toLowerCase());
  const contentPreview = (intel.content || '').toLowerCase().substring(0, 2000);

  // ═══ MATCH AGAINST LEADS ═══
  const leads = await base44.asServiceRole.entities.Lead.list('-created_date', 200);

  for (const lead of leads) {
    if (!lead.company) continue;
    const companyLower = lead.company.toLowerCase();

    // Check if any search term contains the company name or vice versa
    const isMatch = searchTerms.some(term =>
      term.includes(companyLower) || companyLower.includes(term)
    ) || contentPreview.includes(companyLower);

    if (!isMatch) continue;

    // Enrich the lead
    const updates = {};
    const enrichNotes = [];

    // Extract useful data from intel content
    if (intel.category === 'pricing' && intel.pricing_data) {
      enrichNotes.push(`Pricing intel: ${intel.pricing_data.substring(0, 200)}`);
    }
    if (intel.category === 'review' || intel.category === 'testimonial') {
      enrichNotes.push(`Review/testimonial data available`);
    }
    if (intel.category === 'news') {
      enrichNotes.push(`Recent news: ${intel.title}`);
    }
    if (intel.category === 'social_media' && intel.engagement_metrics) {
      enrichNotes.push(`Social presence: ${intel.engagement_metrics.substring(0, 200)}`);
    }

    // Update enrichment tracking
    updates.enrichment_count = (lead.enrichment_count || 0) + 1;
    updates.last_enriched = new Date().toISOString();

    // Append intel record ID to linked list
    const existingIds = lead.intel_record_ids || '';
    if (!existingIds.includes(intelId)) {
      updates.intel_record_ids = existingIds ? `${existingIds},${intelId}` : intelId;
    }

    // Append enrichment note
    if (enrichNotes.length > 0) {
      const note = `[EnrichSync ${new Date().toISOString().split('T')[0]}] ${enrichNotes.join('. ')}`;
      updates.notes = ((lead.notes || '') + '\n' + note).substring(0, 4000);
    }

    await base44.asServiceRole.entities.Lead.update(lead.id, updates);
    results.enriched.push({ type: 'Lead', id: lead.id, company: lead.company });
  }

  // ═══ MATCH AGAINST CONTRACTOR COMPANIES ═══
  const contractors = await base44.asServiceRole.entities.ContractorCompany.list('-created_date', 100);

  for (const gc of contractors) {
    if (!gc.company_name) continue;
    const gcLower = gc.company_name.toLowerCase();

    const isMatch = searchTerms.some(term =>
      term.includes(gcLower) || gcLower.includes(term)
    ) || contentPreview.includes(gcLower);

    if (!isMatch) continue;

    const note = `[EnrichSync ${new Date().toISOString().split('T')[0]}] Intel match: ${intel.title} (${intel.category})`;
    await base44.asServiceRole.entities.ContractorCompany.update(gc.id, {
      notes: ((gc.notes || '') + '\n' + note).substring(0, 4000),
      last_updated: new Date().toISOString(),
    });
    results.enriched.push({ type: 'ContractorCompany', id: gc.id, name: gc.company_name });
  }

  // ═══ MATCH AGAINST COMMERCIAL JOBS ═══
  const jobs = await base44.asServiceRole.entities.CommercialJob.list('-created_date', 100);

  for (const job of jobs) {
    const jobLower = (job.job_name || '').toLowerCase();
    const gcLower = (job.gc_name || '').toLowerCase();
    const ownerLower = (job.owner_name || '').toLowerCase();

    const isMatch = [jobLower, gcLower, ownerLower].some(name =>
      name && searchTerms.some(term => term.includes(name) || name.includes(term))
    ) || (jobLower && contentPreview.includes(jobLower));

    if (!isMatch) continue;

    const note = `[EnrichSync ${new Date().toISOString().split('T')[0]}] Intel match: ${intel.title}`;
    await base44.asServiceRole.entities.CommercialJob.update(job.id, {
      notes: ((job.notes || '') + '\n' + note).substring(0, 4000),
    });
    results.enriched.push({ type: 'CommercialJob', id: job.id, name: job.job_name });
  }

  // Log activity
  if (results.enriched.length > 0) {
    await base44.asServiceRole.entities.AgentActivity.create({
      agent_name: 'Enrichment Sync',
      action: `Intel "${intel.title}" enriched ${results.enriched.length} records`,
      status: 'success',
      category: 'enrichment',
      details: JSON.stringify(results),
    });
  }

  return Response.json({ success: true, ...results });
});