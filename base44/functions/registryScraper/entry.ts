import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SEARCH_TERMS = [
  "epoxy", "floor coating", "concrete polish", "decorative concrete",
  "resinous flooring", "floor finishing", "concrete coating", "surface prep",
  "garage floor", "terrazzo"
];

const STATE_REGISTRIES = {
  FL: "Florida Division of Corporations (sunbiz.org)",
  AZ: "Arizona Corporation Commission (ecorp.azcc.gov)",
  OH: "Ohio Secretary of State (businesssearch.ohiosos.gov)",
  IL: "Illinois Secretary of State (ilsos.gov)",
  TX: "Texas Comptroller (mycpa.cpa.state.tx.us)",
  CA: "California Secretary of State (bizfileonline.sos.ca.gov)",
  GA: "Georgia Secretary of State (ecorp.sos.ga.gov)",
  NC: "North Carolina Secretary of State (sosnc.gov)",
  NV: "Nevada Secretary of State (esos.nv.gov)",
  CO: "Colorado Secretary of State (sos.state.co.us)",
  NY: "New York DOS (dos.ny.gov)",
  PA: "Pennsylvania DOS (dos.pa.gov)",
  NJ: "New Jersey DORES (njportal.com)",
  MI: "Michigan LARA (cofs.lara.state.mi.us)",
  VA: "Virginia SCC (scc.virginia.gov)",
  WA: "Washington Secretary of State (sos.wa.gov)",
  MA: "Massachusetts Secretary of State (sec.state.ma.us)",
  TN: "Tennessee Secretary of State (sos.tn.gov)",
  IN: "Indiana Secretary of State (inbiz.in.gov)",
  MO: "Missouri Secretary of State (sos.mo.gov)",
  MD: "Maryland SDAT (dat.maryland.gov)",
  WI: "Wisconsin DFI (dfi.wi.gov)",
  MN: "Minnesota Secretary of State (msos.state.mn.us)",
  SC: "South Carolina Secretary of State (sos.sc.gov)",
  AL: "Alabama Secretary of State (sos.alabama.gov)",
  LA: "Louisiana Secretary of State (sos.la.gov)",
  KY: "Kentucky Secretary of State (sos.ky.gov)",
  OR: "Oregon Secretary of State (sos.oregon.gov)",
  OK: "Oklahoma Secretary of State (sos.ok.gov)",
  CT: "Connecticut Secretary of State (concord-sots.ct.gov)",
  UT: "Utah Division of Corporations (secure.utah.gov)",
  IA: "Iowa Secretary of State (sos.iowa.gov)",
  MS: "Mississippi Secretary of State (sos.ms.gov)",
  AR: "Arkansas Secretary of State (sos.arkansas.gov)",
  KS: "Kansas Secretary of State (sos.ks.gov)",
  NM: "New Mexico Secretary of State (sos.state.nm.us)",
  NE: "Nebraska Secretary of State (sos.nebraska.gov)",
  ID: "Idaho Secretary of State (sos.idaho.gov)",
  WV: "West Virginia Secretary of State (sos.wv.gov)",
  HI: "Hawaii DCCA (hbe.ehawaii.gov)",
  NH: "New Hampshire Secretary of State (sos.nh.gov)",
  ME: "Maine Secretary of State (icrs.informe.org)",
  MT: "Montana Secretary of State (sosmt.gov)",
  RI: "Rhode Island Secretary of State (sos.ri.gov)",
  DE: "Delaware Division of Corporations (icis.corp.delaware.gov)",
  SD: "South Dakota Secretary of State (sdsos.gov)",
  ND: "North Dakota Secretary of State (sos.nd.gov)",
  AK: "Alaska Division of Corporations (commerce.alaska.gov)",
  VT: "Vermont Secretary of State (sos.vermont.gov)",
  WY: "Wyoming Secretary of State (sos.wyo.gov)",
  DC: "DC DCRA (corponline.dcra.dc.gov)"
};

const STATE_NAMES = {
  FL: "Florida", AZ: "Arizona", OH: "Ohio", IL: "Illinois", TX: "Texas",
  CA: "California", GA: "Georgia", NC: "North Carolina", NV: "Nevada",
  CO: "Colorado", NY: "New York", PA: "Pennsylvania", NJ: "New Jersey",
  MI: "Michigan", VA: "Virginia", WA: "Washington", MA: "Massachusetts",
  TN: "Tennessee", IN: "Indiana", MO: "Missouri", MD: "Maryland",
  WI: "Wisconsin", MN: "Minnesota", SC: "South Carolina", AL: "Alabama",
  LA: "Louisiana", KY: "Kentucky", OR: "Oregon", OK: "Oklahoma",
  CT: "Connecticut", UT: "Utah", IA: "Iowa", MS: "Mississippi",
  AR: "Arkansas", KS: "Kansas", NM: "New Mexico", NE: "Nebraska",
  ID: "Idaho", WV: "West Virginia", HI: "Hawaii", NH: "New Hampshire",
  ME: "Maine", MT: "Montana", RI: "Rhode Island", DE: "Delaware",
  SD: "South Dakota", ND: "North Dakota", AK: "Alaska", VT: "Vermont",
  WY: "Wyoming", DC: "District of Columbia"
};

