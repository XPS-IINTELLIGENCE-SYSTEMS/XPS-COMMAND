import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { command, targets, mode } = await req.json();

    if (!command) {
      return Response.json({ error: 'command is required' }, { status: 400 });
    }

    // The Swarm Orchestrator analyzes the command and determines which agents to invoke
    const agentRegistry = {
      lead_gen: { name: "Lead Gen Manager", functions: ["territoryAnalyzer", "leadScraper", "contactEnricher", "deepResearch", "leadScorer", "bulkLeadPipeline"], triggers: ["lead", "scrape", "territory", "pipeline", "enrich", "prospect", "find"] },
      sales_director: { name: "Sales Director", functions: ["generateProposal", "sendOutreachEmail", "makeAiCall", "sendSms"], triggers: ["proposal", "sell", "close", "deal", "negotiate", "follow up", "quote"] },
      billing_controller: { name: "Finance Controller", functions: ["generateInvoice"], triggers: ["invoice", "payment", "billing", "collect", "money", "revenue", "financial"] },
      seo_marketing: { name: "Marketing Director", functions: ["seoAnalyze", "webResearch"], triggers: ["seo", "content", "blog", "keyword", "marketing", "campaign"] },
      social_media: { name: "Social Media Manager", functions: ["seoAnalyze"], triggers: ["social", "instagram", "facebook", "linkedin", "tiktok", "post", "youtube"] },
      prediction: { name: "Prediction Analyst", functions: ["leadScorer"], triggers: ["forecast", "predict", "trend", "projection", "future"] },
      simulation: { name: "Simulation Analyst", functions: ["territoryAnalyzer", "leadScorer"], triggers: ["simulate", "what if", "scenario", "model", "risk"] },
      validation: { name: "QA Director", functions: [], triggers: ["validate", "audit", "quality", "duplicate", "check", "verify"] },
      recommendation: { name: "Strategy Advisor", functions: ["leadScorer"], triggers: ["recommend", "suggest", "optimize", "prioritize", "best", "strategy"] },
      code_agent: { name: "Systems Engineer", functions: [], triggers: ["system", "automation", "workflow", "debug", "performance"] },
      security: { name: "Security Director", functions: [], triggers: ["security", "access", "compliance", "protect", "threat"] },
      maintenance: { name: "Maintenance Ops", functions: [], triggers: ["clean", "archive", "maintenance", "stale", "cleanup"] },
      reputation: { name: "Reputation Manager", functions: ["webResearch", "sendOutreachEmail"], triggers: ["review", "reputation", "testimonial", "rating", "brand"] },
    };

    const commandLower = command.toLowerCase();

    // Determine which agents should be activated
    const activatedAgents = [];
    for (const [agentId, agent] of Object.entries(agentRegistry)) {
      const match = agent.triggers.some(t => commandLower.includes(t));
      if (match) {
        activatedAgents.push({ id: agentId, ...agent });
      }
    }

    // If no specific match, use AI to determine routing
    if (activatedAgents.length === 0) {
      const routingResult = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a swarm orchestrator for a digital corporation. Given this command, determine which department agents should handle it.

Command: "${command}"

Available agents and their roles:
- lead_gen: Lead generation, territory analysis, scraping, enrichment
- sales_director: Proposals, negotiations, closing deals, follow-ups
- billing_controller: Invoicing, payments, collections, financial reporting
- seo_marketing: SEO, content creation, keyword strategy, competitor analysis
- social_media: Social media posts, content calendars, platform management
- prediction: Revenue forecasting, trend analysis, market predictions
- simulation: What-if scenarios, risk modeling, pipeline simulations
- validation: Data quality audits, duplicate detection, compliance checks
- recommendation: Next-best-action, strategy optimization, prioritization
- code_agent: System automation, workflow creation, debugging
- security: Data access monitoring, compliance, threat detection
- maintenance: Data cleanup, archival, system health
- reputation: Review monitoring, brand sentiment, testimonial collection

Return the agents that should handle this command and what each should do.`,
        response_json_schema: {
          type: "object",
          properties: {
            agents: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  agent_id: { type: "string" },
                  task: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            execution_plan: { type: "string" },
            estimated_time: { type: "string" }
          }
        }
      });

      // Create tasks for the AI-determined agents
      const tasks = [];
      for (const agent of (routingResult.agents || [])) {
        const task = await base44.entities.AgentTask.create({
          task_description: `[SWARM] ${agent.task}`,
          task_type: "Workflow",
          status: "Queued",
          priority: agent.priority === "high" ? "High" : agent.priority === "urgent" ? "Urgent" : "Medium",
          result: `Assigned to: ${agent.agent_id}`,
          related_entity_type: "Workflow"
        });
        tasks.push({ agent: agent.agent_id, task_id: task.id, instruction: agent.task });
      }

      return Response.json({
        success: true,
        mode: "ai-routed",
        command,
        execution_plan: routingResult.execution_plan,
        estimated_time: routingResult.estimated_time,
        agents_activated: tasks.length,
        tasks
      });
    }

    // Execute with matched agents
    const results = [];
    const tasks = [];

    for (const agent of activatedAgents) {
      // Create a task for each activated agent
      const task = await base44.entities.AgentTask.create({
        task_description: `[SWARM] ${command}`,
        task_type: "Workflow",
        status: "Queued",
        priority: mode === "urgent" ? "Urgent" : "High",
        result: `Assigned to: ${agent.id} (${agent.name})`,
        related_entity_type: "Workflow"
      });
      tasks.push({ agent_id: agent.id, agent_name: agent.name, task_id: task.id });

      // If the agent has functions and targets are provided, try to execute
      if (agent.functions.length > 0 && targets) {
        for (const fn of agent.functions) {
          // Check if this function is relevant to the command
          const fnRelevant = {
            territoryAnalyzer: ["territory", "analyze", "market"],
            leadScraper: ["lead", "scrape", "find", "prospect"],
            contactEnricher: ["enrich", "contact", "email", "phone"],
            deepResearch: ["research", "deep", "intel"],
            leadScorer: ["score", "rank", "prioritize"],
            bulkLeadPipeline: ["pipeline", "bulk", "mass"],
            generateProposal: ["proposal", "quote", "bid"],
            generateInvoice: ["invoice", "bill"],
            sendOutreachEmail: ["email", "outreach", "send"],
            makeAiCall: ["call", "phone"],
            sendSms: ["sms", "text"],
            seoAnalyze: ["seo", "analyze", "keyword"],
            webResearch: ["research", "web", "search"]
          };

          const isRelevant = (fnRelevant[fn] || []).some(t => commandLower.includes(t));
          if (isRelevant) {
            try {
              const res = await base44.functions.invoke(fn, targets);
              results.push({ agent: agent.id, function: fn, success: true, data: res.data });
            } catch (err) {
              results.push({ agent: agent.id, function: fn, success: false, error: err.message });
            }
          }
        }
      }
    }

    return Response.json({
      success: true,
      mode: mode || "standard",
      command,
      agents_activated: activatedAgents.length,
      agents: activatedAgents.map(a => ({ id: a.id, name: a.name })),
      tasks_created: tasks.length,
      tasks,
      execution_results: results,
      message: `Swarm activated: ${activatedAgents.map(a => a.name).join(', ')}. ${tasks.length} tasks created.${results.length > 0 ? ` ${results.filter(r => r.success).length} functions executed successfully.` : ''}`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});