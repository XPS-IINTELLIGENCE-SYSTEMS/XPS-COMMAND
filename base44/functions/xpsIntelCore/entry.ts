import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// ═══════════════════════════════════════════════════════════════════
// XPS INTEL CORE — Xtreme Polishing Systems Master Intelligence
// Scrapes all XPS brands, 60+ locations, social, pricing, branding
// ═══════════════════════════════════════════════════════════════════

const BROWSERLESS_KEY = Deno.env.get("BROWSERLESS_API_KEY");
const GROQ_KEY = Deno.env.get("GROQ_API_KEY");

const XPS_BRANDS = [
  { key: "XPS", name: "Xtreme Polishing Systems", url: "xtremepolishingsystems.com",
    prompt: "Xtreme Polishing Systems (xtremepolishingsystems.com & shopxps.com) — ALL products with exact prices: epoxy systems, diamond tooling, grinders, polishing machines, coatings, primers, sealers, densifiers, dyes, metallic pigments, polyaspartic, polyurea, urethane. Include SKUs, coverage rates, specs. Plus company news, team bios, awards, certifications, partnerships, press releases, job postings." },
  { key: "NCP", name: "National Concrete Polishing", url: "nationalconcretepolishing.com",
    prompt: "National Concrete Polishing (nationalconcretepolishing.com) — ALL services: concrete polishing, epoxy flooring, stained concrete, decorative overlays. Pricing per sqft, service areas, project portfolio, client testimonials, team info, certifications, recent projects." },
  { key: "CPU", name: "Concrete Polishing University", url: "concretepolishinguniversity.com",
    prompt: "Concrete Polishing University (concretepolishinguniversity.com) — ALL training courses with prices, schedules, certifications offered, instructors, curriculum, hands-on workshops, online vs in-person, equipment training, business coaching." },
  { key: "XPS Xpress", name: "XPS Xpress", url: "xpsxpress.com",
    prompt: "XPS Xpress (xpsxpress.com) — complete product catalog with ALL prices: epoxy kits, metallic systems, flake systems, polyaspartic topcoats, primers, grinders, diamond tooling. Shipping, bulk pricing, dealer programs, bestsellers, new arrivals." },
  { key: "Epoxy Network", name: "Epoxy Network", url: "epoxynetwork.com",
    prompt: "Epoxy Network (epoxynetwork.com) — franchise/contractor network: all locations, territory availability, training provided, marketing support, onboarding process, pricing/fees, success stories, services offered at each location." },
  { key: "XPS Intelligence", name: "XPS Intelligence", url: "xpsintelligence.com",
    prompt: "XPS Intelligence (xpsintelligence.com) — SaaS platform: features, pricing tiers, CRM capabilities, AI tools, bid automation, lead generation, project management, integrations, client testimonials, demo info." },
];

const XPS_LOCATIONS = [
  "Phoenix AZ","Tucson AZ","Mesa AZ","Scottsdale AZ","Tempe AZ","Chandler AZ","Gilbert AZ","Glendale AZ",
  "Los Angeles CA","San Diego CA","San Francisco CA","Sacramento CA","San Jose CA","Fresno CA","Long Beach CA","Oakland CA",
  "Denver CO","Colorado Springs CO","Miami FL","Orlando FL","Tampa FL","Jacksonville FL","Fort Lauderdale FL","West Palm Beach FL","Naples FL","Sarasota FL",
  "Atlanta GA","Savannah GA","Chicago IL","Aurora IL","Naperville IL","Indianapolis IN","Louisville KY",
  "New Orleans LA","Baton Rouge LA","Boston MA","Baltimore MD","Detroit MI","Grand Rapids MI","Minneapolis MN",
  "Kansas City MO","St Louis MO","Charlotte NC","Raleigh NC","Las Vegas NV","Reno NV","Newark NJ","Albuquerque NM",
  "New York NY","Buffalo NY","Columbus OH","Cleveland OH","Cincinnati OH","Oklahoma City OK","Tulsa OK","Portland OR",
  "Philadelphia PA","Pittsburgh PA","Nashville TN","Memphis TN","Knoxville TN",
  "Dallas TX","Houston TX","San Antonio TX","Austin TX","Fort Worth TX","El Paso TX",
  "Salt Lake City UT","Virginia Beach VA","Richmond VA","Seattle WA","Tacoma WA","Milwaukee WI","Washington DC"
];

