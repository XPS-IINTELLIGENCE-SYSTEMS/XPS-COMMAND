import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const action = body.action || "scrape_and_analyze";

  if (action === "scrape_and_analyze") {
    const { state, city, project_type } = body;

    // Gather our own bid history
    const allJobs = await base44.asServiceRole.entities.CommercialJob.list('-created_date', 200);
    const wonJobs = allJobs.filter(j => j.bid_status === "won" && j.estimated_flooring_value > 0);
    const lostJobs = allJobs.filter(j => j.bid_status === "lost" && j.estimated_flooring_value > 0);

    const calcPricePerSqft = (j) => j.flooring_sqft > 0 ? j.estimated_flooring_value / j.flooring_sqft : 0;
    const wonPrices = wonJobs.map(calcPricePerSqft).filter(p => p > 0);
    const lostPrices = lostJobs.map(calcPricePerSqft).filter(p => p > 0);
    const avgWon = wonPrices.length > 0 ? wonPrices.reduce((a, b) => a + b, 0) / wonPrices.length : 0;
    const avgLost = lostPrices.length > 0 ? lostPrices.reduce((a, b) => a + b, 0) / lostPrices.length : 0;

    // Regional filter
    const targetState = state || "US";
    const targetCity = city || "";
    const targetType = project_type || "commercial flooring";
    const regionJobs = allJobs.filter(j =>
      (!state || j.state?.toLowerCase() === state.toLowerCase()) &&
      (!city || j.city?.toLowerCase().includes(city.toLowerCase()))
    );

    const prompt = `You are a commercial flooring bid results analyst. Research and analyze recent public bid results for commercial flooring projects.

SEARCH FOR:
- Recent public bid tabulations for commercial flooring/epoxy/polished concrete projects
- Focus on: ${targetCity ? targetCity + ', ' : ''}${targetState}
- Project types: ${targetType}
- Sources: SAM.gov, state procurement portals, city/county bid results, BidNet, ConstructConnect

OUR INTERNAL DATA:
- Won bids: ${wonJobs.length} jobs, avg $${avgWon.toFixed(2)}/sqft
- Lost bids: ${lostJobs.length} jobs, avg $${avgLost.toFixed(2)}/sqft
- Regional jobs in ${targetState}: ${regionJobs.length}
- Our price range: $${Math.min(...wonPrices, 99).toFixed(2)} - $${Math.max(...wonPrices, 0).toFixed(2)}/sqft

ANALYZE:
1. Find 5-10 recent public bid results for similar projects in the region
2. Extract winning bid amounts and price-per-sqft where possible
3. Compare our pricing against market benchmarks
4. Identify where we're overpricing vs underpricing
5. Suggest specific adjustments to our dynamic pricing algorithm

Return structured analysis.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: "gemini_3_flash",
      response_json_schema: {
        type: "object",
        properties: {
          market_bids: {
            type: "array",
            items: {
              type: "object",
              properties: {
                project_name: { type: "string" },
                location: { type: "string" },
                project_type: { type: "string" },
                winning_bid: { type: "number" },
                sqft: { type: "number" },
                price_per_sqft: { type: "number" },
                source: { type: "string" },
                date: { type: "string" }
              }
            }
          },
          market_avg_price_per_sqft: { type: "number" },
          market_range_low: { type: "number" },
          market_range_high: { type: "number" },
          our_position: { type: "string" },
          pricing_adjustments: {
            type: "array",
            items: {
              type: "object",
              properties: {
                category: { type: "string" },
                current_approach: { type: "string" },
                recommended_change: { type: "string" },
                expected_impact: { type: "string" },
                priority: { type: "string" }
              }
            }
          },
          win_rate_analysis: { type: "string" },
          summary: { type: "string" }
        }
      }
    });

    return Response.json({
      success: true,
      analysis: result,
      our_data: {
        won_count: wonJobs.length,
        lost_count: lostJobs.length,
        avg_won_price: avgWon,
        avg_lost_price: avgLost,
        regional_jobs: regionJobs.length,
        win_rate: wonJobs.length + lostJobs.length > 0
          ? Math.round((wonJobs.length / (wonJobs.length + lostJobs.length)) * 100) : 0
      }
    });
  }

  return Response.json({ error: 'Invalid action' }, { status: 400 });
});