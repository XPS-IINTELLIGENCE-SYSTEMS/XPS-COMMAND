import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SCRAPE_TIERS = {
  xps_owned: {
    label: "XPS Owned Properties",
    frequency: "daily",
    urls: [
      "xtremepolishingsystems.com", "xpsxpress.com", "nationalconcretepolishing.net"
    ]
  },
  industry_site: {
    label: "Industry Information",
    frequency: "weekly",
    urls: [
      "concretedecor.net", "theconcreteproducer.com", "concreteconstruction.net",
      "icri.org", "concrete.org", "ascc.net", "worldofconcrete.com",
      "flooringcontractor.com", "fcnews.net", "contractormag.com",
      "forconstructionpros.com", "constructionexec.com"
    ]
  },
  ai_tech: {
    label: "AI & Technology",
    frequency: "daily",
    urls: [
      "anthropic.com/news", "openai.com/blog", "huggingface.co",
      "producthunt.com", "techcrunch.com/category/artificial-intelligence",
      "venturebeat.com/ai"
    ]
  },
  construction_news: {
    label: "Construction News",
    frequency: "daily",
    urls: [
      "constructiondive.com", "enr.com", "builderonline.com",
      "bisnow.com", "globest.com"
    ]
  },
  government: {
    label: "Government & Regulatory",
    frequency: "weekly",
    urls: [
      "bls.gov/iag/tgs/iag23.htm", "census.gov/construction",
      "osha.gov/construction"
    ]
  },
  financial: {
    label: "Financial & Economic",
    frequency: "weekly",
    urls: [
      "mckinsey.com/industries/private-equity-and-principal-investors/our-insights",
      "deloitte.com/us/en/insights/industry/engineering-and-construction.html"
    ]
  },
  trends_social: {
    label: "Trends & Social",
    frequency: "daily",
    urls: [
      "reddit.com/r/Flooring", "reddit.com/r/Construction",
      "reddit.com/r/ConcreteFinishing"
    ]
  }
};

const CATEGORY_MAP = {
  "product": "Product Info", "pricing": "Pricing", "technical": "Technical Spec",
  "market": "Market Data", "news": "Industry News", "competitor": "Competitor Intel",
  "ai": "AI Technology", "government": "Government Regulation", "financial": "Financial Data",
  "social": "Social Trend", "case_study": "Case Study"
};

function getCategoryForTier(category, suggestion) {
  return CATEGORY_MAP[suggestion] || 
    (category === 'ai_tech' ? 'AI Technology' : 
     category === 'government' ? 'Government Regulation' :
     category === 'financial' ? 'Financial Data' :
     category === 'trends_social' ? 'Social Trend' : 'Industry News');
}

