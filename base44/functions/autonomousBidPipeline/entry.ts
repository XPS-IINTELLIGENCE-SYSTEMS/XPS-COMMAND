import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { action, jobId, opportunityUrl } = payload;

    // 1. MONITOR: Find new bid opportunities
    if (action === 'monitor') {
      const jobs = await base44.entities.CommercialJob.filter(
        { bid_status: 'not_started', project_phase: 'pre_bid' },
        '-discovery_date',
        50
      );

      const opportunities = jobs.map(job => ({
        id: job.id,
        name: job.job_name,
        scopeUrl: job.source_url,
        phase: job.project_phase,
        discovered: job.discovery_date,
        value: job.estimated_flooring_value,
      }));

      return Response.json({ action: 'monitor', opportunities, count: opportunities.length });
    }

    // 2. EXTRACT: Get scope-of-work from URL using shadow browser
    if (action === 'extract') {
      if (!opportunityUrl) {
        return Response.json({ error: 'opportunityUrl required' }, { status: 400 });
      }

      // Call shadow browser to extract scope document
      const shadowResult = await base44.functions.invoke('shadowBrowser', {
        url: opportunityUrl,
        action: 'extractScope',
        extractPDF: true,
        extractText: true,
      });

      const scopeData = {
        url: opportunityUrl,
        extracted: new Date().toISOString(),
        content: shadowResult?.content || '',
        structure: shadowResult?.structure || {},
        images: shadowResult?.images || [],
        pdfs: shadowResult?.pdfs || [],
      };

      // Store extracted scope
      if (jobId) {
        await base44.entities.FloorScope.create({
          project_name: `Scope from ${opportunityUrl}`,
          gc_company_name: 'To Be Determined',
          raw_scope_document: opportunityUrl,
          extracted_zones: JSON.stringify(parseZones(scopeData.content)),
          takeoff_status: 'in_progress',
          bid_status: 'not_started',
        });
      }

      return Response.json({ action: 'extract', scopeData, status: 'extracted' });
    }

    // 3. GENERATE: Create bid proposal in Google Docs
    if (action === 'generate') {
      if (!jobId) {
        return Response.json({ error: 'jobId required' }, { status: 400 });
      }

      const job = await base44.entities.CommercialJob.get(jobId);
      if (!job) {
        return Response.json({ error: 'Job not found' }, { status: 404 });
      }

      // Get knowledge base for pricing and specifications
      const knowledge = await base44.entities.KnowledgeBase.list('-updated_date', 10);
      const flooringSystems = knowledge.filter(k => k.type === 'flooring_system');

      // Generate proposal content
      const proposalContent = generateProposalContent(job, flooringSystems);

      // Create Google Doc
      const docResult = await base44.functions.invoke('readWriteGoogleDocs', {
        action: 'create',
        title: `BID PROPOSAL: ${job.job_name}`,
        content: proposalContent,
        folderId: 'root', // Can be configured
      });

      // Create BidDocument record
      const bidDoc = await base44.entities.BidDocument.create({
        job_id: jobId,
        project_name: job.job_name,
        bid_date: new Date().toISOString().split('T')[0],
        recipient_name: job.gc_contact || 'General Contractor',
        recipient_email: job.gc_email,
        recipient_company: job.gc_name,
        scope_of_work: job.job_name,
        bid_document_content: proposalContent,
        send_status: 'draft',
        validation_passed: false,
      });

      return Response.json({
        action: 'generate',
        bidId: bidDoc.id,
        googleDocUrl: docResult?.url,
        status: 'created',
      });
    }

    // 4. ORCHESTRATE: Full pipeline
    if (action === 'orchestrate') {
      // Monitor
      const monitorResult = await base44.functions.invoke('autonomousBidPipeline', {
        action: 'monitor',
      });

      const results = [];
      for (const opp of monitorResult.opportunities) {
        try {
          // Extract
          const extractResult = await base44.functions.invoke('autonomousBidPipeline', {
            action: 'extract',
            opportunityUrl: opp.scopeUrl,
            jobId: opp.id,
          });

          // Generate
          const genResult = await base44.functions.invoke('autonomousBidPipeline', {
            action: 'generate',
            jobId: opp.id,
          });

          // Update job status
          await base44.entities.CommercialJob.update(opp.id, {
            bid_status: 'bid_generated',
            last_follow_up: new Date().toISOString(),
          });

          results.push({
            opportunity: opp.name,
            extracted: true,
            generated: true,
            bidId: genResult.bidId,
            docUrl: genResult.googleDocUrl,
          });
        } catch (err) {
          results.push({
            opportunity: opp.name,
            error: err.message,
          });
        }
      }

      // Log orchestration
      await base44.entities.OrchestratorLog.create({
        action: 'autonomousBidPipeline',
        status: 'completed',
        input_count: monitorResult.opportunities.length,
        output_count: results.filter(r => !r.error).length,
        results: JSON.stringify(results),
      });

      return Response.json({
        action: 'orchestrate',
        processed: results.length,
        generated: results.filter(r => !r.error).length,
        results,
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Pipeline error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function parseZones(content) {
  // Parse scope document for zones/areas
  const zones = [];
  const lines = (content || '').split('\n');
  const areaPattern = /(\d+(?:,\d+)?)\s*(?:sq\.?\s*ft|sqft|sf)/i;

  for (const line of lines) {
    const match = line.match(areaPattern);
    if (match) {
      zones.push({
        name: line.substring(0, 50),
        sqft: parseInt(match[1].replace(/,/g, '')),
      });
    }
  }

  return zones;
}

function generateProposalContent(job, flooringSystems) {
  const system = flooringSystems[0]?.specs || {
    name: 'XPress Epoxy Coating System',
    coverage: 'TBD',
    warranty: '5 years',
  };

  return `
PRELIMINARY BID PROPOSAL
═══════════════════════════════════════════

PROJECT: ${job.job_name}
ADDRESS: ${job.address || 'TBD'}, ${job.city}, ${job.state} ${job.zip}
OWNER: ${job.owner_name || 'TBD'}
GC: ${job.gc_name || 'TBD'}

PROJECT DETAILS
───────────────
Project Type: ${job.project_type}
Total Sqft: ${job.total_sqft || 'TBD'}
Flooring Sqft: ${job.flooring_sqft || 'TBD'}
Est. Project Value: $${(job.project_value || 0).toLocaleString()}
Est. Flooring Value: $${(job.estimated_flooring_value || 0).toLocaleString()}

SCOPE OF WORK
───────────────
1. Surface preparation and dust containment
2. Application of XPress ${system.name}
3. Final curing and quality assurance

FLOORING SYSTEM RECOMMENDED
───────────────────────────
System: ${system.name}
Coverage: ${system.coverage}
Warranty: ${system.warranty}

PRELIMINARY ESTIMATE
────────────────────
Material: [TO BE CALCULATED]
Labor: [TO BE CALCULATED]
Equipment: [TO BE CALCULATED]
Overhead & Profit: [TO BE CALCULATED]
TOTAL: [PENDING DETAILED TAKEOFF]

TIMELINE
────────
Prep Work: [5-7 Days]
Application: [3-5 Days]
Curing: [7-14 Days]

NEXT STEPS
──────────
1. Site visit and detailed measurements
2. Detailed scope extraction and takeoff
3. Competitive pricing analysis
4. Final proposal submission

Generated: ${new Date().toLocaleDateString()}
Status: PRELIMINARY - AWAITING VALIDATION
`;
}