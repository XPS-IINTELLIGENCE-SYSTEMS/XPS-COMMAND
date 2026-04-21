import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const log = [];
    const startTime = Date.now();

    // 1. Auto-Diagnose: Check system entities for issues
    log.push({ step: "diagnose", status: "running", time: new Date().toISOString() });
    
    const [leads, jobs, proposals, workflows, agents] = await Promise.all([
      base44.asServiceRole.entities.Lead.list('-created_date', 5),
      base44.asServiceRole.entities.CommercialJob.list('-created_date', 5),
      base44.asServiceRole.entities.Proposal.list('-created_date', 5),
      base44.asServiceRole.entities.Workflow.list('-created_date', 5),
      base44.asServiceRole.entities.AgentJob.filter({ status: 'failed' }, '-created_date', 10),
    ]);

    log.push({ step: "diagnose", status: "complete", 
      counts: { leads: leads.length, jobs: jobs.length, proposals: proposals.length, workflows: workflows.length, failedAgents: agents.length }
    });

    // 2. Auto-Fix: Reset stuck/failed agent jobs
    let fixedCount = 0;
    for (const agent of agents) {
      if (agent.retry_count < (agent.max_retries || 3)) {
        await base44.asServiceRole.entities.AgentJob.update(agent.id, {
          status: 'queued',
          retry_count: (agent.retry_count || 0) + 1,
          error: null,
        });
        fixedCount++;
      }
    }
    log.push({ step: "auto_fix", status: "complete", fixed: fixedCount });

    // 3. Auto-Heal: Reset stuck workflows
    const stuckWorkflows = await base44.asServiceRole.entities.Workflow.filter({ status: 'Failed' }, '-created_date', 20);
    let healedCount = 0;
    for (const wf of stuckWorkflows) {
      await base44.asServiceRole.entities.Workflow.update(wf.id, { status: 'Draft' });
      healedCount++;
    }
    log.push({ step: "auto_heal", status: "complete", healed: healedCount });

    // 4. Auto-Optimize: Use LLM to generate system recommendations
    const systemSummary = `System has ${leads.length} recent leads, ${jobs.length} recent jobs, ${proposals.length} recent proposals, ${fixedCount} failed agents reset, ${healedCount} stuck workflows healed.`;

    const analysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are the XPS Intelligence system optimizer. Analyze this nightly system report and provide 3-5 specific optimization recommendations:

${systemSummary}

Focus on: data quality, pipeline efficiency, automation opportunities, and system health. Be specific and actionable.`,
      response_json_schema: {
        type: "object",
        properties: {
          health_score: { type: "number", description: "Overall system health 0-100" },
          recommendations: { type: "array", items: { type: "string" } },
          critical_issues: { type: "array", items: { type: "string" } },
          summary: { type: "string" }
        }
      }
    });

    log.push({ step: "auto_optimize", status: "complete", health_score: analysis.health_score });

    // 5. Log the run
    const duration = Date.now() - startTime;
    await base44.asServiceRole.entities.AgentActivity.create({
      agent_name: "System Auto-Heal",
      action: "nightly_auto_heal",
      status: "success",
      category: "system",
      details: JSON.stringify({
        duration_ms: duration,
        health_score: analysis.health_score,
        fixes: fixedCount,
        heals: healedCount,
        recommendations: analysis.recommendations,
        critical_issues: analysis.critical_issues,
        summary: analysis.summary,
      }),
    });

    // 6. Record system health
    await base44.asServiceRole.entities.SystemHealth.create({
      run_type: "heal",
      status: "complete",
      score: analysis.health_score || 0,
      duration_ms: duration,
      findings: JSON.stringify(analysis.critical_issues || []),
      actions_taken: JSON.stringify(log),
      recommendations: JSON.stringify(analysis.recommendations || []),
    }).catch(() => {});

    return Response.json({
      success: true,
      duration_ms: duration,
      health_score: analysis.health_score,
      fixes: fixedCount,
      heals: healedCount,
      recommendations: analysis.recommendations,
      summary: analysis.summary,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});