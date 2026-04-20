import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Scheduled: Scrapes competitor websites for changes (pricing, content, products)
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all competitor profiles with websites
    const competitors = await base44.asServiceRole.entities.FlooringCompetitor.list("-created_date", 100);
    const withWebsites = competitors.filter(c => c.website);

    let scanned = 0;
    let changesDetected = 0;
    const errors = [];

    for (const comp of withWebsites.slice(0, 10)) {
      try {
        // Use InvokeLLM with internet to check competitor's current state
        const scan = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Analyze this flooring contractor competitor website: ${comp.website}
          
Company: ${comp.company_name}
Known specialties: ${comp.specialties || "unknown"}
Known pricing tier: ${comp.pricing_tier || "unknown"}

Check their website and provide:
1. Current services and specialties offered
2. Any pricing information visible
3. Any new products or services
4. Recent projects or case studies mentioned
5. Any job postings (indicates growth)
6. Technology/tools they advertise (AI estimating, etc.)
7. Geographic coverage areas`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              services: { type: "array", items: { type: "string" } },
              pricing_signals: { type: "string" },
              new_offerings: { type: "array", items: { type: "string" } },
              recent_projects: { type: "array", items: { type: "string" } },
              hiring: { type: "boolean" },
              technology_used: { type: "array", items: { type: "string" } },
              coverage_areas: { type: "array", items: { type: "string" } },
              threat_assessment: { type: "string" },
              notable_changes: { type: "string" }
            }
          },
          model: "gemini_3_flash"
        });

        const hasChanges = scan?.notable_changes && scan.notable_changes !== "none" && scan.notable_changes.length > 10;

        // Store the intelligence
        await base44.asServiceRole.entities.CompetitorIntelligence.create({
          competitor_name: comp.company_name,
          website_url: comp.website,
          scan_type: "full",
          change_detected: hasChanges,
          change_type: hasChanges ? "content" : "no_change",
          severity: hasChanges ? "medium" : "low",
          current_snapshot: JSON.stringify(scan),
          diff_summary: scan?.notable_changes || "No significant changes detected",
          ai_analysis: scan?.threat_assessment || "",
          recommendations: hasChanges ? `Review ${comp.company_name}'s changes and adjust strategy` : "",
          scanned_at: new Date().toISOString(),
          status: "scanned",
        });

        // Update the competitor profile
        await base44.asServiceRole.entities.FlooringCompetitor.update(comp.id, {
          last_updated: new Date().toISOString(),
          specialties: scan?.services ? JSON.stringify(scan.services.slice(0, 10)) : comp.specialties,
        });

        scanned++;
        if (hasChanges) changesDetected++;
      } catch (err) {
        errors.push(`${comp.company_name}: ${err.message}`);
      }
    }

    // Log the run
    await base44.asServiceRole.entities.OvernightRunLog.create({
      run_date: new Date().toISOString().split("T")[0],
      target_market: "Competitor Intelligence Monitor",
      completion_status: errors.length === 0 ? "complete" : "partial",
      leads_created: changesDetected,
      errors_count: errors.length,
      executive_summary: `Competitor Monitor: Scanned ${scanned} competitors, ${changesDetected} changes detected. ${errors.length} errors.`,
    }).catch(() => {});

    // Alert if significant changes found
    if (changesDetected > 0) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: "jeremy@shopxps.com",
        subject: `[ALERT] ${changesDetected} Competitor Changes Detected`,
        body: `The competitor monitor detected ${changesDetected} changes across ${scanned} competitors scanned.\n\nLogin to review: https://app.base44.com`,
        from_name: "XPS Intelligence"
      }).catch(() => {});
    }

    return Response.json({ success: true, scanned, changesDetected, errors });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});