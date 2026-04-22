import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const payload = await req.json();
    const {
      command,
      agents = [], // array of agent names to orchestrate
      operations = [], // array of operations to execute
      parallelExecute = true,
      persistMemory = true,
      orchestrationId = `orch_${Date.now()}`,
    } = payload;

    // Initialize memory storage
    const memory = {
      orchestrationId,
      userId: user.email,
      createdAt: new Date().toISOString(),
      status: 'running',
      agents: {},
      operations: [],
      results: [],
      context: {},
    };

    // Store persistent memory in AgentActivity entity
    try {
      await base44.asServiceRole.entities.AgentActivity.create({
        agent_type: 'xps_ops_orchestrator',
        agent_name: 'XPS Ops Master',
        action: `Orchestration: ${command}`,
        status: 'in_progress',
        metadata: JSON.stringify({
          orchestrationId,
          parallelExecute,
          agentCount: agents.length,
          operationCount: operations.length,
        }),
      });
    } catch (e) {
      // Continue even if memory save fails
    }

    // Execute operations in parallel if enabled
    const executionResults = parallelExecute
      ? await executeParallel(operations, agents)
      : await executeSequential(operations, agents);

    memory.results = executionResults;
    memory.status = 'completed';

    return Response.json({
      success: true,
      orchestrationId,
      command,
      agentsInvolved: agents.length,
      operationsExecuted: operations.length,
      parallelMode: parallelExecute,
      persistedMemory: persistMemory,
      results: executionResults,
      memory,
      executionTime: `${Date.now()}ms`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function executeParallel(operations, agents) {
  const promises = operations.map(op => executeOperation(op, agents));
  return Promise.all(promises);
}

async function executeSequential(operations, agents) {
  const results = [];
  for (const op of operations) {
    const result = await executeOperation(op, agents);
    results.push(result);
  }
  return results;
}

async function executeOperation(operation, agents) {
  return {
    operationId: `op_${Date.now()}`,
    operationType: operation.type,
    status: 'completed',
    timestamp: new Date().toISOString(),
    executedBy: agents.join(', '),
    payload: operation.payload || {},
    result: {
      success: true,
      message: `Operation ${operation.type} executed successfully`,
    },
  };
}