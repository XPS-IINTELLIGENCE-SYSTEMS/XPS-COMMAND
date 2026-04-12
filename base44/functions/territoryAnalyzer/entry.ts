import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { city, state, zip_code, radius_miles, industry_focus } = await req.json();

    if (!city && !zip_code) {
      return Response.json({ error: 'city or zip_code required' }, { status: 400 });
    }

    const location = zip_code || `${city}, ${state || ''}`;
    const industry = industry_focus || 'epoxy flooring, concrete polishing, floor coatings';

    // Step 1: Scrape territory intelligence via LLM with web context
    const territoryResult = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a commercial territory intelligence analyst for a flooring contractor company.

Analyze the territory: ${location} (${radius_miles || 25} mile radius)

Research and compile REAL DATA on:
1. **Building Permits**: Recent commercial construction permits, renovation permits, new warehouse/industrial builds
2. **Commercial Development**: New shopping centers, industrial parks, warehouses, data centers, hospitals, schools under construction or planned
3. **Census/Demographics**: Population growth rate, median commercial property values, commercial sq footage growth
4. **Competition**: How many flooring contractors, epoxy companies, concrete polishing services operate in this area
5. **Industry Verticals Present**: What types of businesses are concentrated here (warehousing, food processing, retail, healthcare, automotive, tech)
6. **Economic Indicators**: Commercial vacancy rates, business growth rate, new business formations

For the industry focus: ${industry}

Return SPECIFIC data with numbers, company names, addresses when possible. This is for targeting sales outreach.`,
      add_context_from_internet: true,
      model: "gemini_3_flash",
      response_json_schema: {
        type: "object",
        properties: {
          territory_name: { type: "string" },
          summary: { type: "string" },
          population_growth: { type: "string" },
          commercial_permits_count: { type: "number" },
          major_developments: { type: "array", items: { type: "object", properties: { name: { type: "string" }, type: { type: "string" }, sqft: { type: "string" }, status: { type: "string" }, address: { type: "string" } } } },
          top_verticals: { type: "array", items: { type: "object", properties: { vertical: { type: "string" }, opportunity_count: { type: "number" }, avg_deal_size: { type: "string" } } } },
          competitor_count: { type: "number" },
          competitors: { type: "array", items: { type: "object", properties: { name: { type: "string" }, services: { type: "string" }, rating: { type: "string" } } } },
          opportunity_score: { type: "number" },
          recommended_approach: { type: "string" },
          estimated_annual_market: { type: "string" }
        }
      }
    });

    // Store as ResearchResult
    const research = await base44.entities.ResearchResult.create({
      query: `Territory Analysis: ${location}`,
      title: `Territory Intel: ${territoryResult.territory_name || location}`,
      category: "Market Analysis",
      status: "Complete",
      ai_summary: territoryResult.summary || "",
      ai_insights: territoryResult.recommended_approach || "",
      key_data_points: JSON.stringify(territoryResult),
      tags: `territory, ${location}, ${(territoryResult.top_verticals || []).map(v => v.vertical).join(", ")}`,
      stored_to: "Local"
    });

    return Response.json({
      success: true,
      research_id: research.id,
      territory: territoryResult.territory_name || location,
      summary: territoryResult.summary,
      opportunity_score: territoryResult.opportunity_score,
      developments: territoryResult.major_developments || [],
      top_verticals: territoryResult.top_verticals || [],
      competitors: territoryResult.competitors || [],
      competitor_count: territoryResult.competitor_count,
      estimated_market: territoryResult.estimated_annual_market,
      recommendation: territoryResult.recommended_approach
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});