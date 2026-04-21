import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Full branded XPS company package — HTML email
function buildCompanyPackageEmail(gc) {
  const contactName = gc.preconstruction_contact_name || gc.estimator_name || "Preconstruction Team";
  const companyName = gc.company_name || "your company";
  const stateName = gc.state || "your region";

  // Parse project types for personalization
  let projectTypes = [];
  try { projectTypes = JSON.parse(gc.project_types || "[]"); } catch {}

  const relevantVerticals = projectTypes.length > 0
    ? projectTypes.slice(0, 4).join(", ")
    : "commercial, industrial, government, and institutional";

  const subject = `Flooring Subcontractor Prequalification — Xtreme Polishing Systems / National Concrete Polishing — ${stateName} Coverage`;

  const body = `Dear ${contactName},

I'm writing on behalf of Xtreme Polishing Systems (XPS) and National Concrete Polishing (NCP) to formally request placement on ${companyName}'s flooring subcontractor bid list.

As America's premier commercial & industrial flooring solutions provider, we specialize in the exact systems your ${relevantVerticals} projects require.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COMPANY OVERVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Xtreme Polishing Systems (XPS) — Manufacturer & national installer
• National Concrete Polishing (NCP) — Professional installation division
• XPS Xpress — Material supply & distribution (60+ locations)
• 15+ years in commercial flooring
• 10,000+ commercial projects completed
• 200+ certified installation technicians
• Licensed, bonded, and insured in all 50 states

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FLOORING SYSTEMS WE BID
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Epoxy Floor Coatings — Industrial, commercial, decorative (100% solids, water-based, UV-stable)
✓ Polished Concrete — Mechanical grinding & densifying to 3,000+ grit mirror finish
✓ Decorative Concrete — Stained, stamped, engraved, metallic epoxy
✓ Urethane Cement — Food-safe, USDA/FDA compliant, thermal shock rated
✓ Polyaspartic Coatings — Fast-cure, UV-stable, high-performance
✓ Polyurea Coatings — Chemical resistant, flexible, extremely durable
✓ Industrial Floor Coatings — Heavy-duty: warehouses, manufacturing, aerospace
✓ Concrete Repair & Resurfacing — Crack repair, leveling, moisture mitigation
✓ Moisture Mitigation — Vapor barriers, ASTM F2170 testing
✓ Joint Filling — Polyurea, epoxy, and semi-rigid joint fill systems
✓ Shot Blasting & Surface Prep — Diamond grinding, shot blasting, scarifying

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREDENTIALS & CERTIFICATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• $50M+ General Liability & Umbrella Coverage
• Workers' Compensation in all 50 states
• OSHA 30-Hour Certified Crews
• Confined Space Entry Certified
• SAM.gov Registered (Federal Government Projects)
• ICRI Certified Concrete Repair Technicians
• NACE Certified Coating Inspectors
• Manufacturer-Certified Installers (multiple systems)
• EMR Rate: Below industry average

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VERTICAL MARKET EXPERIENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Warehouses & Distribution Centers (500,000+ sqft projects)
• Government / Federal / Military (GSA schedule, MILCON experience)
• Healthcare / Hospitals / Cleanrooms
• Food & Beverage / USDA-Compliant Kitchens
• Data Centers (anti-static, ESD systems)
• Education / Universities
• Airports & Transportation
• Retail, Hotels, Office, Manufacturing

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHY GENERAL CONTRACTORS CHOOSE XPS/NCP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. AI-Assisted Estimating — 24-48 hour bid turnaround on any project
2. Vertical Integration — We manufacture AND install = competitive pricing
3. 60+ Supply Locations — Material availability guaranteed, no delays
4. Nationwide Crews — Deploy anywhere in the US within 72 hours
5. Dedicated Preconstruction — Spec review, value engineering, mock-ups
6. 5-Year Standard Warranty — Extended options available
7. Technology — 3D scanning, drone surveys, AI takeoffs for accuracy

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REQUEST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

We respectfully request to be added to ${companyName}'s flooring subcontractor bid list for ${stateName} and nationwide projects.

We are active on BuildingConnected (search "National Concrete Polishing") and can also receive bid invitations via email.

We can provide the following upon request:
• Prequalification Package
• Insurance Certificates (COI)
• Safety Program & EMR
• Financial References
• Project References (by vertical)
• W-9

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONTACT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Estimating & Bids: bids@nationalconcretepolishing.com
Sales: info@xtremepolishingsystems.com
Phone: (888) XPS-COAT
Web: xtremepolishingsystems.com | nationalconcretepolishing.com | shopxps.com

We look forward to the opportunity to support ${companyName}'s upcoming projects.

Best regards,
XPS National Estimating Team
Xtreme Polishing Systems / National Concrete Polishing`;

  return { subject, body, contactName };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { action, batch_size, dry_run } = await req.json().catch(() => ({}));

    if (action === "preview") {
      // Generate preview for one GC
      const gcs = await base44.asServiceRole.entities.ContractorCompany.filter(
        { bid_list_status: "not_contacted" }, "-annual_revenue_estimate", 1
      );
      if (gcs.length === 0) return Response.json({ error: "No GCs to preview" });
      const pkg = buildCompanyPackageEmail(gcs[0]);
      return Response.json({ success: true, preview: pkg, gc: gcs[0].company_name });
    }

    if (action === "send") {
      const limit = batch_size || 50;
      const gcs = await base44.asServiceRole.entities.ContractorCompany.filter(
        { bid_list_status: "not_contacted" }, "-annual_revenue_estimate", limit
      );

      let sent = 0;
      let skipped = 0;

      for (const gc of gcs) {
        const email = gc.preconstruction_email || gc.estimator_email || gc.email;
        if (!email || !email.includes("@")) { skipped++; continue; }

        const pkg = buildCompanyPackageEmail(gc);

        if (!dry_run) {
          // Send to admin for approval/forwarding
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: "jeremy@shopxps.com",
            subject: `[XPS BID LIST] ${gc.company_name} — ${pkg.subject}`,
            body: `TO: ${email}\nCONTACT: ${pkg.contactName}\nCOMPANY: ${gc.company_name}\nSTATE: ${gc.state}\nREVENUE: $${(gc.annual_revenue_estimate || 0).toLocaleString()}\n\n${"=".repeat(60)}\n\n${pkg.body}`,
            from_name: "XPS Intelligence"
          }).catch(() => {});

          // Update GC record
          await base44.asServiceRole.entities.ContractorCompany.update(gc.id, {
            bid_list_status: "contacted",
            bid_list_request_sent_date: new Date().toISOString(),
            last_updated: new Date().toISOString(),
            follow_up_stage: 0,
          });

          // Log outreach
          await base44.asServiceRole.entities.OutreachEmail.create({
            lead_name: gc.company_name,
            lead_email: email,
            subject: pkg.subject,
            body: pkg.body,
            status: "Sent",
            send_date: new Date().toISOString(),
            channel: "Email",
            template_name: "XPS Full Company Package",
          }).catch(() => {});
        }

        sent++;
      }

      await base44.asServiceRole.entities.AgentActivity.create({
        agent_name: "Mass GC Outreach",
        action: `Sent ${sent} company packages${dry_run ? " (DRY RUN)" : ""}`,
        status: "success",
        category: "outreach",
        related_entity_type: "ContractorCompany",
        details: JSON.stringify({ sent, skipped, batch_size: limit, dry_run: !!dry_run }),
      });

      return Response.json({ success: true, sent, skipped, total_eligible: gcs.length, dry_run: !!dry_run });
    }

    return Response.json({ error: "Use action: 'preview' or 'send'" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});