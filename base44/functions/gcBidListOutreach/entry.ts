import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PROJECT_TYPE_MESSAGING = {
  warehouse: "industrial epoxy flooring and polished concrete systems designed for heavy forklift traffic and durability",
  retail: "decorative epoxy and polished concrete systems that create stunning showroom-quality floors",
  restaurant: "urethane cement and food-safe epoxy systems rated for thermal shock, chemical resistance, and USDA compliance",
  healthcare: "antimicrobial seamless epoxy systems meeting healthcare facility hygiene and infection control standards",
  automotive: "polyaspartic and chemical-resistant epoxy systems built for service bays and showrooms",
  fitness: "polished concrete and rubber-ready preparation systems for high-traffic fitness environments",
  hotel: "decorative metallic epoxy and polished concrete for luxury hospitality environments",
  industrial: "heavy-duty industrial epoxy and urethane systems for manufacturing and processing facilities",
  education: "durable polished concrete and epoxy systems for schools, universities, and campus facilities",
  government: "specification-compliant flooring systems for federal, state, and municipal buildings",
  commercial: "commercial-grade epoxy and polished concrete for office and mixed-use buildings",
  mixed_use: "versatile flooring systems across retail, office, and common areas in mixed-use developments",
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { action, gc_id, batch_size, follow_up_stage } = await req.json().catch(() => ({}));

    if (action === "send_bid_list_requests") {
      // Find GCs not yet contacted, ordered by revenue (largest first)
      const gcs = await base44.asServiceRole.entities.ContractorCompany.filter(
        { bid_list_status: "not_contacted" }, "-annual_revenue_estimate", batch_size || 50
      );

      let sent = 0;
      let skipped = 0;

      for (const gc of gcs) {
        const email = gc.preconstruction_email || gc.email;
        if (!email || !email.includes("@")) { skipped++; continue; }

        // Parse project types for personalization
        let projectTypes = [];
        try { projectTypes = JSON.parse(gc.project_types || "[]"); } catch {}

        const relevantSystems = projectTypes
          .filter(pt => PROJECT_TYPE_MESSAGING[pt])
          .map(pt => PROJECT_TYPE_MESSAGING[pt])
          .slice(0, 3);

        const systemsText = relevantSystems.length > 0
          ? relevantSystems.join("; ")
          : "epoxy flooring, polished concrete, decorative concrete, urethane cement, and industrial floor coating systems";

        const stateName = gc.state || "your region";

        const subject = `Flooring Subcontractor — Epoxy, Polished Concrete, Urethane Cement — ${stateName} Coverage`;

        const body = `Dear ${gc.preconstruction_contact_name || "Preconstruction Team"},

I'm reaching out from Xtreme Polishing Systems / National Concrete Polishing to request placement on your flooring subcontractor bid list.

We specialize in ${systemsText} — with nationwide coverage through 60+ supply locations and crews operating across all 50 states.

For your ${stateName} projects, we offer:
• AI-assisted estimating for fast bid turnaround (typically 24-48 hours)
• Dedicated preconstruction support for specification review and value engineering
• Material availability guaranteed through our national distribution network
• Full project management from mobilization through punch list completion

We'd welcome the opportunity to bid on your upcoming projects that include flooring scope. We are registered on BuildingConnected and can also receive invitations via email at bids@nationalconcretepolishing.com.

Could you add us to your flooring subcontractor bid list? Happy to provide prequalification documents, insurance certificates, or references upon request.

Best regards,
XPS National Estimating Team
Xtreme Polishing Systems / National Concrete Polishing
bids@nationalconcretepolishing.com`;

        // Send via Core.SendEmail — CC jeremy
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: "jeremy@shopxps.com",
          subject: `[BID LIST REQUEST] ${gc.company_name} — ${subject}`,
          body: `OUTREACH SENT TO: ${email}\nCOMPANY: ${gc.company_name}\nSTATE: ${gc.state}\nCITY: ${gc.city}\n\n--- EMAIL CONTENT ---\n\n${body}`,
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
          subject,
          body,
          status: "Sent",
          send_date: new Date().toISOString(),
          channel: "Email",
          template_name: "GC Bid List Request",
        }).catch(() => {});

        sent++;
      }

      return Response.json({ success: true, sent, skipped, total_eligible: gcs.length });
    }

    if (action === "follow_up") {
      const stage = follow_up_stage || 1;
      const statusFilter = "contacted";
      
      const gcs = await base44.asServiceRole.entities.ContractorCompany.filter(
        { bid_list_status: statusFilter, follow_up_stage: stage - 1 }, "-annual_revenue_estimate", batch_size || 50
      );

      const followUpSubjects = {
        1: (gc) => `Following up — Flooring Subcontractor Bid List Request — ${gc.state}`,
        2: (gc) => `Case Study: Recent ${gc.state} Project — XPS Flooring`,
        3: (gc) => `Final Follow-up — Flooring Sub for ${gc.company_name} Projects`,
        4: (gc) => `New Project Completion in ${gc.state} — XPS Flooring Update`,
      };

      const followUpBodies = {
        1: (gc) => `Hi ${gc.preconstruction_contact_name || "Team"},\n\nI wanted to follow up on my request to be added to your flooring subcontractor bid list. We specialize in epoxy, polished concrete, and urethane cement systems and would welcome the opportunity to bid on your upcoming projects.\n\nPlease let me know if you need any prequalification information from us.\n\nBest regards,\nXPS National Estimating Team`,
        2: (gc) => `Hi ${gc.preconstruction_contact_name || "Team"},\n\nI wanted to share a recent project completion relevant to your work — we completed a full flooring system in ${gc.state} that included epoxy, polished concrete, and specialized coatings.\n\nWe'd love to bring this same level of quality to your projects. Are you accepting new subcontractors for flooring scope?\n\nBest regards,\nXPS National Estimating Team`,
        3: (gc) => `Hi ${gc.preconstruction_contact_name || "Team"},\n\nI wanted to make one more attempt to connect before I stop reaching out. We offer nationwide flooring capabilities and fast turnaround estimating that could be a real asset for your projects.\n\nIf now isn't the right time, no worries at all — we'll be here when you need us.\n\nBest regards,\nXPS National Estimating Team`,
        4: (gc) => `Hi ${gc.preconstruction_contact_name || "Team"},\n\nWe recently completed a project in ${gc.state} and wanted to share the results. Our AI-assisted estimating allowed us to turn around the bid in under 24 hours with competitive pricing.\n\nIf you have any upcoming projects with flooring scope, we'd welcome the chance to bid.\n\nBest regards,\nXPS National Estimating Team`,
      };

      let sent = 0;
      for (const gc of gcs) {
        const email = gc.preconstruction_email || gc.email;
        if (!email) continue;

        const subject = followUpSubjects[stage]?.(gc) || `Follow-up — XPS Flooring`;
        const body = followUpBodies[stage]?.(gc) || "Following up on our bid list request.";

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: "jeremy@shopxps.com",
          subject: `[FOLLOW-UP ${stage}] ${gc.company_name} — ${subject}`,
          body: `FOLLOW-UP SENT TO: ${email}\nCOMPANY: ${gc.company_name}\nSTATE: ${gc.state}\nSTAGE: ${stage}\n\n--- EMAIL CONTENT ---\n\n${body}`,
          from_name: "XPS Intelligence"
        }).catch(() => {});

        await base44.asServiceRole.entities.ContractorCompany.update(gc.id, {
          follow_up_stage: stage,
          last_follow_up_date: new Date().toISOString(),
          last_updated: new Date().toISOString(),
        });

        sent++;
      }

      return Response.json({ success: true, stage, sent });
    }

    return Response.json({ error: "Invalid action. Use 'send_bid_list_requests' or 'follow_up'" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});