async function scrapeStateRegistry(base44, stateCode, batchSize) {
  const stateName = STATE_NAMES[stateCode] || stateCode;
  const registry = STATE_REGISTRIES[stateCode] || `${stateName} Secretary of State`;
  const searchTermsStr = SEARCH_TERMS.join(', ');

  const prompt = `You are a business intelligence agent. Search the internet for NEW business registrations in ${stateName} (${stateCode}) that are related to the flooring, epoxy, concrete, or surface coating industry.

Search the ${registry} and any public business formation records for ${stateName}.

Search terms to look for in business names: ${searchTermsStr}

Also search for recent news about new flooring/epoxy/concrete companies starting in ${stateName}.

For each new business found, provide:
- business_name: The registered business name
- entity_type: LLC, Corp, LP, etc.
- formation_date: When it was formed (YYYY-MM-DD format if known)
- registered_agent: Name of the registered agent
- address: Registered address
- search_term_matched: Which of the search terms matched
- category: One of: direct_competitor, potential_customer, training_candidate, franchise_candidate
- opportunity_score: 0-100 score for XPS opportunity
- notes: Why this business matters to XPS

Focus on businesses formed in the last 90 days. Return up to ${batchSize} results.`;

  try {
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          businesses: {
            type: "array",
            items: {
              type: "object",
              properties: {
                business_name: { type: "string" },
                entity_type: { type: "string" },
                formation_date: { type: "string" },
                registered_agent: { type: "string" },
                address: { type: "string" },
                search_term_matched: { type: "string" },
                category: { type: "string" },
                opportunity_score: { type: "number" },
                notes: { type: "string" }
              }
            }
          },
          summary: { type: "string" }
        }
      }
    });

    let created = 0;
    if (result.businesses && result.businesses.length > 0) {
      for (const biz of result.businesses) {
        try {
          await base44.asServiceRole.entities.RegistryAlert.create({
            business_name: biz.business_name || 'Unknown',
            state: stateCode,
            entity_type: biz.entity_type === 'Corp' ? 'Corp' : biz.entity_type === 'LP' ? 'LP' : biz.entity_type === 'LLP' ? 'LLP' : 'LLC',
            formation_date: biz.formation_date || '',
            registered_agent: biz.registered_agent || '',
            address: biz.address || '',
            category: ['direct_competitor', 'potential_customer', 'training_candidate', 'franchise_candidate'].includes(biz.category)
              ? biz.category : 'unknown',
            search_term_matched: biz.search_term_matched || '',
            opportunity_score: biz.opportunity_score || 50,
            notes: biz.notes || '',
            enriched: false,
            lead_created: false,
            processed: false
          });
          created++;
        } catch (e) {
          console.error(`Registry create error for ${stateCode}:`, e.message);
        }
      }
    }

    return { state: stateCode, found: created, summary: result.summary || '' };
  } catch (error) {
    console.error(`State ${stateCode} scrape error:`, error.message);
    return { state: stateCode, found: 0, error: error.message };
  }
}

