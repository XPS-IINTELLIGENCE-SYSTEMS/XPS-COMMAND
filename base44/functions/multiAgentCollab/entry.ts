import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * MULTI-AGENT COLLABORATION ENGINE
 * Enables autonomous agent coordination, dynamic delegation,
 * real-time self-correction, performance reflection, and skill auto-upgrade.
 */

const AGENT_TYPES = [
  "Coordinator", "Browser", "Research", "Scraper", "Writer",
  "Analyst", "Coder", "Scheduler"
];

const AGENT_CAPABILITIES = {
  Coordinator: { skills: ["planning", "delegation", "monitoring", "strategy"], can_delegate_to: ["Research", "Scraper", "Writer", "Analyst", "Browser", "Coder", "Scheduler"] },
  Browser: { skills: ["web_navigation", "data_extraction", "screenshot"], can_delegate_to: ["Research", "Scraper"] },
  Research: { skills: ["deep_research", "company_profiling", "market_analysis", "competitive_intel"], can_delegate_to: ["Writer", "Analyst"] },
  Scraper: { skills: ["lead_scraping", "data_collection", "contact_finding", "web_crawling"], can_delegate_to: ["Research", "Analyst"] },
  Writer: { skills: ["email_drafting", "proposal_writing", "content_creation", "bid_writing"], can_delegate_to: ["Analyst"] },
  Analyst: { skills: ["data_analysis", "scoring", "forecasting", "reporting", "pattern_detection"], can_delegate_to: ["Writer", "Coder"] },
  Coder: { skills: ["data_processing", "automation", "api_calls", "custom_logic"], can_delegate_to: ["Analyst"] },
  Scheduler: { skills: ["task_scheduling", "timing_optimization", "workflow_management"], can_delegate_to: ["Coordinator"] },
};

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { action } = body;

  // ═══════════════════════════════════════════════════════
  // ACTION: COLLABORATIVE GOAL — Multi-agent coordination
  // ═══════════════════════════════════════════════════════
  if (action === 'collaborative_goal') {
    const { goal, max_rounds, require_consensus } = body;
    if (!goal) return Response.json({ error: 'goal required' }, { status: 400 });

    const rounds = max_rounds || 3;
    const startTime = Date.now();
    const collabId = `collab_${Date.now()}`;

    // PHASE 1: Coordinator decomposes goal and assigns agents
    const decomposition = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are the XPS Autonomous Coordinator. Decompose this complex goal into a multi-agent collaboration plan.

GOAL: ${goal}

AVAILABLE AGENTS AND THEIR CAPABILITIES:
${Object.entries(AGENT_CAPABILITIES).map(([k, v]) => `- ${k}: ${v.skills.join(', ')} | Can delegate to: ${v.can_delegate_to.join(', ')}`).join('\n')}

Create a collaboration plan where agents work together, share intermediate results, and iterate to improve output quality. Include:
1. Which agents to involve and what each does
2. Information flow between agents (who passes what to whom)
3. Checkpoints where agents review each other's work
4. Consensus criteria — when is the result "good enough"?
5. Fallback strategies if an agent fails`,
      response_json_schema: {
        type: "object",
        properties: {
          plan_summary: { type: "string" },
          agents_involved: { type: "array", items: { type: "object", properties: {
            agent_type: { type: "string" },
            role_in_collab: { type: "string" },
            primary_task: { type: "string" },
            inputs_from: { type: "array", items: { type: "string" } },
            outputs_to: { type: "array", items: { type: "string" } },
            quality_criteria: { type: "string" },
          }}},
          execution_phases: { type: "array", items: { type: "object", properties: {
            phase_name: { type: "string" },
            agents_active: { type: "array", items: { type: "string" } },
            objective: { type: "string" },
            success_criteria: { type: "string" },
          }}},
          consensus_threshold: { type: "number" },
          max_iterations: { type: "number" },
        }
      },
      model: "gemini_3_flash"
    });

    // Create coordinator job
    const coordJob = await base44.asServiceRole.entities.AgentJob.create({
      agent_type: 'Coordinator',
      job_description: `[COLLAB] ${goal}`,
      goal,
      status: 'running',
      priority: 9,
      trigger_source: 'goal',
      started_at: new Date().toISOString(),
      execution_log: JSON.stringify([{ action: 'collab_started', message: decomposition.plan_summary, timestamp: new Date().toISOString() }]),
    });

    // PHASE 2: Execute phases with inter-agent communication
    const phaseResults = [];
    let accumulatedContext = '';

    for (const phase of (decomposition.execution_phases || []).slice(0, 5)) {
      const agentOutputs = [];

      for (const agentType of (phase.agents_active || [])) {
        const agentConfig = decomposition.agents_involved?.find(a => a.agent_type === agentType);
        if (!agentConfig) continue;

        // Build context from prior agents' outputs
        const inputContext = agentOutputs
          .filter(o => (agentConfig.inputs_from || []).includes(o.agent_type))
          .map(o => `[${o.agent_type}]: ${o.output}`)
          .join('\n\n');

        const agentResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `You are the XPS ${agentType} Agent in a multi-agent collaboration.

YOUR ROLE: ${agentConfig.role_in_collab}
YOUR TASK: ${agentConfig.primary_task}
QUALITY CRITERIA: ${agentConfig.quality_criteria}
PHASE: ${phase.phase_name} — ${phase.objective}

OVERALL GOAL: ${goal}

${inputContext ? `INPUT FROM OTHER AGENTS:\n${inputContext}` : ''}
${accumulatedContext ? `CONTEXT FROM PREVIOUS PHASES:\n${accumulatedContext}` : ''}

Execute your task thoroughly. Rate your own confidence in the output (0-100).
If you identify issues with inputs from other agents, flag them for correction.`,
          response_json_schema: {
            type: "object",
            properties: {
              output: { type: "string" },
              confidence: { type: "number" },
              flags_for_others: { type: "array", items: { type: "object", properties: {
                target_agent: { type: "string" },
                issue: { type: "string" },
                suggestion: { type: "string" },
              }}},
              self_assessment: { type: "string" },
              data: { type: "string" },
            }
          },
          add_context_from_internet: true,
          model: "gemini_3_flash"
        });

        agentOutputs.push({ agent_type: agentType, ...agentResult });

        // Create sub-job record
        await base44.asServiceRole.entities.AgentJob.create({
          agent_type: agentType,
          job_description: `[COLLAB] ${agentConfig.primary_task}`,
          goal,
          status: 'complete',
          priority: 7,
          trigger_source: 'agent_handoff',
          parent_job_id: coordJob.id,
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          result: JSON.stringify(agentResult),
          memory_context: agentResult.output?.substring(0, 500),
        });
      }

      // SELF-CORRECTION: If any agent flagged issues, run a correction round
      const allFlags = agentOutputs.flatMap(o => (o.flags_for_others || []).map(f => ({ from: o.agent_type, ...f })));
      if (allFlags.length > 0) {
        for (const flag of allFlags.slice(0, 3)) {
          const correctedAgent = agentOutputs.find(o => o.agent_type === flag.target_agent);
          if (!correctedAgent) continue;

          const correction = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: `You are the XPS ${flag.target_agent} Agent. Another agent (${flag.from}) flagged an issue with your work:

ISSUE: ${flag.issue}
SUGGESTION: ${flag.suggestion}

YOUR ORIGINAL OUTPUT:
${correctedAgent.output}

GOAL: ${goal}

Self-correct your output. Explain what you changed and why.`,
            response_json_schema: {
              type: "object",
              properties: {
                corrected_output: { type: "string" },
                what_changed: { type: "string" },
                new_confidence: { type: "number" },
              }
            }
          });

          // Update the agent's output with correction
          correctedAgent.output = correction.corrected_output;
          correctedAgent.confidence = correction.new_confidence;
          correctedAgent.self_corrected = true;
        }
      }

      phaseResults.push({
        phase: phase.phase_name,
        objective: phase.objective,
        agents: agentOutputs.map(o => ({
          agent: o.agent_type,
          confidence: o.confidence,
          self_corrected: o.self_corrected || false,
          output_preview: (o.output || '').substring(0, 300),
        })),
        corrections_made: allFlags.length,
      });

      accumulatedContext += `\n\n[Phase: ${phase.phase_name}]\n` +
        agentOutputs.map(o => `${o.agent_type}: ${(o.output || '').substring(0, 500)}`).join('\n');
    }

    // PHASE 3: Synthesis — Coordinator merges all outputs
    const synthesis = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are the Coordinator synthesizing results from a multi-agent collaboration.

GOAL: ${goal}

ALL PHASE RESULTS:
${accumulatedContext}

Create a final unified output that represents the best combined work of all agents.
Grade each agent's contribution and the overall collaboration quality.`,
      response_json_schema: {
        type: "object",
        properties: {
          final_output: { type: "string" },
          overall_quality_score: { type: "number" },
          agent_grades: { type: "array", items: { type: "object", properties: {
            agent: { type: "string" }, grade: { type: "number" },
            contribution: { type: "string" }, improvement_suggestion: { type: "string" },
          }}},
          collaboration_effectiveness: { type: "number" },
          key_insights: { type: "array", items: { type: "string" } },
        }
      }
    });

    const duration = Date.now() - startTime;

    // Update coordinator job
    await base44.asServiceRole.entities.AgentJob.update(coordJob.id, {
      status: 'complete',
      completed_at: new Date().toISOString(),
      result: JSON.stringify({
        final_output: synthesis.final_output,
        quality_score: synthesis.overall_quality_score,
        collaboration_effectiveness: synthesis.collaboration_effectiveness,
        phases_completed: phaseResults.length,
        agents_used: [...new Set(phaseResults.flatMap(p => p.agents.map(a => a.agent)))],
      }),
      live_output: `Collab complete — Quality: ${synthesis.overall_quality_score}/100`,
    });

    // Log activity
    await base44.asServiceRole.entities.AgentActivity.create({
      agent_name: 'Multi-Agent Collab',
      action: `Collaborative goal completed: ${goal.substring(0, 80)}... Quality: ${synthesis.overall_quality_score}/100`,
      status: 'success',
      category: 'system',
      details: JSON.stringify({ collab_id: collabId, phases: phaseResults.length, duration_ms: duration }),
    });

    return Response.json({
      success: true,
      collab_id: collabId,
      coordinator_job_id: coordJob.id,
      plan_summary: decomposition.plan_summary,
      phases: phaseResults,
      synthesis,
      duration_ms: duration,
    });
  }

  // ═══════════════════════════════════════════════════════
  // ACTION: SELF-REFLECT — Agent analyzes own performance
  // ═══════════════════════════════════════════════════════
  if (action === 'self_reflect') {
    const { agent_type, trigger, lookback_count } = body;
    const lookback = lookback_count || 20;

    // Gather recent jobs for this agent type
    const recentJobs = await base44.asServiceRole.entities.AgentJob.filter(
      agent_type ? { agent_type } : {},
      '-created_date',
      lookback
    );

    const completed = recentJobs.filter(j => j.status === 'complete');
    const failed = recentJobs.filter(j => j.status === 'failed');
    const successRate = recentJobs.length > 0
      ? Math.round((completed.length / recentJobs.length) * 100)
      : 0;

    // Calculate average duration
    const durations = completed
      .filter(j => j.started_at && j.completed_at)
      .map(j => new Date(j.completed_at) - new Date(j.started_at));
    const avgDuration = durations.length > 0
      ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length)
      : 0;

    // Get previous reflections for trend analysis
    const prevReflections = await base44.asServiceRole.entities.AgentReflection.filter(
      agent_type ? { agent_type } : {},
      '-created_date',
      5
    );

    const prevRate = prevReflections.length > 0 ? prevReflections[0].success_rate : null;
    const trend = prevRate === null ? 'new'
      : successRate > prevRate + 5 ? 'improving'
      : successRate < prevRate - 5 ? 'declining'
      : 'stable';

    // LLM deep reflection
    const reflection = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are performing a deep self-reflection for the ${agent_type || 'all'} XPS AI agent(s).

