import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const BROWSERLESS_API_KEY = Deno.env.get("BROWSERLESS_API_KEY");
const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");

// Scheduled daily: builds database of top GCs across America for bidder list outreach
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  let user = null;
  try { user = await base44.auth.me(); } catch (_) { /* scheduled run */ }
  if (user && user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

  const GC_TARGETS = [
    "top general contractors Florida commercial construction",
    "largest commercial general contractors Texas",
    "top 50 general contractors Arizona new construction",
    "general contractor commercial warehouse Ohio construction",
    "top general contractors Georgia Atlanta commercial",
    "ENR top 400 contractors flooring subcontractor",
    "commercial general contractor bid opportunities",
  ];

  const query = GC_TARGETS[Math.floor(Math.random() * GC_TARGETS.length)];
  const url = `https://www.google.com/search?q=${encodeURIComponent(query + " contact email")}&num=20`;

  const results = { contractors_found: 0, created: 0, errors: [] };

  if (!BROWSERLESS_API_KEY) return Response.json({ error: "BROWSERLESS_API_KEY not set", results }, { status: 500 });
  if (!GROQ_API_KEY) return Response.json({ error: "GROQ_API_KEY not set", results }, { status: 500 });

  try {
    console.log(`Scraping GCs: ${query}`);
    const browserRes = await fetch(`https://chrome.browserless.io/content?token=${BROWSERLESS_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, waitFor: 3000, gotoOptions: { waitUntil: "networkidle2", timeout: 15000 } })
    });

    if (!browserRes.ok) {
      const errText = await browserRes.text().catch(() => "unknown");
      console.error(`Browserless ${browserRes.status}: ${errText.slice(0, 200)}`);
      return Response.json({ error: `Browserless ${browserRes.status}`, details: errText.slice(0, 200) }, { status: 500 });
    }

    const html = await browserRes.text();
    const text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 8000);

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: `Extract general contractor companies from this text. Return JSON array: [{name, contact_person, email, phone, website, city, state, specialty, estimated_size}]. Only REAL companies. Max 10.\n\n${text}` }],
        temperature: 0.1, max_tokens: 3000
      })
    });

    const groqData = await groqRes.json();
    const raw = groqData.choices?.[0]?.message?.content || "[]";
    let contractors = [];
    try {
      contractors = JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
      if (!Array.isArray(contractors)) contractors = [contractors];
    } catch { return Response.json({ error: "Parse failed" }, { status: 500 }); }

    // Filter fake phones
    contractors = contractors.filter(c => {
      if (!c.phone) return true;
      return !/555\d{4}$/.test(c.phone.replace(/\D/g, ''));
    });

    results.contractors_found = contractors.length;

    // Check for duplicates and create
    const existing = await base44.asServiceRole.entities.Contractor.filter({});
    const existingNames = new Set(existing.map(c => c.company_name?.toLowerCase()));

    for (const gc of contractors) {
      if (existingNames.has(gc.name?.toLowerCase())) continue;

      await base44.asServiceRole.entities.Contractor.create({
        company_name: gc.name || "Unknown GC",
        contact_name: gc.contact_person || "",
        email: gc.email || "",
        phone: gc.phone || "",
        website: gc.website || "",
        city: gc.city || "",
        state: gc.state || "",
        specialty: gc.specialty || "General Contractor",
        status: "discovered",
        source: `Auto-discovered: ${query}`,
        notes: `Auto-scraped on ${new Date().toISOString().split('T')[0]}. Size: ${gc.estimated_size || "unknown"}`
      });
      results.created++;
    }
  } catch (e) {
    results.errors.push(e.message);
  }

  await base44.asServiceRole.entities.OvernightRunLog.create({
    run_date: new Date().toISOString().split('T')[0],
    target_market: "National GC Search",
    completion_status: results.errors.length === 0 ? "complete" : "partial",
    executive_summary: `Contractor DB: Found ${results.contractors_found}, created ${results.created} new`,
    leads_created: results.created,
    errors_count: results.errors.length,
    start_time: new Date().toISOString()
  });

  return Response.json({ success: true, ...results });
});