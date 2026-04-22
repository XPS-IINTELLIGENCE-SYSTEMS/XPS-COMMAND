import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const {
      scenarioName,
      scenarioType, // 'interest_rates', 'sector_crash', 'market_shock', 'custom'
      parameters = {}, // e.g., { interestRateChange: 2, affectedSectors: ['Tech'] }
    } = payload;

    // Fetch current portfolios
    const portfolios = await base44.asServiceRole.entities.FinancialPortfolio.filter({});
    
    if (portfolios.length === 0) {
      return Response.json({ error: 'No portfolios found' }, { status: 400 });
    }

    const baselineValue = portfolios.reduce((s, p) => s + (p.current_balance || 0), 0);
    const holdings = [];
    portfolios.forEach(p => {
      if (p.holdings) {
        try {
          const parsed = typeof p.holdings === 'string' ? JSON.parse(p.holdings) : p.holdings;
          holdings.push(...(Array.isArray(parsed) ? parsed : []));
        } catch (e) {
          // Continue
        }
      }
    });

    // Define scenario impact functions
    const scenarioImpacts = {
      interest_rates: (holding) => {
        const { interestRateChange = 0 } = parameters;
        // Bonds negatively impacted, dividend stocks slightly negative
        if (holding.type === 'BOND' || holding.symbol.includes('BND')) {
          return -Math.abs(interestRateChange) * 0.8; // -0.8% per 1% rate increase
        }
        if (holding.sector === 'Finance' || holding.sector === 'Dividend') {
          return -Math.abs(interestRateChange) * 0.3;
        }
        return 0;
      },
      sector_crash: (holding) => {
        const { crashSectors = {}, crashMagnitude = -10 } = parameters;
        for (const [sector, magnitude] of Object.entries(crashSectors)) {
          if (holding.sector === sector) {
            return magnitude; // Directly apply sector-specific impact
          }
        }
        return 0;
      },
      market_shock: (holding) => {
        const { shockMagnitude = -5, correlation = 0.7 } = parameters;
        // Apply market-wide shock tempered by correlation assumption
        return shockMagnitude * correlation;
      },
      custom: (holding) => {
        const { holdingImpacts = {} } = parameters;
        return holdingImpacts[holding.symbol] || 0;
      },
    };

    // Calculate impact function
    const impactFn = scenarioImpacts[scenarioType] || (() => 0);

    // Simulate portfolio under scenario
    let scenarioValue = 0;
    let gainersCount = 0;
    let losersCount = 0;
    const impactedHoldings = [];

    holdings.forEach(holding => {
      const currentValue = holding.value || 0;
      const percentageChange = impactFn(holding);
      const newValue = currentValue * (1 + percentageChange / 100);
      const absoluteChange = newValue - currentValue;

      scenarioValue += newValue;

      impactedHoldings.push({
        symbol: holding.symbol,
        sector: holding.sector || 'Unknown',
        currentValue,
        newValue,
        percentageChange,
        absoluteChange,
        recommendation:
          percentageChange < -5 ? 'SELL' :
          percentageChange < -2 ? 'REDUCE' :
          percentageChange > 5 ? 'BUY' :
          percentageChange > 2 ? 'ADD' :
          'HOLD'
      });

      if (percentageChange > 0) gainersCount++;
      if (percentageChange < 0) losersCount++;
    });

    // Portfolio-level metrics
    const portfolioImpact = scenarioValue - baselineValue;
    const portfolioImpactPercent = (portfolioImpact / baselineValue) * 100;

    // Generate recommendations
    const recommendations = [];
    const worstHoldings = impactedHoldings.sort((a, b) => a.percentageChange - b.percentageChange).slice(0, 3);
    
    worstHoldings.forEach(h => {
      if (h.percentageChange < -5) {
        recommendations.push(`SELL ${h.symbol}: Expected to decline ${Math.abs(h.percentageChange).toFixed(1)}% (${h.sector})`);
      } else if (h.percentageChange < -2) {
        recommendations.push(`REDUCE ${h.symbol}: Expected headwinds of ${Math.abs(h.percentageChange).toFixed(1)}%`);
      }
    });

    const bestHoldings = impactedHoldings.sort((a, b) => b.percentageChange - a.percentageChange).slice(0, 2);
    bestHoldings.forEach(h => {
      if (h.percentageChange > 5) {
        recommendations.push(`ADD to ${h.symbol}: Positioned to gain ${h.percentageChange.toFixed(1)}%`);
      }
    });

    // Diversification insight
    const sectorExposure = {};
    impactedHoldings.forEach(h => {
      sectorExposure[h.sector] = (sectorExposure[h.sector] || 0) + h.newValue;
    });

    // Save scenario result
    try {
      await base44.asServiceRole.entities.OrchestratorLog.create({
        action: 'scenarioSimulate',
        status: 'completed',
        metadata: JSON.stringify({
          scenarioName,
          scenarioType,
          portfolioImpactPercent,
          gainersCount,
          losersCount,
        }),
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      // Continue
    }

    return Response.json({
      success: true,
      data: {
        scenario: {
          name: scenarioName,
          type: scenarioType,
          parameters,
        },
        baseline: {
          value: baselineValue,
          holdingCount: holdings.length,
        },
        projection: {
          value: scenarioValue,
          change: portfolioImpact,
          changePercent: portfolioImpactPercent,
          gainersCount,
          losersCount,
        },
        impactedHoldings: impactedHoldings.sort((a, b) => b.absoluteChange - a.absoluteChange),
        sectorExposure,
        recommendations,
        riskMetrics: {
          worstCaseValue: scenarioValue,
          worstCaseDrawdown: portfolioImpactPercent,
          affectedAssets: impactedHoldings.filter(h => Math.abs(h.percentageChange) > 0).length,
        },
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});