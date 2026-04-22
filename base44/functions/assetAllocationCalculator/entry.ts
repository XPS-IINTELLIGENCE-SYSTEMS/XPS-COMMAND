import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { riskProfile = 'moderate' } = payload;

    const portfolios = await base44.asServiceRole.entities.FinancialPortfolio.filter({});
    
    if (portfolios.length === 0) {
      return Response.json({ error: 'No portfolios found' }, { status: 400 });
    }

    // Model allocations by risk profile
    const allocationModels = {
      conservative: {
        bonds: 0.50,
        equities: 0.30,
        commodities: 0.10,
        alternatives: 0.10,
      },
      moderate: {
        bonds: 0.35,
        equities: 0.50,
        commodities: 0.10,
        alternatives: 0.05,
      },
      aggressive: {
        bonds: 0.10,
        equities: 0.70,
        commodities: 0.10,
        alternatives: 0.10,
      },
    };

    const targetAllocation = allocationModels[riskProfile] || allocationModels.moderate;
    const totalValue = portfolios.reduce((s, p) => s + (p.current_balance || 0), 0);

    // Simulate current allocation
    const currentAllocation = {
      bonds: 0.32,
      equities: 0.48,
      commodities: 0.12,
      alternatives: 0.08,
    };

    // Calculate rebalancing trades
    const rebalancingPlan = [];
    for (const [asset, targetPct] of Object.entries(targetAllocation)) {
      const currentPct = currentAllocation[asset];
      const currentValue = totalValue * currentPct;
      const targetValue = totalValue * targetPct;
      const difference = targetValue - currentValue;

      if (Math.abs(difference) > totalValue * 0.02) { // Ignore < 2% drift
        rebalancingPlan.push({
          asset: asset.charAt(0).toUpperCase() + asset.slice(1),
          currentPercent: (currentPct * 100).toFixed(1),
          targetPercent: (targetPct * 100).toFixed(1),
          currentValue,
          targetValue,
          tradeAmount: Math.abs(difference),
          action: difference > 0 ? 'BUY' : 'SELL',
          rationale: difference > 0 
            ? `Underweight: increase ${asset} to ${(targetPct * 100).toFixed(0)}%`
            : `Overweight: reduce ${asset} to ${(targetPct * 100).toFixed(0)}%`,
        });
      }
    }

    // Calculate rebalancing impact
    const estimatedTaxLoss = rebalancingPlan
      .filter(t => t.action === 'SELL')
      .reduce((s, t) => s + (t.tradeAmount * 0.15), 0); // Assume 15% are at loss

    const estimatedFees = rebalancingPlan.length * 5; // $5 per trade

    return Response.json({
      success: true,
      data: {
        riskProfile,
        targetAllocation,
        currentAllocation,
        totalPortfolioValue: totalValue,
        rebalancingPlan,
        summary: {
          tradesRequired: rebalancingPlan.length,
          totalTradeValue: rebalancingPlan.reduce((s, t) => s + t.tradeAmount, 0),
          estimatedTaxSavings: estimatedTaxLoss,
          estimatedFees,
          netBenefit: estimatedTaxLoss - estimatedFees,
          rebalancingDrift: Object.entries(currentAllocation)
            .reduce((s, [asset, pct]) => s + Math.abs(pct - targetAllocation[asset]), 0) / 2 * 100,
        },
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});