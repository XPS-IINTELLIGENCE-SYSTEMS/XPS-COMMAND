import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// All 50 US states for rotation
const ALL_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware",
  "Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky",
  "Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi",
  "Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico",
  "New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania",
  "Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
  "Virginia","Washington","West Virginia","Wisconsin","Wyoming"
];

// Top construction markets get extra weight
const HIGH_PRIORITY_STATES = [
  "Texas","Florida","California","Georgia","North Carolina","Virginia","Arizona",
  "Tennessee","Ohio","New York","Illinois","Pennsylvania","Colorado","Washington",
  "Maryland","New Jersey","South Carolina","Nevada","Indiana","Missouri"
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { target_states, batch_size, gc_type } = await req.json().catch(() => ({}));

    // Pick 2 states per run — prioritize high-priority states
    let states = target_states;
    if (!states || states.length === 0) {
      // Get existing counts by state to find underrepresented states
      const allGCs = await base44.asServiceRole.entities.ContractorCompany.list('-created_date', 200);
      const stateCounts = {};
      allGCs.forEach(gc => {
        const s = gc.state;
        if (s) stateCounts[s] = (stateCounts[s] || 0) + 1;
      });

      // Sort states by least coverage, prioritize high-priority states with low counts
      const sortedStates = [...ALL_STATES].sort((a, b) => {
        const aCount = stateCounts[a] || 0;
        const bCount = stateCounts[b] || 0;
        const aPriority = HIGH_PRIORITY_STATES.includes(a) ? -10 : 0;
        const bPriority = HIGH_PRIORITY_STATES.includes(b) ? -10 : 0;
        return (aCount + aPriority) - (bCount + bPriority);
      });

      states = sortedStates.slice(0, 2);
    }

    const size = batch_size || 10;
    const type = gc_type || "general_contractor";

    const prompt = `You are an aggressive commercial construction general contractor discovery engine.

MISSION: Find ${size} REAL general contractors that do COMMERCIAL and GOVERNMENT construction in: ${states.join(" and ")}

TARGET GC TYPES:
- Large commercial general contractors (ENR Top 400 if applicable)
- Government/federal construction contractors (GSA schedule holders)
- Military construction contractors (MILCON)
- Healthcare construction specialists
- Education/university builders
- Data center builders
- Warehouse/distribution center builders
- Mixed-use/retail developers
- Airport/transportation contractors

CRITICAL: These must be GENERAL CONTRACTORS, NOT flooring subcontractors. We want GCs who HIRE flooring subs.

For EACH contractor, provide ALL available info:
- company_name (REAL company — verifiable)
- headquarters_address
- city, state, zip
- website
- phone (main office)
- email (general or estimating)
- preconstruction_contact_name (VP Precon, Director of Estimating, Chief Estimator)
- preconstruction_email
- preconstruction_phone
- estimator_name
- estimator_email
- annual_revenue_estimate (in dollars — research this)
- employee_count
- project_types (array: warehouse, retail, healthcare, government, education, industrial, data_center, military, airport, office, mixed_use, hotel, restaurant)
- states_they_build_in (array of state abbreviations where they operate)
- average_project_value (typical project size in dollars)
- bidding_platform (BuildingConnected, Procore, iSqFt, email_only, multiple)
- bidding_platform_profile_url (if on BuildingConnected or similar)
- notable_projects (2-3 recent notable projects)

SEARCH STRATEGY:
- Check ENR Top Contractors lists
- Search "[state] commercial general contractor"
- Search "[state] government construction contractor"
- Search "top builders [city]"
- Check BuildingConnected profiles
- Check Associated General Contractors (AGC) member directories
- Check state contractor license databases
- Search LinkedIn for "{state} general contractor commercial"

Return ${size} real companies with as much detail as possible. Revenue estimates are important for prioritization.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: "gemini_3_flash",
      response_json_schema: {
        type: "object",
        properties: {
          contractors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                company_name: { type: "string" },
                headquarters_address: { type: "string" },
                city: { type: "string" },
                state: { type: "string" },
                zip: { type: "string" },
                website: { type: "string" },
                phone: { type: "string" },
                email: { type: "string" },
                preconstruction_contact_name: { type: "string" },
                preconstruction_email: { type: "string" },
                preconstruction_phone: { type: "string" },
                estimator_name: { type: "string" },
                estimator_email: { type: "string" },
                annual_revenue_estimate: { type: "number" },
                employee_count: { type: "number" },
                project_types: { type: "array", items: { type: "string" } },
                states_they_build_in: { type: "array", items: { type: "string" } },
                average_project_value: { type: "number" },
                bidding_platform: { type: "string" },
                bidding_platform_profile_url: { type: "string" },
                notable_projects: { type: "array", items: { type: "string" } }
              }
            }
          },
          search_summary: { type: "string" }
        }
      }
    });

    const contractors = result.contractors || [];
    let created = 0;
    let duplicates = 0;
    const createdNames = [];

    for (const c of contractors) {
      if (!c.company_name) continue;

      // Dedup check
      const existing = await base44.asServiceRole.entities.ContractorCompany.filter({
        company_name: c.company_name
      }).catch(() => []);

      if (existing.length > 0) {
        duplicates++;
        continue;
      }

      await base44.asServiceRole.entities.ContractorCompany.create({
        company_name: c.company_name,
        headquarters_address: c.headquarters_address || "",
        city: c.city || "",
        state: c.state || "",
        zip: c.zip || "",
        website: c.website || "",
        phone: c.phone || "",
        email: c.email || "",
        preconstruction_contact_name: c.preconstruction_contact_name || "",
        preconstruction_email: c.preconstruction_email || "",
        preconstruction_phone: c.preconstruction_phone || "",
        estimator_name: c.estimator_name || "",
        estimator_email: c.estimator_email || "",
        annual_revenue_estimate: c.annual_revenue_estimate || 0,
        employee_count: c.employee_count || 0,
        project_types: JSON.stringify(c.project_types || []),
        states_they_build_in: JSON.stringify(c.states_they_build_in || []),
        average_project_value: c.average_project_value || 0,
        bidding_platform: c.bidding_platform || "unknown",
        bidding_platform_profile_url: c.bidding_platform_profile_url || "",
        bid_list_status: "not_contacted",
        relationship_strength: "cold",
        source_url: c.website || "",
        discovered_date: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        notes: c.notable_projects ? `Notable: ${c.notable_projects.join("; ")}` : "",
      });
      created++;
      createdNames.push(c.company_name);
    }

    // Log activity
    await base44.asServiceRole.entities.AgentActivity.create({
      agent_name: "Aggressive GC Scraper",
      action: `Scraped GCs: ${states.join(", ")}`,
      status: "success",
      category: "scraping",
      related_entity_type: "ContractorCompany",
      details: JSON.stringify({
        states,
        found: contractors.length,
        created,
        duplicates,
        companies: createdNames,
      }),
    });

    return Response.json({
      success: true,
      states,
      found: contractors.length,
      created,
      duplicates,
      companies: createdNames,
      search_summary: result.search_summary || "",
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});