import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { contractor_id } = await req.json();
  if (!contractor_id) return Response.json({ error: 'contractor_id required' }, { status: 400 });

  const contractors = await base44.asServiceRole.entities.Contractor.filter({ id: contractor_id });
  const contractor = contractors[0];
  if (!contractor) return Response.json({ error: 'Contractor not found' }, { status: 404 });
  if (!contractor.email) return Response.json({ error: 'No email address for this contractor' }, { status: 400 });

  const prompt = `Write a professional company introduction email from Xtreme Polishing Systems (XPS) and National Concrete Polishing (NCP) to ${contractor.contact_name || 'the team'} at ${contractor.company_name}.

ABOUT XPS/NCP:
- Xtreme Polishing Systems (XPS) — America's premier flooring solutions provider & manufacturer
- National Concrete Polishing (NCP) — Professional installation division
- 60+ franchise locations nationwide, 200+ certified technicians
- Licensed, bonded, insured in all 50 states
- Services: Epoxy floor coatings, polished concrete, stained concrete, decorative concrete, metallic epoxy, polyaspartic coatings, industrial flooring, garage coatings
- We serve as both material supplier AND installation subcontractor
- We can provide: competitive subcontractor bids, material supply at contractor pricing, technical support, on-site training
- Website: xtremepolishingsystems.com | nationalconcretepolishing.com

RECIPIENT: ${contractor.company_name} — ${contractor.contractor_type} in ${contractor.city}, ${contractor.state}
${contractor.specialty ? `Specialty: ${contractor.specialty}` : ''}

Write a warm, professional introduction that:
1. Introduces XPS and NCP
2. Explains our dual capability (manufacture + install)
3. Highlights benefits of working with us
4. Offers competitive subcontractor pricing
5. Invites them to connect for upcoming projects
6. Professional but not salesy — partnership focused

Keep it concise and impactful.`;

  const emailResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        subject: { type: "string" },
        body: { type: "string" }
      }
    }
  });

  await base44.asServiceRole.integrations.Core.SendEmail({
    to: contractor.email,
    subject: emailResult.subject || `Introduction: Xtreme Polishing Systems — Flooring Partner`,
    body: emailResult.body || "",
    from_name: "XPS Business Development"
  });

  await base44.asServiceRole.entities.Contractor.update(contractor_id, {
    intro_sent: true,
    intro_sent_date: new Date().toISOString(),
    relationship_status: "Intro Sent"
  });

  return Response.json({
    success: true,
    subject: emailResult.subject,
    contractor: contractor.company_name
  });
});