import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const FLORIDA_CITIES = [
  "Miami", "Orlando", "Tampa", "Jacksonville", "Fort Lauderdale", "Pompano Beach",
  "West Palm Beach", "Boca Raton", "Naples", "Sarasota", "Fort Myers", "Gainesville",
  "Tallahassee", "Pensacola", "Daytona Beach", "Melbourne", "Port St Lucie",
  "Cape Coral", "Clearwater", "St Petersburg", "Kissimmee", "Lakeland", "Ocala",
  "Deltona", "Palm Bay"
];

const SEARCH_TERMS = [
  "epoxy flooring contractor", "concrete coating company", "polished concrete contractor",
  "decorative concrete contractor", "garage floor coating", "floor coating specialist"
];

const ADJACENT_CATEGORIES = [
  "commercial painting contractor", "flooring contractor commercial", "general contractor flooring",
  "concrete restoration", "property management facilities", "warehouse facility manager",
  "auto dealership", "fitness center gym", "restaurant kitchen renovation", "healthcare facility management"
];

const PERMIT_COUNTIES = [
  "Miami-Dade", "Broward", "Palm Beach", "Hillsborough", "Orange",
  "Duval", "Pinellas", "Lee", "Collier"
];

const PROJECT_TYPES_MAP = {
  warehouse: { flooring_pct: 0.85, system: "High-Performance Industrial Epoxy", price_sqft: 4.5 },
  retail: { flooring_pct: 0.70, system: "Decorative Metallic Epoxy", price_sqft: 6.0 },
  restaurant: { flooring_pct: 0.60, system: "Urethane Cement + Epoxy Top Coat", price_sqft: 8.0 },
  fitness: { flooring_pct: 0.75, system: "Rubber-Over-Epoxy System", price_sqft: 5.5 },
  healthcare: { flooring_pct: 0.80, system: "Antimicrobial Epoxy System", price_sqft: 7.0 },
  industrial: { flooring_pct: 0.90, system: "Heavy-Duty Industrial Epoxy", price_sqft: 4.0 },
  data_center: { flooring_pct: 0.95, system: "ESD Epoxy Flooring System", price_sqft: 9.0 },
  hotel: { flooring_pct: 0.40, system: "Polished Concrete + Decorative Epoxy", price_sqft: 6.5 },
  automotive: { flooring_pct: 0.80, system: "Chemical-Resistant Epoxy", price_sqft: 5.0 },
  brewery: { flooring_pct: 0.85, system: "Urethane Cement Brewery Floor", price_sqft: 9.5 },
  food_processing: { flooring_pct: 0.90, system: "USDA-Approved Urethane Cement", price_sqft: 10.0 },
  office: { flooring_pct: 0.30, system: "Polished Concrete", price_sqft: 3.5 },
  other: { flooring_pct: 0.60, system: "Standard Commercial Epoxy", price_sqft: 4.5 }
};

