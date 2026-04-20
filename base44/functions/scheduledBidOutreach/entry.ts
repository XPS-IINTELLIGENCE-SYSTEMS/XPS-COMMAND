import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PROJECT_TYPE_MESSAGING = {
  warehouse: "industrial epoxy flooring and polished concrete systems designed for heavy forklift traffic",
  retail: "decorative epoxy and polished concrete systems for showroom-quality floors",
  restaurant: "urethane cement and food-safe epoxy systems rated for thermal shock and USDA compliance",
  healthcare: "antimicrobial seamless epoxy systems meeting healthcare hygiene standards",
  automotive: "polyaspartic and chemical-resistant epoxy systems for service bays",
  fitness: "polished concrete and rubber-ready preparation systems for high-traffic gyms",
  hotel: "decorative metallic epoxy and polished concrete for luxury hospitality",
  industrial: "heavy-duty industrial epoxy and urethane systems for manufacturing",
  education: "durable polished concrete and epoxy systems for schools and universities",
  government: "specification-compliant flooring systems for government buildings",
  commercial: "commercial-grade epoxy and polished concrete for office buildings",
  mixed_use: "versatile flooring systems for mixed-use developments",
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Step 1: Send initial outreach to un-contacted GCs with emails
    const newGcs = await base44.asServiceRole.entities.ContractorCompany.filter(
      { bid_list_status: "not_contacted" }, "-annual_revenue_estimate", 20
    );

    let initialSent = 0;
    let initialSkipped = 0;

    for (const gc of newGcs) {
      const email = gc.preconstruction_email || gc.email;
      if (!email || !email.includes("@")) { initialSkipped++; continue; }

      let projectTypes = [];
      try { projectTypes = JSON.parse(gc.project_types || "[]"); } catch {}

      const systemsText = projectTypes
        .filter(pt => PROJECT_TYPE_MESSAGING[pt])
        .map(pt => PROJECT_TYPE_MESSAGING[pt])
        .slice(0, 3)
        .join("; ") || "epoxy flooring, polished concrete, and industrial floor coating systems";

      const subject = `Flooring Subcontractor — Epoxy, Polished Concrete, Urethane Cement — ${gc.state} Coverage`;
      const body = `Dear ${gc.preconstruction_contact_name || "Preconstruction Team"},

I'm reaching out from Xtreme Polishing Systems / National Concrete Polishing to request placement on your flooring subcontractor bid list.

We specialize in ${systemsText} — with nationwide coverage through 60+ supply locations and crews across all 50 states.

For your ${gc.state} projects, we offer:
• AI-assisted estimating for fast bid turnaround (24-48 hours)
• Dedicated preconstruction support for spec review and value engineering
• Material availability guaranteed through our national distribution network
• Full project management from mobilization through punch list

We'd welcome the opportunity to bid on your upcoming flooring projects. We are on BuildingConnected and can receive invitations at bids@nationalconcretepolishing.com.

Could you add us to your flooring subcontractor bid list?

Best regards,
XPS National Estimating Team
Xtreme Polishing Systems / National Concrete Polishing
bids@nationalconcretepolishing.com`;

      // Send copy to jeremy
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: "jeremy@shopxps.com",
        subject: `[BID LIST] ${gc.company_name} (${gc.city}, ${gc.state}) — ${email}`,
        body: `TO: ${email}\nCOMPANY: ${gc.company_name}\nCITY: ${gc.city}, ${gc.state}\nREVENUE: $${(gc.annual_revenue_estimate || 0).toLocaleString()}\nEMPLOYEES: ${gc.employee_count || "?"}\n\n--- EMAIL ---\n\n${body}`,
        from_name: "XPS Intelligence"
      }).catch(() => {});

      await base44.asServiceRole.entities.ContractorCompany.update(gc.id, {
        bid_list_status: "contacted",
        bid_list_request_sent_date: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        follow_up_stage: 0,
      });

      await base44.asServiceRole.entities.OutreachEmail.create({
        to_email: email,
        to_name: gc.company_name,
        subject,
        body,
        status: "Sent",
        email_type: "Initial Outreach",
        sent_at: new Date().toISOString(),
        notes: `GC Bid List Request — ${gc.city}, ${gc.state}`,
      }).catch(() => {});

      initialSent++;
    }

    // Step 2: Follow up on previously contacted GCs
    let followUpSent = 0;
    for (let stage = 1; stage <= 4; stage++) {
      const daysSinceMap = { 1: 3, 2: 10, 3: 21, 4: 45 };
      const daysAgo = daysSinceMap[stage];
      const cutoff = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

      const gcs = await base44.asServiceRole.entities.ContractorCompany.filter(
        { bid_list_status: "contacted", follow_up_stage: stage - 1 }, "-annual_revenue_estimate", 10
      ).catch(() => []);

      for (const gc of gcs) {
        // Only follow up if enough time has passed
        const lastContact = gc.bid_list_request_sent_date || gc.last_follow_up_date;
        if (lastContact && lastContact > cutoff) continue;

        const email = gc.preconstruction_email || gc.email;
        if (!email) continue;

        const subjects = {
          1: `Following up — Flooring Sub Bid List — ${gc.state}`,
          2: `Recent ${gc.state} Project — XPS Flooring`,
          3: `Final Follow-up — Flooring for ${gc.company_name}`,
          4: `${gc.state} Project Update — XPS Flooring`,
        };

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: "jeremy@shopxps.com",
          subject: `[FOLLOW-UP ${stage}] ${gc.company_name} — ${email}`,
          body: `Follow-up stage ${stage} for ${gc.company_name} (${gc.city}, ${gc.state})\nEmail: ${email}`,
          from_name: "XPS Intelligence"
        }).catch(() => {});

        await base44.asServiceRole.entities.ContractorCompany.update(gc.id, {
          follow_up_stage: stage,
          last_follow_up_date: new Date().toISOString(),
          last_updated: new Date().toISOString(),
        });

        followUpSent++;
      }
    }

    return Response.json({
      success: true,
      initial_sent: initialSent,
      initial_skipped: initialSkipped,
      follow_ups_sent: followUpSent,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});