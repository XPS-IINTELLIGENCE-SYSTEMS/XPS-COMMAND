import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Fetch trade ledger
    const trades = await base44.entities.TradeLedger.list('-execution_timestamp', 500).catch(() => []);
    
    // Fetch portfolio data
    const portfolios = await base44.entities.FinancialPortfolio.list('-created_date', 10).catch(() => []);

    // Generate CSV for trades
    const tradeHeaders = ['Ticker', 'Action', 'Entry Price', 'Shares', 'Position Size', 'Confidence %', 'P&L', 'P&L %', 'Win', 'Execution Time', 'Cycle ID'];
    const tradeRows = trades.map(t => [
      t.ticker,
      t.action,
      t.entry_price.toFixed(2),
      t.shares,
      t.position_size.toFixed(2),
      t.confidence,
      t.pnl.toFixed(2),
      t.pnl_pct.toFixed(2),
      t.win ? 'Yes' : 'No',
      new Date(t.execution_timestamp).toISOString(),
      t.cycle_id,
    ]);

    // Generate CSV for portfolios
    const portfolioHeaders = ['Portfolio', 'Initial Balance', 'Current Balance', 'Total Gain/Loss', 'Total Gain/Loss %', 'Total Trades', 'Winning Trades', 'Win Rate %', 'Status'];
    const portfolioRows = portfolios.map(p => [
      p.bucket || 'Main',
      p.initial_balance || 20000,
      p.current_balance.toFixed(2),
      p.total_gain_loss.toFixed(2),
      p.total_gain_loss_pct.toFixed(2),
      p.total_trades || 0,
      p.winning_trades || 0,
      p.win_rate || 0,
      p.status,
    ]);

    // Combine into single CSV
    const csv = [
      'PORTFOLIO PERFORMANCE REPORT',
      `Generated: ${new Date().toISOString()}`,
      `User: ${user.email}`,
      '',
      'PORTFOLIO SUMMARY',
      portfolioHeaders.join(','),
      ...portfolioRows.map(row => row.map(cell => `"${cell}"`).join(',')),
      '',
      'TRADE LEDGER',
      tradeHeaders.join(','),
      ...tradeRows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=portfolio_report_${new Date().toISOString().split('T')[0]}.csv`,
      },
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});