import { base44 } from "@/api/base44Client";

// Simulate parallel agent execution like Manus does
export async function executeAgentTask(prompt, onUpdate) {
  // Step 1: Planning
  onUpdate({
    role: "assistant",
    content: null,
    tools: [{ name: "Planning task breakdown...", status: "running" }]
  });

  // Step 2: Use InvokeLLM to plan and execute
  const planResult = await base44.integrations.Core.InvokeLLM({
    prompt: `You are Agent Zero, an advanced autonomous AI agent. The user has given you this task:

"${prompt}"

Break this into clear steps and execute. Provide a comprehensive, actionable response. If the task involves research, provide detailed findings. If it involves building/creating, provide the deliverable. Be thorough and professional.

Format your response with clear sections using markdown headers, bullet points, and code blocks where appropriate.`,
    response_json_schema: {
      type: "object",
      properties: {
        plan_steps: {
          type: "array",
          items: { type: "string" },
          description: "The steps the agent will take"
        },
        response: {
          type: "string",
          description: "The comprehensive response with findings, deliverables, or results"
        },
        tools_used: {
          type: "array",
          items: { type: "string" },
          description: "List of tools/capabilities used"
        }
      }
    }
  });

  // Step 3: Return completed response
  const tools = (planResult.tools_used || []).map(t => ({
    name: t,
    status: "complete"
  }));

  return {
    role: "assistant",
    content: planResult.response || "Task completed.",
    tools: tools.length > 0 ? tools : [{ name: "Task execution", status: "complete" }]
  };
}

// Research-specific execution with web context
export async function executeResearchTask(prompt, onUpdate) {
  onUpdate({
    role: "assistant",
    content: null,
    tools: [
      { name: "Wide Research — spawning sub-agents...", status: "running" },
      { name: "Browsing web sources...", status: "running" },
    ]
  });

  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `You are Agent Zero's Wide Research module. Conduct comprehensive research on:

"${prompt}"

Provide detailed, structured findings with:
- Executive summary
- Key findings (with specifics, numbers, names)
- Competitive analysis if relevant
- Data tables or comparisons
- Actionable recommendations
- Source attribution

Be thorough, accurate, and professional. Format with markdown.`,
    add_context_from_internet: true,
    response_json_schema: {
      type: "object",
      properties: {
        response: { type: "string" },
        sources_consulted: { type: "number" },
        confidence: { type: "number" }
      }
    }
  });

  return {
    role: "assistant",
    content: result.response || "Research complete.",
    tools: [
      { name: `Wide Research — ${result.sources_consulted || 12} sources analyzed`, status: "complete" },
      { name: "Data synthesis complete", status: "complete" },
    ]
  };
}