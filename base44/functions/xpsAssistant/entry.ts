import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const OWNER_EMAIL = "j.xpsxpress@gmail.com";

const ROLE_PERSONAS = {
  owner: "You are the XPS Strategic Intelligence System — the CEO's private AI advisor for Xtreme Polishing Systems. You provide executive-level strategic analysis, market intelligence, competitive threats, and company-wide opportunity assessment. You speak with authority on industry movements, revenue forecasting, and growth strategy.",
  admin: "You are the XPS System Operator AI — the technical backbone of the platform. You help with integrations, agent configuration, system health, data management, and operational efficiency. You understand every API, every agent, and every data flow.",
  manager: "You are the XPS Territory Intelligence System — a manager's strategic partner. You provide pipeline analysis, team performance insights, competitive intelligence for their territory, and actionable coaching recommendations. You help managers win more deals through data-driven decisions.",
  team_member: "You are the XPS Sales Coach — a personal sales assistant purpose-built for the epoxy, decorative concrete, and polished concrete industry. You help with lead preparation, email writing, call scripts, objection handling, product knowledge, and closing techniques. You know every XPS product, every competitor, and every technique a 25-year industry veteran would know."
};

const INDUSTRY_CONTEXT = `You are an AI built exclusively for Xtreme Polishing Systems (XPS) — a leading manufacturer, distributor, and installer in the epoxy flooring, polished concrete, and decorative concrete industry.

XPS BRANDS: Xtreme Polishing Systems (manufacturer), XPS Xpress (franchise/installer network, 60+ locations), National Concrete Polishing (commercial division), Concrete Polishing University (CPU — training)

CORE PRODUCTS: Epoxy coatings (100% solids, water-based, UV-stable), polyaspartic coatings, polyurea, urethane cement, MMA, polished concrete systems, decorative flake systems, metallic epoxy, ESD flooring, moisture mitigation

KEY MARKETS: Warehouse/distribution, retail, restaurant/food service, fitness/gym, healthcare, industrial, automotive, brewery, food processing, residential garage, commercial office

PRICING KNOWLEDGE: Only quote from verified knowledge base entries. If no verified pricing exists, say so clearly.
TECHNICAL KNOWLEDGE: Surface prep (diamond grinding, shot blasting, scarifying), CSP profiles 1-9, moisture testing (ASTM F2170, ASTM F1869), coating architecture (primer→body coat→topcoat), cure times, failure modes
COMPETITIVE KNOWLEDGE: You know the top 20 competitors and can provide positioning against each

HALLUCINATION PREVENTION: For pricing, technical specs, and product claims — cite the knowledge base entry. If no verified entry exists, state that clearly. Never fabricate data.`;

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { action, message, page_context } = body;

  const effectiveRole = user.email === OWNER_EMAIL ? "owner" : (user.role || "team_member");

  // Load or create user profile
  let profiles = await base44.asServiceRole.entities.UserProfile.filter({ user_email: user.email });
  let profile = profiles[0];
  if (!profile) {
    profile = await base44.asServiceRole.entities.UserProfile.create({
      user_email: user.email,
      full_name: user.full_name || "",
      title: "",
      ai_memory: "{}",
      ai_conversation_history: "[]",
      ai_preferences: "{}",
      ai_persona_name: "XPS Intelligence",
      total_ai_interactions: 0,
    });
  }

  // Parse stored data
  let memory = {};
  let history = [];
  let preferences = {};
  try { memory = JSON.parse(profile.ai_memory || "{}"); } catch {}
  try { history = JSON.parse(profile.ai_conversation_history || "[]"); } catch {}
  try { preferences = JSON.parse(profile.ai_preferences || "{}"); } catch {}

  if (action === "get_context") {
    return Response.json({
      memory,
      history: history.slice(-20),
      preferences,
      persona_name: profile.ai_persona_name || "XPS Intelligence",
      total_interactions: profile.total_ai_interactions || 0,
      role: effectiveRole,
    });
  }

  if (action === "chat") {
    // Build RAG context from knowledge base
    let knowledgeContext = "";
    try {
      const searchRes = await base44.asServiceRole.functions.invoke("knowledgeSearch", {
        action: "search",
        query: message,
        limit: 5,
      });
      if (searchRes?.data?.results) {
        knowledgeContext = searchRes.data.results.map(e =>
          `[${e.category}] ${e.title}: ${(e.summary || e.content || "").slice(0, 300)}`
        ).join("\n");
      }
    } catch {}

    // Build product recommendations context
    let productContext = "";
    try {
      const recs = await base44.asServiceRole.entities.ProductRecommendation.list("-created_date", 5);
      if (recs.length > 0) {
        productContext = recs.map(r =>
          `${r.project_type}: ${r.recommended_xps_product} — ${(r.technical_justification || "").slice(0, 150)}`
        ).join("\n");
      }
    } catch {}

    // Build user's lead context
    let leadContext = "";
    try {
      const leads = await base44.asServiceRole.entities.Lead.filter(
        effectiveRole === "team_member" ? { created_by: user.email } : {},
        "-created_date", 10
      );
      if (leads.length > 0) {
        leadContext = `Active leads: ${leads.map(l => `${l.company} (${l.stage}, score: ${l.score || 'N/A'})`).join(", ")}`;
      }
    } catch {}

    // Build memory string
    const memoryStr = Object.keys(memory).length > 0
      ? `USER MEMORY:\n${Object.entries(memory).map(([k, v]) => `- ${k}: ${v}`).join("\n")}`
      : "";

    const systemPrompt = `${INDUSTRY_CONTEXT}

${ROLE_PERSONAS[effectiveRole] || ROLE_PERSONAS.team_member}

CURRENT USER: ${user.full_name || user.email} (${effectiveRole})
TERRITORY: ${user.territory || "Not assigned"}
${memoryStr}
${leadContext ? `\n${leadContext}` : ""}
${page_context ? `\nUSER IS CURRENTLY VIEWING: ${page_context}` : ""}
${knowledgeContext ? `\nRELEVANT KNOWLEDGE BASE:\n${knowledgeContext}` : ""}
${productContext ? `\nPRODUCT RECOMMENDATIONS:\n${productContext}` : ""}

INSTRUCTIONS:
- Be concise and actionable
- Reference specific leads, data, and knowledge entries when relevant
- If the user asks about pricing or specs, only cite verified knowledge base entries
- Adapt your tone to the user's role and communication style
- Remember context from this conversation`;

    // Build conversation messages
    const recentHistory = history.slice(-10);
    const messages = recentHistory.map(m => ({ role: m.role, content: m.content }));
    messages.push({ role: "user", content: message });

    const messagesPrompt = messages.map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n");

    const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `${systemPrompt}\n\nCONVERSATION:\n${messagesPrompt}\n\nAssistant:`,
    });

    // Update history
    history.push({ role: "user", content: message, ts: new Date().toISOString() });
    history.push({ role: "assistant", content: response, ts: new Date().toISOString() });
    if (history.length > 100) history = history.slice(-100);

    // Extract and update memory after every interaction
    let newMemory = memory;
    try {
      const memExtract = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Extract key facts about the user from this conversation exchange. Return JSON with keys like preferred_name, current_focus, recent_wins, challenges, communication_style, product_knowledge_gaps, active_prospects. Only include facts that were clearly stated or implied. Merge with existing memory.

Existing memory: ${JSON.stringify(memory)}
User message: ${message}
Assistant response: ${response}

Return ONLY valid JSON object:`,
        response_json_schema: {
          type: "object",
          properties: {
            preferred_name: { type: "string" },
            current_focus: { type: "string" },
            recent_wins: { type: "string" },
            challenges: { type: "string" },
            communication_style: { type: "string" },
            product_knowledge_gaps: { type: "string" },
            active_prospects: { type: "string" },
            territory: { type: "string" },
            best_techniques: { type: "string" },
          }
        }
      });
      if (memExtract && typeof memExtract === "object") {
        newMemory = { ...memory };
        for (const [k, v] of Object.entries(memExtract)) {
          if (v && v.trim && v.trim() !== "") newMemory[k] = v;
        }
      }
    } catch {}

    // Save profile
    await base44.asServiceRole.entities.UserProfile.update(profile.id, {
      ai_memory: JSON.stringify(newMemory),
      ai_conversation_history: JSON.stringify(history),
      total_ai_interactions: (profile.total_ai_interactions || 0) + 1,
      ai_last_active: new Date().toISOString(),
    });

    return Response.json({
      response,
      memory: newMemory,
      persona_name: profile.ai_persona_name || "XPS Intelligence",
    });
  }

  if (action === "reset_memory") {
    await base44.asServiceRole.entities.UserProfile.update(profile.id, {
      ai_memory: "{}",
      ai_conversation_history: "[]",
    });
    return Response.json({ success: true });
  }

  return Response.json({ error: "Unknown action" }, { status: 400 });
});