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
      shockType = 'custom', 
      shockMagnitude = -5, // percentage
      volatilitySpikePercent = 20, // volatility increase
      durationDays = 5,
      action = 'run' 
    } = payload;

    // Fetch current portfolios
    const portfolios = await base44.asServiceRole.entities.FinancialPortfolio.filter({});
    
    if (portfolios.length === 0) {
      return Response.json({ error: 'No portfolios found. Initialize sandbox first.' }, { status: 400 });
    }

    // Predefined historical shocks
    const historicalShocks = {
      '2008_crisis': { magnitude: -50, volatility: 80, days: 30 },
      'covid_crash': { magnitude: -35, volatility: 65, days: 14 },
      '2020_flash_crash': { magnitude: -12, volatility: 45, days: 1 },
      'moderate_correction': { magnitude: -8, volatility: 30, days: 7 },
      'high_volatility': { magnitude: -5, volatility: 50, days: 5 },
      'black_monday': { magnitude: -22, volatility: 70, days: 5 },
    };

    // Determine shock parameters
    let activeMagnitude = shockMagnitude;
    let activeVolatility = volatilitySpikePercent;
    let activeDuration = durationDays;

    if (historicalShocks[shockType]) {
      const shock = historicalShocks[shockType];
      activeMagnitude = shock.magnitude;
      activeVolatility = shock.volatility;
      activeDuration = shock.days;
    }

    // Calculate baseline portfolio value
    const baselineValue = portfolios.reduce((s, p) => s + (p.current_balance || 0), 0);
    const baselinePnL = portfolios.reduce((s, p) => s + (p.total_gain_loss || 0), 0);

    // Simulate shock impact
    const stressResults = {
      shockType,
      shockMagnitude: activeMagnitude,
      volatilitySpike: activeVolatility,
      durationDays: activeDuration,
      baselineValue,
      baselinePnL,
      portfolios: [],
      dailyImpact: [],
      stressMetrics: {
        maxLoss: 0,
        maxLossPercent: 0,
        recoveryDays: 0,
        avgVolatility: activeVolatility,
        portfolioResilience: 0,
        sharpeUnderStress: 0,
      },
      bucketImpact: [],
      recommendations: [],
    };

    // Simulate daily movement under shock conditions
    let currentValue = baselineValue;
    let worstValue = baselineValue;
    let recoveredDay = -1;
    const recoveryTarget = baselineValue + (baselineValue * 0.01); // 1% recovery

    for (let day = 0; day < activeDuration; day++) {
      // Day 1: sharp initial impact, subsequent days: recovery/stabilization
      let dayReturn;
      if (day === 0) {
        dayReturn = activeMagnitude / 100;
      } else {
        // Gradual recovery with volatility
        const recoveryFactor = 0.3 + Math.random() * 0.4; // 30-70% recovery daily
        dayReturn = (activeMagnitude * (1 - recoveryFactor * day / activeDuration)) / 100;
      }

      // Apply volatility spike
      const volatilityAdjustment = (Math.random() - 0.5) * (activeVolatility / 100);
      dayReturn += volatilityAdjustment;

      currentValue = currentValue * (1 + dayReturn);
      worstValue = Math.min(worstValue, currentValue);

      if (recoveredDay === -1 && currentValue >= recoveryTarget) {
        recoveredDay = day;
      }

      stressResults.dailyImpact.push({
        day: day + 1,
        portfolioValue: currentValue,
        dailyReturn: dayReturn * 100,
        totalImpact: ((currentValue - baselineValue) / baselineValue) * 100,
      });
    }

    // Calculate stress metrics
    stressResults.stressMetrics.maxLoss = worstValue - baselineValue;
    stressResults.stressMetrics.maxLossPercent = (stressResults.stressMetrics.maxLoss / baselineValue) * 100;
    stressResults.stressMetrics.recoveryDays = recoveredDay > 0 ? recoveredDay : activeDuration + 10;
    stressResults.stressMetrics.portfolioResilience = ((currentValue - worstValue) / Math.abs(worstValue - baselineValue)) * 100;
    stressResults.stressMetrics.sharpeUnderStress = (stressResults.stressMetrics.portfolioResilience / activeVolatility) * 2.5;

    // Simulate impact per bucket
    for (const portfolio of portfolios) {
      const bucketValue = portfolio.current_balance || 0;
      const bucketStressLoss = (bucketValue / baselineValue) * stressResults.stressMetrics.maxLoss;
      
      stressResults.bucketImpact.push({
        bucketName: portfolio.bucket_name || 'Unknown',
        baselineValue: bucketValue,
        maxLoss: bucketStressLoss,
        maxLossPercent: (bucketStressLoss / bucketValue) * 100,
      });
    }

    // Generate recommendations
    if (stressResults.stressMetrics.maxLossPercent < -30) {
      stressResults.recommendations.push('⚠️ Portfolio would suffer severe losses under this shock. Consider risk reduction.');
    } else if (stressResults.stressMetrics.maxLossPercent < -15) {
      stressResults.recommendations.push('⚠️ Significant portfolio decline possible. Review diversification.');
    }

    if (stressResults.stressMetrics.portfolioResilience > 70) {
      stressResults.recommendations.push('✓ Portfolio shows strong recovery potential after initial shock.');
    }

    if (stressResults.stressMetrics.recoveryDays > 14) {
      stressResults.recommendations.push('📊 Recovery timeline extends beyond 2 weeks. Consider hedging strategies.');
    } else if (stressResults.stressMetrics.recoveryDays <= 5) {
      stressResults.recommendations.push('✓ Quick recovery expected. Portfolio structure is resilient.');
    }

    // Save stress test result
    try {
      await base44.asServiceRole.entities.OrchestratorLog.create({
        action: 'stressTestSandbox',
        status: 'completed',
        metadata: JSON.stringify({
          shockType,
          maxLossPercent: stressResults.stressMetrics.maxLossPercent,
          recoveryDays: stressResults.stressMetrics.recoveryDays,
        }),
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      // Continue even if save fails
    }

    return Response.json({
      success: true,
      data: stressResults,
      executionTime: `${Date.now()}ms`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});