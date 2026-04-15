import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const TOP_MANUFACTURERS = [
  { name: "Sherwin-Williams Industrial", url: "sherwin-williams.com" },
  { name: "Dur-A-Flex", url: "dur-a-flex.com" },
  { name: "Sika Corporation", url: "sika.com" },
  { name: "LATICRETE International", url: "laticrete.com" },
  { name: "Flowcrete", url: "flowcrete.com" },
  { name: "Rust-Oleum Professional", url: "rustoleum.com" },
  { name: "Mapei", url: "mapei.com" },
  { name: "Tremco", url: "tremcosealants.com" },
  { name: "W.R. Meadows", url: "wrmeadows.com" },
  { name: "Stonhard", url: "stonhard.com" },
  { name: "PPG Protective Coatings", url: "ppgpmc.com" },
  { name: "Carboline", url: "carboline.com" },
  { name: "Tnemec", url: "tnemec.com" },
  { name: "ArmorPoxy", url: "armorpoxy.com" },
  { name: "Elite Crete Systems", url: "elitecrete.com" },
  { name: "Prosoco", url: "prosoco.com" },
  { name: "AmeriPolish", url: "ameripolish.com" },
  { name: "Husqvarna Construction", url: "husqvarnacp.com" },
  { name: "HTC Sweden", url: "htc-sweden.com" },
  { name: "Diamatic", url: "diamatic.com" },
  { name: "Blastrac", url: "blastrac.com" },
  { name: "Euclid Chemical", url: "euclidchemical.com" },
  { name: "Quikrete", url: "quikrete.com" },
  { name: "Custom Building Products", url: "custombuildingproducts.com" },
  { name: "TEC Specialty", url: "tecspecialty.com" },
  { name: "Silikal", url: "silikal.com" },
  { name: "Altro", url: "altro.com" },
  { name: "Epoxy.com", url: "epoxy.com" },
  { name: "US Coatings", url: "uscoatings.net" },
  { name: "H.B. Fuller", url: "hbfuller.com" }
];

async function profileManufacturer(base44, mfg) {
  const prompt = `Research the company "${mfg.name}" (website: ${mfg.url}) as a manufacturer of epoxy flooring, concrete coatings, or polished concrete products.

Find and provide:
1. Company headquarters location and parent company if any
2. Their full product line related to flooring/coatings (list each product line with description)
3. Any publicly available pricing or price ranges
4. Key technical specifications for their top 3-5 flooring products
5. Their target markets and customer segments
6. Their distributor/dealer network description
7. Estimated annual revenue and employee count
8. Their market position and reputation
9. Compared to XPS (Xtreme Polishing Systems - a polished concrete, epoxy, and decorative concrete company): what are their STRENGTHS and WEAKNESSES?
10. What competitive talking points should an XPS salesperson use against this company?
11. What application guides or installation requirements do they publish?

XPS sells through two divisions:
- XPS Xpress: materials, supplies, equipment, training for contractors
- National Concrete Polishing: direct installation services for commercial projects

Return comprehensive data.`;

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    add_context_from_internet: true,
    response_json_schema: {
      type: "object",
      properties: {
        headquarters: { type: "string" },
        parent_company: { type: "string" },
        product_lines: { type: "array", items: { type: "object", properties: { name: { type: "string" }, description: { type: "string" }, category: { type: "string" } } } },
        pricing_data: { type: "object", properties: { notes: { type: "string" }, ranges: { type: "array", items: { type: "string" } } } },
        technical_specs: { type: "array", items: { type: "object", properties: { product: { type: "string" }, specs: { type: "string" } } } },
        target_markets: { type: "array", items: { type: "string" } },
        distributor_network: { type: "string" },
        annual_revenue_estimate: { type: "number" },
        employee_count: { type: "number" },
        market_position: { type: "string" },
        vs_xps_strengths: { type: "string" },
        vs_xps_weaknesses: { type: "string" },
        xps_talking_points: { type: "array", items: { type: "string" } },
        application_guides: { type: "string" },
        data_completeness: { type: "number" }
      }
    }
  });

  // Check if profile already exists
  const existing = await base44.asServiceRole.entities.ManufacturerProfile.filter(
    { company_name: mfg.name }, '-created_date', 1
  );

  const profileData = {
    company_name: mfg.name,
    website: mfg.url,
    headquarters: result.headquarters || '',
    parent_company: result.parent_company || '',
    product_lines: JSON.stringify(result.product_lines || []),
    pricing_data: JSON.stringify(result.pricing_data || {}),
    technical_specs: JSON.stringify(result.technical_specs || []),
    target_markets: JSON.stringify(result.target_markets || []),
    distributor_network: result.distributor_network || '',
    annual_revenue_estimate: result.annual_revenue_estimate || 0,
    employee_count: result.employee_count || 0,
    market_position: result.market_position || '',
    vs_xps_strengths: result.vs_xps_strengths || '',
    vs_xps_weaknesses: result.vs_xps_weaknesses || '',
    xps_talking_points: JSON.stringify(result.xps_talking_points || []),
    application_guides: result.application_guides || '',
    last_scraped: new Date().toISOString(),
    data_completeness_score: result.data_completeness || 50,
    status: 'active'
  };

  if (existing.length > 0) {
    await base44.asServiceRole.entities.ManufacturerProfile.update(existing[0].id, profileData);
    return { name: mfg.name, action: 'updated', id: existing[0].id };
  } else {
    const created = await base44.asServiceRole.entities.ManufacturerProfile.create(profileData);
    return { name: mfg.name, action: 'created', id: created.id };
  }
}

