import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const AGENT_TYPES = [
  "Coordinator", "Browser", "Research", "Scraper", "Writer",
  "Analyst", "Coder", "Scheduler"
];

const TOOL_CATALOG = {
  query_leads: "Search leads with filters",
  create_lead: "Create a new lead record",
  update_lead: "Update a lead field",
  bulk_update_leads: "Update multiple leads",
  export_leads: "Export leads to JSON",
  send_email: "Send outreach email to a lead",
  queue_email: "Schedule email for later delivery",
  send_sms: "Send SMS via Twilio",
  research_company: "Deep profile a company via web",
  find_contacts: "Find contacts for a company",
  score_lead: "AI score a lead",
  generate_email: "Write personalized outreach email",
  generate_proposal: "Build a proposal document",
  generate_bid: "Build a bid document",
  scrape_web: "Search the web and extract data",
  create_agent_job: "Spawn a sub-agent task",
  update_pipeline_stage: "Move lead in pipeline",
  analyze_data: "Process and analyze data with AI",
  generate_report: "Create a summary report",
};

function buildCoordinatorPrompt(goal, existingContext) {
  return `You are the XPS Autonomous Coordinator Agent. You receive a high-level goal and create an execution plan.
Break the goal into concrete subtasks that specialist agents can execute in parallel where possible.

AVAILABLE AGENT TYPES:
- Browser: navigates URLs, extracts data from web pages
- Research: deep-profiles companies, people, markets using web intelligence
- Scraper: finds and collects leads from any source
- Writer: drafts emails, proposals, bids, social posts, content
- Analyst: processes data, scores leads, generates reports, forecasts
- Coder: writes custom data processing logic
- Scheduler: manages timed tasks and monitors execution

AVAILABLE TOOLS: ${Object.entries(TOOL_CATALOG).map(([k, v]) => `${k}: ${v}`).join('; ')}

USER GOAL: ${goal}

${existingContext ? `CONTEXT FROM PREVIOUS STEPS:\n${existingContext}` : ''}

Create an execution plan. Return JSON with:
- plan_summary: one paragraph overview
- tasks: array of { agent_type, description, tools_needed (array of tool names), depends_on (array of task indices, empty if independent), priority (1-10) }
- estimated_steps: total number of steps
- parallel_groups: array of arrays grouping task indices that can run simultaneously`;
}

function buildAgentPrompt(agentType, taskDescription, tools, context) {
  const typeInstructions = {
    Browser: "You navigate web pages and extract structured data. When given a URL or search query, return the data you found. Focus on accuracy.",
    Research: "You deep-profile companies, people, and markets. Use web intelligence to gather comprehensive data including company details, contacts, financials, and market position.",
    Scraper: "You find and collect business data from web sources. Extract: company names, contacts, emails, phones, locations, industries, and buying signals.",
    Writer: "You create professional business communications. Write emails, proposals, bids, and content. Be concise, professional, and personalized.",
    Analyst: "You analyze data, score leads, and generate insights. Process datasets, identify patterns, rank opportunities, and create forecasts.",
    Coder: "You write JavaScript to process and transform data. Output clean, executable code or data processing results.",
    Scheduler: "You manage task scheduling and timing. Determine optimal send times, create schedules, and plan execution windows.",
  };

  return `You are the XPS ${agentType} Agent for Xtreme Polishing Systems — a multi-million dollar epoxy and decorative concrete company.

${typeInstructions[agentType] || `You are a specialist ${agentType} agent.`}

TASK: ${taskDescription}

${context ? `CONTEXT:\n${context}` : ''}

TOOLS AVAILABLE: ${(tools || []).join(', ')}

Execute this task thoroughly. Return JSON with:
- summary: what you accomplished
- data: the actual output data (structured)
- records_affected: number of records created/updated
- next_actions: any recommended follow-up actions
- handoff_data: data to pass to the next agent if applicable`;
}