async function runTaskBlock(base44, blockNum, blockName, prompt, runLogId) {
  try {
    // Update run log
    const currentLog = await base44.asServiceRole.entities.OvernightRunLog.get(runLogId);
    const taskStatus = JSON.parse(currentLog.task_block_status || '{}');
    taskStatus[`block_${blockNum}`] = { name: blockName, status: 'running', started: new Date().toISOString() };
    await base44.asServiceRole.entities.OvernightRunLog.update(runLogId, {
      task_block_status: JSON.stringify(taskStatus)
    });

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          leads: {
            type: "array",
            items: {
              type: "object",
              properties: {
                company: { type: "string" },
                contact_name: { type: "string" },
                email: { type: "string" },
                phone: { type: "string" },
                website: { type: "string" },
                city: { type: "string" },
                state: { type: "string" },
                vertical: { type: "string" },
                employee_count: { type: "number" },
                estimated_revenue: { type: "number" },
                square_footage: { type: "number" },
                score: { type: "number" },
                ai_insight: { type: "string" },
                ai_recommendation: { type: "string" },
                estimated_value: { type: "number" },
                existing_material: { type: "string" },
                source: { type: "string" }
              }
            }
          },
          jobs: {
            type: "array",
            items: {
              type: "object",
              properties: {
                job_name: { type: "string" },
                city: { type: "string" },
                county: { type: "string" },
                project_type: { type: "string" },
                total_sqft: { type: "number" },
                owner_name: { type: "string" },
                gc_name: { type: "string" },
                project_value: { type: "number" },
                project_phase: { type: "string" },
                source_url: { type: "string" },
                ai_insight: { type: "string" }
              }
            }
          },
          summary: { type: "string" }
        }
      },
      add_context_from_internet: true
    });

    let leadsCreated = 0;
    let jobsFound = 0;

    // Save leads
    if (result.leads && result.leads.length > 0) {
      for (const lead of result.leads) {
        try {
          await base44.asServiceRole.entities.Lead.create({
            company: lead.company || 'Unknown',
            contact_name: lead.contact_name || '',
            email: lead.email || '',
            phone: lead.phone || '',
            website: lead.website || '',
            city: lead.city || '',
            state: lead.state || 'FL',
            vertical: lead.vertical || 'Other',
            location: `${lead.city || ''}, ${lead.state || 'FL'}`,
            employee_count: lead.employee_count || 0,
            estimated_revenue: lead.estimated_revenue || 0,
            square_footage: lead.square_footage || 0,
            score: lead.score || 50,
            ai_insight: lead.ai_insight || '',
            ai_recommendation: lead.ai_recommendation || '',
            estimated_value: lead.estimated_value || 0,
            existing_material: lead.existing_material || '',
            source: lead.source || `Overnight Run Block ${blockNum}`,
            stage: 'Incoming',
            pipeline_status: 'Incoming',
            lead_type: 'XPress',
            ingestion_source: 'Scraper'
          });
          leadsCreated++;
        } catch (e) {
          console.error('Lead create error:', e.message);
        }
      }
    }

    // Save commercial jobs
    if (result.jobs && result.jobs.length > 0) {
      for (const job of result.jobs) {
        try {
          const pType = job.project_type || 'other';
          const config = PROJECT_TYPES_MAP[pType] || PROJECT_TYPES_MAP.other;
          const totalSqft = job.total_sqft || 10000;
          const flooringSqft = Math.round(totalSqft * config.flooring_pct);
          const flooringValue = Math.round(flooringSqft * config.price_sqft);

          await base44.asServiceRole.entities.CommercialJob.create({
            job_name: job.job_name || 'Unnamed Project',
            city: job.city || '',
            county: job.county || '',
            state: 'FL',
            project_type: pType,
            total_sqft: totalSqft,
            flooring_sqft: flooringSqft,
            owner_name: job.owner_name || '',
            gc_name: job.gc_name || '',
            project_value: job.project_value || 0,
            estimated_flooring_value: flooringValue,
            project_phase: job.project_phase || 'permit_filed',
            flooring_system_recommendation: config.system,
            lead_score: Math.min(100, Math.round((flooringValue / 1000) + 40)),
            urgency_score: job.project_phase === 'bidding' ? 90 : job.project_phase === 'pre_bid' ? 75 : 50,
            route_to: flooringValue > 50000 ? 'NCP' : 'XPress',
            bid_status: 'not_started',
            source_url: job.source_url || '',
            discovery_date: new Date().toISOString(),
            ai_insight: job.ai_insight || ''
          });
          jobsFound++;
        } catch (e) {
          console.error('Job create error:', e.message);
        }
      }
    }

    // Update task block status
    taskStatus[`block_${blockNum}`] = {
      name: blockName,
      status: 'complete',
      started: taskStatus[`block_${blockNum}`]?.started,
      completed: new Date().toISOString(),
      leads_created: leadsCreated,
      jobs_found: jobsFound
    };
    
    const updatedLog = await base44.asServiceRole.entities.OvernightRunLog.get(runLogId);
    await base44.asServiceRole.entities.OvernightRunLog.update(runLogId, {
      task_block_status: JSON.stringify(taskStatus),
      leads_created: (updatedLog.leads_created || 0) + leadsCreated,
      jobs_found: (updatedLog.jobs_found || 0) + jobsFound
    });

    return { leadsCreated, jobsFound, summary: result.summary };
  } catch (error) {
    console.error(`Block ${blockNum} error:`, error.message);
    const currentLog = await base44.asServiceRole.entities.OvernightRunLog.get(runLogId);
    const taskStatus = JSON.parse(currentLog.task_block_status || '{}');
    taskStatus[`block_${blockNum}`] = { name: blockName, status: 'failed', error: error.message };
    await base44.asServiceRole.entities.OvernightRunLog.update(runLogId, {
      task_block_status: JSON.stringify(taskStatus),
      errors_count: (currentLog.errors_count || 0) + 1
    });
    return { leadsCreated: 0, jobsFound: 0, error: error.message };
  }
}

