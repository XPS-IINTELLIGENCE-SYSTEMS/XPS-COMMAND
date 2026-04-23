import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Groq from 'npm:groq-sdk@0.4.0';

const groq = new Groq({
  apiKey: Deno.env.get('GROQ_API_KEY'),
});

// Mock market data (no expensive API calls)
const getMockMarketData = () => ({
  AAPL: 150 + Math.random() * 20,
  TSLA: 220 + Math.random() * 30,
  MSFT: 310 + Math.random() * 40,
  GOOGL: 140 + Math.random() * 25,
  NVDA: 520 + Math.random() * 80,
  META: 300 + Math.random() * 35,
});

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const portfolios = await base44.asServiceRole.entities.FinancialPortfolio
      .filter({ status: 'active' }, '-created_date', 1).catch(() => []);

    if (portfolios.length === 0) {
      return Response.json({ error: 'No active portfolio' }, { status: 400 });
    }

    const portfolio = portfolios[0];
    const cycleId = `cycle_${Date.now()}`;

    // Use mock market data (no external API calls)
    const liveMarketPrices = getMockMarketData();
    
    const priceContext = Object.entries(liveMarketPrices)
      .map(([ticker, price]) => `${ticker}: $${price.toFixed(2)}`)
      .join(', ');

    // Single Groq call for trading decision (no external integrations)
    const msg = await groq.chat.completions.create({
      messages: [{
        role: 'user',
        content: `Market snapshot: ${priceContext}

Portfolio balance: $${portfolio.current_balance.toFixed(2)}
Current holdings: ${portfolio.holdings ? JSON.stringify(portfolio.holdings) : 'Cash only'}

Generate 3 stock trades. Format EXACTLY as:
[TRADE] TICKER: AAPL | ACTION: BUY | PRICE: ${liveMarketPrices.AAPL.toFixed(2)} | SHARES: 10 | CONFIDENCE: 85
[TRADE] TICKER: TSLA | ACTION: SELL | PRICE: ${liveMarketPrices.TSLA.toFixed(2)} | SHARES: 5 | CONFIDENCE: 70
[REFLECTION] Why you picked these trades.`,
      }],
      model: 'mixtral-8x7b-32768',
      max_tokens: 600,
      temperature: 0.5,
    });

    const content = msg.choices[0]?.message?.content || '';
    const trades = [];
    const tradeMatches = content.match(/\[TRADE\].*?(?=\[TRADE\]|\[REFLECTION\]|$)/gs) || [];

    for (const match of tradeMatches) {
      const ticker = match.match(/TICKER:\s*(\w+)/)?.[1] || '';
      const action = match.match(/ACTION:\s*(BUY|SELL)/)?.[1] || 'BUY';
      const price = parseFloat(match.match(/PRICE:\s*([\d.]+)/)?.[1]) || liveMarketPrices[ticker] || 100;
      const shares = parseFloat(match.match(/SHARES:\s*([\d.]+)/)?.[1] || '1');
      const confidence = parseInt(match.match(/CONFIDENCE:\s*(\d+)/)?.[1] || '50');

      if (ticker && price > 0) {
        // Realistic P&L simulation
        const volatilityFactor = (Math.random() - 0.5) * 0.04; // -2% to +2%
        const pnl = shares * price * volatilityFactor;
        const pnlPct = volatilityFactor * 100;
        trades.push({
          ticker,
          action,
          price,
          shares,
          confidence,
          pnl,
          pnl_pct: pnlPct,
          win: pnl > 0,
        });
      }
    }

    const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0);
    const reflection = content.match(/\[REFLECTION\](.*?)$/s)?.[1]?.trim() || '';

    // Update portfolio
    const newBalance = portfolio.current_balance + totalPnL;
    await base44.asServiceRole.entities.FinancialPortfolio.update(portfolio.id, {
      current_balance: newBalance,
      total_gain_loss: newBalance - 20000,
      total_trades: (portfolio.total_trades || 0) + trades.length,
      winning_trades: (portfolio.winning_trades || 0) + trades.filter(t => t.win).length,
      win_rate: newBalance > 0 ? parseFloat(((portfolio.winning_trades || 0) / ((portfolio.total_trades || 0) + 1) * 100).toFixed(1)) : 0,
      last_trade_date: new Date().toISOString(),
    }).catch(() => {});

    // Log each trade to TradeLedger
    for (const trade of trades) {
      await base44.asServiceRole.entities.TradeLedger.create({
        portfolio_id: portfolio.id,
        bucket: portfolio.bucket,
        execution_timestamp: new Date().toISOString(),
        cycle_id: cycleId,
        ticker: trade.ticker,
        action: trade.action,
        entry_price: trade.price,
        shares: trade.shares,
        position_size: trade.price * trade.shares,
        confidence: trade.confidence,
        pnl: trade.pnl,
        pnl_pct: trade.pnl_pct,
        win: trade.win,
        groq_reflection: reflection,
        groq_response: content.substring(0, 500),
        portfolio_state: JSON.stringify({
          bucket: portfolio.bucket,
          balance: newBalance,
          total_trades: (portfolio.total_trades || 0) + trades.length,
        }),
      }).catch(() => {});
    }

    // Log cycle activity
    await base44.asServiceRole.entities.AgentActivity.create({
      agent_name: 'Groq Trading',
      action: `Cycle ${cycleId}: ${trades.length} trades | P&L: ${totalPnL.toFixed(2)}`,
      status: 'success',
      category: 'trading',
      details: JSON.stringify({ trades, reflection, newBalance, cycleId }),
    }).catch(() => {});

    return Response.json({
      success: true,
      cycleId,
      trades,
      reflection,
      pnl: totalPnL,
      newBalance,
      liveMarketPrices,
      marketDataSource: marketDataRes?.source || 'fallback',
      newsSentiment,
      sentimentSource: sentimentRes?.source || 'fallback',
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});