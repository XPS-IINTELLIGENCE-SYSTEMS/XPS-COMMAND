import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * NATURAL LANGUAGE → AI-OPTIMIZED PROMPT CONVERTER
 * Takes raw user input and transforms it into a structured,
 * AI-optimal prompt that maximizes LLM output quality.
 */
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { raw_input, context } = await req.json();
  if (!raw_input) return Response.json({ error: 'raw_input required' }, { status: 400 });

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are an AI prompt optimization engine. Transform the user's natural language into a perfectly structured prompt that will produce the best possible AI output.

USER'S RAW INPUT:
"${raw_input}"

${context ? `CONTEXT: ${context}` : ''}

RULES:
1. Preserve the user's INTENT exactly — do not change what they're asking for
2. Add structure: clear objective, specific constraints, output format
3. Add domain context (this is for a commercial flooring/epoxy intelligence system called XPS)
4. Remove ambiguity — be precise about quantities, formats, and expectations
5. Add specificity — if they say "find leads" specify what fields to return
6. Keep it concise but complete — no fluff
7. Format as a ready-to-use prompt

Return both the optimized prompt AND a brief explanation of what you improved.`,
    response_json_schema: {
      type: 'object',
      properties: {
        optimized_prompt: { type: 'string' },
        improvements_made: { type: 'string' },
        detected_intent: { type: 'string' },
        suggested_agent: { type: 'string', description: 'Which agent should handle this: xps_assistant, lead_gen, sales_director, seo_marketing' },
      }
    }
  });

  return Response.json({
    success: true,
    original: raw_input,
    optimized: result.optimized_prompt,
    improvements: result.improvements_made,
    intent: result.detected_intent,
    suggested_agent: result.suggested_agent,
  });
});