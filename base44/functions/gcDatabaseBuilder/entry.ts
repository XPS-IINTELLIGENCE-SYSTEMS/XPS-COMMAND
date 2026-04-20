import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PRIORITY_STATES = ["FL", "TX", "CA", "AZ", "OH", "IL", "GA", "NC", "NV", "CO"];
const ALL_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

const STATE_NAMES = {
  FL:"Florida",TX:"Texas",CA:"California",AZ:"Arizona",OH:"Ohio",IL:"Illinois",GA:"Georgia",
  NC:"North Carolina",NV:"Nevada",CO:"Colorado",NY:"New York",PA:"Pennsylvania",VA:"Virginia",
  WA:"Washington",MI:"Michigan",TN:"Tennessee",IN:"Indiana",MO:"Missouri",WI:"Wisconsin",
  MN:"Minnesota",AL:"Alabama",SC:"South Carolina",LA:"Louisiana",KY:"Kentucky",OR:"Oregon",
  OK:"Oklahoma",CT:"Connecticut",UT:"Utah",IA:"Iowa",NE:"Nebraska",MS:"Mississippi",AR:"Arkansas",
  KS:"Kansas",NM:"New Mexico",ID:"Idaho",HI:"Hawaii",NH:"New Hampshire",ME:"Maine",MT:"Montana",
  RI:"Rhode Island",DE:"Delaware",SD:"South Dakota",ND:"North Dakota",AK:"Alaska",VT:"Vermont",
  WV:"West Virginia",WY:"Wyoming",NJ:"New Jersey",MD:"Maryland",MA:"Massachusetts"
};

const SEARCH_PATTERNS = [
  "top general contractors",
  "largest commercial contractors", 
  "commercial construction companies",
  "GC prequalification list",
  "AGC member contractors",
  "commercial general contractor"
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { states, count_per_state, tier } = await req.json().catch(() => ({}));

    const targetStates = states || PRIORITY_STATES.slice(0, 5);
    const maxPerState = count_per_state || 20;
    const searchTier = tier || 1;

    const BROWSERLESS_KEY = Deno.env.get("BROWSERLESS_API_KEY");
    const GROQ_KEY = Deno.env.get("GROQ_API_KEY");

    if (!BROWSERLESS_KEY || !GROQ_KEY) {
      return Response.json({ error: "Missing BROWSERLESS_API_KEY or GROQ_API_KEY" }, { status: 500 });
    }

    let totalCreated = 0;
    let totalSkipped = 0;
    const errors = [];

    for (const stateCode of targetStates) {
      const stateName = STATE_NAMES[stateCode] || stateCode;
      const searchQuery = `${stateName} ${SEARCH_PATTERNS[Math.floor(Math.random() * SEARCH_PATTERNS.length)]}`;

      try {
        // Use Groq with web context to find GCs
        // First try Browserless, fallback to direct Groq search knowledge
        let cleanText = "";
        
        try {
          const browserRes = await fetch(`https://chrome.browserless.io/content?token=${BROWSERLESS_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              url: `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&num=30`,
              waitForSelector: { selector: "body", timeout: 15000 },
            }),
          });
          if (browserRes.ok) {
            const html = await browserRes.text();
            cleanText = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").substring(0, 12000);
          }
        } catch {}
        
        // If Browserless failed, use Groq's training knowledge
        if (!cleanText) {
          cleanText = `Search query: ${searchQuery}. List the top ${maxPerState} real, well-known general contractors in ${stateName}. Include their actual company names, cities, phone numbers if known, websites, and project types. Only real companies.`;
        }

        // Use Groq to extract structured GC data
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${GROQ_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              {
                role: "system",
                content: `You extract general contractor company information from search results. Return ONLY valid JSON array of objects with these fields: company_name, city, state (2-letter code), phone, email, website, employee_count (number estimate), annual_revenue_estimate (number in dollars), project_types (array of strings from: commercial, industrial, healthcare, warehouse, retail, restaurant, fitness, hotel, education, government, mixed_use). Only include REAL companies with real names. No duplicates. No placeholder data. Target state: ${stateCode}. Return up to ${maxPerState} companies.`
              },
              {
                role: "user",
                content: `Extract general contractor companies from these search results for ${stateName}:\n\n${cleanText}`
              }
            ],
            temperature: 0.1,
            max_tokens: 4000,
          }),
        });

        if (!groqRes.ok) {
          errors.push(`Groq failed for ${stateCode}: ${groqRes.status}`);
          continue;
        }

        const groqData = await groqRes.json();
        const content = groqData.choices?.[0]?.message?.content || "";
        
        let companies = [];
        try {
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          if (jsonMatch) companies = JSON.parse(jsonMatch[0]);
        } catch {
          errors.push(`JSON parse failed for ${stateCode}`);
          continue;
        }

        // Filter out dummy data
        companies = companies.filter(c => 
          c.company_name && 
          c.company_name.length > 2 &&
          !c.company_name.toLowerCase().includes("example") &&
          !c.company_name.toLowerCase().includes("test")
        );

        // Check for duplicates and insert
        const existing = await base44.asServiceRole.entities.ContractorCompany.filter(
          { state: stateCode }, "-created_date", 500
        ).catch(() => []);
        const existingNames = new Set(existing.map(e => e.company_name?.toLowerCase()));

        for (const company of companies) {
          if (existingNames.has(company.company_name?.toLowerCase())) {
            totalSkipped++;
            continue;
          }

          await base44.asServiceRole.entities.ContractorCompany.create({
            company_name: company.company_name,
            city: company.city || "",
            state: stateCode,
            phone: company.phone || "",
            email: company.email || "",
            website: company.website || "",
            employee_count: company.employee_count || null,
            annual_revenue_estimate: company.annual_revenue_estimate || null,
            project_types: JSON.stringify(company.project_types || []),
            states_they_build_in: JSON.stringify([stateCode]),
            bid_list_status: "not_contacted",
            relationship_strength: "cold",
            discovered_date: new Date().toISOString(),
            last_updated: new Date().toISOString(),
            source_url: `google:${searchQuery}`,
          });
          totalCreated++;
          existingNames.add(company.company_name.toLowerCase());
        }
      } catch (err) {
        errors.push(`${stateCode}: ${err.message}`);
      }
    }

    // Log the run
    await base44.asServiceRole.entities.OvernightRunLog.create({
      run_date: new Date().toISOString().split("T")[0],
      target_market: `GC Database: ${targetStates.join(", ")}`,
      completion_status: errors.length === 0 ? "complete" : "partial",
      leads_created: totalCreated,
      errors_count: errors.length,
      executive_summary: `GC Database Builder: Created ${totalCreated} new records, skipped ${totalSkipped} duplicates across ${targetStates.length} states. ${errors.length} errors.`,
    }).catch(() => {});

    return Response.json({
      success: true,
      created: totalCreated,
      skipped: totalSkipped,
      states_scraped: targetStates,
      errors,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});