import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { lead_id, company_name, batch_ids } = await req.json();

    // Support single lead or batch enrichment
    const leadIds = batch_ids || (lead_id ? [lead_id] : []);

    if (leadIds.length === 0 && !company_name) {
      return Response.json({ error: 'lead_id, batch_ids, or company_name required' }, { status: 400 });
    }

    const enriched = [];

    // If just a company name with no lead, do a quick lookup
    if (company_name && leadIds.length === 0) {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Find contact information for key decision makers at: ${company_name}

Look for: Owner, CEO, Facility Manager, VP Operations, General Manager, Plant Manager
For each person found provide: full name, title, email, phone, LinkedIn URL

Also find: company main phone, company email, website URL, physical address, number of employees, annual revenue estimate.

Search thoroughly across LinkedIn, company website, business directories, social media.`,
        add_context_from_internet: true,
        model: "gemini_3_flash",
        response_json_schema: {
          type: "object",
          properties: {
            company_name: { type: "string" },
            website: { type: "string" },
            main_phone: { type: "string" },
            main_email: { type: "string" },
            address: { type: "string" },
            employee_count: { type: "string" },
            revenue_estimate: { type: "string" },
            contacts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  title: { type: "string" },
                  email: { type: "string" },
                  phone: { type: "string" },
                  linkedin: { type: "string" }
                }
              }
            }
          }
        }
      });
      return Response.json({ success: true, enrichment: result });
    }

    // Batch process leads
    for (const id of leadIds) {
      const lead = await base44.entities.Lead.get(id);
      if (!lead) continue;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Find detailed contact information for decision makers at: ${lead.company}
Location: ${lead.location || 'unknown'}
Industry: ${lead.vertical || 'commercial'}
Current contact: ${lead.contact_name || 'unknown'}, Email: ${lead.email || 'none'}, Phone: ${lead.phone || 'none'}

I need:
1. The BEST decision maker for selling flooring/epoxy services (Facility Manager, VP Ops, Owner, GM)
2. Their direct email and phone number
3. Company website, main phone
4. Any additional contacts (backup decision maker)
5. Recent company news that could indicate flooring needs (expansion, renovation, new facility)

Search LinkedIn, company website, Google, business directories, social media.
If the current contact info is already good, verify it and add what's missing.`,
        add_context_from_internet: true,
        model: "gemini_3_flash",
        response_json_schema: {
          type: "object",
          properties: {
            primary_contact: { type: "string" },
            primary_email: { type: "string" },
            primary_phone: { type: "string" },
            primary_title: { type: "string" },
            linkedin_url: { type: "string" },
            company_website: { type: "string" },
            company_phone: { type: "string" },
            additional_contacts: { type: "array", items: { type: "object", properties: { name: { type: "string" }, title: { type: "string" }, email: { type: "string" } } } },
            recent_news: { type: "string" },
            enrichment_notes: { type: "string" }
          }
        }
      });

      // Update the lead with enriched data
      const updates = {};
      if (result.primary_contact && result.primary_contact !== 'unknown') {
        updates.contact_name = result.primary_contact;
      }
      if (result.primary_email && result.primary_email.includes('@')) {
        updates.email = result.primary_email;
      }
      if (result.primary_phone && result.primary_phone.length > 6) {
        updates.phone = result.primary_phone;
      }

      const newNotes = [
        lead.notes || '',
        result.primary_title ? `Title: ${result.primary_title}` : '',
        result.linkedin_url ? `LinkedIn: ${result.linkedin_url}` : '',
        result.company_website ? `Web: ${result.company_website}` : '',
        result.recent_news ? `News: ${result.recent_news}` : '',
        result.enrichment_notes || '',
        result.additional_contacts?.length ? `Alt contacts: ${result.additional_contacts.map(c => `${c.name} (${c.title})`).join(', ')}` : ''
      ].filter(Boolean).join('\n');

      updates.notes = newNotes;
      updates.ai_insight = `${lead.ai_insight || ''}\n[Enriched] ${result.enrichment_notes || 'Contact data updated'}`.trim();

      // Boost score if we found better contact info
      let scoreBoost = 0;
      if (result.primary_email?.includes('@')) scoreBoost += 5;
      if (result.primary_phone?.length > 6) scoreBoost += 5;
      if (result.linkedin_url) scoreBoost += 3;
      if (lead.score) updates.score = Math.min((lead.score || 0) + scoreBoost, 100);

      await base44.entities.Lead.update(id, updates);

      enriched.push({
        lead_id: id,
        company: lead.company,
        contact: result.primary_contact || lead.contact_name,
        email: result.primary_email || lead.email,
        phone: result.primary_phone || lead.phone,
        score_boost: scoreBoost
      });
    }

    return Response.json({
      success: true,
      enriched_count: enriched.length,
      leads: enriched,
      message: `Enriched ${enriched.length} lead(s) with contact intelligence`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});