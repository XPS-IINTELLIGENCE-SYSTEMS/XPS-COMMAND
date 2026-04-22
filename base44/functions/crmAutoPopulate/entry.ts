import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { action, contact_id } = await req.json();

  // ACTION: Validate — AI reviews a single contact and recommends fixes
  if (action === "validate") {
    const leads = await base44.asServiceRole.entities.Lead.filter({ id: contact_id });
    const lead = leads[0];
    if (!lead) return Response.json({ error: "Not found" }, { status: 404 });

    const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are an XPS CRM validation agent. Analyze this contact record and identify issues, missing data, and recommend fixes.

Contact: ${JSON.stringify(lead, null, 2)}

Return a validation report with:
1. data_quality_score: 0-100 rating of data completeness/accuracy
2. missing_fields: array of field names that are empty but important
3. issues: array of {field, issue, fix} objects identifying problems
4. recommended_actions: array of next-step actions (e.g. "enrich contact", "schedule follow-up", "update stage to Qualified")
5. ai_recommendation: 1-2 sentence strategic recommendation for this contact`,
      response_json_schema: {
        type: "object",
        properties: {
          data_quality_score: { type: "number" },
          missing_fields: { type: "array", items: { type: "string" } },
          issues: { type: "array", items: { type: "object", properties: { field: { type: "string" }, issue: { type: "string" }, fix: { type: "string" } } } },
          recommended_actions: { type: "array", items: { type: "string" } },
          ai_recommendation: { type: "string" },
        },
      },
    });
    return Response.json(res);
  }

  // ACTION: Auto-populate — scan all databases and create/update Leads
  const [leads, contractors, gcCompanies, jobs, prospects, callLogs] = await Promise.all([
    base44.asServiceRole.entities.Lead.filter({}),
    base44.asServiceRole.entities.Contractor.filter({}),
    base44.asServiceRole.entities.ContractorCompany.filter({}),
    base44.asServiceRole.entities.CommercialJob.filter({}),
    base44.asServiceRole.entities.ProspectCompany.filter({}),
    base44.asServiceRole.entities.CallLog.filter({}),
  ]);

  // Build dedup key set from existing leads
  const existingKeys = new Set(leads.map(l => `${(l.company || "").toLowerCase().trim()}-${(l.phone || "").replace(/\D/g, "")}`));
  const newContacts = [];
  let updated = 0;

  // Contractors → Leads
  for (const c of contractors) {
    if (!c.company_name && !c.contact_name) continue;
    const key = `${(c.company_name || "").toLowerCase().trim()}-${(c.phone || "").replace(/\D/g, "")}`;
    if (existingKeys.has(key)) continue;
    existingKeys.add(key);
    newContacts.push({
      company: c.company_name || c.contact_name || "Unknown",
      contact_name: c.contact_name || "",
      email: c.email || "",
      phone: c.phone || "",
      website: c.website || "",
      vertical: c.contractor_type || "",
      specialty: c.specialty || "",
      location: `${c.city || ""}, ${c.state || ""}`.replace(/^,\s*|,\s*$/g, ""),
      city: c.city || "",
      state: c.state || "",
      employee_count: c.employee_count || 0,
      stage: "Incoming",
      pipeline_status: "Incoming",
      lead_type: "XPress",
      ingestion_source: "Other",
      source: `Contractor DB (${c.id})`,
      score: c.score || 50,
      notes: c.notes || "",
    });
  }

  // GC Companies → Leads
  for (const gc of gcCompanies) {
    if (!gc.company_name) continue;
    const key = `${gc.company_name.toLowerCase().trim()}-${(gc.phone || "").replace(/\D/g, "")}`;
    if (existingKeys.has(key)) continue;
    existingKeys.add(key);
    newContacts.push({
      company: gc.company_name,
      contact_name: gc.preconstruction_contact_name || gc.estimator_name || "",
      email: gc.email || gc.preconstruction_email || gc.estimator_email || "",
      phone: gc.phone || gc.preconstruction_phone || gc.estimator_phone || "",
      website: gc.website || "",
      vertical: "General Contractor",
      location: `${gc.city || ""}, ${gc.state || ""}`.replace(/^,\s*|,\s*$/g, ""),
      city: gc.city || "",
      state: gc.state || "",
      employee_count: gc.employee_count || 0,
      stage: "Incoming",
      pipeline_status: "Incoming",
      lead_type: "Jobs",
      ingestion_source: "Other",
      source: `GC DB (${gc.id})`,
      score: gc.jobs_won_count ? 80 : 50,
    });
  }

  // Commercial Jobs → Leads (as job leads)
  for (const j of jobs) {
    if (!j.job_name && !j.gc_name && !j.owner_name) continue;
    const company = j.gc_name || j.owner_name || j.job_name;
    const phone = j.gc_phone || j.owner_phone || "";
    const key = `${company.toLowerCase().trim()}-${phone.replace(/\D/g, "")}`;
    if (existingKeys.has(key)) continue;
    existingKeys.add(key);
    newContacts.push({
      company,
      contact_name: j.gc_contact || j.owner_contact || "",
      email: j.gc_email || j.owner_email || "",
      phone,
      vertical: j.project_type || "",
      location: `${j.city || ""}, ${j.state || ""}`.replace(/^,\s*|,\s*$/g, ""),
      city: j.city || "",
      state: j.state || "",
      estimated_value: j.estimated_flooring_value || j.project_value || 0,
      stage: "Incoming",
      pipeline_status: "Incoming",
      lead_type: "Jobs",
      ingestion_source: "Other",
      source: `CommercialJob (${j.id})`,
      score: j.lead_score || j.urgency_score || 50,
      notes: j.job_name ? `Job: ${j.job_name}` : "",
    });
  }

  // Prospect Companies → Leads
  for (const p of prospects) {
    if (!p.company_name) continue;
    const key = `${p.company_name.toLowerCase().trim()}-${(p.phone || "").replace(/\D/g, "")}`;
    if (existingKeys.has(key)) continue;
    existingKeys.add(key);
    newContacts.push({
      company: p.company_name,
      contact_name: p.owner_name || "",
      email: p.email || "",
      phone: p.phone || "",
      website: p.website || "",
      vertical: p.specialty || "Epoxy",
      specialty: p.specialty || "",
      location: `${p.city || ""}, ${p.state || ""}`.replace(/^,\s*|,\s*$/g, ""),
      city: p.city || "",
      state: p.state || "",
      employee_count: p.employee_count || 0,
      years_in_business: p.years_in_business || 0,
      estimated_value: p.deal_value || 0,
      stage: "Incoming",
      pipeline_status: "Incoming",
      lead_type: "XPress",
      ingestion_source: "Other",
      source: `ProspectDB (${p.id})`,
      score: (p.cold_call_priority || 5) * 10,
      notes: p.ai_summary || "",
    });
  }

  // Bulk create in batches of 25
  let created = 0;
  for (let i = 0; i < newContacts.length; i += 25) {
    const batch = newContacts.slice(i, i + 25);
    await base44.asServiceRole.entities.Lead.bulkCreate(batch);
    created += batch.length;
  }

  // Build summary stats
  const stats = {
    existing_leads: leads.length,
    contractors_scanned: contractors.length,
    gc_companies_scanned: gcCompanies.length,
    jobs_scanned: jobs.length,
    prospects_scanned: prospects.length,
    call_logs: callLogs.length,
    new_contacts_created: created,
    duplicates_skipped: (contractors.length + gcCompanies.length + jobs.length + prospects.length) - created,
    total_crm_contacts: leads.length + created,
  };

  return Response.json({ success: true, stats });
});