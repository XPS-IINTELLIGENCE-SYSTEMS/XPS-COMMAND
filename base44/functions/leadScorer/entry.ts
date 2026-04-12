import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { lead_id, batch_all, min_score, top_n, rescore_all } = await req.json();

    let leads = [];

    if (lead_id) {
      const lead = await base44.entities.Lead.get(lead_id);
      if (lead) leads = [lead];
    } else if (batch_all || rescore_all) {
      leads = await base44.entities.Lead.filter({}, '-created_date', 200);
    } else {
      // Score unscored or low-score leads
      leads = await base44.entities.Lead.filter({}, '-created_date', 100);
    }

    if (leads.length === 0) {
      return Response.json({ success: true, message: 'No leads to score', scored: [] });
    }

    const scored = [];

    for (const lead of leads) {
      // Multi-factor scoring algorithm
      let score = 0;
      const breakdown = {};

      // 1. Deal Size Potential (30 points max)
      const val = lead.estimated_value || 0;
      if (val >= 200000) { score += 30; breakdown.deal_size = 30; }
      else if (val >= 100000) { score += 27; breakdown.deal_size = 27; }
      else if (val >= 50000) { score += 24; breakdown.deal_size = 24; }
      else if (val >= 25000) { score += 20; breakdown.deal_size = 20; }
      else if (val >= 10000) { score += 15; breakdown.deal_size = 15; }
      else if (val > 0) { score += 8; breakdown.deal_size = 8; }
      else { score += 3; breakdown.deal_size = 3; }

      // 2. Contact Quality (25 points max)
      let contactScore = 0;
      if (lead.email && lead.email.includes('@')) contactScore += 10;
      if (lead.phone && lead.phone.length > 6) contactScore += 8;
      if (lead.contact_name && lead.contact_name !== 'Facility Manager' && lead.contact_name !== 'unknown') contactScore += 7;
      score += contactScore;
      breakdown.contact_quality = contactScore;

      // 3. Vertical Fit (20 points max)
      const verticalScores = {
        'Warehouse': 20, 'Industrial': 20, 'Healthcare': 18, 'Food & Bev': 18,
        'Retail': 15, 'Automotive': 15, 'Education': 14, 'Fitness': 13,
        'Government': 12, 'Residential': 8, 'Other': 6
      };
      const vertScore = verticalScores[lead.vertical] || 6;
      score += vertScore;
      breakdown.vertical_fit = vertScore;

      // 4. Square Footage (15 points max)
      const sqft = lead.square_footage || 0;
      if (sqft >= 50000) { score += 15; breakdown.sqft = 15; }
      else if (sqft >= 20000) { score += 12; breakdown.sqft = 12; }
      else if (sqft >= 5000) { score += 9; breakdown.sqft = 9; }
      else if (sqft > 0) { score += 5; breakdown.sqft = 5; }
      else { score += 2; breakdown.sqft = 2; }

      // 5. Source Quality (10 points max)
      const source = (lead.source || '').toLowerCase();
      if (source.includes('referral') || source.includes('inbound')) { score += 10; breakdown.source = 10; }
      else if (source.includes('permit') || source.includes('linkedin')) { score += 8; breakdown.source = 8; }
      else if (source.includes('google') || source.includes('scraper')) { score += 6; breakdown.source = 6; }
      else { score += 3; breakdown.source = 3; }

      const finalScore = Math.min(score, 100);

      // Generate AI insight based on score
      let insight = '';
      if (finalScore >= 80) insight = `🔥 HOT LEAD — Score ${finalScore}/100. High-value ${lead.vertical || 'commercial'} opportunity. Priority outreach immediately.`;
      else if (finalScore >= 60) insight = `⚡ WARM LEAD — Score ${finalScore}/100. Strong potential, good contact data. Schedule outreach this week.`;
      else if (finalScore >= 40) insight = `📋 QUALIFYING — Score ${finalScore}/100. Needs enrichment. Recommend contact research before outreach.`;
      else insight = `📌 NURTURE — Score ${finalScore}/100. Lower priority. Add to drip sequence for long-term nurture.`;

      await base44.entities.Lead.update(lead.id, {
        score: finalScore,
        ai_insight: insight
      });

      scored.push({
        lead_id: lead.id,
        company: lead.company,
        score: finalScore,
        breakdown,
        insight,
        stage: lead.stage,
        estimated_value: lead.estimated_value
      });
    }

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    const topLeads = top_n ? scored.slice(0, top_n) : scored;
    const filteredLeads = min_score ? topLeads.filter(l => l.score >= min_score) : topLeads;

    return Response.json({
      success: true,
      total_scored: scored.length,
      results: filteredLeads,
      hot_leads: scored.filter(l => l.score >= 80).length,
      warm_leads: scored.filter(l => l.score >= 60 && l.score < 80).length,
      qualifying: scored.filter(l => l.score >= 40 && l.score < 60).length,
      nurture: scored.filter(l => l.score < 40).length,
      total_pipeline_value: scored.reduce((sum, l) => sum + (l.estimated_value || 0), 0),
      message: `Scored ${scored.length} leads. ${scored.filter(l => l.score >= 80).length} hot, ${scored.filter(l => l.score >= 60 && l.score < 80).length} warm.`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});