import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * CENTRAL DATA ROUTER ENGINE
 * 
 * Every scraper, agent, import, and webhook calls this function.
 * It classifies, deduplicates, scores, routes, and cross-links
 * incoming data across the two data banks:
 * 
 *   OPS DB:    Lead, ContractorCompany, CommercialJob, Proposal
 *   INTEL CORE: IntelRecord, KnowledgeEntry, CompetitorProfile, CrawlResult
 * 
 * NEVER deletes — only archives with reason codes.
 */
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = await req.json();
  const { records, source_type = "manual", source_detail = "" } = payload;

  if (!records || !Array.isArray(records) || records.length === 0) {
    return Response.json({ error: 'records array is required' }, { status: 400 });
  }

  const results = {
    total: records.length,
    routed: { ops_db: 0, intel_core: 0, both: 0 },
    actions: { created: 0, enriched: 0, deduplicated: 0, archived: 0 },
    details: [],
  };

  for (const record of records) {
    try {
      const routeResult = await routeRecord(base44, record, source_type, source_detail);
      results.details.push(routeResult);

      // Tally
      if (routeResult.destination === "ops_db") results.routed.ops_db++;
      else if (routeResult.destination === "intel_core") results.routed.intel_core++;
      else if (routeResult.destination === "both") results.routed.both++;

      if (routeResult.action === "created") results.actions.created++;
      else if (routeResult.action === "enriched") results.actions.enriched++;
      else if (routeResult.action === "deduplicated") results.actions.deduplicated++;
    } catch (err) {
      results.details.push({ error: err.message, record_title: record.title || record.company || "unknown" });
    }
  }

  return Response.json(results);
});

async function routeRecord(base44, record, source_type, source_detail) {
  // Step 1: Classify the record using AI
  const classification = await classifyRecord(base44, record);

  // Step 2: Check for duplicates
  const dupCheck = await checkDuplicate(base44, classification, record);
  if (dupCheck.isDuplicate) {
    // Enrich existing record instead of creating new
    await enrichExisting(base44, dupCheck, record, classification);
    return {
      action: "enriched",
      destination: classification.destination,
      entity: dupCheck.entity,
      entity_id: dupCheck.existingId,
      classification: classification.type,
      detail: `Enriched existing ${dupCheck.entity} (${dupCheck.existingId})`,
    };
  }

  // Step 3: Route to correct entity
  const created = await createRouted(base44, classification, record, source_type, source_detail);

  // Step 4: Cross-link if routed to both banks
  if (classification.destination === "both" && created.ops_id && created.intel_id) {
    await crossLink(base44, classification, created);
  }

  return {
    action: "created",
    destination: classification.destination,
    entity: created.entity,
    entity_id: created.id || created.ops_id,
    classification: classification.type,
    detail: `Created new ${created.entity}`,
  };
}

async function classifyRecord(base44, record) {
  const preview = JSON.stringify(record).substring(0, 2000);

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `Classify this data record for a commercial flooring/epoxy business CRM and intelligence system.

DATA:
${preview}

RULES — classify into ONE primary type:
- "lead" — ANY record with a company name AND contact info (email, phone, or contact_name). This is the DEFAULT for business data. Route to OPS DB.
- "contractor" — specifically a general contractor or GC with construction/bidding info. Route to OPS DB.
- "job" — a specific commercial construction PROJECT with address, specs, permit info. Route to OPS DB.
- "intel" — brand/company intelligence WITHOUT contact info: social media data, location analytics, brand analysis. Route to INTEL CORE.
- "knowledge" — educational content: product specs, training materials, case studies, articles. Route to INTEL CORE.
- "competitor" — competitive analysis of a rival company. Route to INTEL CORE.
- "market_data" — industry trends, market statistics, economic data. Route to INTEL CORE.
- "lead_with_intel" — has BOTH contact info AND deep intelligence/analysis. Route to BOTH.

IMPORTANT: If the record has company + contact_name or company + email or company + phone, it is ALWAYS a "lead" (or "lead_with_intel" if it also has deep analysis). Default to "lead" when uncertain.

Extract the key identifier (company name or title) and a quality score 0-100.`,
    response_json_schema: {
      type: "object",
      properties: {
        type: { type: "string" },
        destination: { type: "string", description: "ops_db, intel_core, or both" },
        primary_name: { type: "string" },
        quality_score: { type: "number" },
        category: { type: "string" },
        summary: { type: "string" },
      }
    }
  });

  // Normalize type and destination
  const validTypes = ["lead", "contractor", "job", "intel", "knowledge", "competitor", "market_data", "lead_with_intel"];
  if (!validTypes.includes(result.type)) {
    // Fallback: if record has company+contact, treat as lead
    const raw = JSON.stringify(record).toLowerCase();
    if ((record.company || record.company_name) && (record.contact_name || record.email || record.phone)) {
      result.type = "lead";
    } else {
      result.type = "intel";
    }
  }

  const typeToDestination = {
    lead: "ops_db", contractor: "ops_db", job: "ops_db",
    intel: "intel_core", knowledge: "intel_core", competitor: "intel_core", market_data: "intel_core",
    lead_with_intel: "both",
  };
  result.destination = typeToDestination[result.type] || "intel_core";

  return result;
}