async function scrapeUrl(url) {
  if (!BROWSERLESS_KEY) return null;
  const res = await fetch(`https://chrome.browserless.io/content?token=${BROWSERLESS_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, waitFor: 3000, gotoOptions: { waitUntil: "networkidle2", timeout: 15000 } })
  });
  if (!res.ok) return null;
  const html = await res.text();
  return html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 10000);
}

async function llmResearch(base44, prompt, schema) {
  return await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt, add_context_from_internet: true, response_json_schema: schema, model: "gemini_3_flash"
  });
}

async function saveIntel(base44, records) {
  if (!records.length) return 0;
  let count = 0;
  for (let i = 0; i < records.length; i += 25) {
    const chunk = records.slice(i, i + 25);
    await base44.asServiceRole.entities.IntelRecord.bulkCreate(chunk);
    count += chunk.length;
  }
  return count;
}

// ── PHASE: Brand Deep Scrape ────────────────────────────────────
async function scrapeBrands(base44, jobId) {
  const records = [];
  for (const brand of XPS_BRANDS) {
    console.log(`[BRAND] ${brand.name}...`);
    // Browserless crawl
    const text = await scrapeUrl(`https://${brand.url}`).catch(() => null);
    if (text && text.length > 200) {
      records.push({
        source_company: brand.key, category: "website", title: `${brand.name} — Website Crawl`,
        content: text.slice(0, 4000), source_url: `https://${brand.url}`, source_type: "crawler",
        tags: `${brand.name},website,crawl`, confidence_score: 90,
        scraped_at: new Date().toISOString(), is_indexed: true, data_freshness: "live", scraper_job_id: jobId
      });
    }
    // LLM deep research
    try {
      const r = await llmResearch(base44, brand.prompt + " Return EVERYTHING found.", {
        type: "object", properties: {
          products: { type: "array", items: { type: "object", properties: {
            name: { type: "string" }, price: { type: "string" }, category: { type: "string" }, description: { type: "string" }
          }}},
          services: { type: "array", items: { type: "string" } },
          team: { type: "array", items: { type: "object", properties: { name: { type: "string" }, role: { type: "string" } }}},
          news: { type: "array", items: { type: "object", properties: { title: { type: "string" }, url: { type: "string" } }}},
          social_summary: { type: "string" },
          keywords: { type: "array", items: { type: "string" } },
          brand_messaging: { type: "string" },
          pricing_highlights: { type: "array", items: { type: "object", properties: { item: { type: "string" }, price: { type: "string" } }}}
        }
      });
      if (r?.products?.length) {
        records.push({
          source_company: brand.key, category: "product", title: `${brand.name} — Products & Catalog`,
          content: JSON.stringify(r.products, null, 2), source_url: `https://${brand.url}`, source_type: "llm_research",
          tags: `${brand.name},products,catalog`, confidence_score: 82,
          scraped_at: new Date().toISOString(), is_indexed: true, data_freshness: "recent", scraper_job_id: jobId
        });
      }
      if (r?.pricing_highlights?.length) {
        records.push({
          source_company: brand.key, category: "pricing", title: `${brand.name} — Pricing Data`,
          content: JSON.stringify(r.pricing_highlights, null, 2), source_url: `https://${brand.url}`, source_type: "llm_research",
          tags: `${brand.name},pricing`, confidence_score: 78,
          pricing_data: JSON.stringify(r.pricing_highlights),
          scraped_at: new Date().toISOString(), is_indexed: true, data_freshness: "recent", scraper_job_id: jobId
        });
      }
      if (r?.keywords?.length) {
        records.push({
          source_company: brand.key, category: "keywords", title: `${brand.name} — SEO & Keywords`,
          content: r.keywords.join(", "), source_url: `https://${brand.url}`, source_type: "llm_research",
          tags: `${brand.name},seo,keywords`, confidence_score: 75,
          keyword_data: JSON.stringify(r.keywords),
          scraped_at: new Date().toISOString(), is_indexed: true, data_freshness: "recent", scraper_job_id: jobId
        });
      }
      if (r?.team?.length) {
        records.push({
          source_company: brand.key, category: "team", title: `${brand.name} — Team & Leadership`,
          content: JSON.stringify(r.team, null, 2), source_url: `https://${brand.url}`, source_type: "llm_research",
          tags: `${brand.name},team`, confidence_score: 70,
          scraped_at: new Date().toISOString(), is_indexed: true, data_freshness: "recent", scraper_job_id: jobId
        });
      }
      if (r?.social_summary) {
        records.push({
          source_company: brand.key, category: "social_media", title: `${brand.name} — Social Media Overview`,
          content: r.social_summary, source_url: `https://${brand.url}`, source_type: "llm_research",
          tags: `${brand.name},social,media`, confidence_score: 72,
          scraped_at: new Date().toISOString(), is_indexed: true, data_freshness: "recent", scraper_job_id: jobId
        });
      }
      if (r?.brand_messaging) {
        records.push({
          source_company: brand.key, category: "branding", title: `${brand.name} — Brand Messaging & Identity`,
          content: r.brand_messaging, source_url: `https://${brand.url}`, source_type: "llm_research",
          tags: `${brand.name},branding,messaging`, confidence_score: 75,
          scraped_at: new Date().toISOString(), is_indexed: true, data_freshness: "recent", scraper_job_id: jobId
        });
      }
      for (const n of (r?.news || []).slice(0, 3)) {
        records.push({
          source_company: brand.key, category: "news", title: n.title || `${brand.name} News`,
          content: "", source_url: n.url || `https://${brand.url}`, source_type: "llm_research",
          tags: `${brand.name},news`, confidence_score: 68,
          scraped_at: new Date().toISOString(), is_indexed: true, data_freshness: "recent", scraper_job_id: jobId
        });
      }
    } catch (e) { console.log(`LLM failed ${brand.name}: ${e.message}`); }
  }
  return records;
}

