import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, url, keywords, raw_text, category } = await req.json();

    if (action === 'scrape_site') {
      // Use InvokeLLM with web context to analyze a site
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze the website at ${url} for SEO purposes. Extract:
1. All visible keywords and key phrases
2. Meta title and description
3. Main content topics and themes
4. Internal link structure quality
5. Content gaps and opportunities
6. Social media links found
7. Overall SEO health assessment

Be thorough and specific to the epoxy flooring / polished concrete industry.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            site_title: { type: "string" },
            meta_description: { type: "string" },
            primary_keywords: { type: "array", items: { type: "string" } },
            secondary_keywords: { type: "array", items: { type: "string" } },
            content_topics: { type: "array", items: { type: "string" } },
            social_profiles: { type: "array", items: { type: "string" } },
            seo_score: { type: "number" },
            strengths: { type: "array", items: { type: "string" } },
            weaknesses: { type: "array", items: { type: "string" } },
            opportunities: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });

      return Response.json({ success: true, analysis: result });
    }

    if (action === 'competitor_analysis') {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Research the competitor "${url}" in the epoxy flooring / polished concrete industry. Find:
1. Their main keywords and ranking terms
2. Content strategy (blog frequency, social activity)
3. Services offered and pricing indicators
4. Geographic coverage
5. Customer reviews sentiment
6. Ad campaigns running (Google, social)
7. Strengths vs XPS Xpress (60+ locations, AI-powered)
8. Weaknesses we can exploit

Compare against XPS Xpress strengths: 60+ franchise locations, AI-powered CRM, certified training, Epoxy Network marketplace, full product catalog.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            company_name: { type: "string" },
            website: { type: "string" },
            keywords: { type: "array", items: { type: "string" } },
            content_strategy: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            weaknesses: { type: "array", items: { type: "string" } },
            opportunities: { type: "array", items: { type: "string" } },
            estimated_traffic: { type: "string" },
            social_presence: { type: "string" },
            threat_level: { type: "string" }
          }
        }
      });

      return Response.json({ success: true, competitor: result });
    }

    if (action === 'filter_knowledge') {
      // Filter and clean raw data before storing
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a data curator for XPS Xpress (epoxy flooring company). Filter and clean this raw data:

${raw_text}

Instructions:
1. Remove duplicate information
2. Remove irrelevant content not related to XPS, epoxy, polished concrete, or business operations
3. Extract key facts, statistics, and actionable data points
4. Identify all keywords and industry terms
5. Generate a concise summary
6. Score the content quality and relevance (0-100)
7. Categorize as: ${category || 'Auto-detect'}`,
        response_json_schema: {
          type: "object",
          properties: {
            cleaned_content: { type: "string" },
            summary: { type: "string" },
            key_facts: { type: "array", items: { type: "string" } },
            keywords: { type: "array", items: { type: "string" } },
            quality_score: { type: "number" },
            suggested_category: { type: "string" },
            is_relevant: { type: "boolean" },
            notes: { type: "string" }
          }
        }
      });

      return Response.json({ success: true, filtered: result });
    }

    if (action === 'generate_content') {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate SEO-optimized content for XPS Xpress / XPS Intelligence.

Target keywords: ${keywords}
Content type: ${category || 'Blog Post'}

About XPS: Xtreme Polishing Systems is America's #1 epoxy and polished concrete franchise with 60+ locations, 200+ team members, AI-powered CRM (XPS Intelligence), certified training programs, and the Epoxy Network contractor marketplace.

Create compelling, keyword-rich content that:
- Naturally incorporates target keywords
- Includes strong CTAs
- Is optimized for search engines
- Sounds authoritative and industry-expert
- References real XPS capabilities and scale`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            meta_title: { type: "string" },
            meta_description: { type: "string" },
            body: { type: "string" },
            hashtags: { type: "array", items: { type: "string" } },
            target_keywords: { type: "array", items: { type: "string" } },
            word_count: { type: "number" }
          }
        }
      });

      return Response.json({ success: true, content: result });
    }

    return Response.json({ error: 'Invalid action. Use: scrape_site, competitor_analysis, filter_knowledge, generate_content' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});