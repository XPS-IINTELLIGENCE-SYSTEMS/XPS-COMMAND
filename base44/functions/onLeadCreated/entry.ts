import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Triggered when a new Lead is created.
 * Auto-scores the lead and creates an AgentTask for the pipeline agent.
 */
Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);
    const { event, data } = body;

    if (!data || !data.company) {
      return Response.json({ status: 'skipped', reason: 'no company data' });
    }

    // Calculate score if not already set
    let score = data.score || 0;
    if (!score) {
      let s = 0;
      if (data.estimated_value > 50000) s += 30;
      else if (data.estimated_value > 10000) s += 20;
      else if (data.estimated_value > 0) s += 10;
      if (data.email) s += 15;
      if (data.phone) s += 15;
      if (data.square_footage > 5000) s += 10;
      if (data.vertical && data.vertical !== "Other") s += 10;
      if (data.contact_name) s += 10;
      if (data.website) s += 5;
      if (data.city || data.state) s += 5;
      score = Math.min(s, 100);

      // Update lead with score
      await base44.asServiceRole.entities.Lead.update(event.entity_id, {
        score,
        pipeline_status: score >= 60 ? "Validated" : "Incoming",
      });
    }

    // Create agent task to research and enrich this lead
    await base44.asServiceRole.entities.AgentTask.create({
      task_description: `Research and enrich new lead: ${data.company} (${data.contact_name || 'no contact'}). Score: ${score}. Vertical: ${data.vertical || 'unknown'}. Estimated value: $${data.estimated_value || 0}.`,
      task_type: "Research",
      status: "Queued",
      priority: score >= 70 ? "High" : score >= 40 ? "Medium" : "Low",
      related_entity_type: "Lead",
      related_entity_id: event.entity_id,
    });

    // If high-value lead, also create outreach task
    if (score >= 60 && data.email) {
      await base44.asServiceRole.entities.AgentTask.create({
        task_description: `Draft initial outreach email for ${data.company} (${data.contact_name}). Email: ${data.email}. High-score lead at ${score}.`,
        task_type: "Send Email",
        status: "Queued",
        priority: "High",
        related_entity_type: "Lead",
        related_entity_id: event.entity_id,
      });
    }

    return Response.json({ 
      status: 'processed', 
      score, 
      tasks_created: score >= 60 && data.email ? 2 : 1 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});