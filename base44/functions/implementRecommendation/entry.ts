import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * IMPLEMENT RECOMMENDATION
 * Takes a Guardian/Orchestrator recommendation and applies it to the system
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.role || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const { recommendation } = await req.json();
    if (!recommendation?.type) {
      return Response.json({ error: 'recommendation.type required' }, { status: 400 });
    }

    const changes = [];

    // ── WORKFLOW RECOMMENDATIONS ──
    if (recommendation.type === 'create_workflow') {
      const { name, triggers, actions } = recommendation.data;
      const workflow = await base44.asServiceRole.entities.Workflow.create({
        name,
        trigger_type: triggers?.[0] || 'manual',
        actions: JSON.stringify(actions || []),
        status: 'Active',
      });
      changes.push(`✅ Created workflow: ${name} (ID: ${workflow.id})`);
    }

    // ── LEAD ROUTING RECOMMENDATIONS ──
    else if (recommendation.type === 'route_hot_leads') {
      const hotLeads = await base44.asServiceRole.entities.Lead.list('-score', 50);
      const filtered = hotLeads.filter(l => l.score > 75 && l.stage === 'Qualified');
      
      for (const lead of filtered) {
        await base44.asServiceRole.entities.Lead.update(lead.id, {
          stage: 'Contacted',
          priority: 10,
        });
      }
      changes.push(`✅ Routed ${filtered.length} hot leads to priority queue`);
    }

    // ── EMAIL TEMPLATE RECOMMENDATIONS ──
    else if (recommendation.type === 'create_email_template') {
      const { name, subject, body, category } = recommendation.data;
      const template = await base44.asServiceRole.entities.MessageTemplate.create({
        name,
        subject,
        body,
        category,
        channel: 'Email',
        is_active: true,
      });
      changes.push(`✅ Created email template: ${name}`);
    }

    // ── SCORE ADJUSTMENT RECOMMENDATIONS ──
    else if (recommendation.type === 'adjust_scoring_logic') {
      const leads = await base44.asServiceRole.entities.Lead.list('-created_date', 100);
      let updated = 0;
      
      for (const lead of leads) {
        if (!lead.score) {
          // Recalculate score based on available data
          let score = 50;
          if (lead.email && lead.phone) score += 15;
          if (lead.vertical && lead.specialty) score += 10;
          if (lead.estimated_value > 10000) score += 15;
          if (lead.ai_insight) score += 10;

          await base44.asServiceRole.entities.Lead.update(lead.id, { score: Math.min(100, score) });
          updated++;
        }
      }
      changes.push(`✅ Rescored ${updated} leads using adjusted logic`);
    }

    // ── PROPOSAL GENERATION RECOMMENDATIONS ──
    else if (recommendation.type === 'generate_proposals') {
      const jobs = await base44.asServiceRole.entities.CommercialJob.list('-urgency_score', 20);
      const bidReady = jobs.filter(j => j.project_phase === 'pre_bid' && j.estimated_flooring_value > 0);
      
      for (const job of bidReady) {
        const proposal = await base44.asServiceRole.entities.Proposal.create({
          title: `Proposal for ${job.job_name}`,
          client_name: job.owner_email ? 'Project Owner' : 'Client',
          service_type: 'Epoxy Floor Coating',
          total_value: job.estimated_flooring_value || 0,
          status: 'Draft',
          lead_id: job.id,
        });
      }
      changes.push(`✅ Generated ${bidReady.length} proposals for pre-bid jobs`);
    }

    // ── OUTREACH AUTOMATION RECOMMENDATIONS ──
    else if (recommendation.type === 'auto_send_emails') {
      const leads = await base44.asServiceRole.entities.Lead.list('-created_date', 20);
      const toContact = leads.filter(l => l.email && l.stage === 'Qualified' && !l.last_contacted);
      
      for (const lead of toContact) {
        await base44.asServiceRole.entities.OutreachEmail.create({
          to_email: lead.email,
          to_name: lead.contact_name,
          subject: `Custom flooring solution for ${lead.company}`,
          body: `Hi ${lead.contact_name},\n\nWe specialize in ${lead.specialty || 'high-performance'} flooring solutions. Would you be open to a brief conversation?\n\nBest regards,\nXPS Team`,
          status: 'Queued',
          lead_id: lead.id,
        });
      }
      changes.push(`✅ Queued ${toContact.length} outreach emails`);
    }

    // ── DATA CLEANUP RECOMMENDATIONS ──
    else if (recommendation.type === 'cleanup_duplicates') {
      const leads = await base44.asServiceRole.entities.Lead.list('-created_date', 500);
      const seen = new Set();
      const duplicates = [];
      
      for (const lead of leads) {
        const key = `${lead.company}-${lead.contact_name}`.toLowerCase();
        if (seen.has(key)) {
          duplicates.push(lead.id);
        }
        seen.add(key);
      }
      
      // Mark duplicates as archived by setting a flag (don't delete—preserve audit trail)
      for (const dupId of duplicates) {
        // Could update to set a 'is_duplicate' flag if field exists
      }
      changes.push(`✅ Identified ${duplicates.length} potential duplicates`);
    }

    // ── SCORING THRESHOLD RECOMMENDATIONS ──
    else if (recommendation.type === 'prioritize_by_threshold') {
      const threshold = recommendation.data?.threshold || 70;
      const leads = await base44.asServiceRole.entities.Lead.list('-score', 100);
      let prioritized = 0;
      
      for (const lead of leads) {
        if ((lead.score || 0) >= threshold && lead.priority < 8) {
          await base44.asServiceRole.entities.Lead.update(lead.id, { priority: 8 });
          prioritized++;
        }
      }
      changes.push(`✅ Prioritized ${prioritized} high-score leads (score >= ${threshold})`);
    }

    return Response.json({
      success: true,
      recommendation_id: recommendation.id,
      message: `Implemented: ${recommendation.title}`,
      changes,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Implementation error:', error);
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
});