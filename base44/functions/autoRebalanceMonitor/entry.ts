import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { action = 'analyze', driftThreshold = 5, taxRate = 0.20, portfolio_id = null } = payload;

    // Fetch portfolios
    const portfolios = await base44.asServiceRole.entities.FinancialPortfolio.filter({});
    
    if (portfolios.length === 0) {
      return Response.json({ error: 'No portfolios found' }, { status: 400 });
    }

    const targetPortfolio = portfolio_id
      ? portfolios.find(p => p.id === portfolio_id)
      : portfolios[0];

    if (!targetPortfolio) {
      return Response.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    // Parse target allocations
    let targetAllocation = {};
    if (targetPortfolio.target_allocation) {
      try {
        targetAllocation = typeof targetPortfolio.target_allocation === 'string'
          ? JSON.parse(targetPortfolio.target_allocation)
          : targetPortfolio.target_allocation;
      } catch (e) {
        // Default allocation
        targetAllocation = { stocks: 0.6, bonds: 0.3, cash: 0.1 };
      }
    }

    // Parse holdings
    let holdings = [];
    if (targetPortfolio.holdings) {
      try {
        const parsed = typeof targetPortfolio.holdings === 'string'
          ? JSON.parse(targetPortfolio.holdings)
          : targetPortfolio.holdings;
        holdings = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        // Continue with empty
      }
    }

    const totalValue = targetPortfolio.current_balance || 0;

    // Calculate current allocations
    const currentAllocation = {};
    const assetCategories = {
      stocks: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'SPY', 'QQQ', 'IVV'],
      bonds: ['BND', 'AGG', 'TLT', 'BND', 'VCIT', 'LQD'],
      cash: ['VMFXX', 'SPAXX'],
      crypto: ['BTC', 'ETH'],
    };

    holdings.forEach(h => {
      let category = 'other';
      for (const [cat, symbols] of Object.entries(assetCategories)) {
        if (symbols.some(s => h.symbol?.includes(s))) {
          category = cat;
          break;
        }
      }

      const value = h.value || 0;
      currentAllocation[category] = (currentAllocation[category] || 0) + value;
    });

    // Normalize allocations
    Object.keys(currentAllocation).forEach(k => {
      currentAllocation[k] = currentAllocation[k] / totalValue;
    });

    // Detect drifts
    const drifts = [];
    Object.entries(targetAllocation).forEach(([asset, target]) => {
      const current = currentAllocation[asset] || 0;
      const drift = Math.abs((current - target) * 100);

      if (drift > driftThreshold) {
        drifts.push({
          asset,
          target: target * 100,
          current: current * 100,
          drift,
          action: current > target ? 'SELL' : 'BUY',
          targetValue: target * totalValue,
          currentValue: current * totalValue,
          tradeValue: Math.abs((target - current) * totalValue),
        });
      }
    });

    // Generate trade proposals
    const proposals = drifts.map(drift => {
      const tradeValue = drift.tradeValue;
      const taxImpact = drift.action === 'SELL' ? tradeValue * taxRate : 0;
      const netProceeds = drift.action === 'SELL' ? tradeValue - taxImpact : tradeValue;

      return {
        asset: drift.asset,
        action: drift.action,
        targetAllocation: drift.target.toFixed(2),
        currentAllocation: drift.current.toFixed(2),
        drift: drift.drift.toFixed(2),
        tradeValue: tradeValue.toFixed(0),
        taxImpact: taxImpact.toFixed(0),
        netProceeds: netProceeds.toFixed(0),
        priority: drift.drift > 10 ? 'HIGH' : drift.drift > 5 ? 'MEDIUM' : 'LOW',
        rationale:
          drift.action === 'SELL'
            ? `Reduce ${drift.asset} from ${drift.current.toFixed(1)}% to ${drift.target.toFixed(1)}%`
            : `Increase ${drift.asset} from ${drift.current.toFixed(1)}% to ${drift.target.toFixed(1)}%`,
      };
    });

    // Calculate total tax impact and net rebalancing benefit
    const totalTaxImpact = proposals.reduce((sum, p) => sum + parseFloat(p.taxImpact), 0);
    const totalTradeValue = proposals.reduce((sum, p) => sum + parseFloat(p.tradeValue), 0);
    const postTaxCost = proposals
      .filter(p => p.action === 'SELL')
      .reduce((sum, p) => sum + parseFloat(p.taxImpact), 0);

    // Save monitoring data
    try {
      await base44.asServiceRole.entities.OrchestratorLog.create({
        action: 'autoRebalanceMonitor',
        status: 'completed',
        metadata: JSON.stringify({
          driftCount: drifts.length,
          proposalCount: proposals.length,
          totalTradeValue,
          totalTaxImpact,
          threshold: driftThreshold,
        }),
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      // Continue
    }

    return Response.json({
      success: true,
      data: {
        portfolio: {
          id: targetPortfolio.id,
          name: targetPortfolio.bucket_name,
          value: totalValue,
        },
        settings: {
          driftThreshold,
          taxRate: (taxRate * 100).toFixed(1),
        },
        allocations: {
          target: targetAllocation,
          current: currentAllocation,
        },
        monitoring: {
          driftsDetected: drifts.length,
          assetsOutOfAlignment: drifts.length,
          maxDrift: drifts.length > 0 ? Math.max(...drifts.map(d => d.drift)).toFixed(2) : 0,
        },
        proposals,
        taxImpact: {
          totalTaxOnSales: totalTaxImpact.toFixed(0),
          netRebalancingCost: postTaxCost.toFixed(0),
          estimatedTaxRate: `${(taxRate * 100).toFixed(1)}%`,
        },
        summary: {
          proposedTrades: proposals.length,
          totalTradeValue: totalTradeValue.toFixed(0),
          rebalancingNeeded: proposals.length > 0,
        },
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});