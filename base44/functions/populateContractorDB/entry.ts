import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get existing contractor count
    const existing = await base44.asServiceRole.entities.ContractorCompany.list('-created_date', 1);
    const existingCount = existing.length;

    // Use LLM with web context to discover contractors
    const states = ["Florida", "Texas", "California", "Georgia", "North Carolina", "Tennessee", "Arizona", "Ohio", "Virginia", "Colorado"];
    const targetState = states[Math.floor(Math.random() * states.length)];

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Find 5 real commercial flooring contractors, epoxy flooring companies, or concrete coating contractors in ${targetState}. 
      
For each contractor provide:
- company_name (real company name)
- city and state
- website (if findable)
- phone (if findable)
- email (if findable)
- specialty (epoxy, polished concrete, decorative concrete, industrial coatings, etc.)
- estimated_employees (number)

Return real companies that do commercial/industrial flooring work. Focus on companies that would be potential partners or sub-contractors for epoxy and polished concrete projects.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          contractors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                company_name: { type: "string" },
                city: { type: "string" },
                state: { type: "string" },
                website: { type: "string" },
                phone: { type: "string" },
                email: { type: "string" },
                specialty: { type: "string" },
                estimated_employees: { type: "number" },
              }
            }
          }
        }
      }
    });

    const contractors = result.contractors || [];
    let created = 0;

    for (const c of contractors) {
      // Check for duplicates
      const dupes = await base44.asServiceRole.entities.ContractorCompany.filter({ 
        company_name: c.company_name 
      }).catch(() => []);
      
      if (dupes.length === 0) {
        await base44.asServiceRole.entities.ContractorCompany.create({
          company_name: c.company_name,
          city: c.city,
          state: c.state,
          website: c.website || "",
          phone: c.phone || "",
          email: c.email || "",
          specialty: c.specialty || "Epoxy",
          estimated_employees: c.estimated_employees || 0,
          source: "AI Discovery",
          status: "active",
          discovery_date: new Date().toISOString(),
        });
        created++;
      }
    }

    // Log activity
    await base44.asServiceRole.entities.AgentActivity.create({
      agent_name: "Contractor DB Builder",
      action: "populate_contractor_db",
      status: "success",
      category: "scraping",
      related_entity_type: "ContractorCompany",
      details: JSON.stringify({
        state: targetState,
        found: contractors.length,
        created,
        total_existing: existingCount,
      }),
    });

    return Response.json({
      success: true,
      state: targetState,
      found: contractors.length,
      created,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});