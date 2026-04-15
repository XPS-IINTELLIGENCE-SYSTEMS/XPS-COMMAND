import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Support both user-triggered and scheduled automation calls
    let isAuthed = false;
    try { const user = await base44.auth.me(); isAuthed = !!user; } catch {}

    const { location, industry, keywords, count, vertical, signal_type } = await req.json().catch(() => ({}));

    if (!location) {
      return Response.json({ error: 'location is required (city, state or zip)', hint: 'Pass {location: "Phoenix, AZ"} or similar' }, { status: 400 });
    }

    const targetCount = Math.min(count || 25, 50);
    const targetVertical = vertical || 'All';
    const signals = signal_type || 'all';

    const scrapeResult = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an elite B2B commercial intelligence analyst for XPS Xtreme Polishing Systems, a nationwide epoxy/polished concrete flooring contractor.

YOUR MISSION: Find EXACTLY ${targetCount} HIGH-INTENT COMMERCIAL PROSPECTS in ${location} using BUYING SIGNALS.

CRITICAL: You MUST return EXACTLY ${targetCount} leads. Not fewer, not more. If you cannot find ${targetCount} leads from buying signals alone, supplement with high-quality directory matches, nearby cities, and related industries until you reach exactly ${targetCount}.

${signals === 'all' || signals === 'permits' ? `
## SIGNAL 1: CONSTRUCTION PERMITS & NEW BUILDS
Search for recent construction permits, new building permits, tenant improvement permits, and commercial renovation permits in ${location}. These indicate active construction where flooring will be needed.
` : ''}

${signals === 'all' || signals === 'filings' ? `
## SIGNAL 2: NEW BUSINESS FILINGS & EXPANSIONS
Search for newly registered businesses, new LLC filings, franchise openings, and business expansions in ${location}. New businesses need new floors.
` : ''}

${signals === 'all' || signals === 'real_estate' ? `
## SIGNAL 3: COMMERCIAL REAL ESTATE & LEASES
Search for commercial properties recently sold, leased, or under renovation in ${location}. Property transitions often trigger flooring work.
` : ''}

${signals === 'all' || signals === 'facilities' ? `
## SIGNAL 4: FACILITY UPGRADES & COMPLAINTS
Search for businesses with aging facilities, floor damage complaints in reviews, health code violations related to flooring, or planned renovations.
` : ''}

Target industry: ${industry || 'commercial, industrial, retail, food & bev, healthcare, automotive, warehouse'}
Target vertical: ${targetVertical}
${keywords ? `Additional keywords: ${keywords}` : ''}

For EACH of the EXACTLY ${targetCount} prospects, provide:
- company: Real business name (MUST be a real, verifiable business)
- contact_name: Decision maker (Facility Manager, Owner, GM, VP Operations, Property Manager, General Contractor)
- email: Email if discoverable (leave empty string if unknown, NEVER use generic "info@" unless real)
- phone: Phone number if findable
- vertical: Best match from [Retail, Food & Bev, Warehouse, Automotive, Healthcare, Fitness, Education, Industrial, Residential, Government, Other]
- location: Full address or city, state
- square_footage: Estimated square footage based on business type (warehouse 20K-100K, restaurant 2K-5K, retail 3K-15K, gym 5K-20K)
- estimated_value: Calculated as sqft × per-sqft rate: Standard $5, Industrial $7, Healthcare $12, Food $8, Metallic $10, Garage $4
- source: SPECIFIC source (e.g. "Building Permit #2024-1234", "New LLC Filing", "LoopNet Listing", "Google Review")
- notes: WHY this is a hot prospect — what buying signal triggered this
- signal_type: Which signal category (Permit, New Filing, Real Estate, Facility Issue, Expansion, Directory)
- urgency: Rate 1-5 how time-sensitive (5 = construction underway, 1 = someday maybe)

