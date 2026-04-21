import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { gc_name } = await req.json().catch(() => ({}));
    const recipientName = gc_name || "Preconstruction Team";

    // Generate a comprehensive branded company package using AI
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Generate a comprehensive, professional company introduction package for Xtreme Polishing Systems (XPS) and National Concrete Polishing (NCP) to send to general contractors requesting bid list placement.

COMPANY INFORMATION:
- Xtreme Polishing Systems (XPS) — America's #1 commercial & industrial flooring solutions provider
- National Concrete Polishing (NCP) — Professional installation division
- XPS Xpress — Material supply & distribution division
- 60+ franchise/supply locations nationwide
- 200+ certified installation technicians
- Licensed, bonded, and insured in all 50 states
- OSHA 30 certified crews
- $50M+ liability insurance coverage
- 15+ years in business
- Completed 10,000+ commercial projects

FLOORING SYSTEMS WE SPECIALIZE IN:
1. Epoxy Floor Coatings — Industrial, commercial, decorative (100% solids, water-based, UV-stable)
2. Polished Concrete — Mechanical grinding & densifying to 3,000+ grit mirror finish
3. Decorative Concrete — Stained, stamped, engraved, metallic epoxy
4. Urethane Cement — Food-safe, chemical resistant, thermal shock rated (USDA/FDA compliant)
5. Polyaspartic Coatings — Fast-cure, UV-stable, high-performance
6. Polyurea Coatings — Extremely durable, flexible, chemical resistant
7. Industrial Floor Coatings — Heavy-duty systems for warehouses, manufacturing, aerospace
8. Concrete Repair & Resurfacing — Crack repair, leveling, moisture mitigation
9. Moisture Mitigation — Vapor barriers, moisture testing per ASTM F2170
10. Joint Filling — Polyurea joint fill, epoxy joint fill, semi-rigid systems
11. Shot Blasting & Surface Prep — Diamond grinding, shot blasting, scarifying

VERTICAL MARKETS:
- Warehouses & Distribution Centers
- Food & Beverage / Restaurant Kitchens (USDA compliant)
- Healthcare / Hospitals / Cleanrooms
- Retail & Showrooms
- Automotive Service & Dealerships
- Data Centers
- Government / Federal / Military (SAM.gov registered)
- Education / Universities
- Hotels & Hospitality
- Manufacturing & Industrial
- Airport & Transportation
- Parking Garages

COMPETITIVE ADVANTAGES:
- Nationwide coverage — crews deploy anywhere in the US
- AI-assisted estimating — 24-48 hour bid turnaround
- Material manufacturer & installer — vertical integration = lower costs
- 60+ supply locations = material availability guaranteed
- Dedicated preconstruction support for spec review & value engineering
- Warranty: 5-year standard, extended options available
- Safety: OSHA 30, confined space certified, forklift certified
- Technology: 3D scanning, drone surveys, AI takeoffs
- References: Available for every project type and vertical

CONTACT INFORMATION:
- Estimating: bids@nationalconcretepolishing.com
- Sales: info@xtremepolishingsystems.com
- Phone: (888) XPS-COAT
- Websites: xtremepolishingsystems.com | nationalconcretepolishing.com | shopxps.com
- BuildingConnected: Active profile — search "National Concrete Polishing"

Generate the FULL email package in this JSON structure:
1. email_subject — Professional subject line for bid list request
2. email_body — Full HTML-formatted email body (professional, branded, comprehensive but not overwhelming)
3. company_overview — 2-paragraph executive summary
4. services_list — Formatted list of all services with brief descriptions
5. credentials_section — Licenses, insurance, certifications, safety record
6. project_experience — Notable project types and volumes
7. why_choose_xps — 5-7 bullet points of key differentiators
8. cta_text — Clear call-to-action requesting bid list placement

The email should be PROFESSIONAL, BRANDED, and COMPELLING. It should position XPS/NCP as a top-tier national flooring subcontractor that any GC would want on their bid list.

Make the email body a COMPLETE standalone package — the GC should get everything they need to evaluate us in one email.`,
      model: "claude_sonnet_4_6",
      response_json_schema: {
        type: "object",
        properties: {
          email_subject: { type: "string" },
          email_body: { type: "string" },
          company_overview: { type: "string" },
          services_list: { type: "string" },
          credentials_section: { type: "string" },
          project_experience: { type: "string" },
          why_choose_xps: { type: "string" },
          cta_text: { type: "string" }
        }
      }
    });

    return Response.json({
      success: true,
      package: result,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});