import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * MULTI-AGENT COLLABORATION ENGINE
 * Enables autonomous coordination, dynamic delegation, self-correction,
 * and self-reflection across all agent types.
 */

const AGENT_CAPABILITIES = {
  Coordinator: { skills: ["planning", "delegation", "monitoring", "strategy"], can_delegate_to: ["Research", "Scraper", "Writer", "Analyst", "Coder", "Outreach", "Proposal", "SEO", "Content"] },
  Research: { skills: ["web_research", "company_profiling", "market_analysis", "competitive_intel"], can_delegate_to: ["Analyst", "Writer", "Scraper"] },
  Scraper: { skills: ["data_extraction", "lead_finding", "web_crawling", "data_cleaning"], can_delegate_to: ["Research", "Analyst"] },
  Writer: { skills: ["email_drafting", "proposal_writing", "content_creation", "copywriting"], can_delegate_to: ["SEO", "Content"] },
  Analyst: { skills: ["data_analysis", "scoring", "forecasting", "reporting", "pattern_detection"], can_delegate_to: ["Writer", "Research"] },
  Coder: { skills: ["automation", "data_processing", "integration", "debugging"], can_delegate_to: ["Analyst"] },
  Outreach: { skills: ["email_campaigns", "follow_ups", "cold_outreach", "relationship_building"], can_delegate_to: ["Writer", "Research"] },
  Proposal: { skills: ["bid_generation", "pricing", "scope_writing", "contract_prep"], can_delegate_to: ["Analyst", "Writer"] },
  SEO: { skills: ["keyword_research", "content_optimization", "ranking_analysis", "backlink_strategy"], can_delegate_to: ["Writer", "Content"] },
  Content: { skills: ["blog_posts", "social_media", "video_scripts", "brand_messaging"], can_delegate_to: ["SEO", "Writer"] },
  Scheduler: { skills: ["task_scheduling", "time_optimization", "resource_allocation"], can_delegate_to: ["Coordinator"] },
};

