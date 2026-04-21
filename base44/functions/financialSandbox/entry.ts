import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * FINANCIAL SANDBOX — Mock $20K Portfolio Manager
 * Buckets: $5k low/mid/high risk, $5k day trading, $10k business venture
 * Simulates trades, tracks growth, generates daily reflections
 */

const PORTFOLIO_CONFIG = [
  { bucket: 'low_risk', name: 'Conservative Growth', initial: 1667, strategy: 'Blue-chip index funds, bonds, dividend stocks. Target 8-12% annual.' },
  { bucket: 'mid_risk', name: 'Balanced Growth', initial: 1667, strategy: 'Growth ETFs, sector rotation, moderate swing trades. Target 15-25% annual.' },
  { bucket: 'high_risk', name: 'Aggressive Alpha', initial: 1666, strategy: 'Small-cap momentum, crypto-adjacent, high-beta plays. Target 30-50%+ annual.' },
  { bucket: 'day_trading', name: 'Day Trading Desk', initial: 5000, strategy: 'Intraday momentum, scalping, news-driven plays. Daily P&L tracking.' },
  { bucket: 'business_venture', name: 'Business Ventures', initial: 10000, strategy: 'SaaS tools, AI services, flooring tech products. Invest in building revenue-generating assets.' },
];

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  let body = {};
  try { body = await req.json(); } catch {}
  const action = body.action || 'daily_cycle'; // init | daily_cycle | report

  if (action === 'init') {
    // Initialize the $20K portfolio
    for (const cfg of PORTFOLIO_CONFIG) {
      const existing = await base44.asServiceRole.entities.FinancialPortfolio.filter({ bucket: cfg.bucket }, '-created_date', 1).catch(() => []);
      if (existing.length === 0) {
        await base44.asServiceRole.entities.FinancialPortfolio.create({
          portfolio_name: cfg.name,
          bucket: cfg.bucket,
          initial_balance: cfg.initial,
          current_balance: cfg.initial,
          total_gain_loss: 0,
          total_gain_loss_pct: 0,
          day_gain_loss: 0,
          trades_today: 0,
          total_trades: 0,
          holdings: '[]',
          trade_history: '[]',
          strategy: cfg.strategy,
          status: 'active',
        });
      }
    }
    return Response.json({ success: true, message: 'Portfolio initialized with $20,000 across 5 buckets' });
  }

  // Load all active portfolios
  const portfolios = await base44.asServiceRole.entities.FinancialPortfolio.filter({ status: 'active' }, '-created_date', 10).catch(() => []);
  
  if (portfolios.length === 0) {
    return Response.json({ error: 'No active portfolios. Run with action: "init" first.' }, { status: 400 });
  }

  const results = [];

  for (const portfolio of portfolios) {
    // AI simulates today's market activity for this bucket
    const simulation = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are an AI portfolio manager running a SIMULATED ${portfolio.portfolio_name} portfolio.

CURRENT STATE:
- Bucket: ${portfolio.bucket}
- Strategy: ${portfolio.strategy}
- Current Balance: $${(portfolio.current_balance || 0).toFixed(2)}
- Initial Balance: $${(portfolio.initial_balance || 0).toFixed(2)}
- Total P&L: $${(portfolio.total_gain_loss || 0).toFixed(2)} (${(portfolio.total_gain_loss_pct || 0).toFixed(1)}%)
- Current Holdings: ${portfolio.holdings || '[]'}
- Total Trades: ${portfolio.total_trades || 0}

Simulate TODAY's market activity. Generate realistic but SIMULATED trades based on current market conditions.
For day_trading: make 3-8 intraday trades with small % moves.
For low/mid/high risk: make 0-2 position adjustments.
For business_venture: simulate progress on building revenue-generating assets.

Return realistic daily results. The simulation should trend toward growth with realistic variance.`,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          trades: { type: 'array', items: { type: 'object', properties: {
            action: { type: 'string' },
            asset: { type: 'string' },
            amount: { type: 'number' },
            price: { type: 'number' },
            pnl: { type: 'number' },
          }}},
          day_pnl: { type: 'number' },
          day_pnl_pct: { type: 'number' },
          new_holdings: { type: 'array', items: { type: 'object', properties: {
            asset: { type: 'string' },
            shares: { type: 'number' },
            avg_price: { type: 'number' },
            current_value: { type: 'number' },
          }}},
          market_outlook: { type: 'string' },
          strategy_adjustment: { type: 'string' },
          reflection: { type: 'string' },
        }
      }
    });

    const dayPnl = simulation.day_pnl || 0;
    const newBalance = (portfolio.current_balance || 0) + dayPnl;
    const totalGainLoss = newBalance - (portfolio.initial_balance || 0);
    const totalGainLossPct = portfolio.initial_balance ? ((totalGainLoss / portfolio.initial_balance) * 100) : 0;
    const tradesCount = (simulation.trades || []).length;

    // Append to trade history (keep last 50)
    let tradeHistory = [];
    try { tradeHistory = JSON.parse(portfolio.trade_history || '[]'); } catch {}
    const newTrades = (simulation.trades || []).map(t => ({ ...t, date: new Date().toISOString() }));
    tradeHistory = [...newTrades, ...tradeHistory].slice(0, 50);

    await base44.asServiceRole.entities.FinancialPortfolio.update(portfolio.id, {
      current_balance: newBalance,
      total_gain_loss: totalGainLoss,
      total_gain_loss_pct: totalGainLossPct,
      day_gain_loss: dayPnl,
      trades_today: tradesCount,
      total_trades: (portfolio.total_trades || 0) + tradesCount,
      holdings: JSON.stringify(simulation.new_holdings || []),
      trade_history: JSON.stringify(tradeHistory),
      strategy: simulation.strategy_adjustment || portfolio.strategy,
      ai_reflection: simulation.reflection || '',
      last_trade_date: new Date().toISOString(),
    });

    results.push({
      bucket: portfolio.bucket,
      name: portfolio.portfolio_name,
      balance: newBalance,
      day_pnl: dayPnl,
      total_pnl: totalGainLoss,
      trades: tradesCount,
      reflection: simulation.reflection,
    });
  }

  // Calculate total portfolio value
  const totalValue = results.reduce((sum, r) => sum + r.balance, 0);
  const totalPnl = results.reduce((sum, r) => sum + r.total_pnl, 0);
  const totalDayPnl = results.reduce((sum, r) => sum + r.day_pnl, 0);

  // Generate daily reflection report
  const reflection = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `Generate a concise daily portfolio reflection report.

PORTFOLIO SUMMARY:
- Total Value: $${totalValue.toFixed(2)} (started at $20,000)
- Total P&L: $${totalPnl.toFixed(2)} (${((totalPnl/20000)*100).toFixed(1)}%)
- Today's P&L: $${totalDayPnl.toFixed(2)}

BUCKET RESULTS:
${results.map(r => `${r.name}: $${r.balance.toFixed(2)} (day: ${r.day_pnl >= 0 ? '+' : ''}$${r.day_pnl.toFixed(2)}, total: ${r.total_pnl >= 0 ? '+' : ''}$${r.total_pnl.toFixed(2)})`).join('\n')}

Write a 3-paragraph self-reflection: What worked, what didn't, what to adjust tomorrow. Be specific.`,
    response_json_schema: {
      type: 'object',
      properties: {
        daily_report: { type: 'string' },
        top_winner: { type: 'string' },
        top_loser: { type: 'string' },
        tomorrow_focus: { type: 'string' },
        confidence_level: { type: 'number' },
      }
    }
  });

  // Log as IntelRecord
  await base44.asServiceRole.entities.IntelRecord.create({
    source_company: 'XPS Intelligence',
    category: 'financial',
    title: `Portfolio Report — $${totalValue.toFixed(0)} (${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(0)}) — ${new Date().toISOString().split('T')[0]}`,
    content: reflection.daily_report || '',
    summary: `Total: $${totalValue.toFixed(0)} | Day: ${totalDayPnl >= 0 ? '+' : ''}$${totalDayPnl.toFixed(0)} | Focus: ${reflection.tomorrow_focus || 'N/A'}`,
    source_type: 'llm_research',
    tags: 'financial-sandbox,portfolio,daily-report',
    confidence_score: reflection.confidence_level || 75,
    scraped_at: new Date().toISOString(),
    is_indexed: true,
    data_freshness: 'live',
  }).catch(() => {});

  // Log activity
  await base44.asServiceRole.entities.AgentActivity.create({
    agent_name: 'Financial Sandbox',
    action: `Daily cycle: $${totalValue.toFixed(0)} total (${totalDayPnl >= 0 ? '+' : ''}$${totalDayPnl.toFixed(0)} today)`,
    status: 'success',
    category: 'analysis',
    details: JSON.stringify({ total_value: totalValue, day_pnl: totalDayPnl, total_pnl: totalPnl, buckets: results.length }),
  });

  return Response.json({
    success: true,
    total_value: totalValue,
    total_pnl: totalPnl,
    day_pnl: totalDayPnl,
    buckets: results,
    reflection,
  });
});