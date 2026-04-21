import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * DORMANT LEAD RE-ENGAGER
 * Runs daily via scheduled automation.
 * Checks dormant leads for reactivation triggers:
 * - Past reactivation date
 * - Company has new activity (web research)
 * - Market conditions changed for their vertical
 */
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const allLeads = await base44.asServiceRole.entities.Lead.list('-created_date', 500);
  const dormantLeads = allLeads.filter(l => l.stage === 'Dormant');

  if (dormantLeads.length === 0) {
    return Response.json({ success: true, message: 'No dormant leads', checked: 0, reactivated: 0 });
  }

  const today = new Date().toISOString().split('T')[0];
  const results = { checked: 0, reactivated: 0, details: [] };

  // Process up to 15 leads per run to stay within timeout
  const batch = dormantLeads.slice(0, 15);

  for (const lead of batch) {
    results.checked++;

    // Check 1: Past reactivation date
    if (lead.reactivation_date && lead.reactivation_date <= today) {
      // Use AI to check if the company has new activity
      const research = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Quick check: Is there any recent activity for "${lead.company}" in ${lead.city || ''}, ${lead.state || ''}?
Look for: new projects, hiring, expansions, permits, news, social media activity, facility changes.
Vertical: ${lead.vertical || 'commercial'}. They are a potential customer for commercial epoxy/polished concrete flooring.
Original dormant reason: ${lead.dormant_reason || 'Unknown'}
Last contacted: ${lead.last_contacted || 'Unknown'}`,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: {
          type: 'object',
          properties: {
            has_new_activity: { type: 'boolean' },
            activity_summary: { type: 'string' },
            reactivation_score: { type: 'number', description: '0-100 likelihood they need flooring now' },
            recommended_approach: { type: 'string' },
            new_contacts_found: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  title: { type: 'string' },
                  email: { type: 'string' },
                }
              }
            },
          }
        }
      });

      if (research.has_new_activity && research.reactivation_score >= 50) {
        // Reactivate!
        const updates = {
          stage: 'Qualified',
          pipeline_status: 'Qualified',
          reactivation_trigger: research.activity_summary?.substring(0, 500) || 'AI detected new activity',
          ai_insight: `🔄 REACTIVATED: ${research.activity_summary || ''}. Approach: ${research.recommended_approach || ''}`.substring(0, 1000),
          score: Math.max(lead.score || 0, research.reactivation_score),
          data_bank_origin: 'recycled',
        };

        // Update contact if new ones found
        if (research.new_contacts_found?.length > 0) {
          const newContact = research.new_contacts_found[0];
          if (newContact.name && newContact.name !== lead.contact_name) {
            updates.contact_name = newContact.name;
            if (newContact.email) updates.email = newContact.email;
          }
        }

        await base44.asServiceRole.entities.Lead.update(lead.id, updates);
        results.reactivated++;
        results.details.push({
          id: lead.id,
          company: lead.company,
          score: research.reactivation_score,
          trigger: research.activity_summary?.substring(0, 200),
        });
      } else {
        // Push reactivation date out another 60 days
        await base44.asServiceRole.entities.Lead.update(lead.id, {
          reactivation_date: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
          ai_insight: `[Dormant Check ${today}] No new activity. Next check in 60 days.`,
        });
      }
    }
  }

  // Log activity
  if (results.reactivated > 0) {
    await base44.asServiceRole.entities.AgentActivity.create({
      agent_name: 'Dormant Re-Engager',
      action: `Checked ${results.checked} dormant leads, reactivated ${results.reactivated}`,
      status: 'success',
      category: 'pipeline',
      details: JSON.stringify(results),
    });
  }

  return Response.json({ success: true, ...results });
});