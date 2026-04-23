import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { query } = await req.json().catch(() => ({}));
    if (!query) return Response.json({ error: 'query required' }, { status: 400 });

    // Fetch portfolio and trade data
    const [portfolios, trades] = await Promise.all([
      base44.entities.FinancialPortfolio.list('-created_date', 10).catch(() => []),
      base44.entities.TradeLedger.list('-execution_timestamp', 200).catch(() => []),
    ]);

    // Format data for LLM analysis
    const tradesByTicker = {};
    const tradesByAction = { BUY: [], SELL: [] };
    let totalPnL = 0;
    let winningTrades = 0;

    trades.forEach(t => {
      totalPnL += t.pnl || 0;
      if (t.win) winningTrades += 1;
      if (!tradesByTicker[t.ticker]) tradesByTicker[t.ticker] = [];
      tradesByTicker[t.ticker].push(t);
      tradesByAction[t.action].push(t);
    });

    // Format top performers
    const topPerformers = Object.entries(tradesByTicker)
      .map(([ticker, tt]) => {
        const pnl = tt.reduce((s, t) => s + (t.pnl || 0), 0);
        return `- ${ticker}: $${pnl.toFixed(2)} across ${tt.length} trades`;
      })
      .sort((a, b) => parseFloat(b.split('$')[1]) - parseFloat(a.split('$')[1]))
      .slice(0, 10)
      .join('\n');

    // Format high confidence trades
    const highConfTrades = trades.filter(t => t.confidence > 75)
      .sort((a, b) => b.pnl - a.pnl)
      .slice(0, 5)
      .map(t => `- ${t.ticker} ${t.action}: ${t.confidence}% confidence, $${t.pnl.toFixed(2)} P&L`)
      .join('\n');

    // Analyze query with LLM
    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `User asked about their portfolio: "${query}"

PORTFOLIO DATA SUMMARY:
- Total Trades: ${trades.length}
- Winning Trades: ${winningTrades}
- Win Rate: ${trades.length > 0 ? ((winningTrades / trades.length) * 100).toFixed(1) : 0}%
- Total P&L: $${totalPnL.toFixed(2)}
- Portfolio Value: $${portfolios.reduce((s, p) => s + (p.current_balance || 0), 0).toFixed(2)}

TOP PERFORMERS (by cumulative P&L):
${topPerformers}

BUY vs SELL:
- Buy Trades: ${tradesByAction.BUY.length}
- Sell Trades: ${tradesByAction.SELL.length}
- Buy P&L: $${tradesByAction.BUY.reduce((s, t) => s + (t.pnl || 0), 0).toFixed(2)}
- Sell P&L: $${tradesByAction.SELL.reduce((s, t) => s + (t.pnl || 0), 0).toFixed(2)}

HIGH CONFIDENCE TRADES (>75%):
${highConfTrades}

Answer the user's question based on this portfolio data. Be specific with numbers and provide actionable insights. If they ask for specific trades, filter and list them with relevant details.`,
      model: 'gpt_5_mini',
    });

    // Generate insights based on query
    const insights = {
      total_trades: trades.length,
      total_pnl: totalPnL,
      win_rate: trades.length > 0 ? ((winningTrades / trades.length) * 100).toFixed(1) : 0,
      top_ticker: Object.entries(tradesByTicker)
        .map(([ticker, tt]) => ({
          ticker,
          pnl: tt.reduce((s, t) => s + (t.pnl || 0), 0),
          count: tt.length,
        }))
        .sort((a, b) => b.pnl - a.pnl)[0],
      high_confidence_trades: trades.filter(t => t.confidence > 75).length,
    };

    return Response.json({
      query,
      analysis,
      insights,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});