async function checkDuplicate(base44, classification, record) {
  const name = classification.primary_name || record.company || record.title || "";
  if (!name || name.length < 2) return { isDuplicate: false };

  const nameClean = name.trim().toLowerCase();

  try {
    if (classification.type === "lead" || classification.type === "lead_with_intel") {
      const leads = await base44.asServiceRole.entities.Lead.list("-created_date", 200);
      const match = leads.find(l => l.company && l.company.trim().toLowerCase() === nameClean);
      if (match) return { isDuplicate: true, entity: "Lead", existingId: match.id, existing: match };
    }

    if (classification.type === "contractor") {
      const gcs = await base44.asServiceRole.entities.ContractorCompany.list("-created_date", 200);
      const match = gcs.find(c => c.company_name && c.company_name.trim().toLowerCase() === nameClean);
      if (match) return { isDuplicate: true, entity: "ContractorCompany", existingId: match.id, existing: match };
    }

    if (classification.type === "intel" || classification.type === "knowledge" || classification.type === "competitor") {
      const intels = await base44.asServiceRole.entities.IntelRecord.list("-created_date", 200);
      const match = intels.find(i => i.title && i.title.trim().toLowerCase() === nameClean);
      if (match) return { isDuplicate: true, entity: "IntelRecord", existingId: match.id, existing: match };
    }
  } catch (e) {
    // If dedup fails, proceed with creation
  }

  return { isDuplicate: false };
}

async function enrichExisting(base44, dupCheck, newRecord, classification) {
  const updates = {};

  if (dupCheck.entity === "Lead") {
    // Merge new fields into existing lead without overwriting
    const existing = dupCheck.existing;
    if (newRecord.email && !existing.email) updates.email = newRecord.email;
    if (newRecord.phone && !existing.phone) updates.phone = newRecord.phone;
    if (newRecord.website && !existing.website) updates.website = newRecord.website;
    if (newRecord.city && !existing.city) updates.city = newRecord.city;
    if (newRecord.state && !existing.state) updates.state = newRecord.state;
    if (newRecord.estimated_value && (!existing.estimated_value || newRecord.estimated_value > existing.estimated_value)) {
      updates.estimated_value = newRecord.estimated_value;
    }
    if (newRecord.employee_count && !existing.employee_count) updates.employee_count = newRecord.employee_count;
    if (newRecord.vertical && !existing.vertical) updates.vertical = newRecord.vertical;

    // Append to notes
    const enrichNote = `[DataRouter ${new Date().toISOString().split('T')[0]}] Enriched from ${classification.type} source. ${classification.summary || ''}`;
    updates.notes = (existing.notes || "") + "\n" + enrichNote;
    updates.enrichment_count = (existing.enrichment_count || 0) + 1;
    updates.last_enriched = new Date().toISOString();

    if (Object.keys(updates).length > 0) {
      await base44.asServiceRole.entities.Lead.update(dupCheck.existingId, updates);
    }
  } else if (dupCheck.entity === "IntelRecord") {
    // Append new content
    const existing = dupCheck.existing;
    const newContent = newRecord.content || newRecord.summary || classification.summary || "";
    if (newContent) {
      updates.content = (existing.content || "").substring(0, 8000) + "\n\n---\n" + newContent.substring(0, 2000);
      updates.data_freshness = "recent";
      updates.scraped_at = new Date().toISOString();
    }
    if (Object.keys(updates).length > 0) {
      await base44.asServiceRole.entities.IntelRecord.update(dupCheck.existingId, updates);
    }
  } else if (dupCheck.entity === "ContractorCompany") {
    const existing = dupCheck.existing;
    if (newRecord.email && !existing.email) updates.email = newRecord.email;
    if (newRecord.phone && !existing.phone) updates.phone = newRecord.phone;
    if (newRecord.website && !existing.website) updates.website = newRecord.website;
    updates.last_updated = new Date().toISOString();

    if (Object.keys(updates).length > 0) {
      await base44.asServiceRole.entities.ContractorCompany.update(dupCheck.existingId, updates);
    }
  }
}

