import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, scope_id, file_url } = await req.json().catch(() => ({}));
    const GROQ_KEY = Deno.env.get("GROQ_API_KEY");

    if (action === "process_scope") {
      if (!scope_id) return Response.json({ error: "scope_id required" }, { status: 400 });

      const scope = await base44.asServiceRole.entities.FloorScope.filter({ id: scope_id });
      if (!scope.length) return Response.json({ error: "Scope not found" }, { status: 404 });
      const s = scope[0];

      // If there's a document, extract data from it
      let extractedText = s.notes || "";
      if (s.raw_scope_document) {
        const extraction = await base44.asServiceRole.integrations.Core.ExtractDataFromUploadedFile({
          file_url: s.raw_scope_document,
          json_schema: {
            type: "object",
            properties: {
              zones: { type: "array", items: { type: "object", properties: { name: { type: "string" }, sqft: { type: "number" }, system_type: { type: "string" } } } },
              total_sqft: { type: "number" },
              special_requirements: { type: "array", items: { type: "string" } },
              bid_due_date: { type: "string" },
              project_name: { type: "string" }
            }
          }
        }).catch(() => null);

        if (extraction?.output) {
          const data = extraction.output;
          await base44.asServiceRole.entities.FloorScope.update(s.id, {
            extracted_zones: JSON.stringify(data.zones || []),
            total_flooring_sqft: data.total_sqft || 0,
            special_requirements: JSON.stringify(data.special_requirements || []),
            takeoff_status: "complete",
          });
          return Response.json({ success: true, extracted: data });
        }
      }

      return Response.json({ success: true, message: "No document to process" });
    }

    if (action === "ai_takeoff") {
      if (!scope_id) return Response.json({ error: "scope_id required" }, { status: 400 });

      const scopes = await base44.asServiceRole.entities.FloorScope.filter({ id: scope_id });
      if (!scopes.length) return Response.json({ error: "Scope not found" }, { status: 404 });
      const s = scopes[0];

      let zones = [];
      try { zones = JSON.parse(s.extracted_zones || "[]"); } catch {}

      if (zones.length === 0) {
        return Response.json({ error: "No zones extracted yet. Run process_scope first." }, { status: 400 });
      }

      // AI calculates takeoff for each zone
      const prompt = `You are an expert flooring estimator for XPS (Xtreme Polishing Systems). Calculate a detailed takeoff for this project.

Project: ${s.project_name}
Location: ${s.project_city}, ${s.project_state}
Type: ${s.project_type}

Zones:
${zones.map(z => `- ${z.name}: ${z.sqft} sqft, System: ${z.system_type || "standard epoxy"}`).join("\n")}

Special requirements: ${s.special_requirements || "none"}

For EACH zone calculate:
- Surface prep cost (diamond grinding $0.50-1.50/sqft based on condition)
- Primer: gallons needed (spread rate ~300 sqft/gal), cost at $45-65/gal
- Base coat: gallons (spread rate ~160 sqft/gal at 8-10 mil), cost at $55-85/gal
- Broadcast/flake if applicable: lbs at 5-8 lbs per 100 sqft, cost $2-4/lb
- Topcoat: gallons (spread rate ~300 sqft/gal), cost at $60-90/gal
- Cove base: if required, $8-15/LF
- Moisture mitigation: if required, $1.50-3.00/sqft
- Labor: $2-5/sqft depending on system complexity
- Equipment: $0.25-0.75/sqft

Then calculate totals: material, labor, equipment, mobilization (based on distance), overhead at 15%, profit at 12%.

Return ONLY valid JSON:
{
  "zones": [{"name":"...","sqft":0,"system":"...","material_cost":0,"labor_cost":0,"equipment_cost":0,"subtotal":0}],
  "totals": {"material":0,"labor":0,"equipment":0,"mobilization":0,"overhead":0,"profit":0,"total":0,"price_per_sqft":0,"gross_margin_pct":0}
}`;

      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1,
          max_tokens: 4000,
        }),
      });

      const groqData = await groqRes.json();
      const content = groqData.choices?.[0]?.message?.content || "";
      
      let takeoff;
      try {
        const match = content.match(/\{[\s\S]*\}/);
        takeoff = JSON.parse(match[0]);
      } catch {
        return Response.json({ error: "Failed to parse takeoff", raw: content }, { status: 500 });
      }

      const totals = takeoff.totals || {};
      await base44.asServiceRole.entities.FloorScope.update(s.id, {
        takeoff_data: JSON.stringify(takeoff),
        takeoff_status: "complete",
        material_cost: totals.material || 0,
        labor_cost: totals.labor || 0,
        equipment_cost: totals.equipment || 0,
        mobilization_cost: totals.mobilization || 0,
        overhead_profit: (totals.overhead || 0) + (totals.profit || 0),
        total_bid_price: totals.total || 0,
        price_per_sqft: totals.price_per_sqft || 0,
        gross_margin_pct: totals.gross_margin_pct || 0,
        bid_status: "takeoff_complete",
      });

      return Response.json({ success: true, takeoff });
    }

    return Response.json({ error: "Invalid action. Use 'process_scope' or 'ai_takeoff'" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});