PERFORMANCE DATA (last ${lookback} jobs):
- Total jobs: ${recentJobs.length}
- Completed: ${completed.length}
- Failed: ${failed.length}
- Success rate: ${successRate}%
- Avg duration: ${avgDuration}ms
- Trend vs last reflection: ${trend}

RECENT FAILURES:
${failed.slice(0, 5).map(j => `- ${j.job_description}: ${j.error}`).join('\n') || 'None'}

RECENT SUCCESSES (sample):
${completed.slice(0, 5).map(j => {
  let summary = '';
  try { summary = JSON.parse(j.result || '{}').summary || ''; } catch { summary = ''; }
  return `- ${j.job_description}: ${summary.substring(0, 100)}`;
}).join('\n')}

PREVIOUS IMPROVEMENTS APPLIED:
${prevReflections.slice(0, 2).map(r => {
  let imps = [];
  try { imps = JSON.parse(r.improvements_applied || '[]'); } catch {}
  return imps.join(', ');
}).join('; ') || 'None yet'}

Perform deep self-analysis. Be brutally honest about weaknesses. Identify specific, actionable improvements.
For each improvement, explain exactly how the agent's system prompt or behavior should change.`,
      response_json_schema: {
        type: "object",
        properties: {
          strengths: { type: "array", items: { type: "string" } },
          weaknesses: { type: "array", items: { type: "string" } },
          root_cause_failures: { type: "array", items: { type: "object", properties: {
            failure: { type: "string" }, root_cause: { type: "string" }, fix: { type: "string" },
          }}},
          improvements: { type: "array", items: { type: "object", properties: {
            area: { type: "string" },
            current_behavior: { type: "string" },
            improved_behavior: { type: "string" },
            prompt_modification: { type: "string" },
            expected_impact: { type: "string" },
          }}},
          collaboration_assessment: { type: "object", properties: {
            score: { type: "number" },
            best_partnerships: { type: "array", items: { type: "string" } },
            friction_points: { type: "array", items: { type: "string" } },
          }},
          delegation_assessment: { type: "object", properties: {
            score: { type: "number" },
            over_delegated: { type: "array", items: { type: "string" } },
            under_delegated: { type: "array", items: { type: "string" } },
          }},
          next_actions: { type: "array", items: { type: "string" } },
          overall_assessment: { type: "string" },
          recommended_skill_upgrades: { type: "array", items: { type: "string" } },
        }
      }
    });

    // Save reflection
    const reflectionRecord = await base44.asServiceRole.entities.AgentReflection.create({
      agent_type: agent_type || 'All',
      reflection_type: trigger === 'failure' ? 'self_correction' : 'performance_review',
      trigger: trigger || 'scheduled',
      jobs_analyzed: recentJobs.length,
      success_rate: successRate,
      avg_duration_ms: avgDuration,
      strengths: JSON.stringify(reflection.strengths || []),
      weaknesses: JSON.stringify(reflection.weaknesses || []),
      improvements_applied: JSON.stringify((reflection.improvements || []).map(i => `${i.area}: ${i.improved_behavior}`)),
      prompt_upgrades: JSON.stringify((reflection.improvements || []).map(i => ({ area: i.area, modification: i.prompt_modification }))),
      collaboration_score: reflection.collaboration_assessment?.score || 0,
      delegation_efficiency: reflection.delegation_assessment?.score || 0,
      self_correction_count: failed.length,
      summary: reflection.overall_assessment || 'Reflection completed',
      next_actions: JSON.stringify(reflection.next_actions || []),
      performance_trend: trend,
      related_job_ids: JSON.stringify(recentJobs.slice(0, 20).map(j => j.id)),
    });

    await base44.asServiceRole.entities.AgentActivity.create({
      agent_name: agent_type || 'System',
      action: `Self-reflection: ${successRate}% success, trend: ${trend}, ${(reflection.improvements || []).length} improvements identified`,
      status: 'success',
      category: 'system',
    });

    return Response.json({
      success: true,
      reflection_id: reflectionRecord.id,
      agent_type: agent_type || 'All',
      success_rate: successRate,
      trend,
      reflection,
    });
  }

  // ═══════════════════════════════════════════════════════
  // ACTION: AUTO-UPGRADE — Apply improvements from reflection
  // ═══════════════════════════════════════════════════════
  if (action === 'auto_upgrade') {
    const { agent_type } = body;

    // Get latest reflection with improvements
    const reflections = await base44.asServiceRole.entities.AgentReflection.filter(
      agent_type ? { agent_type } : {},
      '-created_date',
      3
    );

    if (reflections.length === 0) {
      return Response.json({ error: 'No reflections found. Run self_reflect first.' }, { status: 400 });
    }

    const allImprovements = [];
    for (const r of reflections) {
      try {
        const upgrades = JSON.parse(r.prompt_upgrades || '[]');
        allImprovements.push(...upgrades);
      } catch {}
    }

    if (allImprovements.length === 0) {
      return Response.json({ message: 'No improvements to apply', upgrades_applied: 0 });
    }

    // Generate upgraded system instructions
    const upgrade = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are an AI systems engineer upgrading agent capabilities.

AGENT: ${agent_type || 'All agents'}

IMPROVEMENTS TO APPLY:
${allImprovements.map((i, idx) => `${idx + 1}. Area: ${i.area}\n   Modification: ${i.modification}`).join('\n\n')}

Generate a concrete upgrade plan:
1. Specific system prompt additions/modifications for each improvement
2. New behavioral rules the agent should follow
3. Quality checkpoints to verify improvements are working
4. Metrics to track post-upgrade`,
      response_json_schema: {
        type: "object",
        properties: {
          upgrades_applied: { type: "array", items: { type: "object", properties: {
            area: { type: "string" },
            prompt_addition: { type: "string" },
            new_rule: { type: "string" },
            verification_metric: { type: "string" },
          }}},
          new_capabilities: { type: "array", items: { type: "string" } },
          deprecated_behaviors: { type: "array", items: { type: "string" } },
          expected_impact_summary: { type: "string" },
        }
      }
    });

    // Save as skill_upgrade reflection
    await base44.asServiceRole.entities.AgentReflection.create({
      agent_type: agent_type || 'All',
      reflection_type: 'skill_upgrade',
      trigger: 'manual',
      summary: `Applied ${(upgrade.upgrades_applied || []).length} upgrades: ${upgrade.expected_impact_summary || ''}`,
      improvements_applied: JSON.stringify((upgrade.upgrades_applied || []).map(u => u.new_rule)),
      prompt_upgrades: JSON.stringify(upgrade.upgrades_applied || []),
      next_actions: JSON.stringify(upgrade.new_capabilities || []),
      performance_trend: 'improving',
    });

    await base44.asServiceRole.entities.AgentActivity.create({
      agent_name: agent_type || 'System',
      action: `Auto-upgrade: ${(upgrade.upgrades_applied || []).length} skill upgrades applied`,
      status: 'success',
      category: 'system',
    });

    return Response.json({ success: true, upgrade });
  }

  // ═══════════════════════════════════════════════════════
  // ACTION: COLLABORATION STATS — Performance metrics
  // ═══════════════════════════════════════════════════════
  if (action === 'collab_stats') {
    const [reflections, recentJobs, activities] = await Promise.all([
      base44.asServiceRole.entities.AgentReflection.list('-created_date', 50),
      base44.asServiceRole.entities.AgentJob.list('-created_date', 100),
      base44.asServiceRole.entities.AgentActivity.filter({ category: 'system' }, '-created_date', 30),
    ]);

    const collabJobs = recentJobs.filter(j => j.job_description?.startsWith('[COLLAB]'));
    const byAgent = {};
    for (const t of AGENT_TYPES) {
      const agentReflections = reflections.filter(r => r.agent_type === t);
      const latest = agentReflections[0];
      byAgent[t] = {
        latest_success_rate: latest?.success_rate || null,
        trend: latest?.performance_trend || 'new',
        collaboration_score: latest?.collaboration_score || null,
        delegation_efficiency: latest?.delegation_efficiency || null,
        total_reflections: agentReflections.length,
        last_reflected: latest?.created_date || null,
        strengths: latest ? (() => { try { return JSON.parse(latest.strengths || '[]'); } catch { return []; } })() : [],
        weaknesses: latest ? (() => { try { return JSON.parse(latest.weaknesses || '[]'); } catch { return []; } })() : [],
      };
    }

    const skillUpgrades = reflections.filter(r => r.reflection_type === 'skill_upgrade');

    return Response.json({
      total_reflections: reflections.length,
      total_collaborations: collabJobs.length,
      total_skill_upgrades: skillUpgrades.length,
      by_agent: byAgent,
      recent_reflections: reflections.slice(0, 10).map(r => ({
        id: r.id,
        agent: r.agent_type,
        type: r.reflection_type,
        success_rate: r.success_rate,
        trend: r.performance_trend,
        collab_score: r.collaboration_score,
        summary: r.summary?.substring(0, 200),
        date: r.created_date,
      })),
      recent_activities: activities.slice(0, 15),
    });
  }

  return Response.json({ error: 'Invalid action. Use: collaborative_goal, self_reflect, auto_upgrade, collab_stats' }, { status: 400 });
});