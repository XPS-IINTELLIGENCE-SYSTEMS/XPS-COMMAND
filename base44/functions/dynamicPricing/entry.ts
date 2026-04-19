import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { lead_id, job_id, service_type, square_footage, city, state, project_type, complexity } = await req.json();

  // Gather context from lead or job if provided
  let leadInfo = {};
  let jobInfo = {};

  if (lead_id) {
    const leads = await base44.asServiceRole.entities.Lead.filter({ id: lead_id });
    leadInfo = leads[0] || {};
  }
  if (job_id) {
    const jobs = await base44.asServiceRole.entities.CommercialJob.filter({ id: job_id });
    jobInfo = jobs[0] || {};
  }

  // Gather recent won/lost proposals for pricing intelligence
  const recentProposals = await base44.asServiceRole.entities.Proposal.list('-created_date', 20);
  const wonProposals = recentProposals.filter(p => p.status === 'Approved');
  const lostProposals = recentProposals.filter(p => p.status === 'Rejected');

  const avgWonPrice = wonProposals.length > 0
    ? wonProposals.reduce((sum, p) => sum + (p.price_per_sqft || 0), 0) / wonProposals.length
    : 0;
  const avgLostPrice = lostProposals.length > 0
    ? lostProposals.reduce((sum, p) => sum + (p.price_per_sqft || 0), 0) / lostProposals.length
    : 0;

  // Gather competitor data
  const competitors = await base44.asServiceRole.entities.CompetitorProfile.list('-created_date', 10);
  const competitorSummary = competitors.map(c => `${c.company_name || 'Competitor'}`).join(', ');

  const targetCity = city || jobInfo.city || leadInfo.city || 'Unknown';
  const targetState = state || jobInfo.state || leadInfo.state || 'Unknown';
  const targetSqft = square_footage || jobInfo.flooring_sqft || jobInfo.total_sqft || leadInfo.square_footage || 0;
  const targetService = service_type || jobInfo.flooring_system_recommendation || leadInfo.specialty || 'Epoxy Floor Coating';
  const targetProjectType = project_type || jobInfo.project_type || leadInfo.vertical || 'commercial';

  const prompt = `You are a dynamic pricing strategist for Xtreme Polishing Systems (XPS), a premium epoxy and polished concrete flooring company.

MARKET CONTEXT:
- Location: ${targetCity}, ${targetState}
- Project type: ${targetProjectType}
- Service requested: ${targetService}
- Square footage: ${targetSqft}
- Complexity level: ${complexity || 'medium'}
- Client: ${leadInfo.company || jobInfo.owner_name || 'Unknown'}
- Client estimated revenue: $${leadInfo.estimated_revenue || 'Unknown'}

INTERNAL PRICING DATA:
- Recent won proposals avg price/sqft: $${avgWonPrice.toFixed(2)} (${wonProposals.length} deals)
- Recent lost proposals avg price/sqft: $${avgLostPrice.toFixed(2)} (${lostProposals.length} deals)
- Known competitors in area: ${competitorSummary || 'No data'}

TAKEOFF DATA (if available):
${jobInfo.takeoff_data ? jobInfo.takeoff_data.substring(0, 2000) : 'No takeoff data available'}

XPS STANDARD PRICING RANGES (per sqft):
- Standard Epoxy: $3-5 | Polished Concrete: $3-8 | Decorative Epoxy: $5-10
- Metallic Epoxy: $8-15 | Polyaspartic: $4-7 | Industrial Epoxy: $4-8
- Garage Coating: $3-6 | Healthcare: $5-9 | Food-safe: $4-7

CURRENT MATERIAL COSTS (2024-2025):
- Epoxy resin (100% solids): $45-65/gallon, covers ~120-160 sqft/gal
- Polyaspartic: $55-80/gallon, covers ~200-300 sqft/gal
- Concrete densifier: $25-40/gallon, covers ~200-400 sqft/gal
- Diamond tooling: $200-800 per set, 10,000-50,000 sqft life
- Labor: $35-65/hour depending on skill level

ANALYSIS TASKS:
1. Research current material costs for this specific service type
2. Analyze local market competition in ${targetCity}, ${targetState}
3. Factor in project complexity (${complexity || 'medium'})
4. Consider the client's budget capacity based on their company profile
5. Calculate optimal bid price that maximizes win probability while maintaining margins
6. Provide a pricing breakdown showing: materials, labor, overhead, profit
7. Give a confidence score for each price tier`;

  const pricing = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    add_context_from_internet: true,
    model: "gemini_3_flash",
    response_json_schema: {
      type: "object",
      properties: {
        recommended_price_per_sqft: { type: "number" },
        price_tiers: {
          type: "object",
          properties: {
            aggressive: { type: "object", properties: { price_per_sqft: { type: "number" }, total: { type: "number" }, win_probability: { type: "number" }, margin_pct: { type: "number" }, rationale: { type: "string" } } },
            optimal: { type: "object", properties: { price_per_sqft: { type: "number" }, total: { type: "number" }, win_probability: { type: "number" }, margin_pct: { type: "number" }, rationale: { type: "string" } } },
            premium: { type: "object", properties: { price_per_sqft: { type: "number" }, total: { type: "number" }, win_probability: { type: "number" }, margin_pct: { type: "number" }, rationale: { type: "string" } } }
          }
        },
        cost_breakdown: {
          type: "object",
          properties: {
            material_cost_per_sqft: { type: "number" },
            labor_cost_per_sqft: { type: "number" },
            equipment_cost_per_sqft: { type: "number" },
            overhead_per_sqft: { type: "number" },
            profit_per_sqft: { type: "number" }
          }
        },
        market_analysis: { type: "string" },
        competitor_price_range: { type: "object", properties: { low: { type: "number" }, avg: { type: "number" }, high: { type: "number" } } },
        material_cost_trend: { type: "string" },
        recommendation: { type: "string" },
        confidence_score: { type: "number" }
      }
    }
  });

  return Response.json({
    success: true,
    pricing,
    context: {
      city: targetCity,
      state: targetState,
      sqft: targetSqft,
      service: targetService,
      project_type: targetProjectType,
      won_deals: wonProposals.length,
      lost_deals: lostProposals.length,
      avg_won_price: avgWonPrice,
      avg_lost_price: avgLostPrice
    }
  });
});