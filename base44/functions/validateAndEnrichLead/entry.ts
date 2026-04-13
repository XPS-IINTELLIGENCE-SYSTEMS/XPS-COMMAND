import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * VALIDATION + ENRICHMENT + SCORING + PROFILING PIPELINE
 * Triggered on new lead creation.
 * 
 * Step 1: Validate the business exists, contact info is real
 * Step 2: Check their website for equipment, materials, employee info
 * Step 3: Score & prioritize (new businesses, growth signals, equipment type, etc.)
 * Step 4: Create a company profile summary
 */
Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);
    const { event, data } = body;

    if (!data || !data.company) {
      return Response.json({ status: 'skipped', reason: 'no company data' });
    }

    const leadId = event.entity_id;

    // ── STEP 1 & 2: VALIDATE + ENRICH via AI with web search ──
    const enrichResult = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an advanced business validation and enrichment agent for XPS Xtreme Polishing Systems.

TASK: Validate and enrich this business lead. Search the internet to verify the information.

LEAD DATA:
- Company: ${data.company}
- Contact: ${data.contact_name || "unknown"}
- Email: ${data.email || "none"}
- Phone: ${data.phone || "none"}
- Website: ${data.website || "none"}
- City: ${data.city || "unknown"}, State: ${data.state || "unknown"}
- Industry: ${data.vertical || "unknown"}
- Source: ${data.source || "unknown"}

## VALIDATION STEPS:
1. Search for this company online — is it a real, operating business?
2. Check if the contact name is associated with this company
3. Verify phone/email if possible (format correctness, domain match)
4. If they have a website, check it for:
   - What services they offer
   - What equipment/materials they use or sell
   - Company size indicators (team page, about us, number of projects)
   - Any growth signals (hiring, new services, expansion mentions)
   - Years in business