async function scrapeAndProcess(base44, url, category) {
  const domain = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');

  try {
    const scrapeResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Extract the main content from https://${url}. Return the page title, a cleaned summary of the content (no nav/ads), key facts, and whether it contains pricing, technical specs, or competitor info.`,
      add_context_from_internet: true,
      model: "gemini_3_flash",
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          cleaned_content: { type: "string" },
          key_facts: { type: "array", items: { type: "string" } },
          has_pricing: { type: "boolean" },
          has_technical_specs: { type: "boolean" },
          has_competitor_info: { type: "boolean" },
          content_type: { type: "string" },
          quality_score: { type: "number" },
          summary: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
          category_suggestion: { type: "string" },
          is_high_priority: { type: "boolean" }
        }
      }
    });

    const contentText = (scrapeResult.cleaned_content || '').substring(0, 30000);

    const raw = await base44.asServiceRole.entities.RawKnowledge.create({
      source_url: `https://${url}`,
      source_domain: domain,
      source_category: category,
      scrape_date: new Date().toISOString(),
      raw_content: contentText,
      cleaned_content: contentText,
      content_type: scrapeResult.content_type || 'article',
      processing_status: 'cleaned',
      quality_score: scrapeResult.quality_score || 50,
      word_count: contentText.split(/\s+/).length,
      title: scrapeResult.title || domain
    });

    await base44.asServiceRole.entities.KnowledgeEntry.create({
      title: scrapeResult.title || domain,
      category: getCategoryForTier(category, scrapeResult.category_suggestion),
      source_url: `https://${url}`,
      source_domain: domain,
      content: contentText,
      summary: scrapeResult.summary || '',
      key_facts: JSON.stringify(scrapeResult.key_facts || []),
      tags: (scrapeResult.tags || []).join(', '),
      ingested_date: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      quality_score: scrapeResult.quality_score || 50,
      relevance_score: scrapeResult.quality_score || 50,
      is_competitor_intel: scrapeResult.has_competitor_info || false,
      is_pricing_data: scrapeResult.has_pricing || false,
      is_technical_spec: scrapeResult.has_technical_specs || false,
      is_high_priority: scrapeResult.is_high_priority || false,
      raw_knowledge_id: raw.id
    });

    await base44.asServiceRole.entities.RawKnowledge.update(raw.id, {
      processing_status: 'indexed'
    });

    return { url, status: 'success', title: scrapeResult.title };
  } catch (error) {
    console.error(`Scrape error for ${url}:`, error.message);
    try {
      await base44.asServiceRole.entities.RawKnowledge.create({
        source_url: `https://${url}`,
        source_domain: domain,
        source_category: category,
        scrape_date: new Date().toISOString(),
        processing_status: 'failed',
        error_message: error.message,
        quality_score: 0,
        word_count: 0,
        title: domain
      });
    } catch {}
    return { url, status: 'failed', error: error.message };
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const body = await req.json().catch(() => ({}));
    const { action, tier, urls, category, url } = body;

    // Scrape a specific tier — processes all URLs one-by-one with error isolation
    if (action === 'scrape_tier') {
      const tierConfig = SCRAPE_TIERS[tier];
      if (!tierConfig) return Response.json({ error: 'Invalid tier' }, { status: 400 });

      const results = [];
      for (const u of tierConfig.urls) {
        try {
          const result = await scrapeAndProcess(base44, u, tier);
          results.push(result);
        } catch (e) {
          console.error(`Tier URL failed: ${u}`, e.message);
          results.push({ url: u, status: 'failed', error: e.message });
        }
      }
      const succeeded = results.filter(r => r.status === 'success').length;
      return Response.json({ success: true, tier, scraped: results.length, succeeded, results });
    }

    // Scrape ALL URLs in a tier one-by-one with per-URL error isolation
    if (action === 'scrape_tier_all') {
      const tierConfig = SCRAPE_TIERS[tier];
      if (!tierConfig) return Response.json({ error: 'Invalid tier' }, { status: 400 });

      const results = [];
      for (const u of tierConfig.urls) {
        try {
          const result = await scrapeAndProcess(base44, u, tier);
          results.push(result);
        } catch (e) {
          console.error(`Tier URL failed: ${u}`, e.message);
          results.push({ url: u, status: 'failed', error: e.message });
        }
      }
      const succeeded = results.filter(r => r.status === 'success').length;
      return Response.json({ success: true, tier, scraped: results.length, succeeded, results });
    }

    // Scrape all URLs across ALL tiers matching a frequency — one URL per call
    if (action === 'scrape_scheduled') {
      const frequency = body.frequency || 'weekly';
      const matchingTiers = Object.entries(SCRAPE_TIERS)
        .filter(([, v]) => v.frequency === frequency);

      // Collect all URLs from matching tiers
      const allUrls = [];
      for (const [tierKey, tierConfig] of matchingTiers) {
        for (const u of tierConfig.urls) {
          allUrls.push({ url: u, tier: tierKey });
        }
      }

      // Process one URL at a time — pick by index
      const urlIndex = body.url_index || 0;
      if (urlIndex >= allUrls.length) {
        return Response.json({ success: true, message: `All ${frequency} URLs processed`, total: allUrls.length });
      }

      const target = allUrls[urlIndex];
      const result = await scrapeAndProcess(base44, target.url, target.tier);
      return Response.json({
        success: true, result, tier: target.tier,
        next_index: urlIndex + 1,
        remaining: allUrls.length - urlIndex - 1,
        total: allUrls.length
      });
    }

    // Scrape a single URL
    if (action === 'scrape_url') {
      if (!url) return Response.json({ error: 'URL required' }, { status: 400 });
      const cleanUrl = url.replace(/^https?:\/\//, '');
      const result = await scrapeAndProcess(base44, cleanUrl, category || 'other');
      return Response.json({ success: true, result });
    }

    // Scrape custom list of URLs
    if (action === 'scrape_batch') {
      if (!urls || !urls.length) return Response.json({ error: 'URLs required' }, { status: 400 });
      const results = [];
      for (const u of urls) {
        const cleanUrl = u.replace(/^https?:\/\//, '');
        const result = await scrapeAndProcess(base44, cleanUrl, category || 'other');
        results.push(result);
      }
      return Response.json({ success: true, scraped: results.length, results });
    }

    // Get scrape stats
    if (action === 'stats') {
      const [rawAll, entries, rawFailed] = await Promise.all([
        base44.asServiceRole.entities.RawKnowledge.list('-created_date', 500),
        base44.asServiceRole.entities.KnowledgeEntry.list('-created_date', 500),
        base44.asServiceRole.entities.RawKnowledge.filter({ processing_status: 'failed' }, '-created_date', 50)
      ]);

      const today = new Date().toISOString().split('T')[0];
      const todayRaw = rawAll.filter(r => r.scrape_date && r.scrape_date.startsWith(today));

      const categoryBreakdown = {};
      entries.forEach(e => {
        categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + 1;
      });

      return Response.json({
        total_raw: rawAll.length,
        total_entries: entries.length,
        total_failed: rawFailed.length,
        ingested_today: todayRaw.length,
        category_breakdown: categoryBreakdown,
        tiers: Object.entries(SCRAPE_TIERS).map(([k, v]) => ({
          id: k, label: v.label, frequency: v.frequency, source_count: v.urls.length
        }))
      });
    }

    // List available tiers
    if (action === 'list_tiers') {
      return Response.json({
        tiers: Object.entries(SCRAPE_TIERS).map(([k, v]) => ({
          id: k, label: v.label, frequency: v.frequency, urls: v.urls
        }))
      });
    }

    return Response.json({ error: 'Invalid action. Use: scrape_tier, scrape_tier_all, scrape_url, scrape_batch, scrape_scheduled, stats, list_tiers' }, { status: 400 });
  } catch (error) {
    console.error('knowledgeScraper error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});