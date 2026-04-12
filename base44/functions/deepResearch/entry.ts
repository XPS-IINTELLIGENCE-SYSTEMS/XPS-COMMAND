import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { lead_id, company_name, url } = await req.json();

    let lead = null;
    let target = company_name || '';

    if (lead_id) {
      lead = await base44.entities.Lead.get(lead_id);
      target = lead?.company || company_name || '';
    }

    if (!target && !url) {
      return Response.json({ error: 'lead_id, company_name, or url required' }, { status: 400 });
    }

    // Deep multi-source research
    const researchResult = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a senior business intelligence analyst doing deep research on a potential flooring client.

TARGET: ${target}
${url ? `Website: ${url}` : ''}
${lead ? `Location: ${lead.location || 'unknown'}, Vertical: ${lead.vertical || 'commercial'}, Current notes: ${lead.notes || 'none'}` : ''}

Conduct DEEP RESEARCH across multiple sources:

1. **COMPANY PROFILE**: Full business overview, years in business, ownership, locations, employee count, revenue range
2. **FACILITY ANALYSIS**: Type of building, estimated square footage, current flooring type (if discoverable from photos/reviews), age of facility, recent renovations
3. **REVIEW ANALYSIS**: Check Google Reviews, Yelp — any mentions of floor conditions, cleanliness complaints, renovation plans
4. **SOCIAL MEDIA**: LinkedIn, Facebook, Instagram — recent posts about expansion, renovation, new locations
5. **NEWS & PRESS**: Recent articles, press releases, job postings (hiring = growing = new space = new floors)
6. **BUILDING PERMITS**: Any recent permits for renovation, expansion, tenant improvements
7. **FINANCIAL INDICATORS**: Revenue estimates, growth trajectory, funding rounds (if tech), real estate activity
8. **FLOORING NEEDS ASSESSMENT**: Based on all data, what flooring solution would they need? What system type? Estimated sqft? Price range?
9. **DECISION MAKER MAPPING**: Who decides on facility improvements? Name, title, contact path
10. **COMPETITIVE THREATS**: Have they already gotten quotes? Any evidence of flooring work being planned?

Be SPECIFIC with data. Real names, real numbers, real observations. This drives a sales strategy.`,
      add_context_from_internet: true,
      model: "gemini_3_flash",
      response_json_schema: {
        type: "object",
        properties: {
          company_profile: { type: "string" },
          facility_analysis: { type: "string" },
          review_highlights: { type: "array", items: { type: "string" } },
          social_media_signals: { type: "array", items: { type: "string" } },
          news_items: { type: "array", items: { type: "string" } },
          permit_activity: { type: "string" },
          financial_indicators: { type: "string" },
          flooring_needs: { type: "object", properties: {
            recommended_system: { type: "string" },
            estimated_sqft: { type: "number" },
            price_range: { type: "string" },
            urgency: { type: "string" }
          }},
          decision_makers: { type: "array", items: { type: "object", properties: { name: { type: "string" }, title: { type: "string" }, contact_path: { type: "string" } } } },
          competitive_threats: { type: "string" },
          overall_opportunity_score: { type: "number" },
          recommended_approach: { type: "string" },
          talking_points: { type: "array", items: { type: "string" } }
        }
      }
    });

    // Store as ResearchResult
    const research = await base44.entities.ResearchResult.create({
      query: `Deep Research: ${target}`,
      title: `Deep Intel: ${target}`,
      source_url: url || "",
      category: "Lead Research",
      status: "Complete",
      lead_id: lead_id || "",
      ai_summary: researchResult.company_profile || "",
      ai_insights: researchResult.recommended_approach || "",
      key_data_points: JSON.stringify({
        facility: researchResult.facility_analysis,
        reviews: researchResult.review_highlights,
        social: researchResult.social_media_signals,
        news: researchResult.news_items,
        permits: researchResult.permit_activity,
        financials: researchResult.financial_indicators,
        flooring_needs: researchResult.flooring_needs,
        decision_makers: researchResult.decision_makers,
        talking_points: researchResult.talking_points,
        competition: researchResult.competitive_threats
      }),
      tags: `deep-research, ${target}, ${researchResult.flooring_needs?.recommended_system || ''}`.toLowerCase(),
      stored_to: "Local"
    });

    // Update lead if we have one
    if (lead && lead_id) {
      const updates = {
        ai_insight: `[Deep Research] ${researchResult.recommended_approach || ''}\nOpportunity Score: ${researchResult.overall_opportunity_score || 0}/100\nSystem: ${researchResult.flooring_needs?.recommended_system || 'TBD'}\nEst. SqFt: ${researchResult.flooring_needs?.estimated_sqft || 'Unknown'}`
      };
      if (researchResult.flooring_needs?.estimated_sqft) {
        updates.square_footage = researchResult.flooring_needs.estimated_sqft;
      }
      if (researchResult.overall_opportunity_score) {
        updates.score = Math.min(researchResult.overall_opportunity_score, 100);
      }
      await base44.entities.Lead.update(lead_id, updates);
    }

    return Response.json({
      success: true,
      research_id: research.id,
      company: target,
      profile: researchResult.company_profile,
      flooring_needs: researchResult.flooring_needs,
      decision_makers: researchResult.decision_makers,
      opportunity_score: researchResult.overall_opportunity_score,
      recommended_approach: researchResult.recommended_approach,
      talking_points: researchResult.talking_points,
      review_highlights: researchResult.review_highlights,
      news: researchResult.news_items,
      social_signals: researchResult.social_media_signals
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});