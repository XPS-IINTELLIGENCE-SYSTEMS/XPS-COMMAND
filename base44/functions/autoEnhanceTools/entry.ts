import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const { action } = await req.json();

    if (action === "analyze") {
      // Analyze all tools and generate enhancement recommendations
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a software product analyst for a B2B SaaS platform used by commercial flooring contractors. The platform has 50+ tools including:

LEAD ENGINE: Lead pipeline, CRM, lead scoring, territory analysis, sentiment analysis
SCRAPING: Company finder, job finder, social scraping, trend scraping, master scraper, GitHub explorer
OUTREACH: Email campaigns, SMS, WhatsApp, follow-up bots, proposal generator
BIDDING: Bid center, GC pipeline, blueprint takeoff, dynamic pricing, AI bid writer
FIELD OPS: Field tech, job site map, client portal, change orders, time tracking
AI/AGENTS: Agent command center, agent fleet, agent builder, skills library, knowledge base
ANALYTICS: Performance dashboard, status reports, competitor intelligence
SYSTEM: System health, workflows, scheduler, connectors, settings

For each of the 50 tools, generate exactly ONE high-impact enhancement that would:
1. Increase revenue or save time
2. Be technically feasible
3. Add AI-powered automation

Return a JSON object with "enhancements" array, each with: tool_id, tool_name, enhancement_title, enhancement_description, impact_score (1-100), category (ai, automation, data, ux, integration), estimated_hours.`,
        response_json_schema: {
          type: "object",
          properties: {
            enhancements: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  tool_id: { type: "string" },
                  tool_name: { type: "string" },
                  enhancement_title: { type: "string" },
                  enhancement_description: { type: "string" },
                  impact_score: { type: "number" },
                  category: { type: "string" },
                  estimated_hours: { type: "number" }
                }
              }
            }
          }
        }
      });

      const enhancements = analysis?.enhancements || [];

      // Store as SiteImprovement records
      if (enhancements.length > 0) {
        await base44.entities.SiteImprovement.bulkCreate(
          enhancements.map(e => ({
            title: e.enhancement_title,
            description: e.enhancement_description,
            category: e.category || "ai",
            priority: e.impact_score > 80 ? "critical" : e.impact_score > 60 ? "high" : "medium",
            status: "suggested",
            source: "auto_enhance",
            tool_id: e.tool_id,
            impact_score: e.impact_score,
          }))
        );
      }

      return Response.json({
        success: true,
        enhancements_generated: enhancements.length,
        enhancements: enhancements.slice(0, 10), // Return top 10 preview
      });
    }

    if (action === "self_reflect") {
      // System self-reflection — compare capabilities vs industry standards
      const reflection = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this AI-powered B2B SaaS platform for commercial flooring contractors. The system has:
- 50+ dashboard tools, 78+ backend functions, 52+ data entities
- AI agents with memory, multi-agent orchestration, autonomous engine
- Scraping via Browserless + Groq extraction
- Twilio SMS/WhatsApp, Gmail, HubSpot connectors
- Blueprint PDF takeoff, dynamic pricing, proposal generation
- Competitor monitoring, sentiment analysis, territory analysis

Perform a SELF-REFLECTION audit:
1. What are the 5 biggest capability gaps vs best-in-class competitors?
2. What 5 features would have the highest ROI if added?
3. What 3 system reliability improvements are needed?
4. What 2 AI/ML model upgrades would dramatically improve output quality?

Be specific and actionable.`,
        response_json_schema: {
          type: "object",
          properties: {
            capability_gaps: { type: "array", items: { type: "object", properties: { gap: { type: "string" }, recommendation: { type: "string" }, priority: { type: "string" } } } },
            high_roi_features: { type: "array", items: { type: "object", properties: { feature: { type: "string" }, expected_roi: { type: "string" }, implementation: { type: "string" } } } },
            reliability_improvements: { type: "array", items: { type: "object", properties: { issue: { type: "string" }, fix: { type: "string" } } } },
            ai_upgrades: { type: "array", items: { type: "object", properties: { upgrade: { type: "string" }, impact: { type: "string" } } } },
            overall_score: { type: "number" },
            summary: { type: "string" }
          }
        }
      });

      return Response.json({ success: true, reflection });
    }

    return Response.json({ error: "Invalid action. Use 'analyze' or 'self_reflect'" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});