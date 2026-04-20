import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const BROWSERLESS_API_KEY = Deno.env.get("BROWSERLESS_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_KEY");
const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { urls, location, industry, keywords, count = 10 } = await req.json();

  // Step 1: Determine scrape targets
  let targetUrls = urls || [];
  if (!targetUrls.length && location) {
    // Build Google search URLs for lead discovery
    const query = encodeURIComponent(`${industry || "flooring contractor"} ${keywords || ""} ${location} contact email phone`);
    targetUrls = [
      `https://www.google.com/search?q=${query}&num=20`,
      `https://www.google.com/search?q=${query}+site:yelp.com&num=10`,
      `https://www.google.com/search?q=${query}+site:bbb.org&num=10`
    ];
  }

  if (!targetUrls.length) {
    return Response.json({ error: "Provide urls[] or location + industry" }, { status: 400 });
  }

  // Step 2: Scrape each URL with Browserless
  const allScrapedText = [];
  for (const url of targetUrls.slice(0, 5)) {
    try {
      const browserRes = await fetch(`https://chrome.browserless.io/content?token=${BROWSERLESS_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          waitFor: 3000,
          gotoOptions: { waitUntil: "networkidle2", timeout: 15000 }
        })
      });
      if (browserRes.ok) {
        const html = await browserRes.text();
        // Strip HTML tags, keep text
        const text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 8000);
        allScrapedText.push({ url, text });
      }
    } catch (e) {
      console.error(`Scrape failed for ${url}:`, e.message);
    }
  }

  if (!allScrapedText.length) {
    return Response.json({ error: "No pages could be scraped", scraped: 0 }, { status: 500 });
  }

  // Step 3: Use Groq to extract structured lead data from scraped text
  const extractionPrompt = `Extract business leads from the following scraped web content. Return a JSON array of objects with these fields:
- company (string, required)
- contact_name (string, best guess)
- email (string or null)
- phone (string or null)
- website (string or null)
- location (city, state)
- vertical (one of: Retail, Food & Bev, Warehouse, Automotive, Healthcare, Fitness, Education, Industrial, Residential, Government, Office, Restaurant, Kitchen, Other)
- specialty (if flooring related)

Only return REAL businesses with at least a company name. Max ${count} leads. Return ONLY the JSON array, no markdown.

Scraped content:
${allScrapedText.map(s => `--- ${s.url} ---\n${s.text}`).join('\n\n')}`;

  const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: extractionPrompt }],
      temperature: 0.1,
      max_tokens: 4000
    })
  });

  const groqData = await groqRes.json();
  const rawContent = groqData.choices?.[0]?.message?.content || "[]";

  let leads = [];
  try {
    // Parse JSON, handling possible markdown wrapping
    const cleaned = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    leads = JSON.parse(cleaned);
    if (!Array.isArray(leads)) leads = [leads];
  } catch (e) {
    console.error("JSON parse failed:", rawContent.slice(0, 500));
    return Response.json({ error: "AI extraction failed to produce valid JSON", raw: rawContent.slice(0, 300) }, { status: 500 });
  }

  // Step 4: Write leads to Supabase directly
  const supabaseLeads = leads.map(l => ({
    company: l.company || "Unknown",
    contact_name: l.contact_name || "",
    email: l.email || null,
    phone: l.phone || null,
    website: l.website || null,
    location: l.location || location || "",
    vertical: l.vertical || "Other",
    specialty: l.specialty || null,
    stage: "Incoming",
    pipeline_status: "Incoming",
    ingestion_source: "Scraper",
    source: `Browserless scrape: ${targetUrls[0]}`,
    score: 0,
    ai_insight: `Auto-scraped from ${targetUrls.length} source(s) on ${new Date().toISOString().split('T')[0]}`
  }));

  let supabaseResult = { inserted: 0, errors: [] };
  if (supabaseLeads.length > 0) {
    const sbRes = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify(supabaseLeads)
    });

    if (sbRes.ok) {
      const inserted = await sbRes.json();
      supabaseResult.inserted = inserted.length;
    } else {
      const errText = await sbRes.text();
      supabaseResult.errors.push(errText);
      // Fallback: also write to Base44 Lead entity
      console.log("Supabase insert failed, falling back to Base44 entities");
      for (const lead of leads.slice(0, count)) {
        await base44.asServiceRole.entities.Lead.create({
          company: lead.company || "Unknown",
          contact_name: lead.contact_name || "Unknown",
          stage: "Incoming",
          pipeline_status: "Incoming",
          email: lead.email || "",
          phone: lead.phone || "",
          website: lead.website || "",
          location: lead.location || location || "",
          vertical: lead.vertical || "Other",
          ingestion_source: "Scraper",
          source: `Browserless scrape`,
          ai_insight: `Auto-scraped on ${new Date().toISOString().split('T')[0]}`
        });
      }
      supabaseResult.inserted = leads.length;
      supabaseResult.fallback = "base44";
    }
  }

  // Step 5: Also mirror to Base44 Lead entity for UI display
  for (const lead of leads.slice(0, count)) {
    try {
      await base44.asServiceRole.entities.Lead.create({
        company: lead.company || "Unknown",
        contact_name: lead.contact_name || "Unknown",
        stage: "Incoming",
        pipeline_status: "Incoming",
        email: lead.email || "",
        phone: lead.phone || "",
        website: lead.website || "",
        location: lead.location || location || "",
        vertical: lead.vertical || "Other",
        ingestion_source: "Scraper",
        source: `Browserless scrape`,
        ai_insight: `Auto-scraped on ${new Date().toISOString().split('T')[0]}`
      });
    } catch (e) {
      console.error("Base44 lead create failed:", e.message);
    }
  }

  return Response.json({
    success: true,
    scraped_pages: allScrapedText.length,
    leads_extracted: leads.length,
    supabase: supabaseResult,
    leads: leads.slice(0, 5) // preview
  });
});