import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Pricing matrix per system per sqft
const PRICING = {
  "Epoxy Floor Coating": { material: 1.50, labor: 2.50, total_low: 3.50, total_high: 6.00 },
  "Polished Concrete": { material: 0.75, labor: 2.00, total_low: 2.50, total_high: 5.00 },
  "Decorative Concrete": { material: 2.00, labor: 3.00, total_low: 4.50, total_high: 8.00 },
  "Metallic Epoxy": { material: 3.00, labor: 4.00, total_low: 6.00, total_high: 12.00 },
  "Urethane Cement": { material: 3.50, labor: 4.50, total_low: 7.00, total_high: 14.00 },
  "Polyaspartic": { material: 2.50, labor: 3.00, total_low: 5.00, total_high: 9.00 },
  "Industrial Coating": { material: 2.00, labor: 3.00, total_low: 4.50, total_high: 8.00 },
  "Moisture Mitigation": { material: 1.50, labor: 1.50, total_low: 2.50, total_high: 4.00 },
  "Surface Prep Only": { material: 0.25, labor: 1.50, total_low: 1.50, total_high: 2.50 },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { batch_size, job_ids } = await req.json().catch(() => ({}));

    // Get jobs that need takeoffs
    let jobs;
    if (job_ids && job_ids.length > 0) {
      const allJobs = await base44.asServiceRole.entities.CommercialJob.list('-created_date', 200);
      jobs = allJobs.filter(j => job_ids.includes(j.id));
    } else {
      // Get jobs without takeoffs, prioritized by urgency
      const allJobs = await base44.asServiceRole.entities.CommercialJob.filter(
        { takeoff_complete: false }, '-urgency_score', batch_size || 10
      );
      jobs = allJobs;
    }

    if (jobs.length === 0) {
      return Response.json({ success: true, message: "No jobs need takeoffs", processed: 0 });
    }

    let processed = 0;
    const results = [];

    for (const job of jobs) {
      // Generate AI takeoff based on project details
      const takeoffResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Generate a detailed flooring takeoff estimate for this commercial project:

PROJECT: ${job.job_name}
LOCATION: ${job.city}, ${job.state}
PROJECT TYPE: ${job.project_type}
SECTOR: ${job.sector}
TOTAL BUILDING SQFT: ${job.total_sqft || "Unknown"}
ESTIMATED FLOORING SQFT: ${job.flooring_sqft || "Unknown"}
PROJECT VALUE: $${(job.project_value || 0).toLocaleString()}
RECOMMENDED SYSTEM: ${job.flooring_system_recommendation || "To be determined"}
GC: ${job.gc_name || "Unknown"}

Based on the project type and sector, generate a comprehensive flooring takeoff with:

1. ZONE BREAKDOWN — Divide the building into logical zones (e.g., warehouse floor, office areas, restrooms, loading docks, mechanical rooms, corridors, lobby)
2. For each zone:
   - Zone name
   - Estimated square footage
   - Recommended flooring system
   - Surface prep requirements
   - Material cost per sqft
   - Labor cost per sqft
   - Total cost for zone
3. ADDITIONAL ITEMS:
   - Moisture testing (ASTM F2170)
   - Joint filling/repair
   - Concrete repair
   - Mobilization/demobilization
   - Containment/protection
4. TOTALS:
   - Total material cost
   - Total labor cost
   - Total project cost
   - Recommended bid price (with 25-35% markup)
   - Competitive market price range

Use these pricing guidelines:
${Object.entries(PRICING).map(([sys, p]) => `${sys}: $${p.total_low}-$${p.total_high}/sqft`).join("\n")}

Be realistic and comprehensive. This will be used for actual bid preparation.`,
        model: "gemini_3_flash",
        response_json_schema: {
          type: "object",
          properties: {
            zones: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  zone_name: { type: "string" },
                  sqft: { type: "number" },
                  flooring_system: { type: "string" },
                  surface_prep: { type: "string" },
                  material_cost_sqft: { type: "number" },
                  labor_cost_sqft: { type: "number" },
                  total_cost: { type: "number" }
                }
              }
            },
            additional_items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  item: { type: "string" },
                  cost: { type: "number" }
                }
              }
            },
            total_material_cost: { type: "number" },
            total_labor_cost: { type: "number" },
            total_project_cost: { type: "number" },
            recommended_bid_price: { type: "number" },
            market_price_low: { type: "number" },
            market_price_high: { type: "number" },
            total_sqft_covered: { type: "number" },
            avg_cost_per_sqft: { type: "number" },
            notes: { type: "string" },
            confidence_level: { type: "string" }
          }
        }
      });

      // Update the job with takeoff data
      await base44.asServiceRole.entities.CommercialJob.update(job.id, {
        takeoff_data: JSON.stringify(takeoffResult),
        takeoff_complete: true,
        estimated_flooring_value: takeoffResult.recommended_bid_price || job.estimated_flooring_value,
        bid_status: "takeoff_complete",
      });

      processed++;
      results.push({
        job_name: job.job_name,
        state: job.state,
        total_sqft: takeoffResult.total_sqft_covered,
        recommended_bid: takeoffResult.recommended_bid_price,
        confidence: takeoffResult.confidence_level,
      });
    }

    // Log activity
    await base44.asServiceRole.entities.AgentActivity.create({
      agent_name: "AI Takeoff Engine",
      action: `Completed ${processed} AI takeoffs`,
      status: "success",
      category: "analysis",
      related_entity_type: "CommercialJob",
      details: JSON.stringify({ processed, results }),
    });

    return Response.json({
      success: true,
      processed,
      results,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});