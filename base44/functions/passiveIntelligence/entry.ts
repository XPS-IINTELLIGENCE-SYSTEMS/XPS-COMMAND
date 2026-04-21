import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * PASSIVE INTELLIGENCE WORKER
 * Recursively scrapes top-tier financial, AI, and industry trend sites.
 * Filters for high-value signals, summarizes into actionable opportunities,
 * and logs them into Command Notepad (AgentTask) for agent review.
 */

const INTEL_SOURCES = [
  // Financial & Markets
  { name: "Bloomberg Markets", url: "bloomberg.com/markets", focus: "Market trends, economic indicators, sector performance, commodities" },
  { name: "Reuters Business", url: "reuters.com/business", focus: "Global business news, M&A activity, industry disruptions" },
  { name: "Seeking Alpha", url: "seekingalpha.com", focus: "Stock analysis, market sentiment, sector rotation, earnings" },
  { name: "Yahoo Finance", url: "finance.yahoo.com", focus: "Market movers, trending stocks, economic calendar, sector heatmaps" },
  { name: "CNBC Economy", url: "cnbc.com/economy", focus: "Federal Reserve, GDP, inflation, employment, housing market" },
  
  // AI & Technology
  { name: "TechCrunch AI", url: "techcrunch.com/category/artificial-intelligence", focus: "AI startup funding, product launches, enterprise AI adoption" },
  { name: "The Verge AI", url: "theverge.com/ai-artificial-intelligence", focus: "AI product news, industry shifts, regulation, consumer AI" },
  { name: "VentureBeat AI", url: "venturebeat.com/ai", focus: "Enterprise AI, MLOps, AI infrastructure, funding rounds" },
  { name: "MIT Technology Review", url: "technologyreview.com", focus: "Breakthrough technologies, AI research, climate tech, biotech" },
  
  // Construction & Real Estate
  { name: "Construction Dive", url: "constructiondive.com", focus: "Commercial construction trends, regulations, labor market, materials pricing" },
  { name: "ENR News", url: "enr.com/articles", focus: "Engineering news, infrastructure spending, mega-project updates" },
  { name: "Commercial Real Estate", url: "commercialobserver.com", focus: "CRE deals, development pipeline, market analytics, tenant trends" },
  
  // Business & SaaS
  { name: "SaaStr", url: "saastr.com/blog", focus: "SaaS metrics, growth strategies, pricing models, PLG" },
  { name: "First Round Review", url: "review.firstround.com", focus: "Startup playbooks, hiring, product-market fit, scaling" },
];

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const runId = `intel_${Date.now()}`;
  const signals = [];
  const errors = [];

  // Scrape each source via LLM with internet
  for (const source of INTEL_SOURCES) {
    try {
      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are an elite intelligence analyst. Research "${source.name}" (${source.url}).
Focus: ${source.focus}

Extract the TOP 3 most actionable signals from the last 48 hours. For each signal:
- What happened (concrete facts, numbers)
- Why it matters for a commercial flooring / construction AI company
- Specific action to take (trade idea, business pivot, tool to build, partnership to pursue)
- Urgency: immediate / this_week / this_month

Only return signals with REAL business value. Skip fluff.`,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: {
          type: 'object',
          properties: {
            signals: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  headline: { type: 'string' },
                  details: { type: 'string' },
                  business_impact: { type: 'string' },
                  action_item: { type: 'string' },
                  urgency: { type: 'string' },
                  category: { type: 'string' },
                  confidence: { type: 'number' },
                }
              }
            }
          }
        }
      });

      const highValue = (result.signals || []).filter(s => (s.confidence || 0) >= 60);
      for (const sig of highValue.slice(0, 2)) {
        signals.push({ ...sig, source: source.name });
      }
    } catch (e) {
      errors.push(`${source.name}: ${e.message}`);
    }
  }

  // Store top signals as IntelRecords
  const intelRecords = signals.map(s => ({
    source_company: 'XPS Intelligence',
    category: 'market_trend',
    title: s.headline || 'Passive Intel Signal',
    content: `${s.details}\n\nBusiness Impact: ${s.business_impact}\n\nAction: ${s.action_item}`,
    summary: s.action_item || '',
    source_type: 'llm_research',
    tags: `passive-intel,${s.category || 'general'},${s.urgency || 'this_week'},${s.source}`,
    confidence_score: s.confidence || 70,
    scraped_at: new Date().toISOString(),
    is_indexed: true,
    data_freshness: 'live',
  }));

  for (let i = 0; i < intelRecords.length; i += 25) {
    await base44.asServiceRole.entities.IntelRecord.bulkCreate(intelRecords.slice(i, i + 25)).catch(() => {});
  }

  // Log top 10 actionable signals to Command Notepad (AgentTask)
  const topSignals = signals
    .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
    .slice(0, 10);

  for (const sig of topSignals) {
    await base44.asServiceRole.entities.AgentTask.create({
      task_description: `[INTEL] ${sig.headline}: ${sig.action_item}`,
      task_type: 'Custom',
      status: 'Queued',
      priority: sig.urgency === 'immediate' ? 'Urgent' : sig.urgency === 'this_week' ? 'High' : 'Medium',
      result: JSON.stringify({ source: sig.source, category: sig.category, confidence: sig.confidence, details: sig.details }),
    }).catch(() => {});
  }

  // Log activity
  await base44.asServiceRole.entities.AgentActivity.create({
    agent_name: 'Passive Intelligence',
    action: `Scanned ${INTEL_SOURCES.length} sources, found ${signals.length} signals, logged ${topSignals.length} to notepad`,
    status: errors.length > 3 ? 'pending' : 'success',
    category: 'research',
    details: JSON.stringify({ run_id: runId, sources: INTEL_SOURCES.length, signals: signals.length, notepad_items: topSignals.length, errors: errors.length }),
  });

  return Response.json({
    success: true,
    run_id: runId,
    sources_scanned: INTEL_SOURCES.length,
    signals_found: signals.length,
    notepad_items: topSignals.length,
    errors: errors.length,
    top_signals: topSignals.slice(0, 5),
  });
});