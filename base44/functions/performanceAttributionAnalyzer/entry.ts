import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { action = 'analyze', timeWindowDays = 30, selectedBucket = null } = payload;

    // Fetch portfolios and trade logs
    const portfolios = await base44.asServiceRole.entities.FinancialPortfolio.filter({});
    
    if (portfolios.length === 0) {
      return Response.json({ error: 'No portfolios found' }, { status: 400 });
    }

    const targetPortfolio = selectedBucket
      ? portfolios.find(p => p.id === selectedBucket)
      : portfolios[0];

    if (!targetPortfolio) {
      return Response.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    // Parse trade log
    let trades = [];
    if (targetPortfolio.trade_log) {
      try {
        const parsed = typeof targetPortfolio.trade_log === 'string'
          ? JSON.parse(targetPortfolio.trade_log)
          : targetPortfolio.trade_log;
        trades = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        // Continue with empty trades
      }
    }

    // Filter trades within time window
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeWindowDays);
    
    const relevantTrades = trades.filter(t => {
      const tradeDate = new Date(t.date || t.timestamp || Date.now());
      return tradeDate >= cutoffDate;
    });

    // Attribution analysis
    const sectorAttribution = {};
    const strategyAttribution = {};
    let totalContribution = 0;

    relevantTrades.forEach(trade => {
      const tradeGain = (trade.gain || 0) + (trade.performance || 0);
      const sector = trade.sector || 'Unknown';
      const strategy = trade.strategy || trade.type || 'Unknown';

      sectorAttribution[sector] = {
        gain: (sectorAttribution[sector]?.gain || 0) + tradeGain,
        count: (sectorAttribution[sector]?.count || 0) + 1,
        trades: [...(sectorAttribution[sector]?.trades || []), trade],
      };

      strategyAttribution[strategy] = {
        gain: (strategyAttribution[strategy]?.gain || 0) + tradeGain,
        count: (strategyAttribution[strategy]?.count || 0) + 1,
        trades: [...(strategyAttribution[strategy]?.trades || []), trade],
      };

      totalContribution += tradeGain;
    });

    // Rank sectors and strategies
    const topSectors = Object.entries(sectorAttribution)
      .map(([name, data]) => ({
        name,
        gain: data.gain,
        count: data.count,
        avgPerTrade: data.count > 0 ? data.gain / data.count : 0,
        contribution: totalContribution > 0 ? (data.gain / totalContribution) * 100 : 0,
      }))
      .sort((a, b) => b.gain - a.gain);

    const topStrategies = Object.entries(strategyAttribution)
      .map(([name, data]) => ({
        name,
        gain: data.gain,
        count: data.count,
        avgPerTrade: data.count > 0 ? data.gain / data.count : 0,
        contribution: totalContribution > 0 ? (data.gain / totalContribution) * 100 : 0,
      }))
      .sort((a, b) => b.gain - a.gain);

    // Best and worst trades
    const sortedTrades = relevantTrades.sort((a, b) => (b.gain || 0) - (a.gain || 0));
    const bestTrades = sortedTrades.slice(0, 5);
    const worstTrades = sortedTrades.slice(-5).reverse();

    // Win rate
    const winningTrades = relevantTrades.filter(t => (t.gain || 0) > 0);
    const winRate = relevantTrades.length > 0 ? (winningTrades.length / relevantTrades.length) * 100 : 0;

    // Risk metrics
    const gains = relevantTrades.map(t => t.gain || 0);
    const avgGain = gains.length > 0 ? gains.reduce((a, b) => a + b, 0) / gains.length : 0;
    const gainStdDev = gains.length > 0
      ? Math.sqrt(gains.reduce((sq, n) => sq + Math.pow(n - avgGain, 2), 0) / gains.length)
      : 0;

    // Key insights
    const insights = [];
    
    if (topSectors.length > 0 && topSectors[0].gain > 0) {
      insights.push(`${topSectors[0].name} sector driven ${topSectors[0].contribution.toFixed(1)}% of gains via ${topSectors[0].count} trades`);
    }
    
    if (winRate > 70) {
      insights.push(`Strong win rate of ${winRate.toFixed(0)}% indicates effective trade selection`);
    } else if (winRate < 40) {
      insights.push(`Low win rate of ${winRate.toFixed(0)}% suggests need for tighter entry/exit rules`);
    }

    if (bestTrades.length > 0) {
      insights.push(`Best trade: ${bestTrades[0].symbol || 'Position'} (${(bestTrades[0].gain || 0).toFixed(2)} pts)`);
    }

    if (gainStdDev > avgGain * 2) {
      insights.push(`High volatility in trade outcomes (σ=${gainStdDev.toFixed(2)}) indicates inconsistent execution`);
    }

    // Save analysis
    try {
      await base44.asServiceRole.entities.OrchestratorLog.create({
        action: 'performanceAttributionAnalyze',
        status: 'completed',
        metadata: JSON.stringify({
          timeWindow: timeWindowDays,
          totalTrades: relevantTrades.length,
          totalGain: totalContribution,
          winRate,
        }),
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      // Continue
    }

    return Response.json({
      success: true,
      data: {
        period: {
          days: timeWindowDays,
          startDate: cutoffDate.toISOString(),
          endDate: new Date().toISOString(),
        },
        summary: {
          totalTrades: relevantTrades.length,
          totalGain: totalContribution,
          avgGainPerTrade: avgGain,
          gainStdDev,
          winRate,
          winningTrades: winningTrades.length,
          losingTrades: relevantTrades.length - winningTrades.length,
        },
        sectorAttribution: topSectors,
        strategyAttribution: topStrategies,
        bestTrades: bestTrades.map(t => ({
          symbol: t.symbol,
          date: t.date,
          gain: t.gain,
          type: t.type,
          sector: t.sector,
        })),
        worstTrades: worstTrades.map(t => ({
          symbol: t.symbol,
          date: t.date,
          gain: t.gain,
          type: t.type,
          sector: t.sector,
        })),
        insights,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});