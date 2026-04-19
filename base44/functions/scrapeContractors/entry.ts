import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { states, contractor_type, limit } = await req.json();
  const targetStates = states || ["AZ"];
  const type = contractor_type || "General Contractor";
  const maxResults = Math.min(limit || 10, 15);

  const prompt = `Find REAL building contractors in ${targetStates.join(", ")} that are ${type}s.

Search for ACTUAL companies with real contact information from:
- AGC (Associated General Contractors) member directories
- State contractor licensing boards
- Commercial construction project databases
- Google Maps / Google Business profiles
- LinkedIn company pages
- ABC (Associated Builders and Contractors)
- ENR Top Contractors lists

For each contractor, provide:
- Company name (real company)
- Primary contact name and title
- Email (real business email, not generic)
- Phone number
- Website
- Physical address, city, state, zip
- Type (General Contractor, Flooring Sub, Concrete Sub, etc.)
- Specialty (commercial, industrial, government, healthcare, etc.)
- Estimated employee count
- Estimated annual revenue
- License number if available
- Notes about the company

Find ${maxResults} real contractors. Be specific — use actual company names and real contact details.`;

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    add_context_from_internet: true,
    model: "gemini_3_flash",
    response_json_schema: {
      type: "object",
      properties: {
        contractors: {
          type: "array",
          items: {
            type: "object",
            properties: {
              company_name: { type: "string" },
              contact_name: { type: "string" },
              title: { type: "string" },
              email: { type: "string" },
              phone: { type: "string" },
              website: { type: "string" },
              address: { type: "string" },
              city: { type: "string" },
              state: { type: "string" },
              zip: { type: "string" },
              contractor_type: { type: "string" },
              specialty: { type: "string" },
              employee_count: { type: "number" },
              annual_revenue: { type: "number" },
              license_number: { type: "string" },
              notes: { type: "string" }
            }
          }
        },
        summary: { type: "string" }
      }
    }
  });

  const contractors = result.contractors || [];
  const created = [];

  for (const c of contractors) {
    const record = await base44.asServiceRole.entities.Contractor.create({
      company_name: c.company_name || "Unknown",
      contact_name: c.contact_name || "",
      title: c.title || "",
      email: c.email || "",
      phone: c.phone || "",
      website: c.website || "",
      address: c.address || "",
      city: c.city || "",
      state: c.state || "",
      zip: c.zip || "",
      contractor_type: c.contractor_type || type,
      specialty: c.specialty || "",
      employee_count: c.employee_count || 0,
      annual_revenue: c.annual_revenue || 0,
      license_number: c.license_number || "",
      notes: c.notes || "",
      source: "AI Scraper",
      relationship_status: "New"
    });
    created.push(record);
  }

  return Response.json({
    contractors_found: created.length,
    summary: result.summary || `Found ${created.length} contractors`,
    contractors: created
  });
});