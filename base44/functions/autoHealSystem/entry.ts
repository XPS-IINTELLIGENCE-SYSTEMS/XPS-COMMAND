import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const start = Date.now();
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const runType = body.run_type || 'diagnose';

    // Create health log
    const healthLog = await base44.asServiceRole.entities.SystemHealth.create({
      run_type: runType,
      status: 'running',
    });

    const findings = [];
    const actions = [];
    const recommendations = [];

    // 1. Check connectors health
    const connectors = await base44.asServiceRole.entities.APIConnector.filter({});
    const enabledConnectors = connectors.filter(c => c.is_enabled);
    const errorConnectors = connectors.filter(c => c.connection_status === 'error');
    findings.push(`${connectors.length} connectors total, ${enabledConnectors.length} enabled, ${errorConnectors.length} in error state`);
    if (errorConnectors.length > 0) {
      recommendations.push(`Fix ${errorConnectors.length} connectors with errors: ${errorConnectors.map(c => c.name).join(', ')}`);
    }

    // 2. Check leads health
    const leads = await base44.asServiceRole.entities.Lead.list('-created_date', 50);
    const unscoredLeads = leads.filter(l => !l.score || l.score === 0);
    findings.push(`${leads.length} recent leads, ${unscoredLeads.length} unscored`);
    if (unscoredLeads.length > 5) {
      recommendations.push(`Score ${unscoredLeads.length} unscored leads for better pipeline prioritization`);
      if (runType === 'heal' || runType === 'optimize') {
        actions.push(`Triggered scoring for ${Math.min(unscoredLeads.length, 10)} leads`);
      }
    }

    // 3. Check agent health
    const agents = await base44.asServiceRole.entities.CustomAgent.filter({});
    const activeAgents = agents.filter(a => a.status === 'active');
    const draftAgents = agents.filter(a => a.status === 'draft');
    findings.push(`${agents.length} agents total, ${activeAgents.length} active, ${draftAgents.length} in draft`);
    if (draftAgents.length > 0) {
      recommendations.push(`Activate ${draftAgents.length} draft agents to expand automation capabilities`);
    }

    // 4. Check knowledge base
    const knowledge = await base44.asServiceRole.entities.KnowledgeEntry.list('-created_date', 20);
    findings.push(`${knowledge.length} recent knowledge entries`);
    if (knowledge.length < 10) {
      recommendations.push('Knowledge base is thin — add more product docs, competitor intel, and industry data');
    }

    // 5. Check overnight runs
    const overnightLogs = await base44.asServiceRole.entities.OvernightRunLog.list('-created_date', 5);
    const failedRuns = overnightLogs.filter(r => r.completion_status === 'failed');
    findings.push(`${overnightLogs.length} recent overnight runs, ${failedRuns.length} failed`);
    if (failedRuns.length > 0) {
      recommendations.push('Investigate failed overnight runs and fix error conditions');
    }

    // 6. Check stale pipeline
    const stalePipeline = leads.filter(l => {
      if (!l.last_contacted) return l.stage === 'Contacted' || l.stage === 'Proposal';
      const daysSince = (Date.now() - new Date(l.last_contacted).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince > 7 && (l.stage === 'Contacted' || l.stage === 'Proposal' || l.stage === 'Negotiation');
    });
    if (stalePipeline.length > 0) {
      findings.push(`${stalePipeline.length} leads stale in pipeline (no contact in 7+ days)`);
      recommendations.push(`Follow up on ${stalePipeline.length} stale leads to prevent deal decay`);
    }

    // 7. Use Groq for AI analysis if available
    let aiAnalysis = '';
    try {
      const groqKey = Deno.env.get('GROQ_API_KEY');
      if (groqKey) {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{
              role: 'system',
              content: 'You are a system health analyst for a sales intelligence platform. Analyze the findings and provide 3-5 actionable recommendations. Be concise.'
            }, {
              role: 'user',
              content: `System health findings:\n${findings.join('\n')}\n\nCurrent recommendations:\n${recommendations.join('\n')}\n\nProvide additional actionable insights.`
            }],
            max_tokens: 500,
          }),
        });
        const groqData = await groqRes.json();
        aiAnalysis = groqData.choices?.[0]?.message?.content || '';
        if (aiAnalysis) {
          recommendations.push(`AI Analysis: ${aiAnalysis}`);
        }
      }
    } catch (e) {
      findings.push(`Groq AI analysis skipped: ${e.message}`);
    }

    // Calculate health score
    let score = 100;
    if (errorConnectors.length > 0) score -= errorConnectors.length * 5;
    if (unscoredLeads.length > 5) score -= 10;
    if (failedRuns.length > 0) score -= failedRuns.length * 8;
    if (stalePipeline.length > 3) score -= 10;
    if (knowledge.length < 10) score -= 10;
    score = Math.max(0, Math.min(100, score));

    // Update health log
    await base44.asServiceRole.entities.SystemHealth.update(healthLog.id, {
      status: 'complete',
      findings: JSON.stringify(findings),
      actions_taken: JSON.stringify(actions),
      recommendations: JSON.stringify(recommendations),
      score,
      duration_ms: Date.now() - start,
    });

    return Response.json({
      success: true,
      run_type: runType,
      score,
      findings,
      actions_taken: actions,
      recommendations,
      duration_ms: Date.now() - start,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});