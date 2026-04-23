import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Groq from 'npm:groq-sdk@0.4.0';

const groq = new Groq({
  apiKey: Deno.env.get('GROQ_API_KEY'),
});

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const portfolios = await base44.asServiceRole.entities.FinancialPortfolio
      .filter({ status: 'active' }, '-created_date', 1).catch(() => []);

    if (portfolios.length === 0) {
      return Response.json({ message: 'No active portfolio' });
    }

    const portfolio = portfolios[0];
    const targetAllocation = { stocks: 0.6, bonds: 0.3, cash: 0.1 };
    
    // Parse current holdings
    const holdings = (() => {
      try { return JSON.parse(portfolio.holdings || '[]'); }
      catch { return []; }
    })();

    // Calculate current allocation percentages
    const totalValue = portfolio.current_balance || 20000;
    let stockValue = 0;
    let bondValue = 0;
    let cashValue = portfolio.current_balance || 0;

    // Simulate allocation from holdings
    for (const holding of holdings) {
      const holdingValue = (holding.shares || 0) * (holding.price || 0);
      if (['AAPL', 'MSFT', 'TSLA', 'GOOGL', 'NVDA'].includes(holding.ticker)) {
        stockValue += holdingValue;
        cashValue -= holdingValue;
      }
    }

    const currentAllocation = {
      stocks: totalValue > 0 ? stockValue / totalValue : 0,
      bonds: totalValue > 0 ? bondValue / totalValue : 0,
      cash: totalValue > 0 ? cashValue / totalValue : 0,
    };

    // Calculate drift
    const stockDrift = Math.abs(currentAllocation.stocks - targetAllocation.stocks);
    const bondDrift = Math.abs(currentAllocation.bonds - targetAllocation.bonds);
    const cashDrift = Math.abs(currentAllocation.cash - targetAllocation.cash);
    const maxDrift = Math.max(stockDrift, bondDrift, cashDrift);

    // Only rebalance if drift exceeds threshold
    if (maxDrift < 0.15) {
      return Response.json({
        rebalanced: false,
        message: 'Portfolio within acceptable drift threshold',
        currentAllocation,
        targetAllocation,
        maxDrift,
      });
    }

    // Use Groq to generate rebalancing trades
    const rebalancePrompt = `Portfolio rebalancing analysis:

CURRENT ALLOCATION:
- Stocks: ${(currentAllocation.stocks * 100).toFixed(1)}%
- Bonds: ${(currentAllocation.bonds * 100).toFixed(1)}%
- Cash: ${(currentAllocation.cash * 100).toFixed(1)}%

TARGET ALLOCATION:
- Stocks: ${(targetAllocation.stocks * 100).toFixed(1)}%
- Bonds: ${(targetAllocation.bonds * 100).toFixed(1)}%
- Cash: ${(targetAllocation.cash * 100).toFixed(1)}%

Generate EXACTLY 2-3 rebalancing trades in format:
[REBALANCE_TRADE] TICKER: AAPL | ACTION: SELL | REASON: Overweight stocks, need to reduce to meet 60% target
[REBALANCE_TRADE] TICKER: BND | ACTION: BUY | REASON: Underweight bonds, need to increase to meet 30% target`;

    const rebalanceRes = await groq.chat.completions.create({
      messages: [{ role: 'user', content: rebalancePrompt }],
      model: 'mixtral-8x7b-32768',
      max_tokens: 600,
      temperature: 0.3,
    });

    const rebalanceContent = rebalanceRes.choices[0]?.message?.content || '';
    const rebalanceTrades = [];
    const tradeMatches = rebalanceContent.match(/\[REBALANCE_TRADE\].*?(?=\[REBALANCE_TRADE\]|$)/gs) || [];

    for (const match of tradeMatches) {
      const ticker = match.match(/TICKER:\s*(\w+)/)?.[1] || '';
      const action = match.match(/ACTION:\s*(BUY|SELL)/)?.[1] || 'BUY';
      const reason = match.match(/REASON:\s*(.+?)$/m)?.[1]?.trim() || '';

      if (ticker) {
        rebalanceTrades.push({ ticker, action, reason });
      }
    }

    // Log rebalancing event
    await base44.asServiceRole.entities.AgentActivity.create({
      agent_name: 'Auto Rebalancer',
      action: `Rebalancing: ${rebalanceTrades.length} trades | Drift: ${(maxDrift * 100).toFixed(1)}%`,
      status: 'success',
      category: 'rebalancing',
      details: JSON.stringify({
        currentAllocation,
        targetAllocation,
        trades: rebalanceTrades,
        maxDrift,
      }),
    }).catch(() => {});

    return Response.json({
      rebalanced: true,
      trades: rebalanceTrades,
      currentAllocation,
      targetAllocation,
      maxDrift,
      groqAnalysis: rebalanceContent.substring(0, 300),
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});