async function generateRecommendations(base44) {
  const manufacturers = await base44.asServiceRole.entities.ManufacturerProfile.list('-data_completeness_score', 50);

  const projectTypes = [
    "warehouse", "retail", "restaurant", "fitness", "healthcare",
    "industrial", "food_processing", "automotive", "brewery", "data_center"
  ];

  let created = 0;
  for (const pt of projectTypes) {
    const competitorList = manufacturers.slice(0, 5).map(m => m.company_name).join(', ');

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `For a ${pt.replace('_', ' ')} flooring project, recommend the best XPS (Xtreme Polishing Systems) product and system. Compare against these competitors: ${competitorList}.

XPS offers: industrial epoxy, polished concrete, decorative metallic epoxy, urethane cement, polyaspartic, rubber-over-epoxy, ESD epoxy, antimicrobial epoxy, and chemical-resistant coatings.

Provide: recommended XPS product, full system description, the most common competing product used in ${pt.replace('_', ' ')} facilities, why XPS is better, price comparison notes, technical justification, and 3-5 sales talking points.`,
      response_json_schema: {
        type: "object",
        properties: {
          recommended_product: { type: "string" },
          recommended_system: { type: "string" },
          environment_type: { type: "string" },
          competing_product: { type: "string" },
          competing_manufacturer: { type: "string" },
          xps_advantages: { type: "array", items: { type: "string" } },
          price_comparison: { type: "string" },
          technical_justification: { type: "string" },
          sales_talking_points: { type: "array", items: { type: "string" } },
          estimated_sqft_cost: { type: "number" }
        }
      }
    });

    try {
      await base44.asServiceRole.entities.ProductRecommendation.create({
        project_type: pt,
        environment_type: result.environment_type || 'indoor_dry',
        substrate_condition: 'unknown',
        recommended_xps_product: result.recommended_product || '',
        recommended_system: result.recommended_system || '',
        competing_product: result.competing_product || '',
        competing_manufacturer: result.competing_manufacturer || '',
        xps_advantages: JSON.stringify(result.xps_advantages || []),
        price_comparison: result.price_comparison || '',
        technical_justification: result.technical_justification || '',
        sales_talking_points: JSON.stringify(result.sales_talking_points || []),
        estimated_sqft_cost: result.estimated_sqft_cost || 0
      });
      created++;
    } catch (e) {
      console.error('Recommendation create error:', e.message);
    }
  }

  return created;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Support both user-triggered and scheduled automation calls
    let isAuthed = false;
    try { const user = await base44.auth.me(); isAuthed = !!user; } catch {}

    const body = await req.json().catch(() => ({}));
    const { action, manufacturer_name, batch_size } = body;

    // Profile a single manufacturer
    if (action === 'profile_one') {
      const mfg = TOP_MANUFACTURERS.find(m => m.name.toLowerCase().includes((manufacturer_name || '').toLowerCase()));
      if (!mfg) return Response.json({ error: 'Manufacturer not found in list' }, { status: 400 });
      const result = await profileManufacturer(base44, mfg);
      return Response.json({ success: true, result });
    }

    // Profile a batch of manufacturers
    if (action === 'profile_batch') {
      const size = batch_size || 5;
      const existing = await base44.asServiceRole.entities.ManufacturerProfile.list('-created_date', 100);
      const existingNames = new Set(existing.map(e => e.company_name.toLowerCase()));
      const toProfile = TOP_MANUFACTURERS.filter(m => !existingNames.has(m.name.toLowerCase())).slice(0, size);

      const results = [];
      for (const mfg of toProfile) {
        const result = await profileManufacturer(base44, mfg);
        results.push(result);
      }

      return Response.json({ success: true, profiled: results.length, results });
    }

    // Generate product recommendations
    if (action === 'generate_recommendations') {
      const count = await generateRecommendations(base44);
      return Response.json({ success: true, recommendations_created: count });
    }

    // Get stats
    if (action === 'stats') {
      const profiles = await base44.asServiceRole.entities.ManufacturerProfile.list('-data_completeness_score', 100);
      const recs = await base44.asServiceRole.entities.ProductRecommendation.list('-created_date', 100);
      return Response.json({
        total_profiles: profiles.length,
        total_manufacturers_in_list: TOP_MANUFACTURERS.length,
        coverage_pct: Math.round((profiles.length / TOP_MANUFACTURERS.length) * 100),
        total_recommendations: recs.length,
        profiles: profiles.map(p => ({ name: p.company_name, score: p.data_completeness_score, last_scraped: p.last_scraped }))
      });
    }

    // List all manufacturers in system
    if (action === 'list') {
      return Response.json({ manufacturers: TOP_MANUFACTURERS });
    }

    return Response.json({ error: 'Invalid action. Use: profile_one, profile_batch, generate_recommendations, stats, list' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});