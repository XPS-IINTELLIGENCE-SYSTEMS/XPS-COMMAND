import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Support both user-triggered and scheduled automation calls
    let isAuthed = false;
    try { const user = await base44.auth.me(); isAuthed = !!user; } catch {}

    const body = await req.json().catch(() => ({}));
    const count = Math.min(body.count || 10, 25);

    // JOBS PIPELINE — End-Buyer / Project Leads
    // These are facilities, property managers, investors, etc. who NEED flooring work done
    // XPS either does the work directly or refers to a contractor partner

    const scrapeResult = await base44.integrations.Core.InvokeLLM({
      prompt: `You are the XPS Xtreme Polishing Systems lead generation engine for the JOBS PIPELINE.
This pipeline finds END BUYERS — businesses and property owners who NEED epoxy/polished concrete flooring work done.
These are NOT contractors. These are the CUSTOMERS who hire contractors.

TARGET GEOGRAPHY: Arizona — Phoenix metro, Tempe outward. Also consider nearby markets.

## END BUYER CATEGORIES (ranked by priority):

HIGH PRIORITY:
1. Property management companies — commercial and multifamily property managers needing floor upgrades, common-area durability, turnover solutions
   Sources: BOMA, IFMA, chambers, local directories, Phoenix Business Journal
   Lead angle: maintenance savings, appearance, tenant-turn speed

2. Real estate investors/operators — commercial investors, light industrial owners, multifamily investors doing repositioning
   Sources: CREXi, LoopNet, investor groups, chambers, NAIOP
   Lead angle: asset value, durability, speed-to-market

3. Warehouse/logistics operators — warehouse owners, 3PLs needing heavy-duty coatings, safety, maintenance reduction
   Sources: Maps, industrial directories, Phoenix Business Journal, NAIOP
   Lead angle: uptime, safety, cleanability, longevity

4. Manufacturing plants — plant operators needing chemical resistance, safety, durable floor systems
   Sources: Maps, industrial directories, Arizona Commerce Authority, business journals
   Lead angle: compliance, durability, reduced maintenance

5. Automotive dealerships and service — showroom/service bay floors, chemical resistance, branding aesthetics
   Sources: Maps, dealer directories, official websites
   Lead angle: durable attractive systems for service and retail-facing areas

6. Food processing and kitchens — urethane cement, sanitation, slip resistance, washdown performance
   Sources: Maps, directories, official sites, procurement portals
   Lead angle: hygiene, slip resistance, lifecycle value

MEDIUM PRIORITY:
7. Retail buildouts — retail operators, franchisees, fit-out teams needing fast-turn decorative/durable floors
   Sources: Business journals, GCs, TI firms, Procore, Blue Book
   Lead angle: opening timeline, visual impact, low downtime

8. Schools/universities — facilities teams needing durable, low-maintenance, safe floors
   Sources: IFMA, procurement portals, school facilities pages
   Lead angle: lifecycle value, maintenance reduction

9. Hospitals/healthcare — facilities teams needing hygienic, durable floor systems
   Sources: IFMA, procurement portals, healthcare facility pages
   Lead angle: hygiene, durability, reduced disruption

10. Homeowners — garage floors, interior metallic/flake epoxy
    Sources: Home shows, social media, Nextdoor, Facebook groups
    Lead angle: Start high then negotiate down, largest company in US

## SEARCH SEEDS:
- "warehouse floor coating phoenix"
- "property management flooring arizona"
- "commercial floor repair mesa"
- "automotive dealership remodel phoenix"
- "food processing facility arizona"
- "industrial space for lease tempe"
- "retail buildout phoenix"
- "school floor renovation arizona"
- "garage floor epoxy homeowner phoenix"

## EXCLUSION RULES:
- DO NOT return other flooring CONTRACTORS — those go in XPress pipeline
- Focus on businesses that NEED floors done, not businesses that DO floors
- Prefer facilities showing signs of wear, expansion, renovation, or new construction
- Prefer Arizona businesses but include nearby if strong signal

Find ${count} real end-buyer prospects in Arizona matching these categories.

For EACH lead provide:
- company: Facility/business name
- contact_name: Decision maker (Facility Manager, Property Manager, Owner, VP Operations, GM)
- email: Business email
- phone: Business phone
- website: Company website
- city: City
- state: State
- zip: ZIP
- vertical: Best match from [Retail, Food & Bev, Warehouse, Automotive, Healthcare, Fitness, Education, Industrial, Residential, Government, Other]
- square_footage: Estimated project square footage
- estimated_value: Calculated as sqft × rate (Standard $5, Industrial $7, Healthcare $12, Food $8, Metallic $10, Garage $4, Residential $6)
- buyer_type: "Property Management" | "Real Estate Investor" | "Warehouse/Logistics" | "Manufacturing" | "Automotive" | "Food Processing" | "Retail" | "Education" | "Healthcare" | "Homeowner"
- priority_level: "high" | "medium"
- pain_signal: What specific floor pain or trigger they have
- source: Which source found them
- notes: Recommended approach and offer angle`,
      add_context_from_internet: true,
      model: "gemini_3_flash",
      response_json_schema: {
        type: "object",
        properties: {
          leads: {
            type: "array",
            items: {
              type: "object",
              properties: {
                company: { type: "string" },
                contact_name: { type: "string" },
                email: { type: "string" },
                phone: { type: "string" },
                website: { type: "string" },
                city: { type: "string" },
                state: { type: "string" },
                zip: { type: "string" },
                vertical: { type: "string" },
                square_footage: { type: "number" },
                estimated_value: { type: "number" },
                buyer_type: { type: "string" },
                priority_level: { type: "string" },
                pain_signal: { type: "string" },
                source: { type: "string" },
                notes: { type: "string" }
              }
            }
          },
          total_found: { type: "number" },
          sources_checked: { type: "string" }
        }
      }
    });

    const leads = scrapeResult.leads || [];
    const created = [];

    for (const lead of leads) {
      // Jobs scoring formula — weighted for project value and pain urgency
      let score = 0;

      // Project value (25 pts max)
      const val = lead.estimated_value || 0;
      if (val >= 100000) score += 25;
      else if (val >= 50000) score += 20;
      else if (val >= 20000) score += 15;
      else if (val >= 5000) score += 10;
      else score += 5;

      // Buyer type priority (20 pts max)
      const highBuyers = ["Property Management", "Warehouse/Logistics", "Manufacturing", "Real Estate Investor", "Automotive", "Food Processing"];
      const medBuyers = ["Retail", "Education", "Healthcare"];
      if (highBuyers.includes(lead.buyer_type)) score += 20;
      else if (medBuyers.includes(lead.buyer_type)) score += 14;
      else score += 8; // Homeowner etc.

      // Pain signal strength (20 pts max)
      const pain = (lead.pain_signal || "").toLowerCase();
      if (pain.includes("damage") || pain.includes("safety") || pain.includes("violation") || pain.includes("renovation")) score += 20;
      else if (pain.includes("wear") || pain.includes("expansion") || pain.includes("new") || pain.includes("turnover")) score += 15;
      else if (pain.includes("maintenance") || pain.includes("upgrade")) score += 10;
      else score += 5;

      // Contact completeness (15 pts max)
      if (lead.contact_name && lead.email && lead.phone) score += 15;
      else if ((lead.email || lead.phone) && lead.contact_name) score += 10;
      else if (lead.email || lead.phone) score += 6;
      else score += 2;

      // Square footage (10 pts max)
      const sqft = lead.square_footage || 0;
      if (sqft >= 10000) score += 10;
      else if (sqft >= 5000) score += 8;
      else if (sqft >= 1000) score += 5;
      else score += 3;

      // Vertical fit (10 pts max)
      const topVerts = ["Warehouse", "Industrial", "Food & Bev", "Healthcare", "Automotive"];
      if (topVerts.includes(lead.vertical)) score += 10;
      else score += 5;

      const finalScore = Math.min(score, 100);
      const priority = lead.priority_level === "high" ? 8 : 5;

      const record = await base44.asServiceRole.entities.Lead.create({
        company: lead.company || "Unknown",
        contact_name: lead.contact_name || "",
        email: lead.email || "",
        phone: lead.phone || "",
        website: lead.website || "",
        vertical: lead.vertical || "Other",
        city: lead.city || "",
        state: lead.state || "AZ",
        zip: lead.zip || "",
        location: `${lead.city || ""}, ${lead.state || "AZ"}`,
        square_footage: lead.square_footage || 0,
        estimated_value: lead.estimated_value || 0,
        score: finalScore,
        priority: priority,
        lead_type: "Jobs",
        stage: "Incoming",
        pipeline_status: "Incoming",
        ingestion_source: "Scraper",
        source: `${lead.source || "AI Search"} | ${lead.buyer_type || "End Buyer"}`,
        ai_insight: `[${lead.buyer_type || "End Buyer"}] [${lead.priority_level || "medium"}] Pain: ${lead.pain_signal || "Unknown"}`,
        ai_recommendation: lead.notes || "",
        notes: `Jobs scraper | ${lead.buyer_type || "End Buyer"} | ${new Date().toISOString().split("T")[0]}`
      });
      created.push({ id: record.id, company: lead.company, score: finalScore, buyer_type: lead.buyer_type, value: lead.estimated_value });
    }

    return Response.json({
      success: true,
      pipeline: "Jobs",
      leads_created: created.length,
      leads: created.sort((a, b) => b.score - a.score),
      sources_checked: scrapeResult.sources_checked || "Maps, BOMA, IFMA, Chambers, Directories, Business Journals"
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});