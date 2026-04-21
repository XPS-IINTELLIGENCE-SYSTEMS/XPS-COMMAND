import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * DAILY AGENT AUDIT
 * Runs daily — identifies weaknesses, enhancements, cleanups, opportunities, 
 * optimizations, new tools, new workflows, and money-making ideas.
 * Full read/write/admin access to analyze and improve the system.
 */

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const auditId = `audit_${Date.now()}`;
  
  // Gather system metrics
  const [leads, jobs, contractors, tasks, activities, improvements] = await Promise.all([
    base44.asServiceRole.entities.Lead.list('-created_date', 50).catch(() => []),
    base44.asServiceRole.entities.CommercialJob.list('-created_date', 50).catch(() => []),
    base44.asServiceRole.entities.ContractorCompany.list('-created_date', 50).catch(() => []),
    base44.asServiceRole.entities.AgentTask.filter({ status: 'Queued' }, '-created_date', 50).catch(() => []),
    base44.asServiceRole.entities.AgentActivity.list('-created_date', 20).catch(() => []),
    base44.asServiceRole.entities.SiteImprovement.list('-created_date', 10).catch(() => []),
  ]);

  const systemSnapshot = {
    total_leads: leads.length,
    leads_by_stage: {},
    total_jobs: jobs.length,
    jobs_by_phase: {},
    total_contractors: contractors.length,
    pending_tasks: tasks.length,
    recent_activities: activities.length,
    recent_improvements: improvements.length,
  };

  leads.forEach(l => { systemSnapshot.leads_by_stage[l.stage] = (systemSnapshot.leads_by_stage[l.stage] || 0) + 1; });
  jobs.forEach(j => { systemSnapshot.jobs_by_phase[j.project_phase] = (systemSnapshot.jobs_by_phase[j.project_phase] || 0) + 1; });

  // Run comprehensive audit via AI
  const audit = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are the Chief AI Auditor for XPS Intelligence — a commercial flooring business automation platform.

SYSTEM SNAPSHOT:
${JSON.stringify(systemSnapshot, null, 2)}

RECENT ACTIVITIES:
${activities.slice(0, 10).map(a => `- ${a.agent_name}: ${a.action} (${a.status})`).join('\n')}

PENDING TASKS:
${tasks.slice(0, 10).map(t => `- ${t.task_description} (${t.priority})`).join('\n')}

Perform a COMPREHENSIVE daily audit. For each category, provide 3 specific, actionable items:

1. WEAKNESSES — system vulnerabilities, broken pipelines, data gaps
2. ENHANCEMENTS — immediate improvements that would increase performance
3. CLEANUPS — data hygiene, stale records, duplicate elimination needed
4. OPPORTUNITIES — untapped revenue, market gaps, partnership opportunities  
5. OPTIMIZATIONS — speed, cost, accuracy improvements
6. DASHBOARD_UPGRADES — UI/UX improvements, new widgets, better data viz
7. NEW_TOOLS — tools that should be built to increase capability
8. NEW_WORKFLOWS — automation sequences that would save time/money
9. MONEY_MAKING_IDEAS — concrete revenue-generating system ideas
10. HIGH_PRIORITY_ACTIONS — top 5 things to do TODAY

Be specific. Include dollar estimates where possible. This is for a real business.`,
    response_json_schema: {
      type: 'object',
      properties: {
        weaknesses: { type: 'array', items: { type: 'object', properties: { issue: { type: 'string' }, severity: { type: 'string' }, fix: { type: 'string' } } } },
        enhancements: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, impact: { type: 'string' }, effort: { type: 'string' } } } },
        cleanups: { type: 'array', items: { type: 'object', properties: { area: { type: 'string' }, action: { type: 'string' } } } },
        opportunities: { type: 'array', items: { type: 'object', properties: { opportunity: { type: 'string' }, estimated_value: { type: 'string' }, approach: { type: 'string' } } } },
        optimizations: { type: 'array', items: { type: 'object', properties: { target: { type: 'string' }, improvement: { type: 'string' }, expected_gain: { type: 'string' } } } },
        dashboard_upgrades: { type: 'array', items: { type: 'object', properties: { upgrade: { type: 'string' }, reason: { type: 'string' } } } },
        new_tools: { type: 'array', items: { type: 'object', properties: { tool_name: { type: 'string' }, purpose: { type: 'string' }, revenue_impact: { type: 'string' } } } },
        new_workflows: { type: 'array', items: { type: 'object', properties: { workflow: { type: 'string' }, steps: { type: 'string' }, time_saved: { type: 'string' } } } },
        money_making_ideas: { type: 'array', items: { type: 'object', properties: { idea: { type: 'string' }, revenue_potential: { type: 'string' }, implementation_time: { type: 'string' } } } },
        high_priority_actions: { type: 'array', items: { type: 'object', properties: { action: { type: 'string' }, deadline: { type: 'string' }, owner: { type: 'string' } } } },
        overall_health_score: { type: 'number' },
        audit_summary: { type: 'string' },
      }
    }
  });

  // Store the audit as an IntelRecord
  await base44.asServiceRole.entities.IntelRecord.create({
    source_company: 'XPS Intelligence',
    category: 'custom',
    title: `Daily System Audit — ${new Date().toISOString().split('T')[0]}`,
    content: JSON.stringify(audit, null, 2).substring(0, 8000),
    summary: audit.audit_summary || 'Daily audit complete',
    source_type: 'llm_research',
    tags: 'daily-audit,system-health,agent-audit',
    confidence_score: audit.overall_health_score || 75,
    scraped_at: new Date().toISOString(),
    is_indexed: true,
    data_freshness: 'live',
  });

  // Create high-priority tasks from the audit
  const topActions = (audit.high_priority_actions || []).slice(0, 5);
  for (const action of topActions) {
    await base44.asServiceRole.entities.AgentTask.create({
      task_description: `[AUDIT] ${action.action}`,
      task_type: 'Custom',
      status: 'Queued',
      priority: 'High',
      result: JSON.stringify({ deadline: action.deadline, owner: action.owner }),
    }).catch(() => {});
  }

  // Log activity
  await base44.asServiceRole.entities.AgentActivity.create({
    agent_name: 'System Auditor',
    action: `Daily audit complete — Health: ${audit.overall_health_score || 'N/A'}/100, ${topActions.length} actions created`,
    status: 'success',
    category: 'analysis',
    details: JSON.stringify({
      audit_id: auditId,
      health_score: audit.overall_health_score,
      weaknesses: (audit.weaknesses || []).length,
      opportunities: (audit.opportunities || []).length,
      money_ideas: (audit.money_making_ideas || []).length,
    }),
  });

  return Response.json({
    success: true,
    audit_id: auditId,
    health_score: audit.overall_health_score,
    actions_created: topActions.length,
    audit,
  });
});