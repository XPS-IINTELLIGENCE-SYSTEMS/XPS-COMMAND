import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");

/**
 * GROQ LLM — Drop-in replacement for Base44 InvokeLLM.
 * Accepts: { prompt, response_json_schema?, model?, context? }
 * Returns: same shape as InvokeLLM — string or parsed JSON object.
 * 
 * This saves integration credits by routing through Groq's free/cheap API.
 * Does NOT support web search or file_urls — use InvokeLLM for those.
 */

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { prompt, response_json_schema, model, context } = body;

  if (!prompt) return Response.json({ error: 'prompt is required' }, { status: 400 });

  const groqModel = model || "llama-3.3-70b-versatile";

  let systemMsg = "You are XPS Intelligence — an expert AI assistant. Be concise, actionable, and specific.";
  if (context) systemMsg += `\n\nContext: ${context}`;

  let userMsg = prompt;
  if (response_json_schema) {
    userMsg += "\n\nReturn ONLY valid JSON matching this schema. No markdown wrapping, no explanation.\nSchema: " + JSON.stringify(response_json_schema);
  }

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: groqModel,
      messages: [
        { role: "system", content: systemMsg },
        { role: "user", content: userMsg }
      ],
      temperature: 0.2,
      max_tokens: 4000
    })
  });

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || "";

  if (!response_json_schema) {
    return Response.json({ result: raw, model: groqModel, provider: "groq" });
  }

  // Parse JSON response
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  try {
    const parsed = JSON.parse(cleaned);
    return Response.json({ result: parsed, model: groqModel, provider: "groq" });
  } catch {
    return Response.json({ result: raw, model: groqModel, provider: "groq", parse_error: true });
  }
});