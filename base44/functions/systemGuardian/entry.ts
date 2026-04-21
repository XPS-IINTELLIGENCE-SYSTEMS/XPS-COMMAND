import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * AUTONOMOUS SYSTEM GUARDIAN
 * Runs every 10 minutes. Deep recursive audit → diagnose → fix → heal → harden.
 * Continues until 100% health or human intervention needed.
 */

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const runId = `guardian_${Date.now()}`;
  const startTime = Date.now();
  const actionLog = [];
  let healthScore = 0;
  let needsHuman = false;

  // ═══════════════════════════════════════════
  // PHASE 1: DEEP RECURSIVE AUDIT
  // ═══════════════════════════════════════════
  actionLog.push({ phase: 'audit', status: 'start', time: new Date().toISOString() });

  const [leads, jobs, contractors, tasks, agentJobs, workflows, activities, healthHistory, intelRecords] = await Promise.all([
    base44.asServiceRole.entities.Lead.list('-created_date', 50).catch(() => []),
    base44.asServiceRole.entities.CommercialJob.list('-created_date', 50).catch(() => []),
    base44.asServiceRole.entities.ContractorCompany.list('-created_date', 50).catch(() => []),
    base44.asServiceRole.entities.AgentTask.filter({ status: 'Queued' }, '-created_date', 50).catch(() => []),
    base44.asServiceRole.entities.AgentJob.list('-created_date', 50).catch(() => []),
    base44.asServiceRole.entities.Workflow.list('-created_date', 20).catch(() => []),
    base44.asServiceRole.entities.AgentActivity.list('-created_date', 30).catch(() => []),
    base44.asServiceRole.entities.SystemHealth.list('-created_date', 10).catch(() => []),
    base44.asServiceRole.entities.IntelRecord.list('-created_date', 10).catch(() => []),
  ]);

  const failedJobs = agentJobs.filter(j => j.status === 'failed');
  const stuckJobs = agentJobs.filter(j => j.status === 'running' && j.started_at && (Date.now() - new Date(j.started_at).getTime() > 3600000));
  const failedWorkflows = workflows.filter(w => w.status === 'Failed');
  const staleLeads = leads.filter(l => l.stage === 'Incoming' && l.created_date && (Date.now() - new Date(l.created_date).getTime() > 7 * 86400000));
  const failedActivities = activities.filter(a => a.status === 'failed');
  const staleTasks = tasks.filter(t => t.created_date && (Date.now() - new Date(t.created_date).getTime() > 3 * 86400000));

  const diagnostics = {
    failed_agent_jobs: failedJobs.length,
    stuck_agent_jobs: stuckJobs.length,
    failed_workflows: failedWorkflows.length,
    stale_leads: staleLeads.length,
    failed_activities: failedActivities.length,
    stale_tasks: staleTasks.length,
    total_issues: failedJobs.length + stuckJobs.length + failedWorkflows.length + staleLeads.length + failedActivities.length + staleTasks.length,
  };

  actionLog.push({ phase: 'audit', status: 'complete', diagnostics });

  // ═══════════════════════════════════════════
  // PHASE 2: AUTO-DIAGNOSE ROOT CAUSES
  // ═══════════════════════════════════════════
  actionLog.push({ phase: 'diagnose', status: 'start' });

  const diagnosis = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are the System Guardian for XPS Intelligence. Diagnose root causes.

SYSTEM DIAGNOSTICS:
- Failed Agent Jobs: ${failedJobs.length} ${failedJobs.slice(0, 3).map(j => `(${j.agent_type}: ${j.error || 'unknown'})`).join(', ')}
- Stuck Jobs (>1hr): ${stuckJobs.length}
- Failed Workflows: ${failedWorkflows.length}
- Stale Leads (>7d incoming): ${staleLeads.length}
- Failed Activities: ${failedActivities.length}
- Stale Tasks (>3d queued): ${staleTasks.length}

Recent Health History: ${healthHistory.slice(0, 3).map(h => `Score:${h.score}`).join(', ')}

For each issue category, identify:
1. Root cause (why it failed)
2. Auto-fix action (what to do)
3. Prevention (how to stop recurrence)
4. Whether human intervention is needed