async function createRouted(base44, classification, record, source_type, source_detail) {
  const now = new Date().toISOString();

  if (classification.type === "lead" || classification.type === "lead_with_intel") {
    const lead = await base44.asServiceRole.entities.Lead.create({
      company: record.company || classification.primary_name || "Unknown",
      contact_name: record.contact_name || record.contact || "",
      email: record.email || "",
      phone: record.phone || "",
      website: record.website || "",
      city: record.city || "",
      state: record.state || "",
      vertical: record.vertical || "Other",
      estimated_value: record.estimated_value || 0,
      square_footage: record.square_footage || 0,
      employee_count: record.employee_count || 0,
      stage: "Incoming",
      pipeline_status: "Incoming",
      ingestion_source: "DataRouter",
      source: `${source_type}: ${source_detail}`,
      data_bank_origin: "routed",
      notes: `Routed by DataRouter. Classification: ${classification.type}. Quality: ${classification.quality_score}. ${classification.summary || ""}`,
    });

    // If "both" — also create intel record
    if (classification.type === "lead_with_intel") {
      const intel = await base44.asServiceRole.entities.IntelRecord.create({
        title: `Intel: ${classification.primary_name}`,
        category: "custom",
        source_company: "XPS Intelligence",
        content: record.intel_content || record.content || classification.summary || "",
        summary: classification.summary || "",
        source_type: "llm_research",
        data_freshness: "recent",
        scraped_at: now,
        tags: record.tags || "",
      });
      // Cross-link
      await base44.asServiceRole.entities.Lead.update(lead.id, {
        intel_record_ids: intel.id,
      });
      return { entity: "Lead+IntelRecord", ops_id: lead.id, intel_id: intel.id, id: lead.id };
    }

    return { entity: "Lead", id: lead.id };
  }

  if (classification.type === "contractor") {
    const gc = await base44.asServiceRole.entities.ContractorCompany.create({
      company_name: record.company_name || record.company || classification.primary_name || "Unknown",
      state: record.state || "Unknown",
      city: record.city || "",
      website: record.website || "",
      email: record.email || "",
      phone: record.phone || "",
      source_url: record.source_url || "",
      discovered_date: now,
      notes: `Routed by DataRouter. ${classification.summary || ""}`,
    });
    return { entity: "ContractorCompany", id: gc.id };
  }

  if (classification.type === "job") {
    const job = await base44.asServiceRole.entities.CommercialJob.create({
      job_name: record.job_name || record.title || classification.primary_name || "Unknown Project",
      city: record.city || "",
      state: record.state || "Unknown",
      project_type: record.project_type || "other",
      project_phase: "discovered",
      source_type: "Other",
      discovery_date: now,
      notes: `Routed by DataRouter. ${classification.summary || ""}`,
    });
    return { entity: "CommercialJob", id: job.id };
  }

  // Intel core types
  if (["intel", "knowledge", "competitor", "market_data"].includes(classification.type)) {
    const categoryMap = {
      intel: "custom", knowledge: "custom", competitor: "custom", market_data: "industry_data",
    };
    const intel = await base44.asServiceRole.entities.IntelRecord.create({
      title: record.title || classification.primary_name || "Untitled",
      category: record.category || categoryMap[classification.type] || "custom",
      source_company: record.source_company || "XPS Intelligence",
      content: (record.content || record.raw_content || "").substring(0, 10000),
      summary: classification.summary || record.summary || "",
      source_url: record.source_url || "",
      source_type: record.source_type || "llm_research",
      tags: record.tags || "",
      confidence_score: classification.quality_score || 50,
      data_freshness: "recent",
      scraped_at: now,
      is_indexed: false,
    });
    return { entity: "IntelRecord", id: intel.id };
  }

  // Fallback: store in IntelRecord
  const intel = await base44.asServiceRole.entities.IntelRecord.create({
    title: record.title || classification.primary_name || "Unclassified Record",
    category: "custom",
    source_company: "Custom",
    content: JSON.stringify(record).substring(0, 10000),
    summary: classification.summary || "",
    source_type: "manual",
    data_freshness: "recent",
    scraped_at: now,
  });
  return { entity: "IntelRecord", id: intel.id };
}

async function crossLink(base44, classification, created) {
  // Link ops record to intel record
  if (created.ops_id && created.intel_id) {
    try {
      await base44.asServiceRole.entities.Lead.update(created.ops_id, {
        intel_record_ids: created.intel_id,
      });
    } catch (e) {
      // Non-critical
    }
  }
}