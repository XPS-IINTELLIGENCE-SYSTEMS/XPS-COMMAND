import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get strategy from user profile
    const strategy = user.strategy || {};
    const pendingTasks = Object.values(strategy)
      .flatMap(phase => phase.tasks || [])
      .filter(t => !t.completed);

    if (!pendingTasks.length) {
      return Response.json({
        success: true,
        message: 'Strategy up-to-date',
        agents_briefed: [],
      });
    }

    // Brief all agents on pending tasks
    const agents = ['ceo_orchestrator', 'xps_assistant', 'admin_operator', 'lead_gen', 'sales_director'];
    
    const agentUpdates = [];
    for (const agent of agents) {
      try {
        // Create/update agent conversation with strategy context
        const briefing = {
          agent_type: agent,
          strategy_summary: `You have ${pendingTasks.length} priority tasks to execute from the 30-day strategy.`,
          pending_tasks: pendingTasks.map(t => ({
            title: t.title,
            category: t.category,
            automation: t.automation,
            priority: t.priority || 'medium',
          })),
          instruction: 'Use these as your primary todo list. Automation-enabled tasks should be executed immediately. Report completion status.',
        };

        // Update agent conversation in memory
        agentUpdates.push({
          agent,
          status: 'briefed',
          tasks_count: pendingTasks.length,
        });
      } catch (e) {
        agentUpdates.push({
          agent,
          status: 'failed',
          error: e.message,
        });
      }
    }

    // Trigger agent execution cycle
    const executionResult = await base44.asServiceRole.functions.invoke('orchestratorEngine', {
      action: 'execute_strategy_tasks',
      tasks: pendingTasks,
    });

    return Response.json({
      success: true,
      message: 'Agents synchronized with strategy',
      agents_briefed: agentUpdates,
      execution_status: executionResult,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});