import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * LEAD LIFECYCLE MANAGER
 * Triggered on Lead update (stage or score changes)
 * - Lost → Dormant transition with reason codes
 * - Won → Intel feedback loop (captures winning patterns)
 * - Score-based auto-reactivation of dormant leads
 * - Stage progression validation
 */
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // Automation-triggered — no user auth required
  const body = await req.json().catch(() => ({}));

  // Support entity automation payload
  const leadId = body.data?.id || body.event?.entity_id || body.lead_id;
  const data = body.data || {};
  const oldData = body.old_data || {};
  const changedFields = body.changed_fields || [];

  if (!leadId) {
    return Response.json({ skipped: true, reason: 'No lead ID in payload' });
  }

  // Fetch the full lead
  const leads = await base44.asServiceRole.entities.Lead.filter({ id: leadId });
  const lead = leads[0];
  if (!lead) return Response.json({ skipped: true, reason: 'Lead not found' });

  const results = { lead_id: leadId, company: lead.company, actions: [] };

  // ═══ STAGE CHANGE HANDLING ═══
  if (changedFields.includes('stage')) {
    const oldStage = oldData.stage;
    const newStage = data.stage || lead.stage;

    // LOST → DORMANT
    if (newStage === 'Lost') {
      await base44.asServiceRole.entities.Lead.update(leadId, {
        stage: 'Dormant',
        dormant_date: new Date().toISOString(),
        dormant_reason: lead.dormant_reason || 'Lost Deal',
        reactivation_date: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
        data_bank_origin: 'recycled',
      });
      results.actions.push('Lost→Dormant transition');
    }

    // WON → Intel feedback loop
    if (newStage === 'Won') {
      // Create intel record capturing the winning pattern
      const winPattern = {
        company: lead.company,
        vertical: lead.vertical,
        specialty: lead.specialty,
        estimated_value: lead.estimated_value,
        square_footage: lead.square_footage,
        score: lead.score,
        city: lead.city,
        state: lead.state,
        source: lead.source,
        ingestion_source: lead.ingestion_source,
        time_to_close_days: lead.created_date ? Math.round((Date.now() - new Date(lead.created_date).getTime()) / 86400000) : null,
      };

      await base44.asServiceRole.entities.IntelRecord.create({
        source_company: 'XPS Intelligence',
        category: 'case_study',
        title: `Won Deal Pattern: ${lead.company}`,
        content: JSON.stringify(winPattern, null, 2),
        summary: `Won $${(lead.estimated_value || 0).toLocaleString()} ${lead.vertical || ''} deal in ${lead.city || ''}, ${lead.state || ''}. Score: ${lead.score || 'N/A'}.`,
        source_type: 'manual',
        tags: `won,pattern,${lead.vertical || ''},${lead.state || ''}`,
        confidence_score: 95,
        scraped_at: new Date().toISOString(),
        is_indexed: true,
        data_freshness: 'live',
      });
      results.actions.push('Won→Intel feedback captured');
    }

    // DORMANT reactivation check on stage change to anything active
    const activeStages = ['Incoming', 'Validated', 'Qualified', 'Prioritized', 'Contacted', 'Proposal', 'Negotiation'];
    if (oldStage === 'Dormant' && activeStages.includes(newStage)) {
      await base44.asServiceRole.entities.Lead.update(leadId, {
        dormant_reason: null,
        dormant_date: null,
        data_bank_origin: 'recycled',
      });
      results.actions.push(`Reactivated from Dormant→${newStage}`);
    }
  }

  // ═══ SCORE CHANGE HANDLING ═══
  if (changedFields.includes('score')) {
    const newScore = data.score || lead.score || 0;
    const oldScore = oldData.score || 0;

    // Auto-reactivate dormant leads that score high
    if (lead.stage === 'Dormant' && newScore >= 70 && oldScore < 70) {
      await base44.asServiceRole.entities.Lead.update(leadId, {
        stage: 'Qualified',
        pipeline_status: 'Qualified',
        reactivation_trigger: `Score jumped to ${newScore} (was ${oldScore})`,
      });
      results.actions.push(`Auto-reactivated dormant lead (score ${oldScore}→${newScore})`);
    }

    // Auto-priority upgrade
    if (newScore >= 80 && lead.priority < 8) {
      await base44.asServiceRole.entities.Lead.update(leadId, { priority: 9 });
      results.actions.push('Priority upgraded to 9 (hot lead)');
    }
  }

  // Log activity
  if (results.actions.length > 0) {
    await base44.asServiceRole.entities.AgentActivity.create({
      agent_name: 'Lead Lifecycle',
      action: results.actions.join(' | '),
      status: 'success',
      category: 'pipeline',
      related_entity_type: 'Lead',
      related_entity_id: leadId,
      details: JSON.stringify(results),
    });
  }

  return Response.json({ success: true, ...results });
});