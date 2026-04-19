import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { job_id } = await req.json();
  if (!job_id) return Response.json({ error: 'job_id required' }, { status: 400 });

  const jobs = await base44.asServiceRole.entities.CommercialJob.filter({ id: job_id });
  const job = jobs[0];
  if (!job) return Response.json({ error: 'Job not found' }, { status: 404 });

  const prompt = `You are a professional flooring estimator for Xtreme Polishing Systems (XPS) and National Concrete Polishing (NCP).

PROJECT DETAILS:
- Name: ${job.job_name}
- Type: ${job.project_type}
- Location: ${job.city}, ${job.state}
- Total sqft: ${job.total_sqft || 'Unknown'}
- Flooring sqft: ${job.flooring_sqft || 'Estimate based on project type'}
- Project value: $${job.project_value || 'Unknown'}
- Recommended system: ${job.flooring_system_recommendation || 'Determine best system'}
- Owner: ${job.owner_name || 'Unknown'}
- GC: ${job.gc_name || 'Unknown'}

PERFORM A COMPLETE AI TAKEOFF:

1. ZONE BREAKDOWN - Break the project into logical zones (lobby, warehouse floor, kitchen, restroom, loading dock, etc.)
2. For each zone specify:
   - Square footage
   - Recommended flooring system (epoxy, polished concrete, stained concrete, decorative, polyaspartic, etc.)
   - Surface preparation needed (grinding, shot blasting, patching, moisture mitigation)
   - Number of coats/passes
   - Material list with quantities and unit costs
   - Labor hours and crew size needed
   - Equipment needed

3. MATERIAL COSTS (use real XPS pricing):
   - Primers: $0.15-0.30/sqft
   - Epoxy body coat: $0.40-0.80/sqft
   - Polyaspartic topcoat: $0.50-1.00/sqft
   - Decorative flake: $0.20-0.40/sqft
   - Metallic pigments: $0.60-1.20/sqft
   - Concrete densifier: $0.08-0.15/sqft
   - Concrete polish (grinding): $0.50-1.50/sqft
   - Stain/dye: $0.30-0.60/sqft
   - Moisture barrier: $0.30-0.50/sqft
   - Crack repair/patching: $0.10-0.30/sqft

4. LABOR RATES:
   - Skilled installer: $45-65/hour
   - Helper: $25-35/hour
   - Project manager: $75-95/hour
   - Typical crew: 3-6 workers depending on size

5. COMPETITIVE PRICING - Research what competitors charge:
   - Budget contractors: $2-4/sqft
   - Mid-range: $4-7/sqft
   - Premium (XPS level): $6-12/sqft
   - Government/prevailing wage: add 30-50%

6. Calculate totals:
   - Total material cost
   - Total labor cost
   - Equipment costs
   - Overhead (15%)
   - Profit margin (20-30%)
   - Total bid value

Return a comprehensive takeoff.`;

  const takeoffResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    add_context_from_internet: true,
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
              system: { type: "string" },
              surface_prep: { type: "string" },
              materials: { type: "array", items: { type: "object", properties: { item: { type: "string" }, qty: { type: "string" }, unit_cost: { type: "number" }, total: { type: "number" } } } },
              labor_hours: { type: "number" },
              crew_size: { type: "number" },
              zone_material_cost: { type: "number" },
              zone_labor_cost: { type: "number" }
            }
          }
        },
        total_material_cost: { type: "number" },
        total_labor_cost: { type: "number" },
        equipment_cost: { type: "number" },
        overhead: { type: "number" },
        profit: { type: "number" },
        total_bid_value: { type: "number" },
        recommended_bid_range: { type: "object", properties: { low: { type: "number" }, mid: { type: "number" }, high: { type: "number" } } },
        competitive_analysis: { type: "string" },
        timeline_days: { type: "number" },
        crew_recommendation: { type: "string" },
        system_recommendation: { type: "string" },
        notes: { type: "string" }
      }
    }
  });

  await base44.asServiceRole.entities.CommercialJob.update(job_id, {
    takeoff_data: JSON.stringify(takeoffResult),
    takeoff_complete: true,
    estimated_flooring_value: takeoffResult.total_bid_value || job.estimated_flooring_value,
    competitive_pricing: takeoffResult.competitive_analysis || "",
    flooring_system_recommendation: takeoffResult.system_recommendation || job.flooring_system_recommendation,
    bid_status: "takeoff_complete"
  });

  return Response.json({
    success: true,
    takeoff: takeoffResult,
    job_id
  });
});