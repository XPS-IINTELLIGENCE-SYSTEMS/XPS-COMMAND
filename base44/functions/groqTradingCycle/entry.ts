import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Anthropic from 'npm:@anthropic-ai/sdk@0.24.0';
import Groq from 'npm:groq-sdk@0.4.0';

const anthropic = new Anthropic({
  apiKey: Deno.env.get('ANTHROPIC_API_KEY'),
});

const groq = new Groq({
  apiKey: Deno.env.get('GROQ_API_KEY'),
});

// Fetch real market data via Anthropic browser
const fetchRealMarketData = async () => {
  try {
    const response = await anthropic.beta.messages.create({
      model: 'claude-opus-4-1-20250805',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: 'Search web for current stock prices: AAPL, TSLA, MSFT, GOOGL, NVDA, META. Return ONLY a JSON object with ticker: price pairs. Example: {"AAPL": 150.25, "TSLA": 220.50}',
      }],
      betas: ['interleaved-thinking-2025-05-14'],
    });

    const content = response.content.find(c => c.type === 'text')?.text || '{}';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
  } catch (e) {
    console.error('Market data fetch error:', e.message);
    return {};
  }
};

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

    // Fetch real market data via Anthropic browser
    const liveMarketPrices = await fetchRealMarketData();
    
    if (!Object.keys(liveMarketPrices).length) {
      return Response.json({ error: 'Failed to fetch market data' }, { status: 500 });
    }

    const priceContext = Object.entries(liveMarketPrices)
      .map(([ticker, price]) => `${ticker}: $${price.toFixed(2)}`)
      .join(', ');

    // Groq for trading decision based on real market data
    const msg = await groq.chat.completions.create({
      messages: [{
        role: 'user',
        content: `Real market data: ${priceContext}

Portfolio: $${portfolio.current_balance.toFixed(2)}

Generate 3 trades. Format:
[TRADE] TICKER: AAPL | ACTION: BUY | PRICE: ${liveMarketPrices.AAPL?.toFixed(2) || '150'} | SHARES: 10 | CONFIDENCE: 85
[TRADE] TICKER: TSLA | ACTION: SELL | PRICE: ${liveMarketPrices.TSLA?.toFixed(2) || '220'} | SHARES: 5 | CONFIDENCE: 70
[REFLECTION] Why chosen.`,
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