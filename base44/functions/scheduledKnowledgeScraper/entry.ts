import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const COMPANY_TARGETS = [
  { name: "Xtreme Polishing Systems", abbr: "XPS", url: "xtremepolishingsystems.com", prompt: "Research Xtreme Polishing Systems — latest products, pricing, news, social media posts, reviews, team updates, job postings" },
  { name: "National Concrete Polishing", abbr: "NCP", url: "nationalconcretepolishing.com", prompt: "Research National Concrete Polishing — recent projects, services, news, reviews, social media, team" },
  { name: "XPS Xpress", abbr: "XPRESS", url: "xpsxpress.com", prompt: "Research XPS Xpress — product catalog updates, pricing changes, new products, reviews, shipping" },
  { name: "Concrete Polishing University", abbr: "CPU", url: "concretepolishinguniversity.com", prompt: "Research Concrete Polishing University — new courses, certifications, pricing, student reviews, events" },
];

const INDUSTRY_TARGETS = [
  { prompt: "Latest trends and news in commercial epoxy flooring and concrete polishing industry — pricing, regulations, innovations, market data", industry: "Flooring & Coatings" },
  { prompt: "Latest commercial construction projects requiring concrete flooring — new permits, bid opportunities, government contracts", industry: "Construction" },
  { prompt: "Latest AI, automation, and SaaS tools for construction and flooring businesses", industry: "Technology" },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    let totalCreated = 0;
    const errors = [];

    // Scrape company targets
    for (const target of COMPANY_TARGETS) {
      try {
        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: target.prompt + ". Return structured findings with title, category, content, source_url, and tags.",
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              findings: { type: "array", items: { type: "object", properties: {
                title: { type: "string" }, category: { type: "string" },
                content: { type: "string" }, source_url: { type: "string" }, tags: { type: "string" }
              }}}
            }
          },
          model: "gemini_3_flash"
        });
        
        const findings = result?.findings || [];
        if (findings.length > 0) {
          await base44.asServiceRole.entities.IntelRecord.bulkCreate(
            findings.map(f => ({
              source_company: target.abbr, category: f.category || "custom",
              title: f.title, content: f.content, source_url: f.source_url || target.url,
              source_type: "scraper", tags: f.tags || target.name,
              confidence_score: 75, scraped_at: new Date().toISOString(), is_indexed: true,
            }))
          );
          totalCreated += findings.length;
        }
      } catch (e) {
        errors.push(`${target.abbr}: ${e.message}`);
      }
    }

    // Scrape industry targets
    for (const target of INDUSTRY_TARGETS) {
      try {
        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: target.prompt + ". Return structured findings.",
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              findings: { type: "array", items: { type: "object", properties: {
                title: { type: "string" }, content: { type: "string" },
                source_url: { type: "string" }, tags: { type: "string" }
              }}}
            }
          },
          model: "gemini_3_flash"
        });
        
        const findings = result?.findings || [];
        if (findings.length > 0) {
          await base44.asServiceRole.entities.IntelRecord.bulkCreate(
            findings.map(f => ({
              source_company: "Industry", category: "industry_data",
              industry: target.industry, title: f.title, content: f.content,
              source_url: f.source_url || "", source_type: "scraper",
              tags: f.tags || target.industry, confidence_score: 70,
              scraped_at: new Date().toISOString(), is_indexed: true,
            }))
          );
          totalCreated += findings.length;
        }
      } catch (e) {
        errors.push(`Industry(${target.industry}): ${e.message}`);
      }
    }

    // Log the run
    await base44.asServiceRole.entities.OvernightRunLog.create({
      run_type: "knowledge_scraper",
      status: errors.length === 0 ? "success" : "partial",
      summary: `Knowledge scraper: ${totalCreated} records created from ${COMPANY_TARGETS.length} companies + ${INDUSTRY_TARGETS.length} industries`,
      records_created: totalCreated,
      errors: errors.length > 0 ? JSON.stringify(errors) : null,
    });

    // Notify admin
    if (totalCreated > 0) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: "admin@xtremepolishingsystems.com",
        subject: `🧠 Knowledge Scraper: ${totalCreated} new records ingested`,
        body: `<h3>Automated Knowledge Scrape Complete</h3><p>${totalCreated} new intel records created.</p><p>Companies: ${COMPANY_TARGETS.map(t => t.abbr).join(", ")}</p><p>Industries: ${INDUSTRY_TARGETS.map(t => t.industry).join(", ")}</p>${errors.length > 0 ? `<p>Errors: ${errors.join(", ")}</p>` : ""}`
      });
    }

    return Response.json({ success: true, total_created: totalCreated, errors });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});