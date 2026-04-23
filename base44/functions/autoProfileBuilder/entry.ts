import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const body = await req.json().catch(() => ({}));
  const { entity_type, entity_id } = body;

  // Support both direct calls and entity automation payloads
  const type = entity_type || body.event?.entity_name;
  const id = entity_id || body.data?.id || body.event?.entity_id;

  if (!type || !id) return Response.json({ error: 'entity_type and entity_id required' }, { status: 400 });

  // Fetch the entity record
  let record = null;
  if (type === 'Lead') {
    const r = await base44.asServiceRole.entities.Lead.filter({ id });
    record = r[0];
  } else if (type === 'ContractorCompany') {
    const r = await base44.asServiceRole.entities.ContractorCompany.filter({ id });
    record = r[0];
  } else if (type === 'CommercialJob') {
    const r = await base44.asServiceRole.entities.CommercialJob.filter({ id });
    record = r[0];
  } else {
    return Response.json({ error: `Unsupported entity type: ${type}` }, { status: 400 });
  }

  if (!record) return Response.json({ error: `${type} ${id} not found` }, { status: 404 });

  // Build context based on entity type
  let profilePrompt = '';
  if (type === 'Lead') {
    profilePrompt = `Build an EXHAUSTIVE business intelligence profile for this company/lead:

COMPANY: ${record.company || 'Unknown'}
CONTACT: ${record.contact_name || 'Unknown'}
EMAIL: ${record.email || 'N/A'}
PHONE: ${record.phone || 'N/A'}
WEBSITE: ${record.website || 'N/A'}
LOCATION: ${record.city || ''}, ${record.state || ''} ${record.zip || ''}
VERTICAL: ${record.vertical || 'Unknown'}
SPECIALTY: ${record.specialty || 'Unknown'}
EMPLOYEE COUNT: ${record.employee_count || 'Unknown'}
EST. REVENUE: $${record.estimated_revenue || 'Unknown'}
YEARS IN BUSINESS: ${record.years_in_business || 'Unknown'}
EXISTING MATERIAL: ${record.existing_material || 'Unknown'}
EQUIPMENT: ${record.equipment_used || 'Unknown'}
SQ FT: ${record.square_footage || 'Unknown'}

Research this company and provide:`;
  } else if (type === 'ContractorCompany') {
    profilePrompt = `Build an EXHAUSTIVE business intelligence profile for this general contractor:

COMPANY: ${record.company_name || 'Unknown'}
WEBSITE: ${record.website || 'N/A'}
HQ: ${record.headquarters_address || ''}, ${record.city || ''}, ${record.state || ''} ${record.zip || ''}
PHONE: ${record.phone || 'N/A'}
EMAIL: ${record.email || 'N/A'}
PRECON CONTACT: ${record.preconstruction_contact_name || 'N/A'} (${record.preconstruction_email || 'N/A'})
ESTIMATOR: ${record.estimator_name || 'N/A'} (${record.estimator_email || 'N/A'})
PM: ${record.project_manager_name || 'N/A'} (${record.project_manager_email || 'N/A'})
ANNUAL REVENUE: $${record.annual_revenue_estimate || 'Unknown'}
EMPLOYEES: ${record.employee_count || 'Unknown'}
PROJECT TYPES: ${record.project_types || 'Unknown'}
STATES: ${record.states_they_build_in || 'Unknown'}
AVG PROJECT SIZE: ${record.average_project_size_sqft || 'Unknown'} sqft
AVG PROJECT VALUE: $${record.average_project_value || 'Unknown'}
BIDDING PLATFORM: ${record.bidding_platform || 'Unknown'}

Research this contractor and provide:`;
  } else if (type === 'CommercialJob') {
    profilePrompt = `Build an EXHAUSTIVE business intelligence profile for this commercial construction project:

PROJECT: ${record.job_name || 'Unknown'}
ADDRESS: ${record.address || ''}, ${record.city || ''}, ${record.state || ''} ${record.zip || ''}
TYPE: ${(record.project_type || 'Unknown').replace(/_/g, ' ')}
SECTOR: ${record.sector || 'Unknown'}
OWNER: ${record.owner_name || 'Unknown'} (${record.owner_email || 'N/A'}, ${record.owner_phone || 'N/A'})
GC: ${record.gc_name || 'Unknown'} (${record.gc_email || 'N/A'}, ${record.gc_phone || 'N/A'})
ARCHITECT: ${record.architect_name || 'Unknown'}
TOTAL SQFT: ${record.total_sqft || 'Unknown'}
FLOORING SQFT: ${record.flooring_sqft || 'Unknown'}
PROJECT VALUE: $${record.project_value || 'Unknown'}
EST FLOORING VALUE: $${record.estimated_flooring_value || 'Unknown'}
PHASE: ${record.project_phase || 'Unknown'}
SOURCE: ${record.source_type || 'Unknown'}

Research this project, owner, GC, and architect. Provide:`;
  }

  let profile;
  try {
    profile = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `${profilePrompt}

Provide:
1. COMPANY OVERVIEW: Description, market position
2. CONTACT DIRECTORY: Names, titles, emails if available
3. XPS OPPORTUNITY ANALYSIS: How XPS can win this business
4. RECOMMENDATIONS: Top 3 action items with urgency
5. SUMMARY: 2-3 sentence summary`,
      add_context_from_internet: false,
      model: "gpt_5_mini",
      response_json_schema: {
        type: "object",
        properties: {
          company_overview: { type: "string" },
          contact_directory: { type: "array", items: { type: "object" } },
          xps_opportunity: { type: "string" },
          recommendations: { type: "array", items: { type: "object" } },
          summary: { type: "string" },
          overall_score: { type: "number" }
        }
      }
    });
  } catch (e) {
    // If credit limit hit or error, return minimal profile from existing data
    profile = {
      company_overview: `${record.company || record.company_name || record.job_name} - Limited profile due to credit limits`,
      contact_directory: [],
      xps_opportunity: "Needs deeper research when credits are available",
      recommendations: [{ action: "Re-attempt full profile", urgency: "Medium" }],
      summary: "Basic profile created - full enrichment pending",
      overall_score: 30
    };
  }

  // Save profile data back to entity
  const profileJson = JSON.stringify(profile);
  const summaryText = profile.summary || '';
  const score = profile.overall_score || 0;

  if (type === 'Lead') {
    await base44.asServiceRole.entities.Lead.update(id, {
      profile_data: profileJson,
      ai_insight: summaryText.substring(0, 1000),
      score: score || record.score,
      ai_recommendation: (profile.recommendations || []).map(r => `[${r.urgency}] ${r.action}`).join(' | ').substring(0, 1000),
      validation_notes: `Auto-profiled ${new Date().toISOString()}. Missing: ${(profile.missing_data_flags || []).join(', ') || 'None'}`
    });
  } else if (type === 'ContractorCompany') {
    await base44.asServiceRole.entities.ContractorCompany.update(id, {
      notes: `PROFILE: ${summaryText}\n\nOPPORTUNITY: ${profile.xps_opportunity || ''}\n\nRISK: ${profile.risk_assessment || ''}`.substring(0, 2000),
      last_updated: new Date().toISOString()
    });
  } else if (type === 'CommercialJob') {
    await base44.asServiceRole.entities.CommercialJob.update(id, {
      ai_insight: summaryText.substring(0, 1000),
      notes: `FULL PROFILE: ${profileJson}`.substring(0, 2000)
    });
  }

  // Also save to IntelRecord for the master database index
  await base44.asServiceRole.entities.IntelRecord.create({
    source_company: "XPS",
    category: "custom",
    industry: type === 'Lead' ? (record.vertical || 'Other') : (type === 'CommercialJob' ? ((record.project_type || 'other').replace(/_/g, ' ')) : 'Construction'),
    title: `Full Profile: ${record.company || record.company_name || record.job_name || 'Unknown'}`,
    content: profileJson.substring(0, 4000),
    summary: summaryText,
    source_type: "llm",
    tags: `profile,${type.toLowerCase()},${record.city || ''},${record.state || ''}`,
    confidence_score: score,
    scraped_at: new Date().toISOString(),
    is_indexed: true,
    metadata: JSON.stringify({
      entity_type: type,
      entity_id: id,
      contact_count: (profile.contact_directory || []).length,
      recommendations_count: (profile.recommendations || []).length,
      missing_flags: profile.missing_data_flags || []
    })
  });

  // Log activity
  await base44.asServiceRole.entities.AgentActivity.create({
    agent_name: "Profile Builder",
    action: `Built exhaustive profile for ${type}: ${record.company || record.company_name || record.job_name}`,
    status: "success",
    category: "research",
    related_entity_type: type,
    related_entity_id: id,
    details: JSON.stringify({
      entity_type: type,
      contacts_found: (profile.contact_directory || []).length,
      score: score,
      recommendations: (profile.recommendations || []).length,
      missing_data: profile.missing_data_flags || []
    })
  });

  return Response.json({
    success: true,
    entity_type: type,
    entity_id: id,
    profile_score: score,
    contacts_found: (profile.contact_directory || []).length,
    recommendations: (profile.recommendations || []).length,
    missing_data: profile.missing_data_flags || [],
    summary: summaryText
  });
});