import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const body = await req.json().catch(() => ({}));
  const jobId = body.job_id || body.data?.id || body.event?.entity_id;

  if (!jobId) return Response.json({ error: 'job_id required' }, { status: 400 });

  // Fetch the job
  const jobs = await base44.asServiceRole.entities.CommercialJob.filter({ id: jobId });
  const job = jobs[0];
  if (!job) return Response.json({ error: 'Job not found' }, { status: 404 });

  // Only process jobs in early phases that haven't been bid yet
  const skipStatuses = ['bid_generated', 'sent', 'follow_up_1', 'follow_up_2', 'follow_up_3', 'won', 'lost'];
  if (skipStatuses.includes(job.bid_status)) {
    return Response.json({ skipped: true, reason: `Job already at bid_status: ${job.bid_status}` });
  }

  const sqft = job.flooring_sqft || job.total_sqft || 0;
  const jobName = job.job_name || 'Unnamed Project';

  // Log start
  await base44.asServiceRole.entities.AgentActivity.create({
    agent_name: "Auto-Bid Pipeline",
    action: `Starting automated bid pipeline for: ${jobName} (${sqft} sqft)`,
    status: "pending",
    category: "bidding",
    related_entity_type: "CommercialJob",
    related_entity_id: jobId,
    details: JSON.stringify({ phase: "start", job_name: jobName, sqft, city: job.city, state: job.state })
  });

  // ═══════════════════════════════════════════
  // STEP 1: AI TAKEOFF
  // ═══════════════════════════════════════════
  let takeoffData = {};
  try {
    if (job.takeoff_data) {
      takeoffData = JSON.parse(job.takeoff_data);
    }
  } catch {}

  // If no takeoff exists, generate one
  if (!takeoffData.zones || takeoffData.zones.length === 0) {
    const takeoffResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a professional flooring estimator for Xtreme Polishing Systems (XPS).

PROJECT: ${jobName}
LOCATION: ${job.city || 'Unknown'}, ${job.state || 'Unknown'}
TYPE: ${(job.project_type || 'commercial').replace(/_/g, ' ')}
TOTAL SQFT: ${sqft || 'Estimate based on project type'}
SECTOR: ${job.sector || 'Commercial Private'}
ARCHITECT: ${job.architect_name || 'N/A'}
GC: ${job.gc_name || 'N/A'}

FLOORING SYSTEM: ${job.flooring_system_recommendation || 'To be determined based on project type'}

Perform a professional takeoff. Break the project into zones based on the project type:
- Warehouse: main floor, loading docks, offices, restrooms
- Retail: sales floor, back stock, entrance, restrooms
- Restaurant: kitchen, dining, bar, walk-in, restrooms
- Healthcare: patient areas, corridors, labs, reception
- Industrial: production floor, break room, shipping/receiving
- Office: main work area, lobby, conference rooms, break room
- Other: estimate logically based on total sqft

For EACH zone provide:
1. Zone name and purpose
2. Square footage (must sum to total)
3. Recommended flooring system
4. Surface prep requirements
5. Number of coats/layers
6. Cure time per coat
7. Special requirements (moisture mitigation, ESD, cove base, etc.)

Then calculate total materials needed:
- Primer gallons (coverage: 200-300 sqft/gal)
- Base coat gallons (coverage: 120-160 sqft/gal) 
- Top coat gallons (coverage: 200-250 sqft/gal)
- Aggregate/chip/metallic pigment (lbs)
- Diamond tooling sets
- Prep materials (crack filler, self-leveler, etc.)

Calculate costs using current pricing:
- Epoxy resin: $55/gallon
- Polyaspartic: $70/gallon
- Primer: $35/gallon
- Metallic pigment: $45/lb
- Aggregate chips: $25/bag (50lb)
- Diamond tooling: $400/set (covers 15,000 sqft)
- Crack repair material: $8/linear ft
- Self-leveling compound: $45/bag (covers 50 sqft at 1/4")
- Cove base material: $12/linear ft
- Labor rate: $45/hour, estimate 100-150 sqft/hour per worker`,
      response_json_schema: {
        type: "object",
        properties: {
          zones: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                sqft: { type: "number" },
                system_type: { type: "string" },
                prep_requirements: { type: "string" },
                coats: { type: "number" },
                cure_time_hours: { type: "number" },
                special_requirements: { type: "string" }
              }
            }
          },
          materials: {
            type: "array",
            items: {
              type: "object",
              properties: {
                item: { type: "string" },
                quantity: { type: "number" },
                unit: { type: "string" },
                unit_cost: { type: "number" },
                total_cost: { type: "number" }
              }
            }
          },
          total_material_cost: { type: "number" },
          total_labor_hours: { type: "number" },
          total_labor_cost: { type: "number" },
          equipment_cost: { type: "number" },
          mobilization_cost: { type: "number" },
          project_duration_days: { type: "number" },
          crew_size: { type: "number" },
          notes: { type: "string" }
        }
      }
    });

    takeoffData = takeoffResult;

    // Save takeoff to job
    await base44.asServiceRole.entities.CommercialJob.update(jobId, {
      takeoff_data: JSON.stringify(takeoffData),
      takeoff_complete: true,
      flooring_system_recommendation: takeoffData.zones?.[0]?.system_type || job.flooring_system_recommendation,
      flooring_sqft: takeoffData.zones?.reduce((sum, z) => sum + (z.sqft || 0), 0) || sqft
    });
  }

  // ═══════════════════════════════════════════
  // STEP 2: DYNAMIC PRICING
  // ═══════════════════════════════════════════
  const pricingResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are a pricing strategist for Xtreme Polishing Systems.

PROJECT: ${jobName} in ${job.city || 'Unknown'}, ${job.state || 'Unknown'}
TYPE: ${(job.project_type || 'commercial').replace(/_/g, ' ')}
SECTOR: ${job.sector || 'Commercial Private'}
SQFT: ${takeoffData.zones?.reduce((s, z) => s + (z.sqft || 0), 0) || sqft}

TAKEOFF COSTS:
- Material cost: $${takeoffData.total_material_cost || 0}
- Labor cost: $${takeoffData.total_labor_cost || 0}
- Equipment: $${takeoffData.equipment_cost || 0}
- Mobilization: $${takeoffData.mobilization_cost || 0}

Calculate 3 pricing tiers:
1. AGGRESSIVE — low margin (15-20%), highest win probability
2. OPTIMAL — balanced margin (25-35%), best value
3. PREMIUM — high margin (35-50%), premium positioning

Factor in: market rates for ${job.city}, ${job.state}, project complexity, client type (${job.sector}), material costs.`,
    add_context_from_internet: true,
    model: "gemini_3_flash",
    response_json_schema: {
      type: "object",
      properties: {
        tiers: {
          type: "object",
          properties: {
            aggressive: { type: "object", properties: { price_per_sqft: { type: "number" }, total: { type: "number" }, margin_pct: { type: "number" }, win_probability: { type: "number" } } },
            optimal: { type: "object", properties: { price_per_sqft: { type: "number" }, total: { type: "number" }, margin_pct: { type: "number" }, win_probability: { type: "number" } } },
            premium: { type: "object", properties: { price_per_sqft: { type: "number" }, total: { type: "number" }, margin_pct: { type: "number" }, win_probability: { type: "number" } } }
          }
        },
        recommended_tier: { type: "string" },
        market_analysis: { type: "string" },
        recommended_price_per_sqft: { type: "number" }
      }
    }
  });

  const selectedTier = pricingResult.tiers?.[pricingResult.recommended_tier || 'optimal'] || pricingResult.tiers?.optimal;
  const finalPricePerSqft = selectedTier?.price_per_sqft || pricingResult.recommended_price_per_sqft || 5;
  const finalSqft = takeoffData.zones?.reduce((s, z) => s + (z.sqft || 0), 0) || sqft || 1000;
  const totalBid = Math.round(finalSqft * finalPricePerSqft);

  // Save pricing to job
  await base44.asServiceRole.entities.CommercialJob.update(jobId, {
    competitive_pricing: JSON.stringify(pricingResult),
    estimated_flooring_value: totalBid,
    bid_status: 'takeoff_complete'
  });

  // ═══════════════════════════════════════════
  // STEP 3: GENERATE PDF PROPOSAL
  // ═══════════════════════════════════════════
  const proposalRes = await base44.asServiceRole.functions.invoke('generateJobProposalPdf', {
    job_id: jobId,
    pricing_tier: pricingResult.recommended_tier || 'optimal',
    custom_price_per_sqft: finalPricePerSqft
  });

  // ═══════════════════════════════════════════
  // STEP 4: GENERATE BID PACKAGE (email-ready)
  // ═══════════════════════════════════════════
  const bidRes = await base44.asServiceRole.functions.invoke('generateBidPackage', {
    job_id: jobId,
    send_email: false  // Don't auto-send — queue for human approval
  });

  // Final job update
  await base44.asServiceRole.entities.CommercialJob.update(jobId, {
    bid_status: 'bid_generated',
    bid_document_id: bidRes?.bid_id || '',
    ai_insight: `Auto-bid pipeline complete. Recommended: $${finalPricePerSqft.toFixed(2)}/sqft ($${totalBid.toLocaleString()} total). ${pricingResult.recommended_tier || 'optimal'} tier. ${pricingResult.market_analysis || ''}`.substring(0, 1000)
  });

  // Log completion
  await base44.asServiceRole.entities.AgentActivity.create({
    agent_name: "Auto-Bid Pipeline",
    action: `Bid pipeline complete for ${jobName}: $${totalBid.toLocaleString()} (${finalPricePerSqft.toFixed(2)}/sqft)`,
    status: "approval_required",
    category: "bidding",
    related_entity_type: "CommercialJob",
    related_entity_id: jobId,
    details: JSON.stringify({
      phase: "complete",
      job_name: jobName,
      sqft: finalSqft,
      price_per_sqft: finalPricePerSqft,
      total_bid: totalBid,
      tier: pricingResult.recommended_tier || 'optimal',
      margin: selectedTier?.margin_pct || 0,
      win_probability: selectedTier?.win_probability || 0,
      pdf_url: proposalRes?.pdf_url || '',
      bid_id: bidRes?.bid_id || '',
      zones: takeoffData.zones?.length || 0,
      materials_count: takeoffData.materials?.length || 0
    })
  });

  return Response.json({
    success: true,
    job_id: jobId,
    job_name: jobName,
    pipeline_results: {
      takeoff: {
        zones: takeoffData.zones?.length || 0,
        total_sqft: finalSqft,
        material_cost: takeoffData.total_material_cost || 0,
        labor_cost: takeoffData.total_labor_cost || 0,
        duration_days: takeoffData.project_duration_days || 0
      },
      pricing: {
        recommended_tier: pricingResult.recommended_tier || 'optimal',
        price_per_sqft: finalPricePerSqft,
        total_bid: totalBid,
        margin_pct: selectedTier?.margin_pct || 0,
        win_probability: selectedTier?.win_probability || 0,
        all_tiers: pricingResult.tiers
      },
      proposal: {
        pdf_url: proposalRes?.pdf_url || null,
        proposal_id: proposalRes?.proposal_id || null
      },
      bid_package: {
        bid_id: bidRes?.bid_id || null,
        bid_number: bidRes?.bid_number || null,
        status: "draft_ready"
      }
    }
  });
});