async function executeTool(base44, toolName, params) {
  switch (toolName) {
    case "query_leads": {
      const leads = await base44.asServiceRole.entities.Lead.filter(params.filters || {}, '-score', params.limit || 50);
      return { success: true, data: leads, count: leads.length };
    }
    case "create_lead": {
      const leadData = {
        company: params.company || params.name || 'Unknown',
        contact_name: params.contact_name || params.contact || 'Decision Maker',
        stage: params.stage || 'Incoming',
        ...(params.email && { email: params.email }),
        ...(params.phone && { phone: params.phone }),
        ...(params.website && { website: params.website }),
        ...(params.location && { location: params.location }),
        ...(params.city && { city: params.city }),
        ...(params.state && { state: params.state }),
        ...(params.vertical && { vertical: params.vertical }),
        ...(params.specialty && { specialty: params.specialty }),
        ...(params.square_footage && { square_footage: params.square_footage }),
        ...(params.ingestion_source && { ingestion_source: params.ingestion_source }),
        ingestion_source: params.ingestion_source || 'Other',
        source: params.source || 'Agent Engine',
      };
      const lead = await base44.asServiceRole.entities.Lead.create(leadData);
      return { success: true, data: lead };
    }
    case "update_lead": {
      await base44.asServiceRole.entities.Lead.update(params.id, params.data);
      return { success: true };
    }
    case "bulk_update_leads": {
      for (const id of (params.ids || [])) {
        await base44.asServiceRole.entities.Lead.update(id, params.data);
      }
      return { success: true, count: (params.ids || []).length };
    }
    case "send_email": {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: params.to,
        subject: params.subject,
        body: params.body,
        from_name: params.from_name || "Mike Rodriguez — XPS"
      });
      if (params.lead_id) {
        await base44.asServiceRole.entities.OutreachEmail.create({
          to_email: params.to, to_name: params.to_name || '', subject: params.subject,
          body: params.body, status: "Sent", email_type: params.email_type || "Initial Outreach",
          lead_id: params.lead_id, sent_at: new Date().toISOString()
        });
      }
      return { success: true };
    }
    case "research_company":
    case "scrape_web": {
      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Research and extract comprehensive data about: ${params.query || params.name || params.keyword}. ${params.city ? `Location: ${params.city}` : ''} ${params.context || ''}. Return detailed structured information.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            company_name: { type: "string" },
            website: { type: "string" },
            phone: { type: "string" },
            email: { type: "string" },
            address: { type: "string" },
            industry: { type: "string" },
            description: { type: "string" },
            contacts: { type: "array", items: { type: "object", properties: { name: { type: "string" }, title: { type: "string" }, email: { type: "string" } } } },
            additional_data: { type: "string" }
          }
        },
        model: "gemini_3_flash"
      });
      return { success: true, data: result };
    }
    case "score_lead": {
      const lead = await base44.asServiceRole.entities.Lead.get(params.lead_id);
      const scoreResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Score this lead for XPS (epoxy flooring company). Company: ${lead.company}, Vertical: ${lead.vertical}, Location: ${lead.location}, SqFt: ${lead.square_footage}, Revenue: ${lead.estimated_revenue}. Score 0-100 on fit, urgency, and deal size. Return score and reasoning.`,
        response_json_schema: { type: "object", properties: { score: { type: "number" }, reasoning: { type: "string" } } }
      });
      await base44.asServiceRole.entities.Lead.update(params.lead_id, { score: scoreResult.score, ai_insight: scoreResult.reasoning });
      return { success: true, data: scoreResult };
    }
    case "generate_email": {
      const lead = await base44.asServiceRole.entities.Lead.get(params.lead_id);
      const emailResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Write a personalized outreach email for XPS Xtreme Polishing Systems to ${lead.contact_name || 'Decision Maker'} at ${lead.company}. They are in ${lead.vertical || 'commercial'} sector, located in ${lead.location || lead.city || 'their area'}. Be warm, professional, and mention XPS epoxy flooring solutions. Sign as Mike Rodriguez, Senior Flooring Consultant.`,
        response_json_schema: { type: "object", properties: { subject: { type: "string" }, body_html: { type: "string" } } }
      });
      return { success: true, data: emailResult };
    }
    case "generate_proposal": {
      const res = await base44.asServiceRole.functions.invoke('generateProposal', params);
      return { success: true, data: res.data };
    }
    case "generate_bid": {
      const res = await base44.asServiceRole.functions.invoke('generateBidPackage', params);
      return { success: true, data: res.data };
    }
    case "analyze_data": {
      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: params.prompt,
        response_json_schema: params.schema || { type: "object", properties: { analysis: { type: "string" }, insights: { type: "array", items: { type: "string" } }, recommendations: { type: "array", items: { type: "string" } } } }
      });
      return { success: true, data: result };
    }
    case "generate_report": {
      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Generate a professional report: ${params.description}. ${params.data ? `Data: ${JSON.stringify(params.data).substring(0, 3000)}` : ''}`,
        response_json_schema: { type: "object", properties: { title: { type: "string" }, summary: { type: "string" }, sections: { type: "array", items: { type: "object", properties: { heading: { type: "string" }, content: { type: "string" } } } } } }
      });
      return { success: true, data: result };
    }
    case "update_pipeline_stage": {
      await base44.asServiceRole.entities.Lead.update(params.lead_id, { stage: params.stage });
      return { success: true };
    }
    default:
      return { success: false, error: `Unknown tool: ${toolName}` };
  }
}

async function appendLog(base44, jobId, entry) {
  const job = await base44.asServiceRole.entities.AgentJob.get(jobId);
  let log = [];
  try { log = JSON.parse(job.execution_log || '[]'); } catch { log = []; }
  log.push({ ...entry, timestamp: new Date().toISOString() });
  await base44.asServiceRole.entities.AgentJob.update(jobId, {
    execution_log: JSON.stringify(log),
    live_output: entry.message || entry.action || ''
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action } = body;

    // ── SUBMIT A NEW GOAL ──
    if (action === 'submit_goal') {
      const { goal, priority } = body;
      if (!goal) return Response.json({ error: 'goal is required' }, { status: 400 });

      // Create coordinator job
      const coordJob = await base44.asServiceRole.entities.AgentJob.create({
        agent_type: 'Coordinator',
        job_description: goal,
        goal,
        status: 'planning',
        priority: priority || 8,
        trigger_source: 'goal',
        started_at: new Date().toISOString(),
        execution_log: JSON.stringify([{ action: 'goal_received', message: `Goal received: ${goal}`, timestamp: new Date().toISOString() }])
      });

      // Plan with AI
      const planPrompt = buildCoordinatorPrompt(goal);
      const plan = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: planPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            plan_summary: { type: "string" },
            tasks: { type: "array", items: { type: "object", properties: {
              agent_type: { type: "string" }, description: { type: "string" },
              tools_needed: { type: "array", items: { type: "string" } },
              depends_on: { type: "array", items: { type: "number" } },
              priority: { type: "number" }
            } } },
            estimated_steps: { type: "number" },
            parallel_groups: { type: "array", items: { type: "array", items: { type: "number" } } }
          }
        },
        model: "gemini_3_flash"
      });

      await appendLog(base44, coordJob.id, { action: 'plan_created', message: plan.plan_summary, task_count: (plan.tasks || []).length });

      // Create sub-jobs for each task
      const subJobs = [];
      for (let i = 0; i < (plan.tasks || []).length; i++) {
        const task = plan.tasks[i];
        // Validate agent type
        const validType = AGENT_TYPES.includes(task.agent_type) ? task.agent_type : 'Research';
        const subJob = await base44.asServiceRole.entities.AgentJob.create({
          agent_type: validType,
          job_description: task.description,
          goal,
          status: 'queued',
          priority: task.priority || 5,
          trigger_source: 'goal',
          parent_job_id: coordJob.id,
          step_current: 0,
          step_total: 1,
          tool_calls: JSON.stringify(task.tools_needed || []),
          execution_log: JSON.stringify([])
        });
        subJobs.push({ index: i, id: subJob.id, agent_type: validType, description: task.description, depends_on: task.depends_on || [] });
      }

      // Update coordinator with step count
      await base44.asServiceRole.entities.AgentJob.update(coordJob.id, {
        status: 'running',
        step_total: subJobs.length,
        result: JSON.stringify({ plan_summary: plan.plan_summary, sub_jobs: subJobs })
      });

      return Response.json({
        success: true,
        coordinator_job_id: coordJob.id,
        plan_summary: plan.plan_summary,
        tasks_created: subJobs.length,
        sub_jobs: subJobs
      });
    }

    // ── EXECUTE A SPECIFIC JOB ──
    if (action === 'execute_job') {
      const { job_id } = body;
      const job = await base44.asServiceRole.entities.AgentJob.get(job_id);
      if (!job) return Response.json({ error: 'Job not found' }, { status: 404 });

      await base44.asServiceRole.entities.AgentJob.update(job_id, {
        status: 'running',
        started_at: job.started_at || new Date().toISOString()
      });
      await appendLog(base44, job_id, { action: 'execution_started', message: `${job.agent_type} agent starting: ${job.job_description}` });

      let retries = 0;
      const maxRetries = job.max_retries || 3;
      let lastError = null;

      while (retries <= maxRetries) {
        try {
          // Build agent prompt
          let context = job.memory_context || '';
          // Get context from parent job if exists
          if (job.parent_job_id) {
            try {
              const parent = await base44.asServiceRole.entities.AgentJob.get(job.parent_job_id);
              if (parent.result) {
                const parsed = JSON.parse(parent.result);
                context += `\nParent goal: ${parent.goal || parent.job_description}\nPlan: ${parsed.plan_summary || ''}`;
              }
            } catch { /* no parent context */ }
          }

          const tools = (() => { try { return JSON.parse(job.tool_calls || '[]'); } catch { return []; } })();
          const prompt = buildAgentPrompt(job.agent_type, job.job_description, tools, context);

          await appendLog(base44, job_id, { action: 'llm_call', message: `Calling AI (attempt ${retries + 1})...` });

          const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
              type: "object",
              properties: {
                summary: { type: "string" },
                data: { type: "string" },
                records_affected: { type: "number" },
                next_actions: { type: "array", items: { type: "string" } },
                handoff_data: { type: "string" }
              }
            },
            add_context_from_internet: true,
            model: "gemini_3_flash"
          });

          // Execute any tools the AI recommends
          let toolResults = [];
          for (const toolName of tools) {
            if (TOOL_CATALOG[toolName]) {
              try {
                await appendLog(base44, job_id, { action: 'tool_call', tool: toolName, message: `Calling tool: ${toolName}` });
                const toolResult = await executeTool(base44, toolName, { query: job.job_description, context: result.data });
                toolResults.push({ tool: toolName, ...toolResult });
              } catch (toolErr) {
                toolResults.push({ tool: toolName, success: false, error: toolErr.message });
                await appendLog(base44, job_id, { action: 'tool_error', tool: toolName, message: toolErr.message });
              }
            }
          }

          // Success — save result
          await base44.asServiceRole.entities.AgentJob.update(job_id, {
            status: 'complete',
            completed_at: new Date().toISOString(),
            step_current: job.step_total || 1,
            result: JSON.stringify({ ...result, tool_results: toolResults }),
            memory_context: result.summary || '',
            live_output: result.summary || 'Complete',
            retry_count: retries
          });
          await appendLog(base44, job_id, { action: 'completed', message: result.summary || 'Task completed', records: result.records_affected });

          // Update parent coordinator progress
          if (job.parent_job_id) {
            const siblings = await base44.asServiceRole.entities.AgentJob.filter({ parent_job_id: job.parent_job_id });
            const completedCount = siblings.filter(s => s.status === 'complete').length;
            await base44.asServiceRole.entities.AgentJob.update(job.parent_job_id, {
              step_current: completedCount,
              live_output: `${completedCount}/${siblings.length} tasks complete`
            });

            // If all siblings done, mark coordinator complete
            if (completedCount === siblings.length) {
              await base44.asServiceRole.entities.AgentJob.update(job.parent_job_id, {
                status: 'complete',
                completed_at: new Date().toISOString(),
                live_output: 'All tasks completed'
              });
              await appendLog(base44, job.parent_job_id, { action: 'all_complete', message: `All ${siblings.length} tasks finished` });
            }
          }

          return Response.json({ success: true, result: { ...result, tool_results: toolResults } });

        } catch (execError) {
          lastError = execError.message;
          retries++;
          await appendLog(base44, job_id, {
            action: 'retry',
            attempt: retries,
            message: `Error: ${execError.message}. ${retries <= maxRetries ? `Retrying (attempt ${retries + 1})...` : 'Max retries reached.'}`
          });
          await base44.asServiceRole.entities.AgentJob.update(job_id, { status: 'retrying', retry_count: retries });
        }
      }

      // All retries failed
      await base44.asServiceRole.entities.AgentJob.update(job_id, {
        status: 'failed',
        completed_at: new Date().toISOString(),
        error: lastError,
        live_output: `Failed after ${maxRetries} retries: ${lastError}`
      });
      return Response.json({ error: lastError }, { status: 500 });
    }

    // ── EXECUTE ALL QUEUED JOBS FOR A GOAL ──
    if (action === 'run_goal') {
      const { coordinator_job_id } = body;
      const subJobs = await base44.asServiceRole.entities.AgentJob.filter({ parent_job_id: coordinator_job_id, status: 'queued' }, '-priority');
      
      const results = [];
      for (const job of subJobs) {
        try {
          const res = await base44.functions.invoke('autonomousEngine', { action: 'execute_job', job_id: job.id });
          results.push({ job_id: job.id, success: true, data: res.data });
        } catch (err) {
          results.push({ job_id: job.id, success: false, error: err.message });
        }
      }

      return Response.json({ success: true, executed: results.length, results });
    }

    // ── GET DASHBOARD STATS ──
    if (action === 'dashboard') {
      const allJobs = await base44.asServiceRole.entities.AgentJob.filter({}, '-created_date', 200);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const todayJobs = allJobs.filter(j => new Date(j.created_date) >= today);
      const running = allJobs.filter(j => j.status === 'running' || j.status === 'planning' || j.status === 'retrying');
      const queued = allJobs.filter(j => j.status === 'queued');
      const completed = allJobs.filter(j => j.status === 'complete');
      const failed = allJobs.filter(j => j.status === 'failed');

      const byAgent = {};
      for (const t of AGENT_TYPES) {
        const agentJobs = allJobs.filter(j => j.agent_type === t);
        byAgent[t] = {
          running: agentJobs.filter(j => ['running', 'planning', 'retrying'].includes(j.status)).length,
          queued: agentJobs.filter(j => j.status === 'queued').length,
          completed: agentJobs.filter(j => j.status === 'complete').length,
          failed: agentJobs.filter(j => j.status === 'failed').length,
          today: agentJobs.filter(j => new Date(j.created_date) >= today).length,
          last_action: agentJobs[0]?.live_output || agentJobs[0]?.job_description || null,
          last_time: agentJobs[0]?.updated_date || null
        };
      }

      return Response.json({
        total: allJobs.length,
        running: running.length,
        queued: queued.length,
        completed_total: completed.length,
        completed_today: todayJobs.filter(j => j.status === 'complete').length,
        failed: failed.length,
        success_rate: completed.length > 0 ? Math.round((completed.length / (completed.length + failed.length)) * 100) : 0,
        by_agent: byAgent,
        active_jobs: running.map(j => ({ id: j.id, agent_type: j.agent_type, description: j.job_description, status: j.status, step: j.step_current, total: j.step_total, output: j.live_output, started: j.started_at })),
        queued_jobs: queued.slice(0, 20).map(j => ({ id: j.id, agent_type: j.agent_type, description: j.job_description, priority: j.priority })),
        recent_completed: completed.slice(0, 30).map(j => ({ id: j.id, agent_type: j.agent_type, description: j.job_description, result_summary: (() => { try { return JSON.parse(j.result || '{}').summary; } catch { return j.result?.substring(0, 200); } })(), completed_at: j.completed_at })),
        recent_failed: failed.slice(0, 10).map(j => ({ id: j.id, agent_type: j.agent_type, description: j.job_description, error: j.error, completed_at: j.completed_at }))
      });
    }

    // ── CANCEL / PAUSE / RESUME ──
    if (action === 'control') {
      const { job_id, command } = body;
      if (command === 'cancel') await base44.asServiceRole.entities.AgentJob.update(job_id, { status: 'cancelled', completed_at: new Date().toISOString() });
      if (command === 'pause') await base44.asServiceRole.entities.AgentJob.update(job_id, { status: 'paused' });
      if (command === 'resume') await base44.asServiceRole.entities.AgentJob.update(job_id, { status: 'queued' });
      if (command === 'retry') {
        await base44.asServiceRole.entities.AgentJob.update(job_id, { status: 'queued', error: '', retry_count: 0 });
      }
      return Response.json({ success: true });
    }

    // ── GET JOB DETAIL ──
    if (action === 'job_detail') {
      const job = await base44.asServiceRole.entities.AgentJob.get(body.job_id);
      let log = [];
      try { log = JSON.parse(job.execution_log || '[]'); } catch { log = []; }
      let result = null;
      try { result = JSON.parse(job.result || 'null'); } catch { result = job.result; }
      
      let subJobs = [];
      if (job.agent_type === 'Coordinator') {
        subJobs = await base44.asServiceRole.entities.AgentJob.filter({ parent_job_id: job.id });
      }

      return Response.json({ ...job, parsed_log: log, parsed_result: result, sub_jobs: subJobs });
    }

    return Response.json({ error: 'Invalid action. Use: submit_goal, execute_job, run_goal, dashboard, control, job_detail' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});