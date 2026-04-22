import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SEARCH_TERMS = [
  "epoxy", "epoxy flooring", "epoxy coatings",
  "decorative concrete", "concrete coatings", "concrete polishing",
  "polished concrete", "concrete floor",
  "polyaspartic", "polyurea", "metallic epoxy",
  "garage floor", "garage coatings",
  "industrial flooring", "floor coating",
  "stained concrete", "concrete overlay",
  "concrete resurfacing"
];

const SPECIALTY_MAP = {
  "epoxy": "Epoxy",
  "epoxy flooring": "Epoxy",
  "epoxy coatings": "Epoxy",
  "metallic epoxy": "Metallic Epoxy",
  "decorative concrete": "Decorative Concrete",
  "concrete coatings": "Concrete Coatings",
  "concrete polishing": "Polished Concrete",
  "polished concrete": "Polished Concrete",
  "polyaspartic": "Polyaspartic",
  "polyurea": "Polyurea",
  "garage floor": "Garage Coatings",
  "garage coatings": "Garage Coatings",
  "industrial flooring": "Industrial Coatings",
  "floor coating": "General Flooring",
  "stained concrete": "Stained Concrete",
  "concrete floor": "General Flooring",
  "concrete overlay": "Decorative Concrete",
  "concrete resurfacing": "Decorative Concrete",
};

function calculatePriority(formationDate) {
  if (!formationDate) return 5;
  const now = new Date();
  const formed = new Date(formationDate);
  const yearsOld = (now - formed) / (1000 * 60 * 60 * 24 * 365.25);
  
  // Brand new (< 1 year) = 10 (highest priority — they need everything)
  // 1-2 years = 9
  // 2-3 years = 8
  // 3-5 years = 7
  // 5-10 years = 6
  // 10+ years = 5
  // Very old (20+) = 4 (established, less likely to switch)
  if (yearsOld < 1) return 10;
  if (yearsOld < 2) return 9;
  if (yearsOld < 3) return 8;
  if (yearsOld < 5) return 7;
  if (yearsOld < 10) return 6;
  if (yearsOld < 20) return 5;
  return 4;
}

function calculateYears(formationDate) {
  if (!formationDate) return 0;
  const now = new Date();
  const formed = new Date(formationDate);
  return Math.max(0, Math.round((now - formed) / (1000 * 60 * 60 * 24 * 365.25) * 10) / 10);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const targetStates = body.states || ["FL", "AZ", "OH", "TX", "CA", "GA", "NC", "TN", "CO", "NV"];
    const maxPerState = body.max_per_state || 15;
    const searchTermOverrides = body.search_terms || null;

    const terms = searchTermOverrides || SEARCH_TERMS.slice(0, 8); // Use top 8 terms by default

    // Get existing company names to avoid duplicates
    const existing = await base44.asServiceRole.entities.ProspectCompany.filter({}, "-created_date", 500).catch(() => []);
    const existingNames = new Set(existing.map(e => e.company_name?.toLowerCase().trim()));

    const allResults = [];
    const stateResults = {};

    for (const state of targetStates) {
      const stateFinds = [];
      
      // Use LLM with internet to search state registries
      const searchPrompt = `Search for recently registered businesses in ${state} that match these categories: epoxy flooring companies, decorative concrete companies, polished concrete companies, concrete coating contractors, garage floor coating businesses.

Look at the ${state} Secretary of State business registry, contractor license databases, and business filings.

Focus on finding NEW businesses (formed in the last 0-5 years). For each company found, provide:
- Company name (exact registered name)
- DBA name if different
- Owner/registered agent name
- Formation/registration date
- Business type (LLC, Corp, etc.)
- Address, City, State, ZIP
- Phone number if available
- Website if available  
- Email if available
- License number if available
- Which search term matched

Find up to ${maxPerState} companies. Prioritize the NEWEST companies first.
Return ONLY real companies you can verify from registry data.`;

      try {
        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: searchPrompt,
          add_context_from_internet: true,
          model: "gemini_3_flash",
          response_json_schema: {
            type: "object",
            properties: {
              companies: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    company_name: { type: "string" },
                    dba_name: { type: "string" },
                    owner_name: { type: "string" },
                    formation_date: { type: "string" },
                    business_type: { type: "string" },
                    address: { type: "string" },
                    city: { type: "string" },
                    state: { type: "string" },
                    zip: { type: "string" },
                    phone: { type: "string" },
                    website: { type: "string" },
                    email: { type: "string" },
                    license_number: { type: "string" },
                    search_term_matched: { type: "string" },
                    source_url: { type: "string" }
                  }
                }
              },
              registry_source: { type: "string" }
            }
          }
        });

        if (result?.companies) {
          for (const co of result.companies) {
            if (!co.company_name) continue;
            const nameKey = co.company_name.toLowerCase().trim();
            if (existingNames.has(nameKey)) continue;
            existingNames.add(nameKey);

            const matchedTerm = (co.search_term_matched || "epoxy").toLowerCase();
            const specialty = SPECIALTY_MAP[matchedTerm] || "Epoxy";
            const priority = calculatePriority(co.formation_date);
            const years = calculateYears(co.formation_date);

            const record = {
              company_name: co.company_name,
              dba_name: co.dba_name || "",
              owner_name: co.owner_name || "",
              phone: co.phone || "",
              email: co.email || "",
              website: co.website || "",
              address: co.address || "",
              city: co.city || "",
              state: co.state || state,
              zip: co.zip || "",
              specialty: specialty,
              business_type: ["LLC", "Corp", "Sole Prop", "Partnership", "LP", "LLP"].includes(co.business_type) ? co.business_type : "LLC",
              formation_date: co.formation_date || "",
              years_in_business: years,
              license_number: co.license_number || "",
              source: "State Registry",
              source_url: co.source_url || result.registry_source || "",
              source_state_registry: `${state} Secretary of State`,
              search_term_matched: co.search_term_matched || matchedTerm,
              cold_call_priority: priority,
              cold_call_status: "Not Contacted",
              enriched: false,
              call_count: 0,
              deal_value: 0,
            };

            stateFinds.push(record);
            allResults.push(record);
          }
        }
      } catch (err) {
        console.error(`Error scraping ${state}:`, err.message);
      }

      stateResults[state] = stateFinds.length;
    }

    // Bulk create all found companies
    if (allResults.length > 0) {
      const batches = [];
      for (let i = 0; i < allResults.length; i += 25) {
        batches.push(allResults.slice(i, i + 25));
      }
      for (const batch of batches) {
        await base44.asServiceRole.entities.ProspectCompany.bulkCreate(batch).catch(err => {
          console.error("Bulk create error:", err.message);
        });
      }
    }

    return Response.json({
      success: true,
      total_found: allResults.length,
      by_state: stateResults,
      states_searched: targetStates,
      new_companies: allResults.map(r => ({
        name: r.company_name,
        state: r.state,
        specialty: r.specialty,
        priority: r.cold_call_priority,
        years: r.years_in_business,
        formation_date: r.formation_date,
      })),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});