FINAL REMINDER: Return EXACTLY ${targetCount} leads in the array. Count them. If the array has fewer than ${targetCount}, add more until it reaches ${targetCount}.`,
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
                notes: { type: "string" },
                signal_type: { type: "string" },
                urgency: { type: "number" }
              }
            }
          },
          market_summary: { type: "string" },
          signal_breakdown: {
            type: "object",
            properties: {
              permits_found: { type: "number" },
              new_filings_found: { type: "number" },
              real_estate_signals: { type: "number" },
              facility_issues: { type: "number" }
            }
          },
          total_found: { type: "number" }
        }
      }
    });

    let leads = scrapeResult.leads || [];

    // ENFORCE COUNT: If LLM returned fewer, make a supplemental call
    if (leads.length < targetCount) {
      const deficit = targetCount - leads.length;
      const existingNames = leads.map(l => l.company).join(", ");

      const supplementResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Find EXACTLY ${deficit} more commercial business prospects in ${location} for flooring services.
Industry: ${industry || 'commercial'}. Vertical: ${targetVertical}.
DO NOT repeat any of these companies: ${existingNames}
Return exactly ${deficit} NEW prospects with: company, contact_name, email, phone, vertical, location, square_footage, estimated_value, source, notes, signal_type, urgency.`,
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
                  notes: { type: "string" },
                  signal_type: { type: "string" },
                  urgency: { type: "number" }
                }
              }
            }
          }
        }
      });

      if (supplementResult.leads) {
        leads = [...leads, ...supplementResult.leads];
      }
    }

    // Trim to exact count if somehow over
    leads = leads.slice(0, targetCount);

    const createdLeads = [];

    for (const lead of leads) {
      let score = 0;

      // Deal size scoring (25%)
      const val = lead.estimated_value || 0;
      if (val >= 200000) score += 25;
      else if (val >= 50000) score += 20;
      else if (val >= 10000) score += 15;
      else score += 5;

      // Buying signal strength (30%)
      const sig = (lead.signal_type || '').toLowerCase();
      if (sig.includes('permit')) score += 30;
      else if (sig.includes('filing') || sig.includes('new')) score += 25;
      else if (sig.includes('real estate') || sig.includes('lease')) score += 22;
      else if (sig.includes('facility') || sig.includes('issue')) score += 20;
      else score += 8;

      // Urgency (15%)
      const urg = lead.urgency || 1;
      score += Math.min(urg * 3, 15);

      // Contact quality (15%)
      if (lead.email && lead.phone && lead.contact_name) score += 15;
      else if (lead.email || lead.phone) score += 10;
      else if (lead.contact_name) score += 5;

      // Vertical fit (15%)
      const highValue = ['Warehouse', 'Industrial', 'Healthcare', 'Food & Bev'];
      const midValue = ['Retail', 'Automotive', 'Education', 'Fitness'];
      if (highValue.includes(lead.vertical)) score += 15;
      else if (midValue.includes(lead.vertical)) score += 10;
      else score += 5;

      const finalScore = Math.min(score, 100);

      // Parse city/state from location
      const locParts = (lead.location || location || "").split(",").map(s => s.trim());
      const leadCity = locParts[0] || "";
      const leadState = locParts[1] || "";

      const created = await base44.entities.Lead.create({
        company: lead.company || "Unknown",
        contact_name: lead.contact_name || "",
        email: lead.email || "",
        phone: lead.phone || "",
        vertical: lead.vertical || "Other",
        location: lead.location || location,
        city: leadCity,
        state: leadState,
        square_footage: lead.square_footage || 0,
        estimated_value: lead.estimated_value || 0,
        score: finalScore,
        stage: "Incoming",
        pipeline_status: "Incoming",
        lead_type: "XPress",
        ingestion_source: "Scraper",
        source: `Signal: ${lead.signal_type || 'Web'} | ${lead.source || 'AI Search'}`,
        ai_insight: `[Signal: ${lead.signal_type || 'General'}] [Urgency: ${lead.urgency || '?'}/5] ${lead.notes || ''}`,
        notes: `Buying signal: ${lead.source || 'N/A'}. ${lead.notes || ''}`
      });
      createdLeads.push({
        id: created.id,
        company: lead.company,
        score: finalScore,
        value: lead.estimated_value,
        signal: lead.signal_type,
        urgency: lead.urgency,
        source: lead.source
      });
    }

    return Response.json({
      success: true,
      total_found: leads.length,
      leads_created: createdLeads.length,
      leads: createdLeads.sort((a, b) => b.score - a.score),
      market_summary: scrapeResult.market_summary || `Found ${leads.length} signal-based leads in ${location}`,
      signal_breakdown: scrapeResult.signal_breakdown || {},
      total_pipeline_value: createdLeads.reduce((sum, l) => sum + (l.value || 0), 0)
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});