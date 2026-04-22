import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // Load ALL 9 data sources end-to-end
  const [leads, prospects, contractors, gcCompanies, jobs, outreach, alerts, bids, proposals] = await Promise.all([
    base44.asServiceRole.entities.Lead.list("-score", 2000),
    base44.asServiceRole.entities.ProspectCompany.list("-cold_call_priority", 500),
    base44.asServiceRole.entities.Contractor.list("-score", 500),
    base44.asServiceRole.entities.ContractorCompany.list("-created_date", 500),
    base44.asServiceRole.entities.CommercialJob.list("-urgency_score", 500),
    base44.asServiceRole.entities.OutreachEmail.list("-created_date", 500),
    base44.asServiceRole.entities.RegistryAlert.list("-created_date", 500),
    base44.asServiceRole.entities.BidDocument.list("-created_date", 100),
    base44.asServiceRole.entities.Proposal.list("-created_date", 100),
  ]);

  const normalize = (str) => (str || "").toLowerCase().replace(/[^a-z0-9]/g, "").trim();
  const dedupMap = new Map();
  const dupeLog = [];
  let totalBefore = 0;

  const addEntry = (item, source, mapper) => {
    totalBefore++;
    const data = mapper(item);
    if (!data.company_name || data.company_name === "Unknown" || !data.company_name.trim()) return;
    const key = normalize(data.company_name) + "_" + normalize(data.state || "");
    if (dedupMap.has(key)) {
      const ex = dedupMap.get(key);
      if (!ex.email && data.email) ex.email = data.email;
      if (!ex.phone && data.phone) ex.phone = data.phone;
      if (!ex.contact_name && data.contact_name) ex.contact_name = data.contact_name;
      if (!ex.website && data.website) ex.website = data.website;
      if (!ex.ai_insight && data.ai_insight) ex.ai_insight = data.ai_insight;
      if (data.score > (ex.score || 0)) ex.score = data.score;
      if (data.estimated_value > (ex.estimated_value || 0)) ex.estimated_value = data.estimated_value;
      ex.sources.push(source);
      ex.source_ids.push(item.id);
      dupeLog.push({ company: data.company_name, from: source, into: ex.primary_source });
    } else {
      dedupMap.set(key, { ...data, primary_source: source, sources: [source], source_ids: [item.id] });
    }
  };

  // 1. Lead
  leads.forEach(l => addEntry(l, "Lead", (l) => ({
    company_name: l.company || "", contact_name: l.contact_name || "",
    email: l.email || "", phone: l.phone || "", website: l.website || "",
    city: l.city || "", state: l.state || "",
    location: l.location || `${l.city || ""}, ${l.state || ""}`.trim(),
    score: l.score || 0, priority: l.priority || Math.round((l.score || 50) / 10),
    vertical: l.vertical || "", specialty: l.specialty || "",
    ai_insight: l.ai_insight || "", ai_recommendation: l.ai_recommendation || "",
    estimated_value: l.estimated_value || 0, employee_count: l.employee_count || 0,
    years_in_business: l.years_in_business || 0, stage: l.stage || "Incoming",
  })));

  // 2. ProspectCompany
  prospects.forEach(p => addEntry(p, "Prospect", (p) => ({
    company_name: p.company_name || "", contact_name: p.owner_name || "",
    email: p.email || "", phone: p.phone || "", website: p.website || "",
    city: p.city || "", state: p.state || "",
    location: `${p.city || ""}, ${p.state || ""}`.trim(),
    score: (p.cold_call_priority || 5) * 10, priority: p.cold_call_priority || 5,
    vertical: p.specialty || "", specialty: p.specialty || "",
    ai_insight: p.ai_summary || "", ai_recommendation: p.ai_pitch || "",
    estimated_value: p.deal_value || 0, employee_count: p.employee_count || 0,
    years_in_business: p.years_in_business || 0,
  })));

  // 3. Contractor
  contractors.forEach(c => addEntry(c, "Contractor", (c) => ({
    company_name: c.company_name || "", contact_name: c.contact_name || "",
    email: c.email || "", phone: c.phone || "", website: c.website || "",
    city: c.city || "", state: c.state || "",
    location: `${c.city || ""}, ${c.state || ""}`.trim(),
    score: c.score || 70, priority: 7,
    vertical: c.contractor_type || "", specialty: c.specialty || "",
    ai_insight: c.notes || "", estimated_value: c.annual_revenue || 0,
    employee_count: c.employee_count || 0,
  })));

  // 4. ContractorCompany (GC targets)
  gcCompanies.forEach(gc => addEntry(gc, "GC Company", (gc) => ({
    company_name: gc.company_name || "",
    contact_name: gc.preconstruction_contact_name || gc.estimator_name || "",
    email: gc.email || gc.preconstruction_email || "",
    phone: gc.phone || gc.preconstruction_phone || "",
    website: gc.website || "", city: gc.city || "", state: gc.state || "",
    location: `${gc.city || ""}, ${gc.state || ""}`.trim(),
    score: 80, priority: 8, vertical: "General Contractor",
    ai_insight: (gc.notes || "").substring(0, 300),
    estimated_value: gc.average_project_value || 0, employee_count: gc.employee_count || 0,
  })));

  // 5. CommercialJob
  jobs.forEach(j => addEntry(j, "Job", (j) => ({
    company_name: j.gc_name || j.owner_name || j.job_name || "",
    contact_name: j.gc_contact || j.owner_contact || "",
    email: j.gc_email || j.owner_email || "", phone: j.gc_phone || j.owner_phone || "",
    website: "", city: j.city || "", state: j.state || "",
    location: `${j.city || ""}, ${j.state || ""}`.trim(),
    score: j.lead_score || j.urgency_score || 50,
    priority: Math.round((j.urgency_score || j.lead_score || 50) / 10),
    vertical: j.project_type || "", ai_insight: j.ai_insight || "",
    estimated_value: j.estimated_flooring_value || j.project_value || 0,
  })));

  // 6. OutreachEmail (past outreach recipients)
  outreach.forEach(o => addEntry(o, "Outreach", (o) => ({
    company_name: o.to_name || "", contact_name: "",
    email: o.to_email || "", phone: "", website: "",
    city: "", state: "", location: "",
    score: 60, priority: 6, vertical: "", ai_insight: o.notes || "",
    estimated_value: 0,
  })));

  // 7. RegistryAlert (newly discovered companies)
  alerts.forEach(a => addEntry(a, "Registry", (a) => ({
    company_name: a.business_name || "", contact_name: a.registered_agent || "",
    email: a.email || "", phone: a.phone || "", website: a.website || "",
    city: "", state: a.state || "", location: a.state || "",
    score: a.opportunity_score || 70, priority: 7,
    vertical: a.category || "", ai_insight: a.notes || "",
    estimated_value: 0,
  })));

  // 8. BidDocument (bid recipients)
  bids.forEach(b => addEntry(b, "Bid", (b) => ({
    company_name: b.recipient_company || b.project_name || "",
    contact_name: "", email: b.recipient_email || "", phone: "",
    website: "", city: "", state: "",
    location: b.project_address || "",
    score: 75, priority: 7, vertical: "",
    ai_insight: `Bid: ${b.project_name || ""}`,
    estimated_value: (b.total_material_cost || 0) + (b.total_labor_cost || 0),
  })));

  // 9. Proposal (proposal clients)
  proposals.forEach(p => addEntry(p, "Proposal", (p) => ({
    company_name: p.client_name || "", contact_name: p.client_contact || "",
    email: p.client_email || "", phone: "", website: "",
    city: "", state: "", location: "",
    score: 80, priority: 8, vertical: p.service_type || "",
    ai_insight: `Proposal: ${p.title || ""}`,
    estimated_value: p.total_value || 0,
  })));

  const compiled = Array.from(dedupMap.values());
  compiled.sort((a, b) => (b.score || 0) - (a.score || 0));

  const valid = (v) => v && v !== "n/a" && v !== "Not Available" && v !== "";
  const withEmail = compiled.filter(c => valid(c.email)).length;
  const withPhone = compiled.filter(c => valid(c.phone)).length;
  const withBoth = compiled.filter(c => valid(c.email) && valid(c.phone)).length;

  return Response.json({
    summary: {
      sources: {
        leads: leads.length, prospects: prospects.length, contractors: contractors.length,
        gc_companies: gcCompanies.length, jobs: jobs.length, outreach: outreach.length,
        registry_alerts: alerts.length, bids: bids.length, proposals: proposals.length,
      },
      total_before_dedup: totalBefore,
      total_after_dedup: compiled.length,
      duplicates_merged: dupeLog.length,
      with_email: withEmail, with_phone: withPhone, with_both: withBoth,
    },
    dupe_log: dupeLog.slice(0, 30),
    queue: compiled,
  });
});