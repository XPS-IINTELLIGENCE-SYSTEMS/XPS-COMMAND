import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { target, prompt, source_company, category, industry, sub_industry } = await req.json();

    const searchPrompt = prompt || `Research and find the latest information about: ${target}. Include news, products, pricing, reviews, social media, team info, and any publicly available business data.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: searchPrompt + ". Return structured findings with title, category, content, source_url, and tags for each finding.",
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          findings: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                category: { type: "string" },
                content: { type: "string" },
                source_url: { type: "string" },
                tags: { type: "string" }
              }
            }
          }
        }
      },
      model: "gemini_3_flash"
    });

    const findings = result?.findings || [];
    let created = 0;

    if (findings.length > 0) {
      await base44.entities.IntelRecord.bulkCreate(
        findings.map(f => ({
          source_company: source_company || "Custom",
          category: category || f.category || "custom",
          industry: industry || "",
          sub_industry: sub_industry || "",
          title: f.title,
          content: f.content,
          source_url: f.source_url || "",
          source_type: "scraper",
          tags: f.tags || target || "",
          confidence_score: 75,
          scraped_at: new Date().toISOString(),
          is_indexed: true,
        }))
      );
      created = findings.length;
    }

    return Response.json({ success: true, records_created: created, findings_count: findings.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});