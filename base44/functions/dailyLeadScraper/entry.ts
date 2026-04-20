import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const BROWSERLESS_API_KEY = Deno.env.get("BROWSERLESS_API_KEY");
const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");

// Scheduled daily: scrapes commercial + government leads across target markets
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  let user = null;
  try { user = await base44.auth.me(); } catch (_) { /* scheduled run */ }
  // Allow scheduled automations (no user context) or admin users
  if (user && user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

  const TARGET_MARKETS = [
    { state: "FL", cities: ["Tampa", "Orlando", "Miami", "Jacksonville"] },
    { state: "AZ", cities: ["Phoenix", "Scottsdale", "Tempe", "Mesa"] },
    { state: "TX", cities: ["Houston", "Dallas", "Austin", "San Antonio"] },
    { state: "OH", cities: ["Columbus", "Cleveland", "Cincinnati"] },
    { state: "GA", cities: ["Atlanta", "Savannah"] },
  ];

  const SEARCH_TYPES = [
    { type: "commercial", query: "commercial flooring contractor epoxy polished concrete" },
    { type: "government", query: "site:sam.gov flooring epoxy concrete coating" },
    { type: "gc_bidders", query: "general contractor commercial construction new building" },
  ];

  const results = { scraped: 0, leads_created: 0, errors: [] };

  if (!BROWSERLESS_API_KEY) return Response.json({ error: "BROWSERLESS_API_KEY not set", results }, { status: 500 });
  if (!GROQ_API_KEY) return Response.json({ error: "GROQ_API_KEY not set", results }, { status: 500 });

  // Pick 2 random markets + 1 search type per run to stay within rate limits
  const shuffledMarkets = TARGET_MARKETS.sort(() => Math.random() - 0.5).slice(0, 2);
  const searchType = SEARCH_TYPES[Math.floor(Math.random() * SEARCH_TYPES.length)];

  for (const market of shuffledMarkets) {
    const city = market.cities[Math.floor(Math.random() * market.cities.length)];
    const query = encodeURIComponent(`${searchType.query} ${city} ${market.state} contact email phone`);
    const url = `https://www.google.com/search?q=${query}&num=20`;

    try {
      console.log(`Scraping: ${city}, ${market.state} — ${searchType.type}`);
      const browserRes = await fetch(`https://chrome.browserless.io/content?token=${BROWSERLESS_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, waitFor: 3000, gotoOptions: { waitUntil: "networkidle2", timeout: 15000 } })
      });

      if (!browserRes.ok) {
        const errText = await browserRes.text().catch(() => "unknown");
        console.error(`Browserless ${browserRes.status}: ${errText.slice(0, 200)}`);
        results.errors.push(`Browserless ${browserRes.status} for ${city}`);
        continue;
      }

      const html = await browserRes.text();
      const text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 8000);

      results.scraped++;

      // Extract with Groq
      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: `Extract business leads from this content. Return JSON array with: company, contact_name, email, phone, website, location, vertical. Only REAL businesses. Max 10.\n\n${text}` }],
          temperature: 0.1, max_tokens: 3000
        })
      });

      const groqData = await groqRes.json();
      const raw = groqData.choices?.[0]?.message?.content || "[]";
      let leads = [];
      try {
        leads = JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
        if (!Array.isArray(leads)) leads = [leads];
      } catch { continue; }

      // Filter fake phones
      leads = leads.filter(l => {
        if (!l.phone) return true;
        const digits = l.phone.replace(/\D/g, '');
        return !/555\d{4}$/.test(digits) && digits.length >= 10;
      });

      for (const lead of leads) {
        await base44.asServiceRole.entities.Lead.create({
          company: lead.company || "Unknown",
          contact_name: lead.contact_name || "Unknown",
          stage: "Incoming",
          pipeline_status: "Incoming",
          email: lead.email || "",
          phone: lead.phone || "",
          website: lead.website || "",
          location: lead.location || `${city}, ${market.state}`,
          vertical: lead.vertical || "Other",
          lead_type: searchType.type === "government" ? "Jobs" : "XPress",
          ingestion_source: "Scraper",
          source: `Daily auto-scrape: ${searchType.type} | ${city}, ${market.state}`,
          ai_insight: `Auto-discovered ${searchType.type} lead on ${new Date().toISOString().split('T')[0]}`
        });
        results.leads_created++;
      }
    } catch (e) {
      results.errors.push(`${city}: ${e.message}`);
    }
  }

  // Log the run
  await base44.asServiceRole.entities.OvernightRunLog.create({
    run_date: new Date().toISOString().split('T')[0],
    target_market: shuffledMarkets.map(m => m.state).join(", "),
    completion_status: results.errors.length === 0 ? "complete" : "partial",
    executive_summary: `Lead Scraper: ${results.leads_created} leads from ${results.scraped} pages`,
    leads_created: results.leads_created,
    errors_count: results.errors.length,
    error_log: results.errors.length ? results.errors.join("; ") : null,
    start_time: new Date().toISOString()
  });

  return Response.json({ success: true, ...results });
});