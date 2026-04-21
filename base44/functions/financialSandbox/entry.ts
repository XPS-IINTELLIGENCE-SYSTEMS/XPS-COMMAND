import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PORTFOLIO_CONFIG = [
  { bucket: 'low_risk', name: 'Conservative Growth', initial: 1667, strategy: 'Blue-chip ETFs, bonds, dividends. 8-12% annual.' },
  { bucket: 'mid_risk', name: 'Balanced Growth', initial: 1667, strategy: 'Growth ETFs, sector rotation, swing trades. 15-25% annual.' },
  { bucket: 'high_risk', name: 'Aggressive Alpha', initial: 1666, strategy: 'Small-cap momentum, crypto-adjacent, high-beta. 30-50%+.' },
  { bucket: 'day_trading', name: 'Day Trading Desk', initial: 5000, strategy: 'Intraday momentum, scalping, news-driven. Hourly P&L.' },
  { bucket: 'business_venture', name: 'Business Ventures', initial: 10000, strategy: 'SaaS tools, AI services, flooring tech. Revenue assets.' },
];

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  let body = {};
  try { body = await req.json(); } catch {}
  const action = body.action || 'daily_cycle';

  if (action === 'init') {
    for (const cfg of PORTFOLIO_CONFIG) {
      const existing = await base44.asServiceRole.entities.FinancialPortfolio.filter({ bucket: cfg.bucket }, '-created_date', 1).catch(() => []);
      if (existing.length === 0) {
        await base44.asServiceRole.entities.FinancialPortfolio.create({
          portfolio_name: cfg.name, bucket: cfg.bucket,
          initial_balance: cfg.initial, current_balance: cfg.initial,
          total_gain_loss: 0, total_gain_loss_pct: 0, day_gain_loss: 0,
          trades_today: 0, total_trades: 0,
          holdings: '[]', trade_history: '[]',
          strategy: cfg.strategy, status: 'active',
        });
      }
    }
    return Response.json({ success: true, message: 'Portfolio initialized with $20,000 across 5 buckets' });
  }

  const portfolios = await base44.asServiceRole.entities.FinancialPortfolio.filter({ status: 'active' }, '-created_date', 10).catch(() => []);
  if (portfolios.length === 0) return Response.json({ error: 'No active portfolios.' }, { status: 400 });

  const ts = new Date().toISOString();

  // Build ALL portfolio states into ONE prompt to avoid timeout
  const portfolioStates = portfolios.map(p =>
    `[${p.bucket}] ${p.portfolio_name}: $${(p.current_balance||0).toFixed(2)} (start $${(p.initial_balance||0).toFixed(2)}, P&L $${(p.total_gain_loss||0).toFixed(2)}). Holdings: ${p.holdings || '[]'}. Strategy: ${p.strategy}`
  ).join('\n');

  // Single LLM call with live web data for ALL buckets
  const simulation = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are an elite AI hedge fund manager. Time: ${ts}

LOOK UP REAL LIVE market data: S&P 500, NASDAQ, VIX, BTC, top movers, breaking news.

PORTFOLIO STATE:
${portfolioStates}

For EACH bucket, generate trades using REAL current prices and tickers. Include:
- day_trading: 2-4 trades with real intraday momentum
- high_risk: 1-2 high-beta plays with real prices
- mid_risk: 0-1 adjustments
- low_risk: 0-1 adjustments
- business_venture: revenue progress update

For EVERY trade include: action, ticker, live_price (real), shares, amount, pnl, reason (2 sentences citing real market signals/prices/news).

