import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { lead_id, service_type, square_footage, notes } = await req.json();

    // Get lead info if provided
    let leadInfo = {};
    if (lead_id) {
      leadInfo = await base44.entities.Lead.get(lead_id);
    }

    const prompt = `You are a professional proposal writer for Xtreme Polishing Systems (XPS), a premium epoxy and polished concrete flooring company.

Generate a professional flooring proposal with these details:
- Client: ${leadInfo.company || "TBD"}
- Contact: ${leadInfo.contact_name || "TBD"}
- Service: ${service_type || "Epoxy Floor Coating"}
- Square Footage: ${square_footage || "TBD"}
- Location: ${leadInfo.location || "Florida"}
- Additional Notes: ${notes || "None"}

Use industry-standard pricing:
- Epoxy Floor Coating: $3-8/sqft
- Polished Concrete: $3-12/sqft
- Decorative Epoxy: $5-12/sqft
- Industrial Epoxy: $4-10/sqft
- Metallic Epoxy: $6-15/sqft
- Garage Coating: $3-6/sqft

Include: scope of work, materials list, timeline, payment terms (50% deposit, 50% on completion), and a professional tone.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          scope_of_work: { type: "string" },
          materials: { type: "string" },
          timeline: { type: "string" },
          price_per_sqft: { type: "number" },
          total_value: { type: "number" },
          terms: { type: "string" }
        }
      }
    });

    // Create the proposal entity
    const proposal = await base44.entities.Proposal.create({
      title: result.title || `Proposal for ${leadInfo.company || "Client"}`,
      client_name: leadInfo.company || "TBD",
      client_contact: leadInfo.contact_name || "TBD",
      client_email: leadInfo.email || "",
      service_type: service_type || "Epoxy Floor Coating",
      square_footage: square_footage || 0,
      price_per_sqft: result.price_per_sqft || 0,
      total_value: result.total_value || 0,
      scope_of_work: result.scope_of_work || "",
      materials: result.materials || "",
      timeline: result.timeline || "",
      terms: result.terms || "50% deposit due upon acceptance. Remaining 50% due upon project completion.",
      status: "Draft",
      lead_id: lead_id || "",
      notes: notes || ""
    });

    // Update lead stage if applicable
    if (lead_id) {
      await base44.entities.Lead.update(lead_id, { stage: "Proposal" });
    }

    return Response.json({ 
      success: true, 
      message: "Proposal generated",
      proposal_id: proposal.id,
      proposal 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});