import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ALL_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware",
  "Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky",
  "Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi",
  "Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico",
  "New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania",
  "Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
  "Virginia","Washington","West Virginia","Wisconsin","Wyoming"
];

const HIGH_PRIORITY = [
  "Texas","Florida","California","Georgia","North Carolina","Virginia","Arizona",
  "Tennessee","Ohio","New York","Illinois","Pennsylvania","Colorado","Washington"
];

const FLOORING_SPECIALTIES = [
  "epoxy flooring", "polished concrete", "decorative concrete", "stained concrete",
  "metallic epoxy", "polyaspartic coatings", "urethane cement", "industrial floor coatings",
  "concrete resurfacing", "garage floor coatings", "warehouse epoxy", "commercial flooring",
  "food-safe flooring", "cleanroom flooring", "anti-static flooring", "moisture mitigation"
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { target_states, focus_sectors, batch_size } = await req.json().catch(() => ({}));

    // Pick 3 states per run
    let states = target_states;
    if (!states || states.length === 0) {
      const existingJobs = await base44.asServiceRole.entities.CommercialJob.list('-created_date', 200);
      const stateCounts = {};
      existingJobs.forEach(j => {
        if (j.state) stateCounts[j.state] = (stateCounts[j.state] || 0) + 1;
      });
      const sorted = [...ALL_STATES].sort((a, b) => {
        const ac = stateCounts[a] || 0;
        const bc = stateCounts[b] || 0;
        const ap = HIGH_PRIORITY.includes(a) ? -10 : 0;
        const bp = HIGH_PRIORITY.includes(b) ? -10 : 0;
        return (ac + ap) - (bc + bp);
      });
      states = sorted.slice(0, 3);
    }

    const sectors = focus_sectors || ["Government Federal", "Government State", "Government Municipal", "Commercial Private", "Institutional"];
    const size = batch_size || 10;

    const prompt = `You are an aggressive commercial construction job discovery engine for Xtreme Polishing Systems (XPS) and National Concrete Polishing (NCP).

MISSION: Find ${size} REAL commercial and government construction projects in PRE-BID or BIDDING phase that need flooring work in: ${states.join(", ")}

FLOORING SPECIALTIES WE BID ON:
${FLOORING_SPECIALTIES.join(", ")}

TARGET SECTORS: ${sectors.join(", ")}

PROJECT TYPES WE WANT:
- Warehouses & Distribution Centers (Amazon, FedEx, etc.)
- Government Buildings (Federal, State, Municipal)
- Military Facilities (Army, Navy, Air Force bases)
- Hospitals & Healthcare Facilities
- Data Centers
- Schools & Universities
- Airports & Transportation Hubs
- Retail & Shopping Centers
- Hotels & Hospitality
- Food Processing & Breweries
- Manufacturing Plants
- Office Buildings
- Parking Garages
- Any project with 5,000+ sqft of flooring scope

SOURCES TO SEARCH:
- SAM.gov (federal solicitations with NAICS 238330, 238990)
- State procurement portals
- Municipal bid boards
- Dodge Data construction starts
- ConstructConnect project leads
- PlanHub bid invitations
- BuildingConnected project postings
- Commercial building permits filed
- Real estate development announcements
- Military base improvement projects
- Government facilities modernization

For EACH project provide:
- job_name: Project name/title
- address, city, state, zip
- owner_name: Property owner or agency
- owner_contact, owner_email, owner_phone
- gc_name: General contractor (if assigned)
- gc_email, gc_phone
- architect_name, architect_contact
- project_type: warehouse/retail/restaurant/healthcare/industrial/government/education/military/data_center/airport/hotel/office/parking_garage/other
- sector: Government Federal/Government State/Government Municipal/Commercial Private/Institutional
- total_sqft: Total building sqft
- flooring_sqft: Estimated flooring scope sqft
- project_value: Total project value
- estimated_flooring_value: Our estimated flooring bid value ($3-15/sqft depending on system)
- project_phase: pre_bid or bidding
- bid_due_date: When bids are due (YYYY-MM-DD format)
- source_url: Where you found this
- source_type: SAM.gov/BidNet/Dodge/ConstructConnect/PlanHub/BuildingConnected/Permit DB/Other
- flooring_system_recommendation: What system XPS should propose
- ai_insight: Why this is a good opportunity
- urgency_score: 0-100 (higher = more urgent bid deadline)
- lead_score: 0-100 (higher = better fit for XPS)

CRITICAL: Focus on projects that are ACTIVELY BIDDING or about to bid. We need projects where we can submit a bid NOW or within the next 30-60 days. These must be REAL, verifiable projects.`;

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
                owner_contact: { type: "string" },
                owner_email: { type: "string" },
                owner_phone: { type: "string" },
                gc_name: { type: "string" },
                gc_email: { type: "string" },
                gc_phone: { type: "string" },
                architect_name: { type: "string" },
                architect_contact: { type: "string" },
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
                flooring_system_recommendation: { type: "string" },
                ai_insight: { type: "string" },
                urgency_score: { type: "number" },
                lead_score: { type: "number" }
              }
            }
          },
          search_summary: { type: "string" }
        }
      }
    });

    const jobs = result.jobs || [];
    let created = 0;
    let duplicates = 0;
    const createdJobs = [];

    for (const job of jobs) {
      if (!job.job_name || !job.city || !job.state) continue;

      // Dedup
      const existing = await base44.asServiceRole.entities.CommercialJob.filter({
        job_name: job.job_name
      }).catch(() => []);

      if (existing.length > 0) { duplicates++; continue; }

      // Normalize project_type
      const validTypes = ["warehouse","retail","restaurant","fitness","healthcare","industrial","data_center","hotel","automotive","brewery","food_processing","office","education","government","mixed_use","military","airport","parking_garage","other"];
      const pType = validTypes.includes(job.project_type) ? job.project_type : "other";

      const validSectors = ["Government Federal","Government State","Government Municipal","Commercial Private","Commercial Public","Institutional"];
      const pSector = validSectors.includes(job.sector) ? job.sector : "Commercial Private";

      const validPhases = ["discovered","permit_filed","design","pre_bid","bidding"];
      const pPhase = validPhases.includes(job.project_phase) ? job.project_phase : "discovered";

      const record = await base44.asServiceRole.entities.CommercialJob.create({
        job_name: job.job_name,
        address: job.address || "",
        city: job.city,
        state: job.state,
        zip: job.zip || "",
        owner_name: job.owner_name || "",
        owner_contact: job.owner_contact || "",
        owner_email: job.owner_email || "",
        owner_phone: job.owner_phone || "",
        gc_name: job.gc_name || "",
        gc_email: job.gc_email || "",
        gc_phone: job.gc_phone || "",
        architect_name: job.architect_name || "",
        architect_contact: job.architect_contact || "",
        project_type: pType,
        sector: pSector,
        total_sqft: job.total_sqft || 0,
        flooring_sqft: job.flooring_sqft || 0,
        project_value: job.project_value || 0,
        estimated_flooring_value: job.estimated_flooring_value || 0,
        project_phase: pPhase,
        bid_due_date: job.bid_due_date || null,
        source_url: job.source_url || "",
        source_type: job.source_type || "Scraper",
        flooring_system_recommendation: job.flooring_system_recommendation || "",
        ai_insight: job.ai_insight || "",
        urgency_score: job.urgency_score || 50,
        lead_score: job.lead_score || 50,
        discovery_date: new Date().toISOString(),
        bid_status: "not_started",
        route_to: pSector.startsWith("Government") ? "NCP" : "Both",
      });
      created++;
      createdJobs.push({ name: job.job_name, state: job.state, value: job.estimated_flooring_value });
    }

    // Log activity
    await base44.asServiceRole.entities.AgentActivity.create({
      agent_name: "Aggressive Job Scraper",
      action: `Discovered ${created} bid jobs in ${states.join(", ")}`,
      status: "success",
      category: "scraping",
      related_entity_type: "CommercialJob",
      details: JSON.stringify({ states, found: jobs.length, created, duplicates, jobs: createdJobs }),
    });

    return Response.json({
      success: true,
      states,
      found: jobs.length,
      created,
      duplicates,
      jobs: createdJobs,
      search_summary: result.search_summary || "",
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});