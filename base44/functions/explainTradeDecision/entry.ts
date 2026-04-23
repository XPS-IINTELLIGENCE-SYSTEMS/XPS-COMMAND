import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { trade_id } = await req.json().catch(() => ({}));
    if (!trade_id) return Response.json({ error: 'trade_id required' }, { status: 400 });

    // Fetch the specific trade from ledger
    const trades = await base44.entities.TradeLedger.filter({ id: trade_id }, null, 1).catch(() => []);
    if (trades.length === 0) {
      return Response.json({ error: 'Trade not found' }, { status: 404 });
    }

    const trade = trades[0];

    // Use LLM to generate detailed explanation
    const explanation = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this trading decision and explain in detail:

TRADE DETAILS:
- Ticker: ${trade.ticker}
- Action: ${trade.action}
- Entry Price: $${trade.entry_price}
- Shares: ${trade.shares}
- Position Size: $${trade.position_size}
- Confidence: ${trade.confidence}%
- P&L: $${trade.pnl} (${trade.pnl_pct}%)
- Win: ${trade.win}

MARKET CONTEXT AT EXECUTION:
${trade.portfolio_state ? JSON.stringify(JSON.parse(trade.portfolio_state || '{}'), null, 2) : 'N/A'}

AI REFLECTION:
${trade.groq_reflection || 'No reflection available'}

GROQ ANALYSIS:
${trade.groq_response ? trade.groq_response.substring(0, 500) : 'No analysis available'}

Provide a clear, concise explanation covering:
1. **Market Conditions**: What was happening in the market when this trade was executed?
2. **News & Sentiment**: What news or sentiment signals influenced this decision?
3. **Technical Signals**: What technical or analytical factors supported this trade?
4. **Decision Rationale**: Why did the AI choose this specific action and size?
5. **Outcome**: Was this trade profitable? What does this indicate?

Format as clear paragraphs, not bullet points.`,
      model: 'gpt_5_mini',
    });

    // Log the explanation request
    await base44.asServiceRole.entities.AgentActivity.create({
      agent_name: 'Trade Explainer',
      action: `Explained trade: ${trade.ticker} ${trade.action}`,
      status: 'success',
      category: 'analysis',
    }).catch(() => {});

    return Response.json({
      trade_id,
      ticker: trade.ticker,
      action: trade.action,
      entry_price: trade.entry_price,
      pnl: trade.pnl,
      pnl_pct: trade.pnl_pct,
      win: trade.win,
      explanation,
      execution_time: trade.execution_timestamp,
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});