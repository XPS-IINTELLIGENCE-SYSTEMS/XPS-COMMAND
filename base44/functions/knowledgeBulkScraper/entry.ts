import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { urls, keywords, category, scrape_depth } = await req.json();
  
  if ((!urls || urls.length === 0) && (!keywords || keywords.length === 0)) {
    return Response.json({ error: 'Provide at least one URL or keyword' }, { status: 400 });
  }

  const allUrls = urls || [];
  const allKeywords = keywords || [];
  const depth = scrape_depth || "standard";
  const cat = category || "Product Info";

  const prompt = `You are a deep knowledge extraction engine for Xtreme Polishing Systems (XPS).

YOUR MISSION: Extract comprehensive, structured business intelligence from the provided sources and compile it into a knowledge base.

${allUrls.length > 0 ? `URLS TO SCRAPE AND ANALYZE:
${allUrls.map((u, i) => `${i + 1}. ${u}`).join('\n')}

For each URL:
- Extract ALL product information, pricing, specifications, services offered
- Identify company positioning, target markets, competitive advantages
- Pull technical data sheets, application guides, coverage rates
- Note certifications, warranties, compliance standards
- Extract contact info, service areas, team/leadership info
- Identify their technology stack, equipment, materials used
` : ''}

${allKeywords.length > 0 ? `INDUSTRY KEYWORDS & PHRASES TO RESEARCH:
${allKeywords.map((k, i) => `${i + 1}. "${k}"`).join('\n')}

For each keyword/phrase:
- Search authoritative industry sources (trade publications, manufacturer sites, industry associations)
- Extract technical specifications, best practices, application methods
- Find pricing benchmarks, market trends, competitive landscape data
- Identify emerging technologies, new product developments
- Pull safety data, regulatory requirements, certification standards
- Note common problems/solutions, FAQs, troubleshooting guides
` : ''}

SCRAPE DEPTH: ${depth}
${depth === "deep" ? "Go extremely thorough — extract every data point, spec sheet detail, pricing tier, and technical specification available." : 
  depth === "competitor" ? "Focus on competitive intelligence — pricing, market positioning, strengths/weaknesses, customer reviews, product comparisons." :
  "Standard extraction — key facts, products, pricing, specs, and insights."}

For EACH piece of knowledge found, create a structured entry with:
- title: Clear descriptive title
- category: ${cat}
- content: Full extracted content (be thorough)
- summary: 2-3 sentence summary
- key_facts: Array of specific extracted facts (prices, specs, percentages, etc.)
- tags: Relevant tags for search
- source_url: Where this came from
- source_domain: Domain name
- relevance_score: 1-100 how relevant to XPS/flooring industry
- is_competitor_intel: true/false
- is_pricing_data: true/false
- is_technical_spec: true/false

Extract AS MUCH knowledge as possible. Be thorough. Each distinct topic should be its own entry.`;

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    add_context_from_internet: true,
    model: "gemini_3_flash",
    response_json_schema: {
      type: "object",
      properties: {
        entries: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              category: { type: "string" },
              content: { type: "string" },
              summary: { type: "string" },
              key_facts: { type: "array", items: { type: "string" } },
              tags: { type: "string" },
              source_url: { type: "string" },
              source_domain: { type: "string" },
              relevance_score: { type: "number" },
              is_competitor_intel: { type: "boolean" },
              is_pricing_data: { type: "boolean" },
              is_technical_spec: { type: "boolean" }
            }
          }
        },
        scrape_summary: { type: "string" },
        total_data_points: { type: "number" },
        sources_analyzed: { type: "number" }
      }
    }
  });

  const entries = result.entries || [];
  const created = [];

  for (const entry of entries) {
    const record = await base44.asServiceRole.entities.KnowledgeEntry.create({
      title: entry.title || "Untitled",
      category: entry.category || cat,
      content: entry.content || "",
      summary: entry.summary || "",
      key_facts: JSON.stringify(entry.key_facts || []),
      tags: entry.tags || "",
      source_url: entry.source_url || "",
      source_domain: entry.source_domain || "",
      relevance_score: entry.relevance_score || 50,
      is_competitor_intel: entry.is_competitor_intel || false,
      is_pricing_data: entry.is_pricing_data || false,
      is_technical_spec: entry.is_technical_spec || false,
      is_high_priority: (entry.relevance_score || 0) >= 80,
      ingested_date: new Date().toISOString(),
      last_updated: new Date().toISOString()
    });
    created.push(record);
  }

  return Response.json({
    entries_created: created.length,
    summary: result.scrape_summary || `Scraped ${created.length} knowledge entries`,
    total_data_points: result.total_data_points || created.length,
    sources_analyzed: result.sources_analyzed || allUrls.length,
    entries: created
  });
});