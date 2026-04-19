import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { focus_areas, agent_name, personality, include_categories } = await req.json();

  // Gather all knowledge entries
  const allEntries = await base44.asServiceRole.entities.KnowledgeEntry.list("-relevance_score", 500);
  
  // Filter by selected categories if specified
  const categories = include_categories || [];
  const filtered = categories.length > 0 
    ? allEntries.filter(e => categories.includes(e.category))
    : allEntries;

  if (filtered.length === 0) {
    return Response.json({ error: 'No knowledge entries found. Scrape some data first.' }, { status: 400 });
  }

  // Build knowledge digest
  const knowledgeDigest = filtered.map(e => {
    let facts = [];
    try { facts = JSON.parse(e.key_facts || "[]"); } catch {}
    return `### ${e.title} [${e.category}]
${e.summary || e.content?.substring(0, 500) || ""}
${facts.length > 0 ? `Key Facts: ${facts.join("; ")}` : ""}
Tags: ${e.tags || "none"}
Source: ${e.source_domain || "internal"}`;
  }).join("\n\n");

  const stats = {
    total_entries: filtered.length,
    categories: [...new Set(filtered.map(e => e.category))],
    competitor_intel: filtered.filter(e => e.is_competitor_intel).length,
    pricing_data: filtered.filter(e => e.is_pricing_data).length,
    technical_specs: filtered.filter(e => e.is_technical_spec).length,
    high_priority: filtered.filter(e => e.is_high_priority).length,
    avg_relevance: Math.round(filtered.reduce((s, e) => s + (e.relevance_score || 0), 0) / filtered.length),
  };

  const prompt = `You are building a CUSTOM AI AGENT SYSTEM PROMPT for Xtreme Polishing Systems (XPS).

AGENT NAME: ${agent_name || "XPS Intelligence Agent"}
PERSONALITY: ${personality || "Professional, knowledgeable, proactive sales & operations expert"}
FOCUS AREAS: ${(focus_areas || []).join(", ") || "All areas"}

KNOWLEDGE BASE STATISTICS:
- Total entries: ${stats.total_entries}
- Categories: ${stats.categories.join(", ")}
- Competitor intelligence entries: ${stats.competitor_intel}
- Pricing data entries: ${stats.pricing_data}
- Technical specifications: ${stats.technical_specs}
- High priority entries: ${stats.high_priority}
- Average relevance score: ${stats.avg_relevance}/100

FULL KNOWLEDGE DIGEST:
${knowledgeDigest.substring(0, 60000)}

---

Using ALL the knowledge above, create a comprehensive SYSTEM PROMPT for this custom AI agent. The system prompt should:

1. IDENTITY — Define who the agent is, its role, expertise, and personality
2. KNOWLEDGE — Embed the most critical facts, pricing, specs, competitive intel directly into the prompt so the agent "knows" them without looking up
3. PRODUCTS & SERVICES — List all products/services with key specs and pricing
4. COMPETITIVE POSITIONING — How XPS compares to competitors, key advantages
5. SALES PLAYBOOK — Key objection handling, closing techniques, value propositions
6. TECHNICAL EXPERTISE — Application methods, surface prep, system recommendations by use case
7. PRICING GUIDE — Pricing tiers, cost breakdowns, margin targets
8. GUARDRAILS — What the agent should/shouldn't say, compliance rules
9. RESPONSE STYLE — How to communicate, tone, format preferences

Make the system prompt EXTREMELY detailed and comprehensive. This will be the agent's entire brain.
Also create a brief description and a list of specific capabilities the agent should have.`;

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    model: "claude_sonnet_4_6",
    response_json_schema: {
      type: "object",
      properties: {
        system_prompt: { type: "string" },
        agent_description: { type: "string" },
        capabilities: { type: "array", items: { type: "string" } },
        knowledge_summary: { type: "string" },
        recommended_tools: { type: "array", items: { type: "string" } },
        estimated_accuracy: { type: "number" },
        knowledge_gaps: { type: "array", items: { type: "string" } }
      }
    }
  });

  // Save the custom LLM config to SiteSettings
  const configKey = `custom_llm_${(agent_name || "default").toLowerCase().replace(/\s+/g, "_")}`;
  
  // Check if setting already exists
  const existing = await base44.asServiceRole.entities.SiteSettings.filter({ setting_key: configKey });
  
  const configValue = JSON.stringify({
    agent_name: agent_name || "XPS Intelligence Agent",
    system_prompt: result.system_prompt || "",
    description: result.agent_description || "",
    capabilities: result.capabilities || [],
    knowledge_summary: result.knowledge_summary || "",
    recommended_tools: result.recommended_tools || [],
    estimated_accuracy: result.estimated_accuracy || 0,
    knowledge_gaps: result.knowledge_gaps || [],
    knowledge_stats: stats,
    built_at: new Date().toISOString(),
    built_by: user.email,
    entries_used: filtered.length
  });

  if (existing.length > 0) {
    await base44.asServiceRole.entities.SiteSettings.update(existing[0].id, {
      setting_value: configValue
    });
  } else {
    await base44.asServiceRole.entities.SiteSettings.create({
      setting_key: configKey,
      setting_value: configValue,
      category: "custom",
      description: `Custom LLM config for ${agent_name || "XPS Agent"}`,
      is_active: true
    });
  }

  return Response.json({
    success: true,
    agent_name: agent_name || "XPS Intelligence Agent",
    system_prompt_length: (result.system_prompt || "").length,
    capabilities: result.capabilities || [],
    knowledge_summary: result.knowledge_summary || "",
    knowledge_gaps: result.knowledge_gaps || [],
    estimated_accuracy: result.estimated_accuracy || 0,
    entries_compiled: filtered.length,
    stats
  });
});