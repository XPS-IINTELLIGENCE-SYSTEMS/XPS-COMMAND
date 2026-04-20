import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

// Routes complex queries to Groq (fast) or Anthropic Claude (deep reasoning)
// based on query complexity. Writes results to Supabase if configured.
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { prompt, context, mode, lead_id, job_id } = await req.json();

  if (!prompt) return Response.json({ error: "prompt is required" }, { status: 400 });

  // Classify complexity to choose model
  const isComplex = mode === "deep" ||
    /bid|estimate|proposal|pricing|market analysis|competitor|forecast|strategy|takeoff|blueprint/i.test(prompt);

  const isReasoning = mode === "reasoning" ||
    /compare|analyze|recommend|evaluate|assess|calculate|optimize/i.test(prompt);

  let result;

  if (isComplex || isReasoning) {
    // Route to Anthropic Claude for deep reasoning
    console.log("Routing to Anthropic Claude (deep reasoning)");
    
    const systemPrompt = `You are XPS Intelligence — an expert AI for the commercial flooring industry (epoxy, polished concrete, polyaspartic, polyurea coatings).

You specialize in:
- Bid estimation and dynamic pricing ($3-20/sqft depending on system)
- Market analysis and territory assessment
- Competitor intelligence and positioning
- Project takeoff calculations
- Proposal generation and scope of work writing

Always provide specific numbers, ranges, and actionable recommendations.
When estimating bids, factor in: materials ($1-6/sqft), labor ($2-8/sqft), overhead (15-25%), profit margin (10-20%), mobilization, surface prep complexity, and local market rates.

${context ? `Additional context:\n${context}` : ""}`;

    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const claudeData = await claudeRes.json();
    result = {
      response: claudeData.content?.[0]?.text || "No response from Claude",
      model: "claude-sonnet-4",
      provider: "anthropic",
      tokens_used: claudeData.usage?.input_tokens + claudeData.usage?.output_tokens || 0
    };

  } else {
    // Route to Groq for fast responses
    console.log("Routing to Groq (fast mode)");

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are XPS Intelligence — an expert AI assistant for Xtreme Polishing Systems, a commercial flooring company. Be concise, actionable, and specific. ${context || ""}`
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    const groqData = await groqRes.json();
    result = {
      response: groqData.choices?.[0]?.message?.content || "No response from Groq",
      model: "llama-3.3-70b",
      provider: "groq",
      tokens_used: groqData.usage?.total_tokens || 0
    };
  }

  // If tied to a lead or job, store the insight
  if (lead_id) {
    try {
      const leads = await base44.asServiceRole.entities.Lead.filter({ id: lead_id });
      if (leads.length > 0) {
        await base44.asServiceRole.entities.Lead.update(lead_id, {
          ai_insight: result.response.slice(0, 2000)
        });
      }
    } catch (e) {
      console.error("Failed to update lead insight:", e.message);
    }
  }

  if (job_id) {
    try {
      await base44.asServiceRole.entities.CommercialJob.update(job_id, {
        ai_insight: result.response.slice(0, 2000)
      });
    } catch (e) {
      console.error("Failed to update job insight:", e.message);
    }
  }

  return Response.json({
    success: true,
    ...result,
    complexity: isComplex ? "deep" : isReasoning ? "reasoning" : "fast"
  });
});