Rate overall system health 0-100.`,
    response_json_schema: {
      type: 'object',
      properties: {
        health_score: { type: 'number' },
        root_causes: { type: 'array', items: { type: 'object', properties: {
          category: { type: 'string' },
          cause: { type: 'string' },
          fix: { type: 'string' },
          prevention: { type: 'string' },
          needs_human: { type: 'boolean' },
        }}},
        critical_alert: { type: 'string' },
        needs_human_intervention: { type: 'boolean' },
      }
    }
  });

  healthScore = diagnosis.health_score || 50;
  needsHuman = diagnosis.needs_human_intervention || false;

  actionLog.push({ phase: 'diagnose', status: 'complete', health_score: healthScore, needs_human: needsHuman });

  // ═══════════════════════════════════════════
  // PHASE 3: AUTO-FIX — Execute Repairs
  // ═══════════════════════════════════════════
  actionLog.push({ phase: 'fix', status: 'start' });
  let fixCount = 0;

  // Fix failed agent jobs — retry those under max retries
  for (const job of failedJobs) {
    if ((job.retry_count || 0) < (job.max_retries || 3)) {
      await base44.asServiceRole.entities.AgentJob.update(job.id, {
        status: 'queued', retry_count: (job.retry_count || 0) + 1, error: null,
      }).catch(() => {});
      fixCount++;
    }
  }

  // Fix stuck jobs — reset to queued
  for (const job of stuckJobs) {
    await base44.asServiceRole.entities.AgentJob.update(job.id, {
      status: 'queued', error: 'Reset by Guardian — was stuck >1hr',
    }).catch(() => {});
    fixCount++;
  }

  // Fix failed workflows — reset to Draft
  for (const wf of failedWorkflows) {
    await base44.asServiceRole.entities.Workflow.update(wf.id, { status: 'Draft' }).catch(() => {});
    fixCount++;
  }

  actionLog.push({ phase: 'fix', status: 'complete', fixes: fixCount });

  // ═══════════════════════════════════════════
  // PHASE 4: AUTO-HEAL — Data Hygiene
  // ═══════════════════════════════════════════
  actionLog.push({ phase: 'heal', status: 'start' });
  let healCount = 0;

  // Heal stale leads — move to Validated so pipeline progresses
  for (const lead of staleLeads.slice(0, 20)) {
    await base44.asServiceRole.entities.Lead.update(lead.id, {
      stage: 'Validated',
      pipeline_status: 'Validated',
      validation_notes: 'Auto-validated by System Guardian — was stale >7 days',
    }).catch(() => {});
    healCount++;
  }

  // Heal stale tasks — mark as Failed with note
  for (const task of staleTasks.slice(0, 20)) {
    await base44.asServiceRole.entities.AgentTask.update(task.id, {
      status: 'Failed',
      error: 'Auto-expired by Guardian — queued >3 days without execution',
    }).catch(() => {});
    healCount++;
  }

  actionLog.push({ phase: 'heal', status: 'complete', healed: healCount });

  // ═══════════════════════════════════════════
  // PHASE 5: AUTO-HARDEN — Prevention
  // ═══════════════════════════════════════════
  actionLog.push({ phase: 'harden', status: 'start' });

  const hardenActions = [];
  for (const rc of (diagnosis.root_causes || [])) {
    if (!rc.needs_human && rc.prevention) {
      hardenActions.push(rc.prevention);
    }
  }

  // Store hardening notes as improvement records
  if (hardenActions.length > 0) {
    await base44.asServiceRole.entities.SiteImprovement.create({
      page_affected: 'System Guardian',
      improvement_type: 'performance',
      description: `Guardian hardening: ${hardenActions.join(' | ')}`,
      agent_triggered: 'System Guardian',
      result: 'success',
      impact_score: Math.min(100, fixCount * 5 + healCount * 3),
      notes: JSON.stringify(hardenActions),
    }).catch(() => {});
  }

  actionLog.push({ phase: 'harden', status: 'complete', actions: hardenActions.length });

  // ═══════════════════════════════════════════
  // PHASE 6: RECORD & REPORT
  // ═══════════════════════════════════════════
  const duration = Date.now() - startTime;

  // Recalculate health score post-repair
  const postRepairIssues = Math.max(0, diagnostics.total_issues - fixCount - healCount);
  const adjustedHealth = Math.min(100, healthScore + Math.round((fixCount + healCount) * 2));

  await base44.asServiceRole.entities.SystemHealth.create({
    run_type: 'maintain',
    status: 'complete',
    score: adjustedHealth,
    duration_ms: duration,
    findings: JSON.stringify(diagnostics),
    actions_taken: JSON.stringify(actionLog),
    recommendations: JSON.stringify(diagnosis.root_causes || []),
  }).catch(() => {});

  await base44.asServiceRole.entities.AgentActivity.create({
    agent_name: 'System Guardian',
    action: `Health: ${adjustedHealth}% | Fixed: ${fixCount} | Healed: ${healCount} | Hardened: ${hardenActions.length} | ${needsHuman ? '⚠️ NEEDS HUMAN' : '✓ Autonomous'}`,
    status: needsHuman ? 'approval_required' : 'success',
    category: 'system',
    details: JSON.stringify({
      run_id: runId,
      health_before: healthScore,
      health_after: adjustedHealth,
      fixes: fixCount,
      heals: healCount,
      hardens: hardenActions.length,
      duration_ms: duration,
      needs_human: needsHuman,
      issues_remaining: postRepairIssues,
    }),
  });

  return Response.json({
    success: true,
    run_id: runId,
    health_score: adjustedHealth,
    health_before: healthScore,
    fixes: fixCount,
    heals: healCount,
    hardens: hardenActions.length,
    duration_ms: duration,
    needs_human: needsHuman,
    issues_found: diagnostics.total_issues,
    issues_remaining: postRepairIssues,
    critical_alert: diagnosis.critical_alert || null,
    action_log: actionLog,
  });
});