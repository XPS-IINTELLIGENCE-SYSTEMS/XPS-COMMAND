import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { location, industry, keywords, count, vertical } = await req.json();

    if (!location) {
      return Response.json({ error: 'location is required (city, state or zip)' }, { status: 400 });
    }

    const targetCount = Math.min(count || 25, 50); // max 50 per batch
    const searchKeywords = keywords || 'commercial buildings, warehouses, retail stores, restaurants, hospitals, schools, fitness centers, automotive dealerships';
    const targetVertical = vertical || 'All';

    // Step 1: Find leads via AI web search
    const scrapeResult = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a B2B lead generation specialist for an epoxy and polished concrete flooring company.

FIND ${targetCount} REAL BUSINESSES in ${location} that are potential customers for flooring services.

Target industry: ${industry || 'commercial, industrial, retail, food & bev, healthcare, automotive, warehouse'}
Target vertical: ${targetVertical}
Keywords to search: ${searchKeywords}

For EACH lead, provide:
- company: Business name (REAL businesses that exist)
- contact_name: Decision maker name if findable (Facility Manager, Owner, GM, VP Operations)
- email: Email if discoverable (info@, contact@, or personal)
- phone: Phone number
- vertical: Best match from [Retail, Food & Bev, Warehouse, Automotive, Healthcare, Fitness, Education, Industrial, Residential, Government, Other]
- location: Full address or city, state
- square_footage: Estimated square footage based on business type
- estimated_value: Estimated deal value based on XPS pricing ($3-15/sqft depending on service type)
- source: How you found them (Google Maps, Yelp, Business Directory, LinkedIn, Permit Database, etc.)
- notes: Why they're a good prospect (new construction, old floors, expanding, etc.)

IMPORTANT: Prioritize businesses that are:
1. Recently opened or expanding (new floors needed)
2. In industries with high flooring turnover (food, warehouse, auto)
3. Businesses with visible floor issues in reviews (complaints about floors, cleanliness)
4. Companies that recently got building permits

Find REAL businesses with real addresses. Quality over quantity.`,
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
                vertical: { type: "string" },
                location: { type: "string" },
                square_footage: { type: "number" },
                estimated_value: { type: "number" },
                source: { type: "string" },
                notes: { type: "string" }
              }
            }
          },
          search_summary: { type: "string" },
          total_found: { type: "number" }
        }
      }
    });

    const leads = scrapeResult.leads || [];
    const createdLeads = [];

    // Step 2: Create leads in CRM with scoring
    for (const lead of leads) {
      // Calculate lead score
      let score = 0;
      // Deal size scoring (30%)
      const val = lead.estimated_value || 0;
      if (val >= 200000) score += 30;
      else if (val >= 50000) score += 25;
      else if (val >= 10000) score += 20;
      else score += 10;
      // Vertical fit (20%)
      const highValueVerticals = ['Warehouse', 'Industrial', 'Healthcare', 'Food & Bev'];
      const midValueVerticals = ['Retail', 'Automotive', 'Education', 'Fitness'];
      if (highValueVerticals.includes(lead.vertical)) score += 20;
      else if (midValueVerticals.includes(lead.vertical)) score += 15;
      else score += 8;
      // Contact quality (25%)
      if (lead.email && lead.phone && lead.contact_name) score += 25;
      else if (lead.email || lead.phone) score += 15;
      else score += 5;
      // Source quality (15%)
      if (lead.source?.includes('Permit')) score += 15;
      else if (lead.source?.includes('LinkedIn')) score += 12;
      else if (lead.source?.includes('Google')) score += 10;
      else score += 5;
      // Notes quality bonus (10%)
      if (lead.notes?.length > 50) score += 10;
      else score += 5;

      const created = await base44.entities.Lead.create({
        company: lead.company || "Unknown",
        contact_name: lead.contact_name || "Facility Manager",
        email: lead.email || "",
        phone: lead.phone || "",
        vertical: lead.vertical || "Other",
        location: lead.location || location,
        square_footage: lead.square_footage || 0,
        estimated_value: lead.estimated_value || 0,
        score: Math.min(score, 100),
        stage: "New",
        source: `AI Scraper: ${lead.source || 'Web Search'}`,
        ai_insight: lead.notes || "",
        notes: `Auto-generated from AI Lead Scraper. Search: ${location}. ${lead.notes || ''}`
      });
      createdLeads.push({ id: created.id, company: lead.company, score: Math.min(score, 100), value: lead.estimated_value });
    }

    return Response.json({
      success: true,
      total_found: leads.length,
      leads_created: createdLeads.length,
      leads: createdLeads.sort((a, b) => b.score - a.score),
      search_summary: scrapeResult.search_summary || `Found ${leads.length} leads in ${location}`,
      total_pipeline_value: createdLeads.reduce((sum, l) => sum + (l.value || 0), 0)
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});