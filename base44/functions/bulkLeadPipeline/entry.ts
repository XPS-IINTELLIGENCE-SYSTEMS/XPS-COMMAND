import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { locations, count_per_location, industry, vertical, enrich, score, research_top } = await req.json();

    if (!locations || !locations.length) {
      return Response.json({ error: 'locations array required (e.g. ["Phoenix, AZ", "Dallas, TX"])' }, { status: 400 });
    }

    const perLocation = Math.min(count_per_location || 25, 50);
    const results = {
      total_leads: 0,
      total_value: 0,
      by_location: [],
      hot_leads: [],
      errors: []
    };

    // Step 1: Scrape leads for each location
    for (const location of locations) {
      try {
        const scrapeRes = await base44.functions.invoke('leadScraper', {
          location,
          industry: industry || '',
          vertical: vertical || '',
          count: perLocation
        });

        const locResult = {
          location,
          leads_found: scrapeRes.data?.total_found || 0,
          leads_created: scrapeRes.data?.leads_created || 0,
          pipeline_value: scrapeRes.data?.total_pipeline_value || 0,
          lead_ids: (scrapeRes.data?.leads || []).map(l => l.id)
        };

        results.total_leads += locResult.leads_created;
        results.total_value += locResult.pipeline_value;
        results.by_location.push(locResult);

      } catch (err) {
        results.errors.push({ location, error: err.message });
      }
    }

    // Step 2: Score all new leads
    if (score !== false) {
      try {
        const scoreRes = await base44.functions.invoke('leadScorer', { batch_all: true });
        const scoreData = scoreRes.data;
        results.scoring = {
          total_scored: scoreData?.total_scored || 0,
          hot: scoreData?.hot_leads || 0,
          warm: scoreData?.warm_leads || 0
        };
        results.hot_leads = (scoreData?.results || []).filter(l => l.score >= 80).slice(0, 10);
      } catch (err) {
        results.errors.push({ step: 'scoring', error: err.message });
      }
    }

    // Step 3: Enrich top leads
    if (enrich !== false && results.hot_leads.length > 0) {
      const topIds = results.hot_leads.slice(0, 5).map(l => l.lead_id);
      try {
        const enrichRes = await base44.functions.invoke('contactEnricher', { batch_ids: topIds });
        results.enrichment = {
          enriched: enrichRes.data?.enriched_count || 0,
          leads: enrichRes.data?.leads || []
        };
      } catch (err) {
        results.errors.push({ step: 'enrichment', error: err.message });
      }
    }

    // Step 4: Deep research on very top leads
    if (research_top && results.hot_leads.length > 0) {
      const topResearch = results.hot_leads.slice(0, Math.min(research_top, 3));
      results.deep_research = [];
      for (const lead of topResearch) {
        try {
          const resRes = await base44.functions.invoke('deepResearch', { lead_id: lead.lead_id });
          results.deep_research.push({
            lead_id: lead.lead_id,
            company: lead.company,
            opportunity_score: resRes.data?.opportunity_score,
            flooring_needs: resRes.data?.flooring_needs,
            approach: resRes.data?.recommended_approach
          });
        } catch (err) {
          results.errors.push({ step: 'research', lead: lead.company, error: err.message });
        }
      }
    }

    return Response.json({
      success: true,
      summary: `Pipeline built: ${results.total_leads} leads across ${locations.length} territories. Total value: $${(results.total_value / 1000).toFixed(0)}k. ${results.hot_leads.length} hot leads identified.`,
      ...results
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});