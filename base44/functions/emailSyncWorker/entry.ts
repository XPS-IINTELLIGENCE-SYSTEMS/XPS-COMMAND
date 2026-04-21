import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * EMAIL SYNC WORKER
 * Monitors OutreachEmail records for status changes (Sent, Opened, Replied)
 * and updates the corresponding Lead or CommercialJob records:
 *   - Updates last_contacted on Lead
 *   - Advances Lead stage if appropriate
 *   - Updates follow_up_count / last_follow_up on CommercialJob
 *   - Appends communication history to notes
 *   - Logs every sync action to AgentActivity
 */

Deno.serve(async (req) => {
  const start = Date.now();
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // 1. Fetch recently updated emails (last 30 min window to catch changes between runs)
    const allEmails = await base44.asServiceRole.entities.OutreachEmail.list('-updated_date', 200);
    const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const recentEmails = allEmails.filter(e =>
      e.updated_date >= cutoff &&
      (e.status === 'Sent' || e.status === 'Opened' || e.status === 'Replied')
    );

    if (recentEmails.length === 0) {
      return Response.json({ success: true, synced: 0, message: 'No new email activity', duration_ms: Date.now() - start });
    }

    const stats = { leads_updated: 0, jobs_updated: 0, emails_processed: 0, errors: 0 };
    const logs = [];

    for (const email of recentEmails) {
      try {
        const now = new Date().toISOString();
        const historyLine = `[${email.status}] ${email.email_type || 'Email'} "${email.subject}" to ${email.to_name || email.to_email} — ${new Date(email.updated_date).toLocaleDateString()}`;

        // ── Update linked Lead ──
        if (email.lead_id) {
          const leads = await base44.asServiceRole.entities.Lead.filter({ id: email.lead_id });
          const lead = leads[0];
          if (lead) {
            const updates = {};

            // Always update last_contacted to the most recent activity
            if (email.status === 'Sent' || email.status === 'Opened' || email.status === 'Replied') {
              const emailTime = email.sent_at || email.updated_date;
              if (!lead.last_contacted || emailTime > lead.last_contacted) {
                updates.last_contacted = emailTime;
              }
            }

            // Stage advancement logic
            if (email.status === 'Sent' && lead.stage === 'Qualified') {
              updates.stage = 'Contacted';
            }
            if (email.status === 'Sent' && lead.stage === 'Prioritized') {
              updates.stage = 'Contacted';
            }
            if (email.status === 'Replied' && (lead.stage === 'Contacted' || lead.stage === 'Qualified' || lead.stage === 'Prioritized')) {
              updates.stage = 'Proposal';
            }

            // Append to notes
            const existingNotes = lead.notes || '';
            const marker = `[Sync ${email.id}]`;
            if (!existingNotes.includes(marker)) {
              updates.notes = (existingNotes ? existingNotes + '\n' : '') + `${marker} ${historyLine}`;
            }

            if (Object.keys(updates).length > 0) {
              await base44.asServiceRole.entities.Lead.update(lead.id, updates);
              stats.leads_updated++;
              logs.push(`Lead "${lead.company}" — ${Object.keys(updates).join(', ')}`);
            }
          }
        }

        // ── Update linked CommercialJob (match by gc_email or owner_email) ──
        if (!email.lead_id) {
          // Try to find a matching job by recipient email
          const jobsByGC = await base44.asServiceRole.entities.CommercialJob.filter({ gc_email: email.to_email });
          const jobsByOwner = jobsByGC.length > 0 ? [] : await base44.asServiceRole.entities.CommercialJob.filter({ owner_email: email.to_email });
          const matchedJob = jobsByGC[0] || jobsByOwner[0];

          if (matchedJob) {
            const updates = {};

            if (email.status === 'Sent' || email.status === 'Replied') {
              updates.follow_up_count = (matchedJob.follow_up_count || 0) + 1;
              updates.last_follow_up = email.sent_at || email.updated_date;
            }

            // Advance bid status on reply
            if (email.status === 'Replied' && matchedJob.bid_status === 'sent') {
              updates.bid_status = 'follow_up_1';
            }

            // Append to notes
            const existingNotes = matchedJob.notes || '';
            const marker = `[Sync ${email.id}]`;
            if (!existingNotes.includes(marker)) {
              updates.notes = (existingNotes ? existingNotes + '\n' : '') + `${marker} ${historyLine}`;
            }

            if (Object.keys(updates).length > 0) {
              await base44.asServiceRole.entities.CommercialJob.update(matchedJob.id, updates);
              stats.jobs_updated++;
              logs.push(`Job "${matchedJob.job_name}" — ${Object.keys(updates).join(', ')}`);
            }
          }
        }

        // ── Also try matching Lead by email address (if no lead_id was set) ──
        if (!email.lead_id && email.to_email) {
          const leadsByEmail = await base44.asServiceRole.entities.Lead.filter({ email: email.to_email });
          const matchedLead = leadsByEmail[0];
          if (matchedLead) {
            const updates = {};
            const emailTime = email.sent_at || email.updated_date;
            if (!matchedLead.last_contacted || emailTime > matchedLead.last_contacted) {
              updates.last_contacted = emailTime;
            }

            if (email.status === 'Sent' && (matchedLead.stage === 'Qualified' || matchedLead.stage === 'Prioritized')) {
              updates.stage = 'Contacted';
            }
            if (email.status === 'Replied' && (matchedLead.stage === 'Contacted' || matchedLead.stage === 'Qualified' || matchedLead.stage === 'Prioritized')) {
              updates.stage = 'Proposal';
            }

            const existingNotes = matchedLead.notes || '';
            const marker = `[Sync ${email.id}]`;
            if (!existingNotes.includes(marker)) {
              updates.notes = (existingNotes ? existingNotes + '\n' : '') + `${marker} ${historyLine}`;
            }

            if (Object.keys(updates).length > 0) {
              await base44.asServiceRole.entities.Lead.update(matchedLead.id, updates);
              stats.leads_updated++;
              logs.push(`Lead "${matchedLead.company}" (by email match) — ${Object.keys(updates).join(', ')}`);
            }
          }
        }

        stats.emails_processed++;
      } catch (err) {
        stats.errors++;
        logs.push(`Error processing email ${email.id}: ${err.message}`);
      }
    }

    // 2. Log the sync run as an AgentActivity
    await base44.asServiceRole.entities.AgentActivity.create({
      agent_name: 'Email Sync Worker',
      action: `Synced ${stats.emails_processed} emails → ${stats.leads_updated} leads, ${stats.jobs_updated} jobs updated`,
      status: stats.errors > 0 ? 'failed' : 'success',
      category: 'outreach',
      details: JSON.stringify({ stats, logs, duration_ms: Date.now() - start }),
    });

    return Response.json({
      success: true,
      ...stats,
      logs,
      duration_ms: Date.now() - start,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});