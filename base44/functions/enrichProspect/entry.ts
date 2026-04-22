import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prospect_id } = await req.json();
    if (!prospect_id) {
      return Response.json({ error: 'prospect_id required' }, { status: 400 });
    }

    const prospects = await base44.asServiceRole.entities.ProspectCompany.filter({ id: prospect_id });
    const prospect = prospects?.[0];
    if (!prospect) {
      return Response.json({ error: 'Prospect not found' }, { status: 404 });
    }

    const prompt = `Research this flooring/concrete company and provide a detailed profile for a cold call sales pitch:

Company: ${prospect.company_name}
DBA: ${prospect.dba_name || "N/A"}
Owner: ${prospect.owner_name || "Unknown"}
State: ${prospect.state}
City: ${prospect.city || "Unknown"}
Specialty: ${prospect.specialty}
Years in Business: ${prospect.years_in_business || "Unknown"}
Website: ${prospect.website || "None found"}

Find:
1. Their website, social media, Google reviews
2. What products/equipment they currently use
3. Who their current suppliers are
4. What services they offer
5. Their approximate size (employees, revenue)
6. Phone number and email if not already known
7. Owner's name and LinkedIn if available

Then generate:
- A brief company summary (2-3 sentences)
- A custom sales pitch for XPS Xpress products (epoxy materials, equipment, training)
- Key talking points for a cold call
- What products they most likely need`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: "gemini_3_flash",
      response_json_schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          pitch: { type: "string" },
          phone: { type: "string" },
          email: { type: "string" },
          website: { type: "string" },
          employee_count: { type: "number" },
          estimated_revenue: { type: "number" },
          current_products: { type: "string" },
          current_supplier: { type: "string" },
          needs_training: { type: "boolean" },
          needs_equipment: { type: "boolean" },
          needs_products: { type: "boolean" },
          talking_points: { type: "array", items: { type: "string" } },
          recommended_products: { type: "array", items: { type: "string" } }
        }
      }
    });

    const updates = {
      enriched: true,
      ai_summary: result?.summary || "",
      ai_pitch: result?.pitch || "",
      enrichment_data: JSON.stringify({
        talking_points: result?.talking_points || [],
        recommended_products: result?.recommended_products || [],
      }),
      needs_training: result?.needs_training || false,
      needs_equipment: result?.needs_equipment || false,
      needs_products: result?.needs_products || false,
      current_products: result?.current_products || prospect.current_products || "",
      current_supplier: result?.current_supplier || prospect.current_supplier || "",
    };

    // Fill in missing contact info
    if (!prospect.phone && result?.phone) updates.phone = result.phone;
    if (!prospect.email && result?.email) updates.email = result.email;
    if (!prospect.website && result?.website) updates.website = result.website;
    if (result?.employee_count) updates.employee_count = result.employee_count;
    if (result?.estimated_revenue) updates.estimated_revenue = result.estimated_revenue;

    await base44.asServiceRole.entities.ProspectCompany.update(prospect_id, updates);

    return Response.json({
      success: true,
      prospect_id,
      enrichment: result,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});