Also generate 5 profitability recommendations with specific tickers, entry/target prices, expected gains, and urgency.`,
    add_context_from_internet: true,
    model: 'gemini_3_flash',
    response_json_schema: {
      type: 'object',
      properties: {
        market_snapshot: { type: 'object', properties: {
          sp500: { type: 'string' }, nasdaq: { type: 'string' }, vix: { type: 'string' },
          btc: { type: 'string' }, headline: { type: 'string' }, sentiment: { type: 'string' },
        }},
        buckets: { type: 'array', items: { type: 'object', properties: {
          bucket: { type: 'string' },
          trades: { type: 'array', items: { type: 'object', properties: {
            action: { type: 'string' }, ticker: { type: 'string' }, asset: { type: 'string' },
            live_price: { type: 'number' }, shares: { type: 'number' },
            amount: { type: 'number' }, pnl: { type: 'number' },
            reason: { type: 'string' }, market_context: { type: 'string' },
          }}},
          day_pnl: { type: 'number' },
          new_holdings: { type: 'array', items: { type: 'object', properties: {
            ticker: { type: 'string' }, asset: { type: 'string' },
            shares: { type: 'number' }, avg_price: { type: 'number' },
            live_price: { type: 'number' }, current_value: { type: 'number' },
            unrealized_pnl: { type: 'number' },
          }}},
          reflection: { type: 'string' },
          strategy_update: { type: 'string' },
        }}},
        recommendations: { type: 'array', items: { type: 'object', properties: {
          title: { type: 'string' }, action: { type: 'string' }, bucket: { type: 'string' },
          ticker: { type: 'string' }, entry_price: { type: 'string' }, target_price: { type: 'string' },
          expected_gain_pct: { type: 'number' }, urgency: { type: 'string' }, reasoning: { type: 'string' },
        }}},
        risk_warnings: { type: 'array', items: { type: 'string' } },
        rebalancing: { type: 'string' },
        new_opportunities: { type: 'array', items: { type: 'object', properties: {
          opportunity: { type: 'string' }, ticker: { type: 'string' },
          why_now: { type: 'string' }, potential_return: { type: 'string' },
        }}},
        performance_report: { type: 'string' },
        next_cycle_focus: { type: 'string' },
      }
    }
  });

  // Process each bucket result
  const results = [];
  for (const portfolio of portfolios) {
    const bucketData = (simulation.buckets || []).find(b => b.bucket === portfolio.bucket) || {};
    const dayPnl = bucketData.day_pnl || 0;
    const newBalance = (portfolio.current_balance || 0) + dayPnl;
    const totalGainLoss = newBalance - (portfolio.initial_balance || 0);
    const totalGainLossPct = portfolio.initial_balance ? ((totalGainLoss / portfolio.initial_balance) * 100) : 0;
    const tradesCount = (bucketData.trades || []).length;

    let tradeHistory = [];
    try { tradeHistory = JSON.parse(portfolio.trade_history || '[]'); } catch {}
    const newTrades = (bucketData.trades || []).map(t => ({ ...t, date: ts, bucket: portfolio.bucket }));
    tradeHistory = [...newTrades, ...tradeHistory].slice(0, 100);

    await base44.asServiceRole.entities.FinancialPortfolio.update(portfolio.id, {
      current_balance: newBalance, total_gain_loss: totalGainLoss,
      total_gain_loss_pct: totalGainLossPct, day_gain_loss: dayPnl,
      trades_today: tradesCount, total_trades: (portfolio.total_trades || 0) + tradesCount,
      holdings: JSON.stringify(bucketData.new_holdings || []),
      trade_history: JSON.stringify(tradeHistory),
      strategy: bucketData.strategy_update || portfolio.strategy,
      ai_reflection: bucketData.reflection || '',
      last_trade_date: ts,
    });

    results.push({ bucket: portfolio.bucket, name: portfolio.portfolio_name,
      balance: newBalance, day_pnl: dayPnl, total_pnl: totalGainLoss, trades: tradesCount });
  }

  const totalValue = results.reduce((s, r) => s + r.balance, 0);
  const totalPnl = results.reduce((s, r) => s + r.total_pnl, 0);
  const totalDayPnl = results.reduce((s, r) => s + r.day_pnl, 0);

  // Store report with recommendations in metadata
  await base44.asServiceRole.entities.IntelRecord.create({
    source_company: 'XPS Intelligence', category: 'financial',
    title: `Portfolio — $${totalValue.toFixed(0)} (${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(0)}) — ${ts.split('T')[0]} ${ts.split('T')[1]?.slice(0,5)}`,
    content: `${simulation.performance_report || ''}\n\nRECOMMENDATIONS:\n${(simulation.recommendations || []).map((r,i) => `${i+1}. [${r.urgency}] ${r.title}: ${r.action} — ${r.reasoning}`).join('\n')}\n\nRISK: ${(simulation.risk_warnings || []).join('; ')}\n\nREBALANCE: ${simulation.rebalancing || 'None'}`,
    summary: `$${totalValue.toFixed(0)} | Cycle: ${totalDayPnl >= 0 ? '+' : ''}$${totalDayPnl.toFixed(0)} | Focus: ${simulation.next_cycle_focus || 'N/A'}`,
    source_type: 'llm_research', tags: 'financial-sandbox,portfolio,report,live',
    confidence_score: 80, scraped_at: ts, is_indexed: true, data_freshness: 'live',
    metadata: JSON.stringify({
      recommendations: simulation.recommendations, risk_warnings: simulation.risk_warnings,
      new_opportunities: simulation.new_opportunities, rebalancing: simulation.rebalancing,
      market_snapshot: simulation.market_snapshot,
    }),
  }).catch(() => {});

  await base44.asServiceRole.entities.AgentActivity.create({
    agent_name: 'Financial Sandbox',
    action: `Live: $${totalValue.toFixed(0)} (${totalDayPnl >= 0 ? '+' : ''}$${totalDayPnl.toFixed(0)}) | ${results.reduce((s,r) => s + r.trades, 0)} trades | ${(simulation.recommendations || []).length} recs`,
    status: 'success', category: 'analysis',
    details: JSON.stringify({ total_value: totalValue, day_pnl: totalDayPnl, total_pnl: totalPnl,
      market: simulation.market_snapshot, recs: (simulation.recommendations || []).length }),
  });

  return Response.json({ success: true, total_value: totalValue, total_pnl: totalPnl, day_pnl: totalDayPnl,
    buckets: results, market: simulation.market_snapshot,
    recommendations: simulation.recommendations, risk_warnings: simulation.risk_warnings });
});