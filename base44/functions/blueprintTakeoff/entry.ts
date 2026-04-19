import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { file_url, job_name, city, state, project_type, notes } = await req.json();
  if (!file_url) return Response.json({ error: 'file_url is required' }, { status: 400 });

  // Step 1: Extract structured data from the uploaded blueprint PDF/image
  const extractionResult = await base44.asServiceRole.integrations.Core.ExtractDataFromUploadedFile({
    file_url,
    json_schema: {
      type: "object",
      properties: {
        rooms: {
          type: "array",
          items: {
            type: "object",
            properties: {
              room_name: { type: "string" },
              length_ft: { type: "number" },
              width_ft: { type: "number" },
              sqft: { type: "number" },
              wall_lengths: { type: "array", items: { type: "number" } },
              perimeter_ft: { type: "number" },
              notes: { type: "string" }
            }
          }
        },
        total_sqft: { type: "number" },
        building_dimensions: { type: "string" },
        scale_info: { type: "string" },
        floor_count: { type: "number" },
        raw_text: { type: "string" }
      }
    }
  });

  if (extractionResult.status === 'error') {
    return Response.json({ error: 'Failed to extract blueprint data', details: extractionResult.details }, { status: 400 });
  }

  const extracted = extractionResult.output;

  // Step 2: AI analysis — classify zones, recommend materials, compute full takeoff
  const analysisPrompt = `You are a senior flooring estimator for Xtreme Polishing Systems (XPS).

EXTRACTED BLUEPRINT DATA:
${JSON.stringify(extracted, null, 2)}

PROJECT CONTEXT:
- Project name: ${job_name || 'Unknown'}
- Location: ${city || 'Unknown'}, ${state || 'Unknown'}
- Project type: ${project_type || 'commercial'}
- Notes: ${notes || 'None'}

TASKS:
1. Analyze each room/zone from the blueprint. If rooms were detected, use them. If only raw text or partial data was found, infer rooms from context.
2. Classify each room into a MATERIAL ZONE:
   - High-traffic (warehouse, retail floor) → Polished Concrete or Industrial Epoxy
   - Food-safe (kitchen, restaurant, food processing) → Polyaspartic or Urethane
   - Decorative (lobby, showroom, office) → Metallic Epoxy or Decorative Epoxy
   - Wet area (restroom, wash bay) → Non-slip Epoxy with broadcast
   - Garage/Loading → Heavy-duty Epoxy or Polyurea
   - Standard (hallway, storage) → Standard Epoxy
3. For each zone calculate:
   - Square footage
   - Wall lengths (perimeter)
   - Recommended flooring system
   - Material cost estimate
   - Labor hours estimate
4. Provide totals and a recommended flooring system.

XPS PRICING (per sqft):
- Standard Epoxy: $3-5 | Polished Concrete: $3-8 | Decorative Epoxy: $5-10
- Metallic Epoxy: $8-15 | Polyaspartic: $4-7 | Industrial Epoxy: $4-8
- Polyurea: $5-9 | Urethane: $4-7 | Garage Coating: $3-6`;

  const analysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: analysisPrompt,
    response_json_schema: {
      type: "object",
      properties: {
        zones: {
          type: "array",
          items: {
            type: "object",
            properties: {
              zone_name: { type: "string" },
              room_type: { type: "string" },
              sqft: { type: "number" },
              wall_length_ft: { type: "number" },
              perimeter_ft: { type: "number" },
              recommended_system: { type: "string" },
              material_zone: { type: "string" },
              material_cost_estimate: { type: "number" },
              labor_hours: { type: "number" },
              labor_cost_estimate: { type: "number" },
              notes: { type: "string" }
            }
          }
        },
        total_sqft: { type: "number" },
        total_flooring_sqft: { type: "number" },
        total_wall_length_ft: { type: "number" },
        total_material_cost: { type: "number" },
        total_labor_cost: { type: "number" },
        total_estimated_value: { type: "number" },
        recommended_system: { type: "string" },
        timeline_days: { type: "number" },
        crew_size: { type: "number" },
        summary: { type: "string" }
      }
    }
  });

  // Step 3: Create or update CommercialJob
  const jobData = {
    job_name: job_name || `Blueprint Takeoff - ${new Date().toLocaleDateString()}`,
    city: city || '',
    state: state || '',
    project_type: project_type || 'other',
    total_sqft: analysis.total_sqft || 0,
    flooring_sqft: analysis.total_flooring_sqft || analysis.total_sqft || 0,
    estimated_flooring_value: analysis.total_estimated_value || 0,
    flooring_system_recommendation: analysis.recommended_system || '',
    takeoff_data: JSON.stringify(analysis),
    takeoff_complete: true,
    bid_status: 'takeoff_complete',
    project_phase: 'pre_bid',
    source_type: 'Manual',
    ai_insight: analysis.summary || '',
    notes: `Blueprint uploaded. ${analysis.zones?.length || 0} zones identified. ${notes || ''}`
  };

  const job = await base44.asServiceRole.entities.CommercialJob.create(jobData);

  return Response.json({
    success: true,
    job_id: job.id,
    job: jobData,
    takeoff: analysis,
    extraction: extracted
  });
});