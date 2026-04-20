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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Pick 3 random states each run to build out the database over time
    const shuffled = [...ALL_STATES].sort(() => Math.random() - 0.5);
    const targetStates = shuffled.slice(0, 3);
    const maxPerState = 15;

    let totalCreated = 0;
    let totalSkipped = 0;
    const errors = [];

    for (const stateCode of targetStates) {
      const stateName = STATE_NAMES[stateCode] || stateCode;

      try {
        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Find the top ${maxPerState} real general contractor companies in ${stateName} (${stateCode}) that do commercial construction. Include real company names, headquarters city, phone numbers, email addresses, websites, estimated employee count, estimated annual revenue, and the types of projects they build (warehouse, retail, restaurant, healthcare, industrial, education, government, hotel, mixed_use, commercial, fitness, automotive). Only REAL companies.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              companies: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    company_name: { type: "string" },
                    city: { type: "string" },
                    phone: { type: "string" },
                    email: { type: "string" },
                    website: { type: "string" },
                    employee_count: { type: "number" },
                    annual_revenue_estimate: { type: "number" },
                    project_types: { type: "array", items: { type: "string" } }
                  }
                }
              }
            }
          },
          model: "gemini_3_flash"
        });

        let companies = result?.companies || [];
        companies = companies.filter(c => c.company_name && c.company_name.length > 2);

        const existing = await base44.asServiceRole.entities.ContractorCompany.filter(
          { state: stateCode }, "-created_date", 500
        ).catch(() => []);
        const existingNames = new Set(existing.map(e => e.company_name?.toLowerCase()));

        for (const company of companies) {
          if (existingNames.has(company.company_name?.toLowerCase())) { totalSkipped++; continue; }

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
            source_url: `scheduled:${stateName}`,
          });
          totalCreated++;
          existingNames.add(company.company_name.toLowerCase());
        }
      } catch (err) {
        errors.push(`${stateCode}: ${err.message}`);
      }
    }

    // Log and notify
    await base44.asServiceRole.entities.OvernightRunLog.create({
      run_date: new Date().toISOString().split("T")[0],
      target_market: `Scheduled GC Scrape: ${targetStates.join(", ")}`,
      completion_status: errors.length === 0 ? "complete" : "partial",
      leads_created: totalCreated,
      errors_count: errors.length,
      executive_summary: `Scheduled scrape: ${totalCreated} new GCs from ${targetStates.join(", ")}. Skipped ${totalSkipped} dupes. ${errors.length} errors.`,
    }).catch(() => {});

    if (totalCreated > 0) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: "jeremy@shopxps.com",
        subject: `[AUTO] GC Scraper — ${totalCreated} New GCs Added (${targetStates.join(", ")})`,
        body: `Automated GC scraper completed.\n\nStates: ${targetStates.join(", ")}\nNew GCs: ${totalCreated}\nSkipped dupes: ${totalSkipped}\nErrors: ${errors.length}\n\nLogin to review: https://app.base44.com`,
        from_name: "XPS Intelligence"
      }).catch(() => {});
    }

    return Response.json({ success: true, created: totalCreated, skipped: totalSkipped, states: targetStates, errors });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});