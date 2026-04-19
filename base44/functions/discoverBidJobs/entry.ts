import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { states, project_types, sector } = await req.json();
  const targetStates = states || ["AZ", "TX", "FL", "CA", "NV"];
  const targetTypes = project_types || ["warehouse", "retail", "restaurant", "office", "government", "industrial", "healthcare", "education"];
  const targetSector = sector || "all";

  const prompt = `You are a commercial construction job discovery engine for Xtreme Polishing Systems (XPS) and National Concrete Polishing (NCP).

MISSION: Find the EARLIEST possible commercial and government construction projects that will need flooring (epoxy, polished concrete, decorative concrete, stained concrete, coatings).

Search for REAL, CURRENT projects in these states: ${targetStates.join(", ")}
Project types: ${targetTypes.join(", ")}
${targetSector !== "all" ? `Sector focus: ${targetSector}` : "All sectors: government federal, state, municipal, and commercial private"}

SOURCES TO CHECK:
- SAM.gov (federal government contracts)
- State/municipal bid boards
- Dodge Data & Analytics projects
- ConstructConnect leads
- PlanHub postings
- Building permits filed
- Commercial real estate developments announced
- Government facility upgrades
- Military base improvements
- Airport renovations
- Hospital/healthcare expansions
- School/university construction
- Data center builds
- Warehouse/distribution center developments

For each project found, extract:
- Project name and description
- Location (address, city, state, zip)
- Owner/agency name and contact
- General contractor if assigned
- Architect if known
- Project type and sector
- Total project value
- Estimated flooring square footage
- Estimated flooring value (use $3-12/sqft depending on system)
- Current phase (discovered, permit_filed, design, pre_bid, bidding)
- Bid due date if applicable
- Source URL
- Why this is a good opportunity for XPS/NCP
- Urgency score 0-100
- Lead score 0-100

Find 5-10 real opportunities. Be specific with company names, locations, and values.`;

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    add_context_from_internet: true,
    model: "gemini_3_flash",
    response_json_schema: {
      type: "object",
      properties: {
        jobs: {
          type: "array",
          items: {
            type: "object",
            properties: {
              job_name: { type: "string" },
              address: { type: "string" },
              city: { type: "string" },
              state: { type: "string" },
              zip: { type: "string" },
              owner_name: { type: "string" },
              owner_email: { type: "string" },
              owner_phone: { type: "string" },
              gc_name: { type: "string" },
              gc_email: { type: "string" },
              gc_phone: { type: "string" },
              architect_name: { type: "string" },
              project_type: { type: "string" },
              sector: { type: "string" },
              total_sqft: { type: "number" },
              flooring_sqft: { type: "number" },
              project_value: { type: "number" },
              estimated_flooring_value: { type: "number" },
              project_phase: { type: "string" },
              bid_due_date: { type: "string" },
              source_url: { type: "string" },
              source_type: { type: "string" },
              ai_insight: { type: "string" },
              flooring_system_recommendation: { type: "string" },
              urgency_score: { type: "number" },
              lead_score: { type: "number" }
            }
          }
        },
        summary: { type: "string" }
      }
    }
  });

  const jobs = result.jobs || [];
  const created = [];

  for (const job of jobs) {
    const record = await base44.asServiceRole.entities.CommercialJob.create({
      job_name: job.job_name || "Unknown Project",
      address: job.address || "",
      city: job.city || "",
      state: job.state || "",
      zip: job.zip || "",
      owner_name: job.owner_name || "",
      owner_email: job.owner_email || "",
      owner_phone: job.owner_phone || "",
      gc_name: job.gc_name || "",
      gc_email: job.gc_email || "",
      gc_phone: job.gc_phone || "",
      architect_name: job.architect_name || "",
      project_type: job.project_type || "other",
      sector: job.sector || "Commercial Private",
      total_sqft: job.total_sqft || 0,
      flooring_sqft: job.flooring_sqft || 0,
      project_value: job.project_value || 0,
      estimated_flooring_value: job.estimated_flooring_value || 0,
      project_phase: job.project_phase || "discovered",
      bid_due_date: job.bid_due_date || null,
      source_url: job.source_url || "",
      source_type: job.source_type || "Scraper",
      ai_insight: job.ai_insight || "",
      flooring_system_recommendation: job.flooring_system_recommendation || "",
      urgency_score: job.urgency_score || 50,
      lead_score: job.lead_score || 50,
      discovery_date: new Date().toISOString(),
      bid_status: "not_started"
    });
    created.push(record);
  }

  return Response.json({
    jobs_found: created.length,
    summary: result.summary || `Found ${created.length} new bid opportunities`,
    jobs: created
  });
});