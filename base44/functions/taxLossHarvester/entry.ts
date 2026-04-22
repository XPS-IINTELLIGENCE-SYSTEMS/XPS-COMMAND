import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { action = 'scan' } = payload;

    const portfolios = await base44.asServiceRole.entities.FinancialPortfolio.filter({});
    
    if (portfolios.length === 0) {
      return Response.json({ error: 'No portfolios found' }, { status: 400 });
    }

    // Simulate holdings with loss data
    const holdingsWithLoss = [
      {
        symbol: 'TSLA',
        bucketName: 'Growth',
        shares: 50,
        entryPrice: 280,
        currentPrice: 245,
        currentValue: 12250,
        unrealizedLoss: -1750,
        lossPercent: -12.5,
        holdingPeriod: '14 months',
        daysHeld: 425,
        taxableGain: 'Loss',
        harvestPriority: 'High',
      },
      {
        symbol: 'NVDA',
        bucketName: 'Growth',
        shares: 20,
        entryPrice: 450,
        currentPrice: 420,
        currentValue: 8400,
        unrealizedLoss: -600,
        lossPercent: -6.7,
        holdingPeriod: '11 months',
        daysHeld: 330,
        taxableGain: 'Loss',
        harvestPriority: 'Medium',
      },
      {
        symbol: 'ARKK',
        bucketName: 'Growth',
        shares: 100,
        entryPrice: 65,
        currentPrice: 58,
        currentValue: 5800,
        unrealizedLoss: -700,
        lossPercent: -10.8,
        holdingPeriod: '16 months',
        daysHeld: 480,
        taxableGain: 'Loss',
        harvestPriority: 'High',
      },
      {
        symbol: 'AAPL',
        bucketName: 'Core',
        shares: 80,
        entryPrice: 155,
        currentPrice: 160,
        currentValue: 12800,
        unrealizedLoss: 400,
        lossPercent: 3.2,
        holdingPeriod: '22 months',
        daysHeld: 660,
        taxableGain: 'Gain',
        harvestPriority: 'None',
      },
    ];

    // Filter only losing positions
    const losingPositions = holdingsWithLoss.filter(h => h.unrealizedLoss < 0);

    // Calculate tax savings
    const totalUnrealizedLoss = losingPositions.reduce((s, p) => s + Math.abs(p.unrealizedLoss), 0);
    
    // Federal tax brackets (simplified): assume 24% marginal rate
    const federalTaxRate = 0.24;
    const stateTaxRate = 0.05; // NY state rate
    const totalTaxRate = federalTaxRate + stateTaxRate;

    const estimatedTaxSavings = totalUnrealizedLoss * totalTaxRate;
    const capitalLossCarryforward = totalUnrealizedLoss > 3000 ? totalUnrealizedLoss - 3000 : 0;

    // Wash-sale risk assessment
    const washSaleRisks = losingPositions.map(pos => ({
      symbol: pos.symbol,
      riskLevel: pos.daysHeld < 30 ? 'High' : pos.daysHeld < 90 ? 'Medium' : 'Low',
      closingWindow: pos.daysHeld < 30 ? `${30 - pos.daysHeld} days remaining` : 'Safe',
    }));

    return Response.json({
      success: true,
      data: {
        losingPositions,
        summary: {
          totalLosingPositions: losingPositions.length,
          totalUnrealizedLoss,
          estimatedTaxSavings,
          capitalLossCarryforward,
          taxRate: `${(totalTaxRate * 100).toFixed(1)}%`,
          federalRate: `${(federalTaxRate * 100).toFixed(1)}%`,
          stateRate: `${(stateTaxRate * 100).toFixed(1)}%`,
        },
        washSaleRisks,
        replacementAssets: {
          TSLA: ['RIVN', 'LUCID', 'F'],
          NVDA: ['BROADCOM', 'INTEL', 'AMD'],
          ARKK: ['QQQ', 'VOO', 'VUG'],
        },
        harvestingStrategy: {
          recommendedActions: [
            'Harvest TSLA and ARKK immediately (highest priority)',
            'Replace with similar sector/style funds to maintain exposure',
            'Monitor 30-day wash-sale window',
          ],
          timing: 'Harvest before year-end to lock in current losses',
          reinvestmentWait: '31 days minimum before buying same/substantially identical security',
        },
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});