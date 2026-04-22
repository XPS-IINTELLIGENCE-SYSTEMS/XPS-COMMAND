import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { records } = await req.json();
  if (!records || !Array.isArray(records) || records.length === 0) {
    return Response.json({ error: "Pass an array of {company_name, website, state, source_ids, primary_source} records" }, { status: 400 });
  }

  // Process max 10 at a time to stay within credit limits
  const batch = records.slice(0, 10);
  const results = [];

  for (const record of batch) {
    const companyName = record.company_name;
    const website = record.website || "";
    const state = record.state || "";

    const prompt = `You are a business research agent. Find the REAL contact information for this company. Do NOT invent data — only return what you can confirm.

Company: ${companyName}
Website: ${website}
State: ${state}

Search for:
1. Real phone number (NOT a 555 number)
2. Real email address
3. Owner or primary contact name
4. City and state

If you cannot find a piece of information, return null for that field.`;

    const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          phone: { type: "string", description: "Real phone number or null" },
          email: { type: "string", description: "Real email or null" },
          contact_name: { type: "string", description: "Owner/contact name or null" },
          city: { type: "string" },
          state: { type: "string" },
          website: { type: "string" },
          confidence: { type: "number", description: "0-100 confidence in results" },
          source_notes: { type: "string", description: "Where you found the data" },
        }
      }
    });

    // Update the original entity if we found better data
    const updates = {};
    let fixed = false;
    if (res.phone && !/555/.test(res.phone)) { updates.phone = res.phone; fixed = true; }
    if (res.email && !/@example|@test|@fake/.test(res.email)) { updates.email = res.email; fixed = true; }
    if (res.contact_name) updates.contact_name = res.contact_name;

    // Try to update the source entity
    if (fixed && record.source_ids?.length > 0 && record.primary_source) {
      const entityMap = { Lead: "Lead", Prospect: "ProspectCompany", Contractor: "Contractor", "GC Company": "ContractorCompany", Job: "CommercialJob", Registry: "RegistryAlert" };
      const entityName = entityMap[record.primary_source];

      if (entityName) {
        const id = record.source_ids[0];
        const entityUpdates = {};

        if (entityName === "Lead") {
          if (updates.phone) entityUpdates.phone = updates.phone;
          if (updates.email) entityUpdates.email = updates.email;
          if (updates.contact_name) entityUpdates.contact_name = updates.contact_name;
          entityUpdates.validation_notes = `Auto-fixed by AI scraper on ${new Date().toISOString()}. Source: ${res.source_notes || "web research"}. Confidence: ${res.confidence || 0}%`;
        } else if (entityName === "ProspectCompany") {
          if (updates.phone) entityUpdates.phone = updates.phone;
          if (updates.email) entityUpdates.email = updates.email;
          if (updates.contact_name) entityUpdates.owner_name = updates.contact_name;
        } else if (entityName === "Contractor") {
          if (updates.phone) entityUpdates.phone = updates.phone;
          if (updates.email) entityUpdates.email = updates.email;
          if (updates.contact_name) entityUpdates.contact_name = updates.contact_name;
        } else if (entityName === "ContractorCompany") {
          if (updates.phone) entityUpdates.phone = updates.phone;
          if (updates.email) entityUpdates.email = updates.email;
        } else if (entityName === "RegistryAlert") {
          if (updates.phone) entityUpdates.phone = updates.phone;
          if (updates.email) entityUpdates.email = updates.email;
        }

        if (Object.keys(entityUpdates).length > 0) {
          await base44.asServiceRole.entities[entityName].update(id, entityUpdates);
        }
      }
    }

    results.push({
      company: companyName,
      found: res,
      fixed,
      updates_applied: fixed ? updates : null,
    });
  }

  const fixedCount = results.filter(r => r.fixed).length;
  return Response.json({
    processed: results.length,
    fixed: fixedCount,
    unfixable: results.length - fixedCount,
    results,
  });
});