async function enrichAndCreateLeads(base44) {
  const unprocessed = await base44.asServiceRole.entities.RegistryAlert.filter(
    { processed: false }, '-opportunity_score', 50
  );

  let leadsCreated = 0;
  for (const alert of unprocessed) {
    if (alert.opportunity_score >= 60) {
      try {
        const enrichResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Research this new business: "${alert.business_name}" in ${STATE_NAMES[alert.state] || alert.state}. Address: ${alert.address || 'unknown'}. Find their website, phone number, email, and the owner's LinkedIn profile if possible. Also determine if they are a flooring contractor, a related trade, or a potential franchise buyer.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              website: { type: "string" },
              phone: { type: "string" },
              email: { type: "string" },
              owner_linkedin: { type: "string" },
              owner_name: { type: "string" },
              business_type: { type: "string" },
              ai_insight: { type: "string" }
            }
          }
        });

        await base44.asServiceRole.entities.RegistryAlert.update(alert.id, {
          enriched: true,
          website: enrichResult.website || '',
          phone: enrichResult.phone || '',
          email: enrichResult.email || '',
          owner_linkedin: enrichResult.owner_linkedin || '',
          processed: true
        });

        const lead = await base44.asServiceRole.entities.Lead.create({
          company: alert.business_name,
          contact_name: enrichResult.owner_name || alert.registered_agent || '',
          email: enrichResult.email || '',
          phone: enrichResult.phone || '',
          website: enrichResult.website || '',
          state: alert.state,
          location: `${alert.address || ''}, ${alert.state}`,
          source: `State Registry — ${alert.state}`,
          stage: 'Incoming',
          pipeline_status: 'Incoming',
          lead_type: alert.category === 'direct_competitor' ? 'XPress' : 'XPress',
          ingestion_source: 'Scraper',
          score: alert.opportunity_score || 50,
          ai_insight: enrichResult.ai_insight || alert.notes || '',
          notes: `New business registered. Category: ${alert.category}. Matched: ${alert.search_term_matched}`
        });

        await base44.asServiceRole.entities.RegistryAlert.update(alert.id, {
          lead_created: true,
          lead_id: lead.id
        });

        leadsCreated++;
      } catch (e) {
        console.error('Enrich error:', e.message);
        await base44.asServiceRole.entities.RegistryAlert.update(alert.id, { processed: true });
      }
    } else {
      await base44.asServiceRole.entities.RegistryAlert.update(alert.id, { processed: true });
    }
  }

  return leadsCreated;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Support both user-triggered and scheduled automation calls
    let isAuthed = false;
    try { const user = await base44.auth.me(); isAuthed = !!user; } catch {}

    const body = await req.json().catch(() => ({}));
    const { action, states, batch_size } = body;

    // Run scraper for specific states
    if (action === 'scrape') {
      const targetStates = states || Object.keys(STATE_REGISTRIES);
      const batchSz = batch_size || 10;
      const results = [];

      for (const state of targetStates) {
        const result = await scrapeStateRegistry(base44, state, batchSz);
        results.push(result);
      }

      const totalFound = results.reduce((s, r) => s + (r.found || 0), 0);

      // Enrich high-scoring alerts and create leads
      const leadsCreated = await enrichAndCreateLeads(base44);

      return Response.json({
        success: true,
        states_scraped: results.length,
        total_businesses_found: totalFound,
        leads_created: leadsCreated,
        results
      });
    }

    // Run priority states only (FL, AZ, TX, CA, OH)
    if (action === 'scrape_priority') {
      const priorityStates = ['FL', 'AZ', 'TX', 'CA', 'OH', 'GA', 'NC', 'IL', 'NY', 'NV'];
      const results = [];

      for (const state of priorityStates) {
        const result = await scrapeStateRegistry(base44, state, 15);
        results.push(result);
      }

      const totalFound = results.reduce((s, r) => s + (r.found || 0), 0);
      const leadsCreated = await enrichAndCreateLeads(base44);

      return Response.json({
        success: true,
        states_scraped: results.length,
        total_businesses_found: totalFound,
        leads_created: leadsCreated,
        results
      });
    }

    // Send daily alert email
    if (action === 'send_alert') {
      const recentAlerts = await base44.asServiceRole.entities.RegistryAlert.filter(
        {}, '-created_date', 100
      );

      const today = new Date().toISOString().split('T')[0];
      const todaysAlerts = recentAlerts.filter(a => a.created_date && a.created_date.startsWith(today));

      if (todaysAlerts.length > 0) {
        const alertTable = todaysAlerts.map((a, i) =>
          `${i + 1}. ${a.business_name} — ${a.state} — ${a.category} — Score: ${a.opportunity_score || 0}`
        ).join('\n');

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: 'jeremy@shopxps.com',
          subject: `🏢 XPS Registry Alert — ${todaysAlerts.length} New Flooring Businesses Found — ${today}`,
          body: `<h2>Daily New Business Registry Alert</h2><p>${todaysAlerts.length} new flooring-related businesses found today across all states.</p><pre>${alertTable}</pre><p>— XPS Intelligence</p>`,
          from_name: 'XPS Intelligence'
        });
      }

      return Response.json({ success: true, alerts_sent: todaysAlerts.length });
    }

    // Get recent alerts
    if (action === 'recent') {
      const alerts = await base44.asServiceRole.entities.RegistryAlert.filter({}, '-created_date', 50);
      return Response.json({ alerts });
    }

    return Response.json({ error: 'Invalid action. Use: scrape, scrape_priority, send_alert, recent' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});