// ── PHASE: Social Media & YouTube ───────────────────────────────
async function scrapeSocial(base44, jobId) {
  const records = [];
  for (const brand of XPS_BRANDS) {
    console.log(`[SOCIAL] ${brand.name}...`);
    try {
      const r = await llmResearch(base44,
        `Research ALL social media for ${brand.name}: Facebook, Instagram, YouTube, TikTok, LinkedIn. ` +
        `Get: follower counts, recent posts with engagement, YouTube video titles/views/URLs, ` +
        `brand hashtags, images found, customer interactions.`,
        { type: "object", properties: {
          platforms: { type: "array", items: { type: "object", properties: {
            name: { type: "string" }, followers: { type: "string" }, url: { type: "string" },
            recent_activity: { type: "string" }
          }}},
          youtube_videos: { type: "array", items: { type: "object", properties: {
            title: { type: "string" }, url: { type: "string" }, views: { type: "string" }
          }}},
          hashtags: { type: "array", items: { type: "string" } }
        }}
      );
      for (const p of (r?.platforms || [])) {
        records.push({
          source_company: brand.key, category: "social_media", title: `${brand.name} — ${p.name}`,
          content: `Followers: ${p.followers || "N/A"}\n${p.recent_activity || ""}`,
          source_url: p.url || "", source_type: "llm_research",
          tags: `${brand.name},${p.name},social`, confidence_score: 70,
          engagement_metrics: JSON.stringify({ followers: p.followers }),
          scraped_at: new Date().toISOString(), is_indexed: true, data_freshness: "recent", scraper_job_id: jobId
        });
      }
      for (const v of (r?.youtube_videos || []).slice(0, 8)) {
        records.push({
          source_company: brand.key, category: "youtube", title: v.title || `${brand.name} Video`,
          content: `Views: ${v.views || "N/A"}`, source_url: v.url || "", source_type: "llm_research",
          tags: `${brand.name},youtube,video`, confidence_score: 70,
          engagement_metrics: JSON.stringify({ views: v.views }),
          scraped_at: new Date().toISOString(), is_indexed: true, data_freshness: "recent", scraper_job_id: jobId
        });
      }
      if (r?.hashtags?.length) {
        records.push({
          source_company: brand.key, category: "keywords", title: `${brand.name} — Hashtags`,
          content: r.hashtags.join(", "), source_type: "llm_research",
          tags: `${brand.name},hashtags`, confidence_score: 72,
          keyword_data: JSON.stringify(r.hashtags),
          scraped_at: new Date().toISOString(), is_indexed: true, data_freshness: "recent", scraper_job_id: jobId
        });
      }
    } catch (e) { console.log(`Social failed ${brand.name}: ${e.message}`); }
  }
  return records;
}