## RESPOND WITH:
- is_valid_business: true/false — is this a real operating business?
- contact_verified: true/false — does the contact appear to be real?
- has_email: true/false
- has_phone: true/false
- has_website: true/false
- website_summary: Brief summary of what their website shows
- equipment_type: What equipment they use (grinders, vacuums, sprayers, etc.) — "unknown" if can't determine
- material_type: What materials/coatings they work with (epoxy, polyurea, polyaspartic, etc.) — "unknown" if can't determine
- employee_estimate: Estimated number of employees (0 if unknown)
- years_in_business: Estimated years (0 if unknown)
- is_new_business: true/false — less than 3 years old?
- is_growing: true/false — shows signs of growth (hiring, expanding, new services)?
- growth_signals: Specific growth indicators found
- services_offered: Comma-separated list of services they offer
- competitive_position: Brief assessment of where they stand vs competitors
- company_profile_summary: 3-5 sentence executive summary of this company, their strengths, what they do, and why XPS should engage
- xps_opportunity: What specific XPS products/services would benefit this company
- validation_notes: Any issues or red flags found
- recommended_priority: 1-10 (10=highest) based on all findings
- recommended_score: 0-100 lead quality score`,
      add_context_from_internet: true,
      model: "gemini_3_flash",
      response_json_schema: {
        type: "object",
        properties: {
          is_valid_business: { type: "boolean" },
          contact_verified: { type: "boolean" },
          has_email: { type: "boolean" },
          has_phone: { type: "boolean" },
          has_website: { type: "boolean" },
          website_summary: { type: "string" },
          equipment_type: { type: "string" },
          material_type: { type: "string" },
          employee_estimate: { type: "number" },
          years_in_business: { type: "number" },
          is_new_business: { type: "boolean" },
          is_growing: { type: "boolean" },
          growth_signals: { type: "string" },
          services_offered: { type: "string" },
          competitive_position: { type: "string" },
          company_profile_summary: { type: "string" },
          xps_opportunity: { type: "string" },
          validation_notes: { type: "string" },
          recommended_priority: { type: "number" },
          recommended_score: { type: "number" }
        }
      }
    });

    // ── STEP 3: DETERMINE PIPELINE STATUS ──
    const isValid = enrichResult.is_valid_business;
    const hasContact = enrichResult.contact_verified || (enrichResult.has_email && enrichResult.has_phone);
    const score = Math.min(enrichResult.recommended_score || 50, 100);
    const priority = Math.min(enrichResult.recommended_priority || 5, 10);

    let pipelineStatus = "Incoming";
    if (!isValid) {
      pipelineStatus = "Incoming"; // Stay in incoming, flagged
    } else if (hasContact && score >= 70) {
      pipelineStatus = "Qualified"; // High quality, ready for outreach
    } else if (hasContact && score >= 50) {
      pipelineStatus = "Prioritized"; // Good lead, needs nurturing
    } else if (isValid) {
      pipelineStatus = "Validated"; // Real business but needs more info
    }

    // ── STEP 4: BUILD PROFILE DATA ──
    const profileData = JSON.stringify({
      validation: {
        is_valid: isValid,
        contact_verified: enrichResult.contact_verified,
        validation_notes: enrichResult.validation_notes,
      },
      business: {
        equipment_type: enrichResult.equipment_type,
        material_type: enrichResult.material_type,
        employee_estimate: enrichResult.employee_estimate,
        years_in_business: enrichResult.years_in_business,
        is_new_business: enrichResult.is_new_business,
        is_growing: enrichResult.is_growing,
        growth_signals: enrichResult.growth_signals,
        services_offered: enrichResult.services_offered,
      },
      analysis: {
        competitive_position: enrichResult.competitive_position,
        xps_opportunity: enrichResult.xps_opportunity,
        website_summary: enrichResult.website_summary,
      }
    });

    // ── UPDATE THE LEAD ──
    const updateData = {
      score,
      priority,
      pipeline_status: pipelineStatus,
      validation_notes: enrichResult.validation_notes || "",
      ai_insight: enrichResult.company_profile_summary || "",
      ai_recommendation: enrichResult.xps_opportunity || "",
      profile_data: profileData,
    };

    // Enrich missing fields from web research
    if (enrichResult.employee_estimate > 0 && (!data.employee_count || data.employee_count === 0)) {
      updateData.employee_count = enrichResult.employee_estimate;
    }
    if (enrichResult.years_in_business > 0 && (!data.years_in_business || data.years_in_business === 0)) {
      updateData.years_in_business = enrichResult.years_in_business;
    }
    if (enrichResult.equipment_type && enrichResult.equipment_type !== "unknown") {
      updateData.equipment_used = enrichResult.equipment_type;
    }
    if (enrichResult.material_type && enrichResult.material_type !== "unknown") {
      updateData.existing_material = enrichResult.material_type;
    }

    await base44.asServiceRole.entities.Lead.update(leadId, updateData);

    // ── CREATE AGENT TASKS ──
    // Research task for all validated leads
    if (isValid) {
      await base44.asServiceRole.entities.AgentTask.create({
        task_description: `[AUTO] Validated lead: ${data.company} (${data.contact_name || 'unknown'}). Score: ${score}. Status: ${pipelineStatus}. ${enrichResult.company_profile_summary || ''}`,
        task_type: "Research",
        status: "Completed",
        priority: priority >= 8 ? "High" : priority >= 5 ? "Medium" : "Low",
        result: `Validated: ${isValid} | Contact: ${hasContact} | Equipment: ${enrichResult.equipment_type || 'unknown'} | Materials: ${enrichResult.material_type || 'unknown'} | Employees: ${enrichResult.employee_estimate || '?'} | Growing: ${enrichResult.is_growing ? 'YES' : 'no'} | ${enrichResult.growth_signals || ''}`,
        completed_at: new Date().toISOString(),
        related_entity_type: "Lead",
        related_entity_id: leadId,
      });
    }

    // Outreach task for high-priority qualified leads
    if (pipelineStatus === "Qualified" && (data.email || data.phone)) {
      await base44.asServiceRole.entities.AgentTask.create({
        task_description: `[AUTO] High-priority outreach needed: ${data.company} (${data.contact_name}). Score: ${score}. ${enrichResult.xps_opportunity || ''}`,
        task_type: "Send Email",
        status: "Queued",
        priority: "High",
        related_entity_type: "Lead",
        related_entity_id: leadId,
      });
    }

    return Response.json({
      status: 'processed',
      lead_id: leadId,
      company: data.company,
      is_valid: isValid,
      score,
      priority,
      pipeline_status: pipelineStatus,
      equipment: enrichResult.equipment_type,
      materials: enrichResult.material_type,
      employees: enrichResult.employee_estimate,
      is_growing: enrichResult.is_growing,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});