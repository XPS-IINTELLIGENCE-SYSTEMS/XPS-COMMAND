import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { file_url, file_name } = await req.json();
  if (!file_url) return Response.json({ error: 'file_url is required' }, { status: 400 });

  // Step 1: Extract content from uploaded file
  const extracted = await base44.asServiceRole.integrations.Core.ExtractDataFromUploadedFile({
    file_url,
    json_schema: {
      type: "object",
      properties: {
        text_content: { type: "string" },
        data_rows: { type: "array", items: { type: "object" } }
      }
    }
  });

  const content = extracted.output?.text_content || JSON.stringify(extracted.output?.data_rows || []);
  const preview = content.substring(0, 3000);

  // Step 2: AI classifies the document
  const classification = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `Classify this uploaded document for an epoxy/flooring business CRM system.

File name: ${file_name}
Content preview:
${preview}

Determine the BEST route for this data. Choose ONE:
- "leads" — if it contains business contacts, company names, leads, prospects, phone/email lists
- "knowledge" — if it contains product info, training materials, technical specs, industry articles, how-to guides
- "competitor" — if it contains competitor data, competitive analysis, market comparison, competitor pricing
- "crm" — if it contains deal notes, customer communications, meeting notes, proposals, invoices
- "pricing" — if it contains price lists, pricing sheets, cost breakdowns, rate cards
- "api_config" — if it contains API keys, tokens, configuration, credentials, connection strings
- "general" — if none of the above clearly fit

Also extract key metadata from the content.`,
    response_json_schema: {
      type: "object",
      properties: {
        route: { type: "string" },
        confidence: { type: "number" },
        summary: { type: "string" },
        title: { type: "string" },
        extracted_count: { type: "number" },
        key_entities: { type: "array", items: { type: "string" } },
        tags: { type: "string" }
      }
    }
  });

  const route = classification.route || "general";
  let result = { route, classification };

  // Step 3: Route to appropriate entity
  if (route === "leads" && extracted.output?.data_rows?.length) {
    const rows = extracted.output.data_rows.slice(0, 100);
    const enriched = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Convert these data rows into CRM lead records. Each should have: company, contact_name, email, phone, city, state, vertical, notes.
Data: ${JSON.stringify(rows).substring(0, 4000)}`,
      response_json_schema: {
        type: "object",
        properties: {
          leads: { type: "array", items: { type: "object", properties: {
            company: { type: "string" }, contact_name: { type: "string" },
            email: { type: "string" }, phone: { type: "string" },
            city: { type: "string" }, state: { type: "string" },
            vertical: { type: "string" }, notes: { type: "string" }
          }}}
        }
      }
    });
    if (enriched.leads?.length) {
      await base44.asServiceRole.entities.Lead.bulkCreate(
        enriched.leads.map(l => ({ ...l, stage: "Incoming", pipeline_status: "Incoming", ingestion_source: "Attachment", lead_type: "XPress" }))
      );
      result.leads_imported = enriched.leads.length;
    }
  } else if (route === "knowledge" || route === "general") {
    await base44.asServiceRole.entities.KnowledgeEntry.create({
      title: classification.title || file_name,
      category: route === "knowledge" ? "Product Info" : "Custom",
      content: content.substring(0, 10000),
      summary: classification.summary || "",
      tags: classification.tags || "",
      source_url: file_url,
      ingested_date: new Date().toISOString()
    });
    result.knowledge_created = true;
  } else if (route === "competitor") {
    await base44.asServiceRole.entities.KnowledgeEntry.create({
      title: classification.title || file_name,
      category: "Competitor Intel",
      is_competitor_intel: true,
      content: content.substring(0, 10000),
      summary: classification.summary || "",
      tags: classification.tags || "",
      source_url: file_url,
      ingested_date: new Date().toISOString()
    });
    result.competitor_intel_created = true;
  } else if (route === "pricing") {
    await base44.asServiceRole.entities.KnowledgeEntry.create({
      title: classification.title || file_name,
      category: "Pricing",
      is_pricing_data: true,
      content: content.substring(0, 10000),
      summary: classification.summary || "",
      tags: classification.tags || "",
      source_url: file_url,
      ingested_date: new Date().toISOString()
    });
    result.pricing_data_created = true;
  } else if (route === "crm") {
    await base44.asServiceRole.entities.KnowledgeEntry.create({
      title: classification.title || file_name,
      category: "Case Study",
      content: content.substring(0, 10000),
      summary: classification.summary || "",
      tags: classification.tags || "",
      source_url: file_url,
      ingested_date: new Date().toISOString()
    });
    result.crm_note_created = true;
  } else if (route === "api_config") {
    await base44.asServiceRole.entities.APIConnector.create({
      service_type: "custom",
      description: classification.summary || file_name,
      notes: content.substring(0, 5000)
    });
    result.api_config_created = true;
  }

  return Response.json(result);
});