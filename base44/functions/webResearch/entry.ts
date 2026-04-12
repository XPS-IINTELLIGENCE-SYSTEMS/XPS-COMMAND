import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { query, url, category, lead_id, deep_analysis } = await req.json();

    if (!query && !url) {
      return Response.json({ error: 'query or url is required' }, { status: 400 });
    }

    const searchQuery = query || url;

    // Create a pending research result
    const research = await base44.entities.ResearchResult.create({
      query: searchQuery,
      source_url: url || "",
      category: category || "Custom",
      status: "Scraping",
      lead_id: lead_id || "",
      tags: ""
    });

    // Step 1: Use LLM with web context to scrape and gather data
    const scrapePrompt = `You are a web research specialist for Xtreme Polishing Systems, a premium epoxy flooring company.

Research the following: "${searchQuery}"
${url ? `Focus on this URL: ${url}` : ''}

Gather comprehensive data including:
- Company overview, services, pricing if available
- Key contacts, decision makers
- Recent news, expansions, projects
- Competitor intelligence if relevant
- Market size, trends, opportunities
- Any data relevant to selling epoxy/polished concrete flooring services

Be thorough and extract every useful data point.`;

    const scrapeResult = await base44.integrations.Core.InvokeLLM({
      prompt: scrapePrompt,
      add_context_from_internet: true,
      model: "gemini_3_flash",
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          source_url: { type: "string" },
          raw_content: { type: "string" },
          key_facts: { type: "array", items: { type: "string" } },
          contacts_found: { type: "array", items: { type: "object", properties: { name: { type: "string" }, title: { type: "string" }, email: { type: "string" }, phone: { type: "string" } } } },
          pricing_data: { type: "string" },
          recent_news: { type: "array", items: { type: "string" } },
          opportunities: { type: "array", items: { type: "string" } }
        }
      }
    });

    // Update with raw data
    await base44.entities.ResearchResult.update(research.id, {
      status: "Analyzing",
      title: scrapeResult.title || searchQuery,
      source_url: scrapeResult.source_url || url || "",
      raw_content: scrapeResult.raw_content || "",
      key_data_points: JSON.stringify({
        key_facts: scrapeResult.key_facts || [],
        contacts_found: scrapeResult.contacts_found || [],
        pricing_data: scrapeResult.pricing_data || "",
        recent_news: scrapeResult.recent_news || [],
        opportunities: scrapeResult.opportunities || []
      })
    });

    // Step 2: Deep AI analysis
    const analysisPrompt = `You are a senior business intelligence analyst for an epoxy flooring company (XPS).

Analyze this research data and provide DEEP INSIGHTS:

Query: ${searchQuery}
Data: ${JSON.stringify(scrapeResult)}

Provide:
1. Executive Summary (2-3 sentences)
2. Key Insights (actionable findings for a flooring contractor)
3. Sales Opportunities (specific ways to approach/sell to this target)
4. Competitive Intelligence (what competitors are doing)
5. Recommended Next Steps (specific actions to take)
6. Risk Assessment (any red flags or concerns)

Be specific, data-driven, and actionable. This is for a busy contractor who needs to make money.`;

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          insights: { type: "string" },
          tags: { type: "array", items: { type: "string" } }
        }
      }
    });

    // Final update
    await base44.entities.ResearchResult.update(research.id, {
      status: "Complete",
      ai_summary: analysis.summary || "",
      ai_insights: analysis.insights || "",
      tags: (analysis.tags || []).join(", "),
      stored_to: "Local"
    });

    // Get the final record
    const final = await base44.entities.ResearchResult.get(research.id);

    return Response.json({
      success: true,
      research_id: research.id,
      title: final.title,
      summary: final.ai_summary,
      insights: final.ai_insights,
      key_data: JSON.parse(final.key_data_points || "{}"),
      tags: final.tags,
      message: `Research complete: "${final.title}"`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});