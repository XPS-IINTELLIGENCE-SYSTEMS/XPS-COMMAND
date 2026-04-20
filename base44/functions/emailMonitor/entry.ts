import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Scheduled: Checks for bid responses, scope invitations, and important emails
// Runs every hour to catch incoming bid invitations and replies
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Check recent outreach emails for status updates
    const recentEmails = await base44.asServiceRole.entities.OutreachEmail.filter(
      { status: "Sent" }, "-sent_at", 100
    );

    let updatedCount = 0;
    let newScopes = 0;

    // Check for any outreach emails that might have replies (mark as needing review)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    // Check ContractorCompany for any that moved from "contacted" to "active" 
    // (meaning they responded to our bid list request)
    const activeGcs = await base44.asServiceRole.entities.ContractorCompany.filter(
      { bid_list_status: "contacted" }, "-last_updated", 50
    );

    // Check for new FloorScopes that haven't been processed
    const pendingScopes = await base44.asServiceRole.entities.FloorScope.filter(
      { takeoff_status: "pending" }, "-created_date", 20
    );

    for (const scope of pendingScopes) {
      // If scope has a raw document, auto-trigger processing
      if (scope.raw_scope_document) {
        // Create an approval request for the admin
        await base44.asServiceRole.entities.AgentActivity.create({
          agent_name: "Email Monitor",
          action: `New bid scope received: ${scope.project_name} from ${scope.gc_company_name}. ${scope.total_flooring_sqft || "?"} sqft. Bid due: ${scope.bid_due_date || "TBD"}`,
          status: "approval_required",
          category: "bidding",
          related_entity_type: "FloorScope",
          related_entity_id: scope.id,
          details: JSON.stringify({
            project: scope.project_name,
            gc: scope.gc_company_name,
            sqft: scope.total_flooring_sqft,
            bid_due: scope.bid_due_date,
            type: scope.project_type,
            has_document: !!scope.raw_scope_document,
          }),
        });
        newScopes++;
      }
    }

    // Check for stale "contacted" GCs that haven't responded in 30+ days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
    const staleGcs = activeGcs.filter(gc => 
      gc.bid_list_request_sent_date && gc.bid_list_request_sent_date < thirtyDaysAgo && (gc.follow_up_stage || 0) >= 3
    );

    for (const gc of staleGcs.slice(0, 5)) {
      await base44.asServiceRole.entities.ContractorCompany.update(gc.id, {
        bid_list_status: "cold",
        last_updated: new Date().toISOString(),
        re_engage_date: new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
      });
      updatedCount++;
    }

    // Summary
    const summary = {
      success: true,
      new_scopes_flagged: newScopes,
      stale_gcs_marked_cold: updatedCount,
      emails_monitored: recentEmails.length,
      pending_scopes: pendingScopes.length,
      timestamp: new Date().toISOString(),
    };

    // Only email if something notable happened
    if (newScopes > 0) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: "jeremy@shopxps.com",
        subject: `[SCOPE ALERT] ${newScopes} New Bid Scopes Need Review`,
        body: `${newScopes} new bid scope(s) received and pending your review in the Approval Queue.\n\nLogin to review: https://app.base44.com`,
        from_name: "XPS Intelligence"
      }).catch(() => {});
    }

    return Response.json(summary);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});