import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Support both user-triggered and scheduled automation calls
    let isAuthed = false;
    try { const user = await base44.auth.me(); isAuthed = !!user; } catch {}

    const body = await req.json().catch(() => ({}));
    const count = Math.min(body.count || 10, 25);

    // XPS XPRESS PIPELINE — Contractor/Operator Sales Leads
    // ICP: Future epoxy operators, new businesses, adjacent trades, training seekers, equipment buyers
    // Geography: Arizona, Tempe-outward
    // Sources: AZCC eCorp, Tempe biz license, ROC, Google Maps, LinkedIn, Indeed, official websites
    // Freshness: 0-12 months preferred, max 24 months with signals

    const scrapeResult = await base44.integrations.Core.InvokeLLM({
      prompt: `You are the XPS Xtreme Polishing Systems lead generation engine for the XPRESS PIPELINE.
This pipeline finds CONTRACTORS and OPERATORS to SELL XPS products, equipment, and training to.
These are NOT end-buyer job leads. These are people who APPLY coatings — we sell THEM supplies.

TARGET GEOGRAPHY: Arizona — prioritize Tempe, Mesa, Chandler, Gilbert, Scottsdale, Phoenix metro outward.

## WHO WE'RE LOOKING FOR (ICP — ranked by priority):

TIER 1 (highest priority):
- Future epoxy operators: Painters, flooring techs, concrete workers, restorers, GC subs wanting higher-margin business
- New businesses: Fresh Arizona LLCs, newly visible contractors (0-12 months), low Google review count
- Adjacent trades adding coatings: Painters adding epoxy, flooring contractors adding polished concrete, restoration firms
- Training seekers: People searching for epoxy training, certification, startup help

TIER 2:
- Supplier-switch candidates: Contractors unhappy with current manufacturer (complaints, supply issues)
- Equipment buyers: Searching for grinders, vacs, tooling, starter packages
- Career switchers: Skilled workers wanting owner-operator independence

TIER 3 (deprioritize):
- Contractors needing work (useful but screen quality)
- Established firms with no expansion signals

## SOURCES TO CHECK (in order):
1. Arizona Corporation Commission eCorp (https://ecorp.azcc.gov) — new LLC filings for contractor/coatings/flooring/paint/restoration entities
2. Arizona ROC contractor search (https://roc.az.gov) — licensed painters, flooring, concrete, restoration contractors
3. Google Maps — low-review profiles for: "epoxy flooring Tempe", "garage floor coating Phoenix", "decorative concrete Mesa", "polished concrete Chandler", "concrete contractor Gilbert"
4. Official websites — service pages confirming coatings/concrete/polishing services
5. Indeed/LinkedIn — hiring for epoxy technician, floor coating installer, concrete polishing in Phoenix metro
6. Tempe Chamber, Phoenix Chamber, BNI Arizona — member directories for contractors
7. Yelp/BBB/Houzz — secondary validation for newer operators

## SEARCH SEEDS (use these exact queries):
- "how to start epoxy flooring business arizona"
- "concrete polishing training phoenix"
- "painter adding epoxy service phoenix"
- "flooring contractor polished concrete arizona"
- "epoxy technician hiring phoenix"
- "new LLC contractor arizona"
- "coatings company phoenix az"
- "garage floor coating tempe"
- "decorative concrete phoenix"
- "concrete repair arizona"

## EXCLUSION RULES:
- DO NOT return companies older than 10 years UNLESS they show recent expansion signals (new services, hiring, new equipment)
- DO NOT return large national chains or franchise headquarters
- DO NOT return end-user facilities (warehouses, hospitals, schools) — those go in the JOBS pipeline
- DO NOT return companies outside Arizona
- Prefer businesses with FEWER than 15 employees

Find ${count} real Arizona contractors/operators matching these criteria.

For EACH lead provide:
- company: Exact business name
- contact_name: Owner or key person (NOT "Sales Dept" or "Manager" — find the actual name)
- email: Real business email
- phone: Business phone
- website: Company website
- city: City
- state: "AZ"
- zip: ZIP code
- employee_count: Estimated employees
- existing_material: What coatings/materials they currently use or sell
- equipment_used: What equipment they use (grinders, etc.)
- years_in_business: How old the business is
- source: Which source found them (AZCC, ROC, Maps, Indeed, etc.)
- icp_tier: 1, 2, or 3
- icp_type: "Future Operator" | "New Business" | "Adjacent Trade" | "Training Seeker" | "Supplier Switch" | "Equipment Buyer" | "Career Switch"
- signals: What specific signals make them a good XPS prospect
- notes: Why XPS should contact them and what to offer`,
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
                employee_count: { type: "number" },
                existing_material: { type: "string" },
                equipment_used: { type: "string" },
                years_in_business: { type: "number" },
                source: { type: "string" },
                icp_tier: { type: "number" },
                icp_type: { type: "string" },
                signals: { type: "string" },
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
      // XPress scoring formula — weighted for contractor/operator fit
      let score = 0;

      // ICP Tier (30 pts max)
      const tier = lead.icp_tier || 3;
      if (tier === 1) score += 30;
      else if (tier === 2) score += 20;
      else score += 8;

      // Recency / freshness (20 pts max)
      const yrs = lead.years_in_business || 99;
      if (yrs <= 1) score += 20;
      else if (yrs <= 3) score += 16;
      else if (yrs <= 5) score += 12;
      else if (yrs <= 10) score += 6;
      else score += 2;

      // Contact completeness (15 pts max)
      if (lead.contact_name && lead.email && lead.phone) score += 15;
      else if ((lead.email || lead.phone) && lead.contact_name) score += 10;
      else if (lead.email || lead.phone) score += 6;
      else score += 2;

      // Size fit — smaller is better for XPress (15 pts max)
      const emp = lead.employee_count || 0;
      if (emp >= 1 && emp <= 5) score += 15;
      else if (emp <= 10) score += 12;
      else if (emp <= 15) score += 8;
      else score += 4;

      // Signal strength (10 pts max)
      const sigs = (lead.signals || "").toLowerCase();
      if (sigs.includes("new") || sigs.includes("startup") || sigs.includes("hiring") || sigs.includes("training")) score += 10;
      else if (sigs.includes("expansion") || sigs.includes("adding") || sigs.includes("switch")) score += 8;
      else score += 4;

      // Website presence (10 pts max)
      if (lead.website) score += 10;
      else score += 3;

      const finalScore = Math.min(score, 100);

      // Priority based on tier
      const priority = tier === 1 ? 9 : tier === 2 ? 6 : 3;

      const record = await base44.asServiceRole.entities.Lead.create({
        company: lead.company || "Unknown",
        contact_name: lead.contact_name || "",
        email: lead.email || "",
        phone: lead.phone || "",
        website: lead.website || "",
        vertical: lead.icp_type || "Other",
        city: lead.city || "",
        state: lead.state || "AZ",
        zip: lead.zip || "",
        location: `${lead.city || ""}, ${lead.state || "AZ"}`,
        employee_count: lead.employee_count || 0,
        existing_material: lead.existing_material || "",
        equipment_used: lead.equipment_used || "",
        years_in_business: lead.years_in_business || 0,
        score: finalScore,
        priority: priority,
        lead_type: "XPress",
        stage: "Incoming",
        pipeline_status: "Incoming",
        ingestion_source: "Scraper",
        source: `${lead.source || "AI Search"} | ICP: ${lead.icp_type || "Unknown"}`,
        ai_insight: `[Tier ${tier}] [${lead.icp_type || "Unknown"}] ${lead.signals || ""}`,
        ai_recommendation: lead.notes || "",
        notes: `XPress scraper | ${lead.source || "AI"} | ${new Date().toISOString().split("T")[0]}`
      });
      created.push({ id: record.id, company: lead.company, score: finalScore, tier, type: lead.icp_type });
    }

    return Response.json({
      success: true,
      pipeline: "XPress",
      leads_created: created.length,
      leads: created.sort((a, b) => b.score - a.score),
      sources_checked: scrapeResult.sources_checked || "AZCC, ROC, Maps, Indeed, LinkedIn, Chambers"
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});