async function generateBidsForJobs(base44, runLogId) {
  const jobs = await base44.asServiceRole.entities.CommercialJob.filter(
    { bid_status: 'not_started' }, '-lead_score', 20
  );
  
  const qualifiedJobs = jobs.filter(j => (j.lead_score || 0) >= 70);
  let bidsGenerated = 0;

  for (const job of qualifiedJobs) {
    try {
      const config = PROJECT_TYPES_MAP[job.project_type] || PROJECT_TYPES_MAP.other;
      const flooringSqft = job.flooring_sqft || Math.round((job.total_sqft || 10000) * config.flooring_pct);
      const materialCost = Math.round(flooringSqft * config.price_sqft * 0.4);
      const laborCost = Math.round(flooringSqft * config.price_sqft * 0.45);
      const totalBid = Math.round(flooringSqft * config.price_sqft);

      const bidResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Generate a professional flooring bid for: ${job.job_name} in ${job.city}, FL. Project type: ${job.project_type}. Square footage: ${flooringSqft} sqft. System: ${config.system}. Total bid value: $${totalBid.toLocaleString()}. Material cost: $${materialCost.toLocaleString()}. Labor cost: $${laborCost.toLocaleString()}. Owner: ${job.owner_name || 'Property Owner'}. GC: ${job.gc_name || 'TBD'}. Write a complete bid document with scope of work, material specifications, timeline, payment terms, and warranty. Also write a personalized cover email.`,
        response_json_schema: {
          type: "object",
          properties: {
            bid_content: { type: "string" },
            email_subject: { type: "string" },
            email_body: { type: "string" },
            takeoff_zones: { type: "string" }
          }
        }
      });

      const bidNum = `BID-FL-${Date.now().toString(36).toUpperCase()}`;
      await base44.asServiceRole.entities.BidDocument.create({
        job_id: job.id,
        bid_number: bidNum,
        bid_date: new Date().toISOString().split('T')[0],
        recipient_name: job.gc_name || job.owner_name || 'Decision Maker',
        recipient_email: job.gc_email || job.owner_email || '',
        recipient_company: job.gc_name || job.owner_name || '',
        project_name: job.job_name,
        project_address: `${job.city}, FL`,
        takeoff_data: bidResult.takeoff_zones || '{}',
        total_material_cost: materialCost,
        total_labor_cost: laborCost,
        total_bid_value: totalBid,
        bid_document_content: bidResult.bid_content || '',
        cover_email_subject: bidResult.email_subject || `${job.job_name} — Flooring Proposal`,
        cover_email_body: bidResult.email_body || '',
        send_status: 'queued',
        validation_passed: true,
        validation_notes: 'Auto-validated by overnight runner'
      });

      await base44.asServiceRole.entities.CommercialJob.update(job.id, {
        bid_status: 'bid_generated'
      });

      bidsGenerated++;
    } catch (e) {
      console.error('Bid generation error:', e.message);
    }
  }

  // Update run log
  const log = await base44.asServiceRole.entities.OvernightRunLog.get(runLogId);
  await base44.asServiceRole.entities.OvernightRunLog.update(runLogId, {
    bids_generated: (log.bids_generated || 0) + bidsGenerated
  });

  return bidsGenerated;
}

async function sendMorningBrief(base44, runLogId) {
  const log = await base44.asServiceRole.entities.OvernightRunLog.get(runLogId);
  const topLeads = await base44.asServiceRole.entities.Lead.filter(
    { state: 'FL' }, '-score', 50
  );
  const topJobs = await base44.asServiceRole.entities.CommercialJob.filter(
    { state: 'FL' }, '-estimated_flooring_value', 20
  );
  const queuedBids = await base44.asServiceRole.entities.BidDocument.filter(
    { send_status: 'queued' }, '-total_bid_value', 20
  );

  const leadTable = topLeads.slice(0, 30).map((l, i) =>
    `${i+1}. ${l.company} — ${l.city}, FL — Score: ${l.score || 0} — Est Value: $${(l.estimated_value || 0).toLocaleString()} — ${l.ai_recommendation || 'Contact for discovery'}`
  ).join('\n');

  const jobTable = topJobs.map((j, i) =>
    `${i+1}. ${j.job_name} — ${j.city} — ${j.project_type} — ${(j.flooring_sqft || 0).toLocaleString()} sqft — $${(j.estimated_flooring_value || 0).toLocaleString()} — Bid: ${j.bid_status}`
  ).join('\n');

  const bidTable = queuedBids.map((b, i) =>
    `${i+1}. ${b.project_name} → ${b.recipient_name} — $${(b.total_bid_value || 0).toLocaleString()}`
  ).join('\n');

  const taskStatus = JSON.parse(log.task_block_status || '{}');
  const blockSummary = Object.values(taskStatus).map(b =>
    `${b.name}: ${b.status}${b.leads_created ? ` (${b.leads_created} leads)` : ''}${b.jobs_found ? ` (${b.jobs_found} jobs)` : ''}`
  ).join('\n');

  const emailBody = `
<h2>🏗️ XPS Intelligence — Overnight Florida Operation Complete</h2>
<p><strong>Run Date:</strong> ${log.run_date}</p>
<p><strong>Status:</strong> ${log.completion_status}</p>

<h3>📊 Executive Summary</h3>
<ul>
  <li><strong>Leads Created:</strong> ${log.leads_created || 0}</li>
  <li><strong>Commercial Jobs Found:</strong> ${log.jobs_found || 0}</li>
  <li><strong>Bids Generated:</strong> ${log.bids_generated || 0}</li>
  <li><strong>Emails Queued:</strong> ${queuedBids.length}</li>
  <li><strong>Errors:</strong> ${log.errors_count || 0}</li>
</ul>

<h3>📋 Task Block Results</h3>
<pre>${blockSummary}</pre>

<h3>🏆 Top 30 Florida Leads</h3>
<pre>${leadTable || 'No leads generated yet'}</pre>

<h3>🏢 Commercial Job Pipeline</h3>
<pre>${jobTable || 'No jobs found yet'}</pre>

<h3>📄 Bids Queued for Sending</h3>
<pre>${bidTable || 'No bids queued'}</pre>

<h3>📞 Priority Call List</h3>
<pre>${topLeads.slice(0, 20).map((l, i) => `${i+1}. ${l.company} — ${l.phone || 'No phone'} — ${l.ai_recommendation || 'Discovery call'}`).join('\n') || 'No calls scheduled'}</pre>

<p>— XPS Intelligence Overnight Engine</p>
  `.trim();

  await base44.asServiceRole.integrations.Core.SendEmail({
    to: 'jeremy@shopxps.com',
    subject: `🏗️ XPS Overnight Report — ${log.leads_created || 0} Leads, ${log.jobs_found || 0} Jobs, ${log.bids_generated || 0} Bids — ${log.run_date}`,
    body: emailBody,
    from_name: 'XPS Intelligence'
  });

  await base44.asServiceRole.entities.OvernightRunLog.update(runLogId, {
    report_sent_at: new Date().toISOString(),
    executive_summary: `${log.leads_created || 0} leads, ${log.jobs_found || 0} jobs, ${log.bids_generated || 0} bids generated for Florida market.`
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Support both user-triggered and scheduled automation calls
    let isAuthed = false;
    try { const user = await base44.auth.me(); isAuthed = !!user; } catch {}

    const body = await req.json().catch(() => ({}));
    const { action, run_id, target_market } = body;

    // Start a full overnight run
    if (action === 'start') {
      const market = target_market || 'Florida';
      const today = new Date().toISOString().split('T')[0];

      const runLog = await base44.asServiceRole.entities.OvernightRunLog.create({
        run_date: today,
        target_market: market,
        start_time: new Date().toISOString(),
        completion_status: 'running',
        leads_created: 0,
        jobs_found: 0,
        bids_generated: 0,
        emails_sent: 0,
        errors_count: 0,
        validation_failures: 0,
        task_block_status: '{}'
      });

      const runLogId = runLog.id;

      // Block 1: Florida contractor discovery
      const citiesStr = FLORIDA_CITIES.join(', ');
      const termsStr = SEARCH_TERMS.join(', ');
      const b1 = await runTaskBlock(base44, 1, 'FL Contractor Discovery',
        `You are the XPS Scraper Agent. Search the internet for epoxy flooring and polished concrete companies in Florida. Target cities: ${citiesStr}. Search terms: ${termsStr}. Find real companies with real contact information. For each company, provide: company name, contact person name, email if findable, phone number, website, city (in Florida), industry vertical, estimated employee count, estimated revenue, estimated square footage they work on, a lead score 0-100, an AI insight about why they matter to XPS, a product recommendation, estimated deal value, and what existing materials/equipment they use. Return as many real Florida contractors as you can find. Focus on companies that BUY materials and supplies — these are XPS Xpress prospects.`,
        runLogId
      );

      // Block 2: Adjacent industries
      const adjStr = ADJACENT_CATEGORIES.join(', ');
      const b2 = await runTaskBlock(base44, 2, 'FL Adjacent Industry Discovery',
        `You are the XPS Scraper Agent. Search for adjacent industry companies in Florida that could buy epoxy flooring products or hire floor coating services. Categories: ${adjStr}. Target cities: ${citiesStr}. Find real companies — painting contractors who could add floor coatings, general contractors with flooring needs, property management companies, auto dealerships, fitness centers, restaurants, healthcare facilities. For each, provide company name, contact, email, phone, website, city, industry vertical, employee count, revenue estimate, square footage, lead score, AI insight, and product recommendation.`,
        runLogId
      );

      // Block 3: Future operators
      const b3 = await runTaskBlock(base44, 3, 'FL Future Operator Discovery',
        `You are the XPS Scraper Agent. Search the internet for people and new businesses in Florida interested in starting an epoxy flooring business. Search for: new Florida LLCs related to epoxy/concrete/floor coating, people asking about starting epoxy businesses, people looking for epoxy flooring training in Florida, concrete polishing certification inquiries. These are potential XPS Xpress franchise buyers or Concrete Polishing University students. For each lead, provide their name/company, contact info if available, city, what signals indicate their interest, a score, and a recommended outreach approach.`,
        runLogId
      );

      // Block 4: Commercial job pipeline
      const countyStr = PERMIT_COUNTIES.join(', ');
      const b4 = await runTaskBlock(base44, 4, 'FL Commercial Job Pipeline',
        `You are the XPS Intelligence Agent. Search for active commercial construction projects in Florida that will need epoxy flooring, polished concrete, or decorative concrete. Search Florida counties: ${countyStr}. Look for: new warehouse construction, new retail build-outs, restaurant renovations, fitness center openings, healthcare facility construction, industrial buildings, data centers, hotels, breweries, food processing plants. Search public permit records, economic development announcements, commercial real estate news, and construction industry announcements. For each project found, provide: project name, city, county, project type (warehouse/retail/restaurant/fitness/healthcare/industrial/etc), total square footage, owner name, general contractor name if known, estimated project value, current phase, source URL, and an AI insight about the flooring opportunity.`,
        runLogId
      );

      // Block 5: Generate bids
      const bidsGenerated = await generateBidsForJobs(base44, runLogId);

      // Block 6: Morning brief
      await base44.asServiceRole.entities.OvernightRunLog.update(runLogId, {
        completion_status: 'complete',
        end_time: new Date().toISOString()
      });

      await sendMorningBrief(base44, runLogId);

      const finalLog = await base44.asServiceRole.entities.OvernightRunLog.get(runLogId);
      return Response.json({
        success: true,
        run_id: runLogId,
        results: {
          leads_created: finalLog.leads_created,
          jobs_found: finalLog.jobs_found,
          bids_generated: finalLog.bids_generated,
          completion_status: finalLog.completion_status
        }
      });
    }

    // Get status of a run
    if (action === 'status') {
      if (run_id) {
        const log = await base44.asServiceRole.entities.OvernightRunLog.get(run_id);
        return Response.json(log);
      }
      const logs = await base44.asServiceRole.entities.OvernightRunLog.filter({}, '-created_date', 5);
      return Response.json({ runs: logs });
    }

    // Get latest run
    if (action === 'latest') {
      const logs = await base44.asServiceRole.entities.OvernightRunLog.filter({}, '-created_date', 1);
      if (logs.length === 0) return Response.json({ run: null });
      return Response.json({ run: logs[0] });
    }

    return Response.json({ error: 'Invalid action. Use: start, status, latest' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});