function safeJSON(str) { try { return JSON.parse(str || '[]'); } catch { return []; } }

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { action } = body;

  // ═══════════════════════════════════════════════════════════
  // 1. COLLABORATIVE GOAL — Multi-agent coordination from a single goal
  // ═══════════════════════════════════════════════════════════
  if (action === 'collaborate') {
    const { goal, max_agents, require_reflection } = body;
    if (!goal) return Response.json({ error: 'goal required' }, { status: 400 });

    const groupId = `collab_${Date.now()}`;

    // Phase 1: Strategic Planning — Coordinator plans multi-agent approach
    const plan = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are the XPS Multi-Agent Coordinator. Given a complex business goal, design a collaboration plan where multiple AI agents work together, share data, and build on each other's output.

GOAL: ${goal}

AVAILABLE AGENTS AND SKILLS:
${Object.entries(AGENT_CAPABILITIES).map(([a, c]) => `${a}: ${c.skills.join(', ')}`).join('\n')}

Design a collaboration plan with:
1. Which agents need to work on this (up to ${max_agents || 5})
2. The ORDER matters — some agents need output from others
3. What data each agent should pass to the next
4. Where agents can work in PARALLEL (no dependency)
5. Quality checkpoints where output should be validated before proceeding
6. Potential failure points and fallback strategies`,
      response_json_schema: {
        type: 'object',
        properties: {
          plan_narrative: { type: 'string' },
          phases: { type: 'array', items: { type: 'object', properties: {
            phase_number: { type: 'number' },
            phase_name: { type: 'string' },
            agents: { type: 'array', items: { type: 'object', properties: {
              agent_type: { type: 'string' },
              task: { type: 'string' },
              depends_on_phase: { type: 'number' },
              expected_output: { type: 'string' },
              quality_threshold: { type: 'number' },
              fallback_agent: { type: 'string' },
            }}},
            parallel: { type: 'boolean' },
          }}},
          success_criteria: { type: 'string' },
          estimated_quality: { type: 'number' },
        }
      },
      model: 'gemini_3_flash'
    });

    // Phase 2: Create coordinator job
    const coordJob = await base44.asServiceRole.entities.AgentJob.create({
      agent_type: 'Coordinator',
      job_description: `[Collaboration] ${goal}`,
      goal,
      status: 'running',
      priority: 9,
      trigger_source: 'goal',
      collaboration_group_id: groupId,
      started_at: new Date().toISOString(),
      step_total: (plan.phases || []).reduce((s, p) => s + (p.agents || []).length, 0),
      result: JSON.stringify({ plan: plan.plan_narrative, phases: plan.phases }),
      execution_log: JSON.stringify([{ action: 'collaboration_planned', message: plan.plan_narrative, timestamp: new Date().toISOString() }]),
    });

    // Phase 3: Execute phases sequentially, agents within phase in parallel
    const allResults = [];
    let phaseContext = '';

    for (const phase of (plan.phases || [])) {
      const phaseJobs = [];

      // Create sub-jobs for all agents in this phase
      for (const agentTask of (phase.agents || [])) {
        const validType = AGENT_CAPABILITIES[agentTask.agent_type] ? agentTask.agent_type : 'Research';
        const subJob = await base44.asServiceRole.entities.AgentJob.create({
          agent_type: validType,
          job_description: agentTask.task,
          goal,
          status: 'running',
          priority: 8,
          trigger_source: 'delegation',
          parent_job_id: coordJob.id,
          collaboration_group_id: groupId,
          started_at: new Date().toISOString(),
          memory_context: phaseContext,
          delegation_chain: JSON.stringify([{ from: 'Coordinator', to: validType, reason: `Phase ${phase.phase_number}: ${phase.phase_name}` }]),
        });
        phaseJobs.push({ job: subJob, task: agentTask });
      }

      // Execute all phase agents (they share phase context)
      const phaseResults = await Promise.all(phaseJobs.map(async ({ job, task }) => {
        const agentPrompt = `You are the XPS ${job.agent_type} Agent working in a multi-agent collaboration.

YOUR TASK: ${task.task}
COLLABORATION CONTEXT: ${phaseContext || 'This is the first phase — no prior context.'}
EXPECTED OUTPUT: ${task.expected_output || 'Detailed, actionable results'}

You are part of a team. Your output will be used by other agents. Be thorough, structured, and specific. Include all data the next agent would need.`;

        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: agentPrompt,
          response_json_schema: {
            type: 'object',
            properties: {
              summary: { type: 'string' },
              output_data: { type: 'string' },
              quality_self_score: { type: 'number' },
              issues_found: { type: 'array', items: { type: 'string' } },
              recommendations_for_next_agent: { type: 'string' },
            }
          },
          add_context_from_internet: true,
          model: 'gemini_3_flash'
        });

        // Self-correction: if quality is below threshold, retry with feedback
        if ((result.quality_self_score || 100) < (task.quality_threshold || 60)) {
          const correctedResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: `You are the XPS ${job.agent_type} Agent performing SELF-CORRECTION.

Your previous output scored ${result.quality_self_score}/100 which is below the required ${task.quality_threshold}.
Issues found: ${(result.issues_found || []).join(', ')}

ORIGINAL TASK: ${task.task}
YOUR PREVIOUS OUTPUT: ${result.summary}

Fix the issues and produce a higher quality output. Be more thorough and specific.`,
            response_json_schema: {
              type: 'object',
              properties: {
                summary: { type: 'string' },
                output_data: { type: 'string' },
                quality_self_score: { type: 'number' },
                corrections_made: { type: 'array', items: { type: 'string' } },
                recommendations_for_next_agent: { type: 'string' },
              }
            },
            add_context_from_internet: true,
            model: 'gemini_3_flash'
          });

          await base44.asServiceRole.entities.AgentJob.update(job.id, {
            status: 'complete', completed_at: new Date().toISOString(),
            quality_score: correctedResult.quality_self_score || 0,
            result: JSON.stringify({ ...correctedResult, self_corrected: true }),
            live_output: `[Self-corrected] ${correctedResult.summary}`,
          });
          return { agent: job.agent_type, job_id: job.id, ...correctedResult, self_corrected: true };
        }

        await base44.asServiceRole.entities.AgentJob.update(job.id, {
          status: 'complete', completed_at: new Date().toISOString(),
          quality_score: result.quality_self_score || 0,
          result: JSON.stringify(result),
          live_output: result.summary,
        });
        return { agent: job.agent_type, job_id: job.id, ...result, self_corrected: false };
      }));

      // Accumulate context for next phase
      phaseContext += `\n\n--- Phase ${phase.phase_number}: ${phase.phase_name} ---\n`;
      phaseContext += phaseResults.map(r => `[${r.agent}]: ${r.summary}\nData: ${(r.output_data || '').substring(0, 1500)}`).join('\n');
      allResults.push({ phase: phase.phase_number, name: phase.phase_name, results: phaseResults });
    }

    // Phase 4: Reflection (if enabled)
    let reflection = null;
    if (require_reflection !== false) {
      reflection = await runReflection(base44, groupId, allResults, goal);
    }

    // Mark coordinator complete
    await base44.asServiceRole.entities.AgentJob.update(coordJob.id, {
      status: 'complete', completed_at: new Date().toISOString(),
      step_current: coordJob.step_total,
      live_output: `Collaboration complete — ${allResults.reduce((s, p) => s + p.results.length, 0)} agents, ${allResults.length} phases`,
      reflection_id: reflection?.id || '',
    });

    return Response.json({
      success: true, group_id: groupId,
      coordinator_job_id: coordJob.id,
      phases: allResults,
      reflection,
      total_agents: allResults.reduce((s, p) => s + p.results.length, 0),
      self_corrections: allResults.reduce((s, p) => s + p.results.filter(r => r.self_corrected).length, 0),
    });
  }

  // ═══════════════════════════════════════════════════════════
  // 2. SELF-REFLECTION — Analyze performance and upgrade skills
  // ═══════════════════════════════════════════════════════════
  if (action === 'reflect') {
    const { agent_type, lookback_count, trigger } = body;

    // Fetch recent completed + failed jobs for this agent
    const filter = agent_type ? { agent_type } : {};
    const recentComplete = await base44.asServiceRole.entities.AgentJob.filter(
      { ...filter, status: 'complete' }, '-completed_at', lookback_count || 20
    );
    const recentFailed = await base44.asServiceRole.entities.AgentJob.filter(
      { ...filter, status: 'failed' }, '-completed_at', 10
    );

    const totalTasks = recentComplete.length + recentFailed.length;
    const successRate = totalTasks > 0 ? Math.round((recentComplete.length / totalTasks) * 100) : 0;
    const avgQuality = recentComplete.length > 0
      ? Math.round(recentComplete.reduce((s, j) => s + (j.quality_score || 50), 0) / recentComplete.length)
      : 0;

    // Parse results for analysis
    const taskSummaries = recentComplete.slice(0, 10).map(j => {
      let parsed = {};
      try { parsed = JSON.parse(j.result || '{}'); } catch {}
      return { type: j.agent_type, desc: j.job_description, quality: j.quality_score, summary: parsed.summary || '', self_corrected: parsed.self_corrected || false };
    });
    const failureSummaries = recentFailed.slice(0, 5).map(j => ({ type: j.agent_type, desc: j.job_description, error: j.error }));

    const analysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are an AI Agent Performance Analyst performing a deep self-reflection for ${agent_type || 'all agents'} in the XPS Intelligence platform.

PERFORMANCE DATA:
- Total tasks analyzed: ${totalTasks}
- Success rate: ${successRate}%
- Average quality score: ${avgQuality}/100
- Self-corrections triggered: ${taskSummaries.filter(t => t.self_corrected).length}

RECENT SUCCESSES:
${taskSummaries.map(t => `[${t.type}] ${t.desc} — Quality: ${t.quality}/100 — ${t.summary}`).join('\n')}

RECENT FAILURES:
${failureSummaries.map(f => `[${f.type}] ${f.desc} — Error: ${f.error}`).join('\n')}

Perform a DEEP self-reflection:
1. Identify patterns in successes and failures
2. Assess which skills are strong and which need improvement
3. Recommend specific prompt/strategy optimizations
4. Suggest new tools or skills the agent should acquire
5. Identify collaboration improvements for multi-agent workflows
6. Create concrete action items to improve performance

Be brutally honest and specific. This is for autonomous self-improvement.`,
      response_json_schema: {
        type: 'object',
        properties: {
          performance_score: { type: 'number' },
          strengths: { type: 'array', items: { type: 'string' } },
          weaknesses: { type: 'array', items: { type: 'string' } },
          failure_patterns: { type: 'array', items: { type: 'string' } },
          prompt_optimizations: { type: 'array', items: { type: 'object', properties: {
            current: { type: 'string' }, improved: { type: 'string' }, reason: { type: 'string' },
          }}},
          skill_upgrades: { type: 'array', items: { type: 'object', properties: {
            skill: { type: 'string' }, description: { type: 'string' }, priority: { type: 'string' },
          }}},
          collaboration_insights: { type: 'array', items: { type: 'object', properties: {
            insight: { type: 'string' }, agents_involved: { type: 'string' }, improvement: { type: 'string' },
          }}},
          next_actions: { type: 'array', items: { type: 'string' } },
          full_analysis: { type: 'string' },
        }
      },
    });

    // Save reflection
    const ref = await base44.asServiceRole.entities.AgentReflection.create({
      agent_type: agent_type || 'All',
      reflection_type: 'performance_review',
      trigger: trigger || 'manual',
      performance_score: analysis.performance_score || avgQuality,
      tasks_analyzed: totalTasks,
      success_rate: successRate,
      strengths: JSON.stringify(analysis.strengths || []),
      weaknesses: JSON.stringify(analysis.weaknesses || []),
      improvements_applied: '[]',
      skill_upgrades: JSON.stringify(analysis.skill_upgrades || []),
      prompt_optimizations: JSON.stringify(analysis.prompt_optimizations || []),
      collaboration_insights: JSON.stringify(analysis.collaboration_insights || []),
      before_metrics: JSON.stringify({ totalTasks, successRate, avgQuality }),
      full_analysis: analysis.full_analysis || '',
      next_actions: JSON.stringify(analysis.next_actions || []),
      related_job_ids: JSON.stringify(recentComplete.slice(0, 10).map(j => j.id)),
      status: 'complete',
    });

    // Log activity
    await base44.asServiceRole.entities.AgentActivity.create({
      agent_name: agent_type || 'System',
      action: `Self-reflection: score ${analysis.performance_score}/100, ${(analysis.weaknesses || []).length} weaknesses, ${(analysis.skill_upgrades || []).length} upgrades recommended`,
      status: 'success', category: 'system',
      details: JSON.stringify({ reflection_id: ref.id, score: analysis.performance_score }),
    });

    return Response.json({ success: true, reflection: { id: ref.id, ...analysis, metrics: { totalTasks, successRate, avgQuality } } });
  }

  // ═══════════════════════════════════════════════════════════
  // 3. DYNAMIC DELEGATION — Agent determines it needs help and delegates
  // ═══════════════════════════════════════════════════════════
  if (action === 'delegate') {
    const { job_id, reason } = body;
    const job = await base44.asServiceRole.entities.AgentJob.get(job_id);
    if (!job) return Response.json({ error: 'Job not found' }, { status: 404 });

    const capabilities = AGENT_CAPABILITIES[job.agent_type] || { can_delegate_to: [] };

    const delegation = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `An ${job.agent_type} agent needs to delegate part of its work.
      
CURRENT TASK: ${job.job_description}
REASON FOR DELEGATION: ${reason || 'Task requires capabilities beyond this agent'}
AGENTS AVAILABLE: ${capabilities.can_delegate_to.join(', ')}

Determine the best agent to delegate to and what specific subtask they should handle.`,
      response_json_schema: {
        type: 'object',
        properties: {
          delegate_to: { type: 'string' },
          subtask: { type: 'string' },
          context_to_pass: { type: 'string' },
          expected_output: { type: 'string' },
          urgency: { type: 'string' },
        }
      }
    });

    const existingChain = safeJSON(job.delegation_chain);
    existingChain.push({ from: job.agent_type, to: delegation.delegate_to, reason: reason || delegation.subtask });

    const delegatedJob = await base44.asServiceRole.entities.AgentJob.create({
      agent_type: delegation.delegate_to || 'Research',
      job_description: delegation.subtask,
      goal: job.goal || job.job_description,
      status: 'queued',
      priority: delegation.urgency === 'high' ? 9 : 7,
      trigger_source: 'delegation',
      parent_job_id: job_id,
      collaboration_group_id: job.collaboration_group_id || '',
      memory_context: delegation.context_to_pass,
      delegation_chain: JSON.stringify(existingChain),
    });

    await base44.asServiceRole.entities.AgentJob.update(job_id, {
      status: 'delegating',
      output_handed_to: delegation.delegate_to,
      delegation_chain: JSON.stringify(existingChain),
      live_output: `Delegated subtask to ${delegation.delegate_to}: ${delegation.subtask}`,
    });

    return Response.json({ success: true, delegated_job: delegatedJob, delegation });
  }

  // ═══════════════════════════════════════════════════════════
  // 4. SELF-CORRECT — Re-execute a failed/low-quality job with improvements
  // ═══════════════════════════════════════════════════════════
  if (action === 'self_correct') {
    const { job_id } = body;
    const job = await base44.asServiceRole.entities.AgentJob.get(job_id);
    if (!job) return Response.json({ error: 'Job not found' }, { status: 404 });

    let prevResult = {};
    try { prevResult = JSON.parse(job.result || '{}'); } catch {}

    const corrected = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are the XPS ${job.agent_type} Agent performing SELF-CORRECTION on a previous task.

ORIGINAL TASK: ${job.job_description}
PREVIOUS OUTPUT: ${prevResult.summary || job.result || 'No output'}
ERROR (if any): ${job.error || 'None'}
QUALITY SCORE: ${job.quality_score || 'Not scored'}

Analyze what went wrong, fix the issues, and produce a corrected, higher-quality output. Explain what you changed and why.`,
      response_json_schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          output_data: { type: 'string' },
          quality_self_score: { type: 'number' },
          corrections_made: { type: 'array', items: { type: 'string' } },
          root_cause: { type: 'string' },
          prevention_strategy: { type: 'string' },
        }
      },
      add_context_from_internet: true,
      model: 'gemini_3_flash'
    });

    // Create a new corrected job linked to original
    const correctedJob = await base44.asServiceRole.entities.AgentJob.create({
      agent_type: job.agent_type,
      job_description: `[Self-Corrected] ${job.job_description}`,
      goal: job.goal,
      status: 'complete',
      priority: job.priority,
      trigger_source: 'self_correction',
      parent_job_id: job_id,
      collaboration_group_id: job.collaboration_group_id || '',
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      quality_score: corrected.quality_self_score || 0,
      result: JSON.stringify(corrected),
      live_output: `[Corrected] ${corrected.summary}`,
    });

    return Response.json({ success: true, corrected_job: correctedJob, corrections: corrected });
  }

  // ═══════════════════════════════════════════════════════════
  // 5. DASHBOARD — Collaboration & reflection overview
  // ═══════════════════════════════════════════════════════════
  if (action === 'dashboard') {
    const [reflections, collabJobs, recentJobs] = await Promise.all([
      base44.asServiceRole.entities.AgentReflection.list('-created_date', 20),
      base44.asServiceRole.entities.AgentJob.filter({ trigger_source: 'delegation' }, '-created_date', 30),
      base44.asServiceRole.entities.AgentJob.list('-created_date', 50),
    ]);

    // Compute agent performance map
    const agentPerf = {};
    for (const j of recentJobs) {
      if (!agentPerf[j.agent_type]) agentPerf[j.agent_type] = { complete: 0, failed: 0, corrections: 0, avg_quality: 0, qualities: [] };
      if (j.status === 'complete') { agentPerf[j.agent_type].complete++; agentPerf[j.agent_type].qualities.push(j.quality_score || 50); }
      if (j.status === 'failed') agentPerf[j.agent_type].failed++;
      if (j.trigger_source === 'self_correction') agentPerf[j.agent_type].corrections++;
    }
    for (const [k, v] of Object.entries(agentPerf)) {
      v.avg_quality = v.qualities.length > 0 ? Math.round(v.qualities.reduce((a, b) => a + b, 0) / v.qualities.length) : 0;
      v.success_rate = (v.complete + v.failed) > 0 ? Math.round((v.complete / (v.complete + v.failed)) * 100) : 0;
      delete v.qualities;
    }

    return Response.json({
      agent_performance: agentPerf,
      recent_reflections: reflections.slice(0, 10),
      active_collaborations: collabJobs.filter(j => j.status === 'running' || j.status === 'delegating'),
      recent_delegations: collabJobs.slice(0, 15),
      total_self_corrections: recentJobs.filter(j => j.trigger_source === 'self_correction').length,
    });
  }

  return Response.json({ error: 'Invalid action. Use: collaborate, reflect, delegate, self_correct, dashboard' }, { status: 400 });
});

// Wrap with error handling

// Helper: Run collaborative reflection after a group finishes
async function runReflection(base44, groupId, allResults, goal) {
  const agentsUsed = allResults.flatMap(p => p.results.map(r => r.agent));
  const corrections = allResults.flatMap(p => p.results.filter(r => r.self_corrected));
  const avgQuality = (() => {
    const scores = allResults.flatMap(p => p.results.map(r => r.quality_self_score || 50));
    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  })();

  const review = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `Review this multi-agent collaboration session:
GOAL: ${goal}
AGENTS USED: ${agentsUsed.join(', ')}
PHASES: ${allResults.length}
SELF-CORRECTIONS: ${corrections.length}
AVG QUALITY: ${avgQuality}/100

PHASE RESULTS:
${allResults.map(p => `Phase ${p.phase}: ${p.name}\n${p.results.map(r => `  [${r.agent}] Quality: ${r.quality_self_score}/100 — ${r.summary}`).join('\n')}`).join('\n\n')}

Provide collaboration-specific insights: what worked, what didn't, how agents could coordinate better.`,
    response_json_schema: {
      type: 'object',
      properties: {
        collaboration_score: { type: 'number' },
        what_worked: { type: 'array', items: { type: 'string' } },
        what_failed: { type: 'array', items: { type: 'string' } },
        coordination_improvements: { type: 'array', items: { type: 'string' } },
        skill_gaps_detected: { type: 'array', items: { type: 'string' } },
        full_review: { type: 'string' },
      }
    }
  });

  const ref = await base44.asServiceRole.entities.AgentReflection.create({
    agent_type: 'Coordinator',
    reflection_type: 'collaboration_review',
    trigger: 'collaboration_end',
    performance_score: review.collaboration_score || avgQuality,
    tasks_analyzed: agentsUsed.length,
    success_rate: avgQuality,
    strengths: JSON.stringify(review.what_worked || []),
    weaknesses: JSON.stringify(review.what_failed || []),
    collaboration_insights: JSON.stringify(review.coordination_improvements || []),
    skill_upgrades: JSON.stringify(review.skill_gaps_detected || []),
    full_analysis: review.full_review || '',
    status: 'complete',
  });

  return { id: ref.id, ...review };
}