// ── PHASE: 60+ Location Intel ───────────────────────────────────
async function scrapeLocations(base44, jobId) {
  const records = [];
  // Batch 15 cities per LLM call to stay fast
  for (let i = 0; i < XPS_LOCATIONS.length; i += 15) {
    const batch = XPS_LOCATIONS.slice(i, i + 15);
    console.log(`[LOCATIONS] Batch ${Math.floor(i / 15) + 1}: ${batch[0]}...`);
    try {
      const r = await llmResearch(base44,
        `Find XPS Xpress, Xtreme Polishing Systems, National Concrete Polishing, and Epoxy Network locations in: ${batch.join(", ")}. ` +
        `For each: address, phone, email, services, Google rating, manager name if available.`,
        { type: "object", properties: {
          locations: { type: "array", items: { type: "object", properties: {
            city: { type: "string" }, state: { type: "string" }, brand: { type: "string" },
            address: { type: "string" }, phone: { type: "string" }, email: { type: "string" },
            services: { type: "string" }, google_rating: { type: "string" }, manager: { type: "string" }
          }}}
        }}
      );
      for (const loc of (r?.locations || [])) {
        records.push({
          source_company: "XPS Location", category: "location",
          title: `${loc.brand || "XPS"} — ${loc.city}, ${loc.state}`,
          content: JSON.stringify(loc, null, 2),
          source_url: "https://xpsxpress.com", source_type: "llm_research",
          tags: `XPS,location,${loc.city},${loc.state}`, confidence_score: 68,
          location_name: `${loc.city}, ${loc.state}`, location_state: loc.state || "",
          scraped_at: new Date().toISOString(), is_indexed: true, data_freshness: "recent", scraper_job_id: jobId
        });
      }
    } catch (e) { console.log(`Locations batch failed: ${e.message}`); }
  }
  return records;
}

// ═══════════════════════════════════════════════════════════════════
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const jobId = `xps_intel_${Date.now()}`;
    let body = {};
    try { body = await req.json(); } catch {}
    const action = body.action || "full"; // full | brands | social | locations

    console.log(`[XPS INTEL CORE] ${action} — Job ${jobId}`);
    let allRecords = [];
    const errors = [];
    const stats = { brands: 0, social: 0, locations: 0, total: 0 };

    if (action === "full" || action === "brands") {
      try { const r = await scrapeBrands(base44, jobId); allRecords.push(...r); stats.brands = r.length; }
      catch (e) { errors.push(`Brands: ${e.message}`); }
    }
    if (action === "full" || action === "social") {
      try { const r = await scrapeSocial(base44, jobId); allRecords.push(...r); stats.social = r.length; }
      catch (e) { errors.push(`Social: ${e.message}`); }
    }
    if (action === "full" || action === "locations") {
      try { const r = await scrapeLocations(base44, jobId); allRecords.push(...r); stats.locations = r.length; }
      catch (e) { errors.push(`Locations: ${e.message}`); }
    }

    stats.total = await saveIntel(base44, allRecords);

    await base44.asServiceRole.entities.AgentActivity.create({
      agent_name: "XPS Intel Core", action: `${action} scan: ${stats.total} records`,
      status: errors.length ? "pending" : "success", category: "research",
      details: JSON.stringify({ stats, errors, job_id: jobId })
    });

    console.log(`[XPS INTEL CORE] Done — ${stats.total} records`);
    return Response.json({ success: true, job_id: jobId, stats, errors });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});