import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CONNECTOR_ID = "69db228b2439d854c8587167";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || "fetch"; // "fetch" | "sync" | "push"

    // Get the app user's HubSpot connection
    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);

    if (action === "fetch") {
      // Fetch contacts from HubSpot
      const contactsRes = await fetch("https://api.hubapi.com/crm/v3/objects/contacts?limit=100&properties=firstname,lastname,email,phone,company,lifecyclestage,hs_lead_status", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const contactsData = await contactsRes.json();

      // Fetch deals from HubSpot
      const dealsRes = await fetch("https://api.hubapi.com/crm/v3/objects/deals?limit=100&properties=dealname,amount,dealstage,pipeline,closedate,hs_lastmodifieddate", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const dealsData = await dealsRes.json();

      return Response.json({
        contacts: (contactsData.results || []).map(c => ({
          id: c.id,
          name: `${c.properties.firstname || ''} ${c.properties.lastname || ''}`.trim(),
          email: c.properties.email,
          phone: c.properties.phone,
          company: c.properties.company,
          stage: c.properties.lifecyclestage,
          status: c.properties.hs_lead_status,
        })),
        deals: (dealsData.results || []).map(d => ({
          id: d.id,
          name: d.properties.dealname,
          amount: parseFloat(d.properties.amount || 0),
          stage: d.properties.dealstage,
          pipeline: d.properties.pipeline,
          closeDate: d.properties.closedate,
        })),
        totalContacts: contactsData.total || 0,
        totalDeals: dealsData.total || 0,
      });
    }

    if (action === "sync") {
      // Pull HubSpot contacts → create/update XPS leads
      const contactsRes = await fetch("https://api.hubapi.com/crm/v3/objects/contacts?limit=100&properties=firstname,lastname,email,phone,company,city,state,zip,lifecyclestage,hs_lead_status", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const contactsData = await contactsRes.json();
      const contacts = contactsData.results || [];

      // Get existing leads to avoid duplicates
      const existingLeads = await base44.asServiceRole.entities.Lead.filter({});
      const existingEmails = new Set(existingLeads.map(l => (l.email || '').toLowerCase()));

      let created = 0;
      let skipped = 0;

      for (const c of contacts) {
        const email = (c.properties.email || '').toLowerCase();
        if (!email || existingEmails.has(email)) {
          skipped++;
          continue;
        }

        const name = `${c.properties.firstname || ''} ${c.properties.lastname || ''}`.trim();
        const company = c.properties.company || name || 'HubSpot Contact';

        await base44.asServiceRole.entities.Lead.create({
          company: company,
          contact_name: name,
          email: email,
          phone: c.properties.phone || '',
          city: c.properties.city || '',
          state: c.properties.state || '',
          zip: c.properties.zip || '',
          stage: 'Incoming',
          pipeline_status: 'Incoming',
          lead_type: 'XPress',
          ingestion_source: 'HubSpot',
          source: 'HubSpot Sync',
        });
        created++;
      }

      return Response.json({ created, skipped, total: contacts.length });
    }

    if (action === "push") {
      // Push XPS leads → HubSpot contacts
      const leads = await base44.asServiceRole.entities.Lead.filter({});
      let pushed = 0;
      let failed = 0;

      for (const lead of leads.slice(0, 50)) {
        if (!lead.email) continue;
        const nameParts = (lead.contact_name || '').split(' ');
        const payload = {
          properties: {
            email: lead.email,
            firstname: nameParts[0] || '',
            lastname: nameParts.slice(1).join(' ') || '',
            phone: lead.phone || '',
            company: lead.company || '',
            city: lead.city || '',
            state: lead.state || '',
            zip: lead.zip || '',
          }
        };

        const res = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) pushed++;
        else failed++;
      }

      return Response.json({ pushed, failed });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});