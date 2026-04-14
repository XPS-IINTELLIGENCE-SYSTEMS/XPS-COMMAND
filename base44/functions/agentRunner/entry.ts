import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const AGENT_TYPES = [
  "Research", "Outreach", "Scraper", "Proposal", "Call", "Content", 
  "Analysis", "SEO", "Social", "Shadow Browser", "Site Builder", 
  "Crawler Network", "Property Builder"
];

function getAgentSystemPrompt(agentType, jobDescription, memoryContext) {
  const prompts = {
    "Research": `You are the XPS Research Agent. You research companies, markets, competitors, and industries for Xtreme Polishing Systems — a multi-million dollar epoxy and decorative concrete company. Provide detailed, actionable intelligence with sources.`,
    "Outreach": `You are the XPS Outreach Agent. You draft personalized outreach emails, SMS messages, and call scripts for Xtreme Polishing Systems sales team. Know XPS products: epoxy coatings, polished concrete, decorative floors, metallic epoxy, garage coatings.`,
    "Scraper": `You are the XPS Scraper Agent. You identify and extract business data from web sources. Find contractors, facility managers, and companies that need flooring services. Extract: company name, contact, email, phone, location, industry, signals.`,
    "Proposal": `You are the XPS Proposal Agent. You generate professional proposals for Xtreme Polishing Systems flooring projects. Include scope of work, materials, timeline, pricing, and terms. XPS services: epoxy floor coating, polished concrete, decorative epoxy, industrial flooring.`,
    "Call": `You are the XPS Call Agent. You prepare call scripts, talking points, and objection handling for sales calls. Know XPS products, pricing tiers, and competitive advantages.`,
    "Content": `You are the XPS Content Agent. You create SEO-optimized blog posts, social media content, ad copy, email campaigns, and video scripts for Xtreme Polishing Systems and XPS Xpress franchise network.`,
    "Analysis": `You are the XPS Analysis Agent. You analyze pipeline data, lead scores, conversion rates, revenue forecasts, and market trends for Xtreme Polishing Systems.`,
    "SEO": `You are the XPS SEO Agent. You analyze keywords, competitors, content gaps, and ranking opportunities for xtremepolishingsystems.com, xpsintelligence.com, and xpsxpress.com.`,
    "Social": `You are the XPS Social Media Agent. You create platform-native content for Instagram, LinkedIn, Facebook, TikTok, YouTube, and other platforms for Xtreme Polishing Systems.`,
    "Shadow Browser": `You are the XPS Shadow Browser Agent. You test, monitor, and identify improvements for xpsintelligence.com. Report bugs, slow pages, broken features, and improvement opportunities.`,
    "Site Builder": `You are the XPS Site Builder Agent. You generate web page designs, component structures, and content for new XPS digital properties.`,
    "Crawler Network": `You are the XPS Crawler Network Agent. You coordinate parallel web crawling operations across multiple data sources to find leads and intelligence.`,
    "Property Builder": `You are the XPS Property Builder Agent. You create brand packages, social profiles, and digital properties for XPS locations and brands.`,
  };

  let prompt = prompts[agentType] || `You are an XPS AI Agent specializing in ${agentType}.`;
  if (memoryContext) {
    prompt += `\n\nPrevious context from earlier sessions:\n${memoryContext}`;
  }
  prompt += `\n\nCurrent task: ${jobDescription}\n\nProvide a detailed, actionable response. Format as JSON with keys: summary, actions (array of steps taken), findings (key data), next_steps (recommended follow-ups), handoff_data (data to pass to next agent if applicable).`;
  return prompt;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, job_id, agent_type, job_description, priority, trigger_source, parent_job_id } = body;

    // Action: run a specific job
    if (action === 'run' && job_id) {
      const job = await base44.asServiceRole.entities.AgentJob.get(job_id);
      if (!job) return Response.json({ error: 'Job not found' }, { status: 404 });

      // Mark as running
      await base44.asServiceRole.entities.AgentJob.update(job_id, {
        status: 'running',
        started_at: new Date().toISOString()
      });

      try {
        // Get memory context from last completed job of same type
        let memoryContext = '';
        try {
          const prevJobs = await base44.asServiceRole.entities.AgentJob.filter(
            { agent_type: job.agent_type, status: 'complete' },
            '-completed_at',
            1
          );
          if (prevJobs && prevJobs.length > 0 && prevJobs[0].result) {
            const prevResult = JSON.parse(prevJobs[0].result);
            memoryContext = prevResult.summary || '';
          }
        } catch (e) {
          // No previous context, continue
        }

        const systemPrompt = getAgentSystemPrompt(job.agent_type, job.job_description, memoryContext);

        // Execute via InvokeLLM
        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: systemPrompt,
          response_json_schema: {
            type: "object",
            properties: {
              summary: { type: "string" },
              actions: { type: "array", items: { type: "string" } },
              findings: { type: "string" },
              next_steps: { type: "array", items: { type: "string" } },
              handoff_data: { type: "string" }
            }
          },
          add_context_from_internet: true
        });

        // Update job with result
        await base44.asServiceRole.entities.AgentJob.update(job_id, {
          status: 'complete',
          completed_at: new Date().toISOString(),
          result: JSON.stringify(result),
          memory_context: result.summary || '',
          execution_log: `Executed at ${new Date().toISOString()}. Actions: ${(result.actions || []).join('; ')}`
        });

        // Auto-handoff: if next_steps suggest another agent, create sub-job
        if (result.next_steps && result.next_steps.length > 0 && result.handoff_data) {
          const handoffDesc = `Handoff from ${job.agent_type}: ${result.next_steps[0]}. Context: ${result.handoff_data}`;
          // Determine best agent for handoff
          let nextAgent = 'Analysis';
          const desc = result.next_steps[0].toLowerCase();
          if (desc.includes('email') || desc.includes('outreach')) nextAgent = 'Outreach';
          else if (desc.includes('research') || desc.includes('investigate')) nextAgent = 'Research';
          else if (desc.includes('scrape') || desc.includes('crawl')) nextAgent = 'Scraper';
          else if (desc.includes('proposal') || desc.includes('quote')) nextAgent = 'Proposal';
          else if (desc.includes('content') || desc.includes('blog') || desc.includes('post')) nextAgent = 'Content';
          else if (desc.includes('seo') || desc.includes('keyword')) nextAgent = 'SEO';

          await base44.asServiceRole.entities.AgentJob.create({
            agent_type: nextAgent,
            job_description: handoffDesc,
            status: 'queued',
            priority: Math.max((job.priority || 5) - 1, 1),
            trigger_source: 'agent_handoff',
            parent_job_id: job_id,
            memory_context: result.handoff_data
          });

          await base44.asServiceRole.entities.AgentJob.update(job_id, {
            output_handed_to: nextAgent
          });
        }

        return Response.json({ success: true, result });
      } catch (execError) {
        await base44.asServiceRole.entities.AgentJob.update(job_id, {
          status: 'failed',
          completed_at: new Date().toISOString(),
          error: execError.message
        });
        return Response.json({ error: execError.message }, { status: 500 });
      }
    }

    // Action: create a new job
    if (action === 'create') {
      if (!agent_type || !AGENT_TYPES.includes(agent_type)) {
        return Response.json({ error: 'Invalid agent_type' }, { status: 400 });
      }
      if (!job_description) {
        return Response.json({ error: 'job_description required' }, { status: 400 });
      }

      const newJob = await base44.asServiceRole.entities.AgentJob.create({
        agent_type,
        job_description,
        status: 'queued',
        priority: priority || 5,
        trigger_source: trigger_source || 'manual',
        parent_job_id: parent_job_id || ''
      });

      return Response.json({ success: true, job: newJob });
    }

    // Action: pause/cancel a job
    if (action === 'pause' && job_id) {
      await base44.asServiceRole.entities.AgentJob.update(job_id, { status: 'paused' });
      return Response.json({ success: true });
    }
    if (action === 'cancel' && job_id) {
      await base44.asServiceRole.entities.AgentJob.update(job_id, { status: 'cancelled' });
      return Response.json({ success: true });
    }

    // Action: get agent stats
    if (action === 'stats') {
      const allJobs = await base44.asServiceRole.entities.AgentJob.filter({}, '-created_date', 200);
      const running = allJobs.filter(j => j.status === 'running');
      const queued = allJobs.filter(j => j.status === 'queued');
      const completed = allJobs.filter(j => j.status === 'complete');
      const failed = allJobs.filter(j => j.status === 'failed');

      const byAgent = {};
      for (const t of AGENT_TYPES) {
        const agentJobs = allJobs.filter(j => j.agent_type === t);
        byAgent[t] = {
          running: agentJobs.filter(j => j.status === 'running').length,
          queued: agentJobs.filter(j => j.status === 'queued').length,
          completed: agentJobs.filter(j => j.status === 'complete').length,
          failed: agentJobs.filter(j => j.status === 'failed').length,
          last_action: agentJobs.length > 0 ? agentJobs[0].updated_date : null
        };
      }

      return Response.json({
        total_running: running.length,
        total_queued: queued.length,
        total_completed: completed.length,
        total_failed: failed.length,
        by_agent: byAgent,
        recent_jobs: allJobs.slice(0, 20)
      });
    }

    // Action: run next queued job
    if (action === 'run_next') {
      const queued = await base44.asServiceRole.entities.AgentJob.filter(
        { status: 'queued' },
        '-priority',
        1
      );
      if (queued.length === 0) {
        return Response.json({ message: 'No queued jobs' });
      }
      // Recursively call self to run the job
      const nextJob = queued[0];
      await base44.asServiceRole.entities.AgentJob.update(nextJob.id, {
        status: 'running',
        started_at: new Date().toISOString()
      });

      // Execute inline
      let memoryContext = '';
      try {
        const prevJobs = await base44.asServiceRole.entities.AgentJob.filter(
          { agent_type: nextJob.agent_type, status: 'complete' },
          '-completed_at',
          1
        );
        if (prevJobs?.length > 0 && prevJobs[0].result) {
          const prevResult = JSON.parse(prevJobs[0].result);
          memoryContext = prevResult.summary || '';
        }
      } catch (_e) { /* no previous context */ }

      const systemPrompt = getAgentSystemPrompt(nextJob.agent_type, nextJob.job_description, memoryContext);
      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: systemPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            actions: { type: "array", items: { type: "string" } },
            findings: { type: "string" },
            next_steps: { type: "array", items: { type: "string" } },
            handoff_data: { type: "string" }
          }
        },
        add_context_from_internet: true
      });

      await base44.asServiceRole.entities.AgentJob.update(nextJob.id, {
        status: 'complete',
        completed_at: new Date().toISOString(),
        result: JSON.stringify(result),
        memory_context: result.summary || ''
      });

      return Response.json({ success: true, job_id: nextJob.id, result });
    }

    return Response.json({ error: 'Invalid action. Use: create, run, pause, cancel, stats, run_next' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});