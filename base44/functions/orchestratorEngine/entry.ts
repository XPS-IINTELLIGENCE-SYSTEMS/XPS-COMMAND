import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * ORCHESTRATOR ENGINE — Autonomous Business Operations Agent
 * Runs the entire system like a CEO: delegates to agents, self-schedules,
 * monitors performance, makes strategic decisions, and logs everything
 * in plain English for human review.
 */

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (user?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

  let body = {};
  try { body = await req.json(); } catch {}
  const cycleType = body.cycle_type || 'on_demand';
  const ts = new Date().toISOString();
  const startTime = Date.now();
  const cycleId = `orch_${Date.now()}`;

  // Create running log entry
  const logEntry = await base44.asServiceRole.entities.OrchestratorLog.create({
    cycle_id: cycleId, cycle_type: cycleType, status: 'running',
    summary: `Orchestrator cycle "${cycleType}" started at ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}...`,
  });

  // ── STEP 1: SYSTEM SNAPSHOT ──
  const [leads, jobs, tasks, activities, portfolios, health, bids, proposals, contractors] = await Promise.all([
    base44.asServiceRole.entities.Lead.list('-created_date', 50).catch(() => []),
    base44.asServiceRole.entities.CommercialJob.list('-created_date', 30).catch(() => []),
    base44.asServiceRole.entities.AgentTask.filter({ status: 'Queued' }, '-created_date', 20).catch(() => []),
    base44.asServiceRole.entities.AgentActivity.list('-created_date', 20).catch(() => []),
    base44.asServiceRole.entities.FinancialPortfolio.filter({ status: 'active' }, '-created_date', 10).catch(() => []),
    base44.asServiceRole.entities.SystemHealth.list('-created_date', 5).catch(() => []),
    base44.asServiceRole.entities.BidDocument.list('-created_date', 20).catch(() => []),
    base44.asServiceRole.entities.Proposal.list('-created_date', 20).catch(() => []),
    base44.asServiceRole.entities.Contractor.list('-created_date', 30).catch(() => []),
  ]);

  const stageCount = {};
  leads.forEach(l => { stageCount[l.stage || 'Unknown'] = (stageCount[l.stage || 'Unknown'] || 0) + 1; });

  const metricsBefore = {
    total_leads: leads.length,
    lead_stages: stageCount,
    active_jobs: jobs.filter(j => !['complete', 'lost'].includes(j.project_phase)).length,
    queued_tasks: tasks.length,
    total_contractors: contractors.length,
    pending_bids: bids.filter(b => b.send_status === 'draft' || b.send_status === 'queued').length,
    open_proposals: proposals.filter(p => p.status !== 'Sent' && p.status !== 'Accepted').length,
    portfolio_value: portfolios.reduce((s, p) => s + (p.current_balance || 0), 0),
    last_health_score: health[0]?.score || 0,
    recent_activities: activities.slice(0, 5).map(a => `${a.agent_name}: ${a.action}`),
  };

  // ── STEP 2: STRATEGIC PLANNING via LLM ──
  const plan = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are the CEO/Orchestrator of XPS Intelligence — an autonomous AI-powered business operations platform for a commercial flooring company. The time is ${ts} (Eastern).

CURRENT SYSTEM STATE:
${JSON.stringify(metricsBefore, null, 2)}

CYCLE TYPE: ${cycleType}
- morning_ops: Review overnight results, prioritize today's pipeline, assign lead follow-ups, schedule scraping
- midday_optimize: Check pipeline progress, run mid-day scoring, trigger outreach for hot leads
- afternoon_outreach: Send proposals, follow up on bids, process new leads, competitor monitoring
- evening_analysis: Full analytics review, performance scoring, strategy adjustments, financial sandbox trading
- overnight_maintenance: System health audit, data cleanup, scraper scheduling, AI model tuning
- on_demand: Assess everything and take the most impactful actions right now
- strategic_review: Deep strategic analysis, quarterly planning, resource reallocation

You must act like a real CEO running this business. Think about:
1. What agents should I deploy RIGHT NOW to generate the most revenue?
2. What leads need immediate attention?
3. What bids/proposals are stale and need follow-up?
4. What scraping/research should be running?
5. What system maintenance is needed?
6. What strategic decisions should I make to improve the business?

For each action, explain your reasoning in PLAIN ENGLISH like a CEO would explain to their team.

Output a detailed operational plan with specific, executable actions.`,
    response_json_schema: {
      type: 'object',
      properties: {
        ceo_briefing: { type: 'string', description: 'Plain English briefing like a real CEO morning standup — 3-5 paragraphs' },
        priority_actions: { type: 'array', items: { type: 'object', properties: {
          agent: { type: 'string' }, action: { type: 'string' }, target: { type: 'string' },
          reasoning: { type: 'string' }, expected_impact: { type: 'string' },
          priority: { type: 'string' }, function_to_call: { type: 'string' },
        }}},
        strategic_decisions: { type: 'array', items: { type: 'object', properties: {
          decision: { type: 'string' }, reasoning: { type: 'string' }, impact: { type: 'string' },
        }}},
        improvements_identified: { type: 'array', items: { type: 'object', properties: {
          area: { type: 'string' }, current_state: { type: 'string' },
          improvement: { type: 'string' }, expected_result: { type: 'string' },
        }}},
        self_scheduled_tasks: { type: 'array', items: { type: 'object', properties: {
          task: { type: 'string' }, scheduled_time: { type: 'string' },
          agent: { type: 'string' }, reason: { type: 'string' },
        }}},
        health_score: { type: 'number' },
        revenue_estimate: { type: 'string' },
        risk_alerts: { type: 'array', items: { type: 'string' } },
      }
    }
  });

  // ── STEP 3: EXECUTE PRIORITY ACTIONS ──
  const actionsExecuted = [];
  const safeFunctions = [
    'nightlyAutoHeal', 'systemGuardian', 'financialSandbox',
    'passiveIntelligence', 'hyperEvolver', 'dailyAgentAudit',
    'cryptoResearchAgent', 'leadScorer', 'sentimentAnalyst',
  ];

  for (const action of (plan.priority_actions || []).slice(0, 5)) {
    const fnName = action.function_to_call;
    let result = 'Logged for manual review';
    let executed = false;

    if (fnName && safeFunctions.includes(fnName)) {
      try {
        const params = {};
        if (fnName === 'financialSandbox') params.action = 'daily_cycle';
        if (fnName === 'cryptoResearchAgent') params.action = 'research';
        if (fnName === 'passiveIntelligence') params.action = 'run';

        await base44.asServiceRole.functions.invoke(fnName, params);
        result = 'Executed successfully';
        executed = true;
      } catch (e) {
        result = `Execution failed: ${e.message}`;
      }
    }

    // Log as AgentTask for tracking
    await base44.asServiceRole.entities.AgentTask.create({
      task_description: `[Orchestrator] ${action.action} — ${action.reasoning}`,
      task_type: 'Workflow',
      status: executed ? 'Completed' : 'Queued',
      priority: action.priority === 'critical' ? 'Urgent' : action.priority === 'high' ? 'High' : 'Medium',
      result: result,
    });

    actionsExecuted.push({
      agent: action.agent, action: action.action,
      target: action.target, reasoning: action.reasoning,
      result, executed, expected_impact: action.expected_impact,
    });
  }

  // ── STEP 4: SELF-SCHEDULE FUTURE TASKS ──
  for (const scheduled of (plan.self_scheduled_tasks || []).slice(0, 8)) {
    await base44.asServiceRole.entities.AgentTask.create({
      task_description: `[Auto-Scheduled] ${scheduled.task} — ${scheduled.reason}`,
      task_type: 'Workflow',
      status: 'Queued',
      priority: 'Medium',
      scheduled_for: scheduled.scheduled_time || null,
    });
  }

  // ── STEP 5: LOG IMPROVEMENTS ──
  for (const imp of (plan.improvements_identified || []).slice(0, 5)) {
    await base44.asServiceRole.entities.SiteImprovement.create({
      title: `[Orchestrator] ${imp.area}: ${imp.improvement}`,
      description: `Current: ${imp.current_state}\nImprovement: ${imp.improvement}\nExpected: ${imp.expected_result}`,
      priority: 'high',
      status: 'open',
      source: 'orchestrator',
      page_affected: imp.area || 'System',
    }).catch(() => {});
  }

  // ── STEP 6: GENERATE HUMAN SUMMARY ──
  const humanSummary = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `Write a clear, warm, human-readable summary of what the AI orchestrator just did for the business owner. Write it like a trusted operations manager giving an end-of-shift report. Use plain English, no jargon.

CEO BRIEFING: ${plan.ceo_briefing}

ACTIONS TAKEN:
${actionsExecuted.map((a, i) => `${i + 1}. ${a.agent}: ${a.action} → ${a.result} (${a.reasoning})`).join('\n')}

STRATEGIC DECISIONS:
${(plan.strategic_decisions || []).map(d => `• ${d.decision}: ${d.reasoning}`).join('\n')}

IMPROVEMENTS IDENTIFIED:
${(plan.improvements_identified || []).map(i => `• ${i.area}: ${i.improvement}`).join('\n')}

UPCOMING SCHEDULED:
${(plan.self_scheduled_tasks || []).map(s => `• ${s.task} at ${s.scheduled_time}`).join('\n')}

RISK ALERTS: ${(plan.risk_alerts || []).join(', ')}

System Health: ${plan.health_score}/100
Revenue Estimate: ${plan.revenue_estimate}

Format as 4-6 paragraphs. Start with "Here's what happened..." Be specific about numbers and names.`,
  });

  const duration = Date.now() - startTime;

  // ── STEP 7: UPDATE LOG ENTRY ──
  await base44.asServiceRole.entities.OrchestratorLog.update(logEntry.id, {
    summary: typeof humanSummary === 'string' ? humanSummary : plan.ceo_briefing,
    agents_deployed: JSON.stringify(actionsExecuted.map(a => a.agent)),
    actions_taken: JSON.stringify(actionsExecuted),
    improvements_made: JSON.stringify(plan.improvements_identified || []),
    metrics_before: JSON.stringify(metricsBefore),
    next_scheduled_actions: JSON.stringify(plan.self_scheduled_tasks || []),
    decisions_made: JSON.stringify(plan.strategic_decisions || []),
    health_score: plan.health_score || 0,
    revenue_impact: plan.revenue_estimate || 'N/A',
    duration_ms: duration,
    status: 'complete',
  });

  // Activity log
  await base44.asServiceRole.entities.AgentActivity.create({
    agent_name: 'Orchestrator',
    action: `${cycleType}: ${actionsExecuted.length} actions, ${(plan.self_scheduled_tasks || []).length} scheduled, health ${plan.health_score}/100`,
    status: 'success', category: 'system',
    details: JSON.stringify({ cycle_id: cycleId, actions: actionsExecuted.length, health: plan.health_score, revenue: plan.revenue_estimate }),
  });

  return Response.json({
    success: true, cycle_id: cycleId,
    summary: typeof humanSummary === 'string' ? humanSummary : plan.ceo_briefing,
    actions_executed: actionsExecuted,
    strategic_decisions: plan.strategic_decisions,
    improvements: plan.improvements_identified,
    scheduled_next: plan.self_scheduled_tasks,
    risk_alerts: plan.risk_alerts,
    health_score: plan.health_score,
    revenue_estimate: plan.revenue_estimate,
    duration_ms: duration,
  });
});