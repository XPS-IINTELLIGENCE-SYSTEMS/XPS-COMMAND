import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const {
      location = "Arizona",
      industry = "Epoxy, Polished Concrete, Decorative Concrete",
      keywords = "epoxy companies, polished concrete, decorative concrete",
      count = 15,
      max_years = 10,
      sources = "Google Maps, Yelp, State Business Registry",
      urls = ""
    } = body;

    const targetCount = Math.min(count, 50);

    const scrapeResult = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a lead generation specialist for XPS Xtreme Polishing Systems (xtremepolishingsystems.com), a nationwide epoxy/polished concrete flooring company.

MISSION: Find ${targetCount} real companies in ${location} that are in the ${industry} industry.

SEARCH METHODOLOGY — Check these sources IN ORDER:
1. GOOGLE MAPS: Search for "${keywords}" in ${location}. Find real businesses with ratings, reviews, addresses, and phone numbers.
2. YELP: Search Yelp for "${keywords}" in ${location}. Cross-reference with Google Maps results.
3. STATE BUSINESS REGISTRY: Check Arizona Corporation Commission (or equivalent) for registered businesses matching these keywords.
${urls ? `4. CUSTOM URLS: Also check these specific URLs for leads: ${urls}` : ''}

FILTERS:
- Companies must be ${max_years} years old or younger (founded ${new Date().getFullYear() - max_years} or later)
- Must be currently open/active businesses
- Must be located in ${location}

For EACH company provide:
- company: Exact business name as registered
- contact_name: Owner or manager name if findable
- email: Business email if discoverable
- phone: Business phone number
- website: Company website URL
- vertical: Best match from [Retail, Food & Bev, Warehouse, Automotive, Healthcare, Fitness, Education, Industrial, Residential, Government, Other]
- city: City name
- state: State abbreviation
- zip: ZIP code
- location: Full "City, State" format
- employee_count: Estimated employee count
- existing_material: What flooring/coating materials they currently use or sell (research their website/reviews)
- equipment_used: What equipment they use if determinable
- square_footage: Estimated facility square footage
- estimated_value: Potential deal value (sqft × rate: Standard $5, Industrial $7, Healthcare $12, Food $8)
- years_in_business: How many years they've been operating
- source: Which source found them (Google Maps, Yelp, State Registry)
- notes: Why they're a good prospect for XPS products
- score_hint: Estimated quality 1-100 based on size, activity, and fit

CRITICAL: Return REAL businesses only. Include their actual phone numbers, addresses, and websites from Google Maps/Yelp listings.`,
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
                vertical: { type: "string" },
                city: { type: "string" },
                state: { type: "string" },
                zip: { type: "string" },
                location: { type: "string" },
                employee_count: { type: "number" },
                existing_material: { type: "string" },
                equipment_used: { type: "string" },
                square_footage: { type: "number" },
                estimated_value: { type: "number" },
                years_in_business: { type: "number" },
                source: { type: "string" },
                notes: { type: "string" },
                score_hint: { type: "number" }
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
      // Score calculation
      let score = lead.score_hint || 0;
      if (!score) {
        score = 30; // base
        if (lead.phone) score += 10;
        if (lead.email) score += 10;
        if (lead.website) score += 5;
        if ((lead.estimated_value || 0) > 50000) score += 15;
        if ((lead.employee_count || 0) > 10) score += 10;
        if ((lead.years_in_business || 0) <= 5) score += 10; // newer = hungrier
      }
      score = Math.min(score, 100);

      const record = await base44.entities.Lead.create({
        company: lead.company || "Unknown",
        contact_name: lead.contact_name || "",
        email: lead.email || "",
        phone: lead.phone || "",
        website: lead.website || "",
        vertical: lead.vertical || "Other",
        city: lead.city || "",
        state: lead.state || "",
        zip: lead.zip || "",
        location: lead.location || location,
        employee_count: lead.employee_count || 0,
        existing_material: lead.existing_material || "",
        equipment_used: lead.equipment_used || "",
        square_footage: lead.square_footage || 0,
        estimated_value: lead.estimated_value || 0,
        years_in_business: lead.years_in_business || 0,
        score: score,
        priority: 0,
        stage: "Incoming",
        pipeline_status: "Incoming",
        ingestion_source: "Scraper",
        source: `${lead.source || sources} | ${location}`,
        ai_insight: lead.notes || "",
        notes: `Auto-scraped from ${lead.source || "AI Search"} on ${new Date().toISOString().split("T")[0]}`
      });
      created.push({ id: record.id, company: lead.company, score });
    }

    return Response.json({
      success: true,
      leads_created: created.length,
      leads: created,
      sources_checked: scrapeResult.sources_checked || sources
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});