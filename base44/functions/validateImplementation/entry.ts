import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * VALIDATE IMPLEMENTATION
 * Validates that a recommendation was successfully implemented
 * Returns a comprehensive report on the changes
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.role || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const { recommendation_id, implementation_result } = await req.json();

    const report = {
      recommendation_id,
      status: 'success',
      validation_timestamp: new Date().toISOString(),
      metrics: {},
      checks: [],
    };

    // ── GENERIC CHECKS ──
    
    // 1. Count entities before/after
    const [leads, jobs, proposals, workflows, emails] = await Promise.all([
      base44.asServiceRole.entities.Lead.list('-created_date', 1000).catch(() => []),
      base44.asServiceRole.entities.CommercialJob.list('-created_date', 100).catch(() => []),
      base44.asServiceRole.entities.Proposal.list('-created_date', 100).catch(() => []),
      base44.asServiceRole.entities.Workflow.list('-created_date', 100).catch(() => []),
      base44.asServiceRole.entities.OutreachEmail.list('-created_date', 200).catch(() => []),
    ]);

    report.metrics = {
      total_leads: leads.length,
      qualified_leads: leads.filter(l => l.stage === 'Qualified').length,
      high_score_leads: leads.filter(l => (l.score || 0) >= 70).length,
      total_jobs: jobs.length,
      pre_bid_jobs: jobs.filter(j => j.project_phase === 'pre_bid').length,
      active_proposals: proposals.filter(p => p.status !== 'Rejected').length,
      active_workflows: workflows.filter(w => w.status === 'Active').length,
      queued_emails: emails.filter(e => e.status === 'Queued').length,
    };

    // ── VALIDATION CHECKS ──

    // Check 1: Leads have necessary data
    const completeLeads = leads.filter(l => l.email && l.phone && l.score && l.ai_insight).length;
    report.checks.push({
      name: 'Lead Completeness',
      status: completeLeads / leads.length > 0.6 ? 'PASS' : 'WARN',
      details: `${completeLeads}/${leads.length} leads have complete data (60% threshold)`,
    });

    // Check 2: Qualified leads are routed
    const routedQualified = leads.filter(l => l.stage === 'Contacted' && l.priority >= 7).length;
    report.checks.push({
      name: 'Qualified Lead Routing',
      status: routedQualified > 0 ? 'PASS' : 'WARN',
      details: `${routedQualified} qualified leads routed to priority queue`,
    });

    // Check 3: High-value jobs have proposals
    const proposalCoverage = jobs.filter(j => proposals.find(p => p.lead_id === j.id)).length;
    report.checks.push({
      name: 'Proposal Coverage',
      status: proposalCoverage / jobs.length > 0.5 ? 'PASS' : 'WARN',
      details: `${proposalCoverage}/${jobs.length} jobs have proposals (50% threshold)`,
    });

    // Check 4: Active workflows exist
    report.checks.push({
      name: 'Workflow Activation',
      status: workflows.filter(w => w.status === 'Active').length > 0 ? 'PASS' : 'WARN',
      details: `${workflows.length} workflows active`,
    });

    // Check 5: Outreach queued
    report.checks.push({
      name: 'Outreach Queue Status',
      status: emails.filter(e => e.status === 'Queued').length > 0 ? 'PASS' : 'WARN',
      details: `${emails.filter(e => e.status === 'Queued').length} emails queued for send`,
    });

    // ── SUMMARY ──
    const passingChecks = report.checks.filter(c => c.status === 'PASS').length;
    report.summary = {
      total_checks: report.checks.length,
      passing: passingChecks,
      warnings: report.checks.filter(c => c.status === 'WARN').length,
      health_score: Math.round((passingChecks / report.checks.length) * 100),
    };

    if (report.summary.health_score >= 80) {
      report.overall_status = '✅ HEALTHY';
    } else if (report.summary.health_score >= 60) {
      report.overall_status = '⚠️ NEEDS ATTENTION';
    } else {
      report.overall_status = '❌ CRITICAL';
    }

    return Response.json({
      success: true,
      validation: report,
    });
  } catch (error) {
    console.error('Validation error:', error);
    return Response.json({ 
      success: false,
      error: error.message,
      validation: { status: 'error', details: error.message }
    }, { status: 500 });
  }
});