import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { action = 'analyze' } = payload;

    // Fetch current portfolios for trade context
    const portfolios = await base44.asServiceRole.entities.FinancialPortfolio.filter({}, '-updated_date', 5);
    
    if (portfolios.length === 0) {
      return Response.json({ error: 'No portfolios found' }, { status: 400 });
    }

    // Simulated market news data (in production, would call real news API)
    const marketNews = [
      { 
        title: 'Fed Signals Potential Rate Hold', 
        source: 'Bloomberg', 
        timeAgo: '2h',
        impact: 'positive',
        relevance: 0.92
      },
      { 
        title: 'Tech Stocks Rally on AI Earnings Beat', 
        source: 'Reuters', 
        timeAgo: '3h',
        impact: 'positive',
        relevance: 0.88
      },
      { 
        title: 'Oil Prices Surge on Supply Concerns', 
        source: 'MarketWatch', 
        timeAgo: '1h',
        impact: 'negative',
        relevance: 0.75
      },
      { 
        title: 'Crypto Market Stabilizes Post-Regulation', 
        source: 'CoinDesk', 
        timeAgo: '4h',
        impact: 'neutral',
        relevance: 0.68
      },
      { 
        title: 'Manufacturing Data Misses Expectations', 
        source: 'Financial Times', 
        timeAgo: '5h',
        impact: 'negative',
        relevance: 0.82
      },
    ];

    // Sentiment scoring (would use LLM in production)
    const sentimentScores = {
      overall: 0.58, // -1 to 1 scale: 0.58 = moderately bullish
      tech: 0.72,
      finance: 0.45,
      energy: -0.35,
      crypto: 0.15,
      macro: -0.12,
    };

    // Map portfolios to sentiment-driven recommendations
    const strategyMappings = portfolios.map((p) => {
      const bucketName = p.bucket_name || 'Unknown';
      let recommendation = '';
      let actionSignal = 'hold';
      let confidence = 0;

      // Determine action based on sentiment and bucket type
      if (bucketName.includes('Tech') || bucketName.includes('Growth')) {
        if (sentimentScores.tech > 0.6) {
          recommendation = `Strong tech sentiment (${(sentimentScores.tech * 100).toFixed(0)}%) supports increasing growth exposure. AI earnings driving bullish momentum.`;
          actionSignal = 'buy';
          confidence = sentimentScores.tech;
        } else {
          recommendation = `Moderate tech sentiment suggests cautious positioning. Monitor earnings surprises.`;
          actionSignal = 'hold';
          confidence = 0.5;
        }
      } else if (bucketName.includes('Defensive') || bucketName.includes('Stable')) {
        if (sentimentScores.overall < 0.5) {
          recommendation = `Market risk rising due to macro concerns. Defensive positioning justified.`;
          actionSignal = 'hold';
          confidence = 0.7;
        } else {
          recommendation = `Positive overall sentiment. Consider slight rotation toward growth.`;
          actionSignal = 'buy';
          confidence = 0.55;
        }
      } else if (bucketName.includes('Energy') || bucketName.includes('Commodity')) {
        if (sentimentScores.energy < -0.2) {
          recommendation = `Energy sector under pressure from supply dynamics. Monitor geopolitical risks.`;
          actionSignal = 'sell';
          confidence = Math.abs(sentimentScores.energy);
        } else {
          recommendation = `Oil stability supports energy valuations. Volatility creates opportunities.`;
          actionSignal = 'hold';
          confidence = 0.6;
        }
      } else {
        recommendation = `Overall market sentiment is ${sentimentScores.overall > 0.5 ? 'bullish' : 'bearish'}. Mixed signals across sectors.`;
        actionSignal = 'hold';
        confidence = Math.abs(sentimentScores.overall);
      }

      return {
        bucketName,
        currentBalance: p.current_balance || 0,
        recommendation,
        actionSignal,
        confidence: Math.min(confidence, 0.95),
        lastUpdate: new Date().toISOString(),
      };
    });

    // Identify dominant sentiment drivers
    const sentimentDrivers = [
      {
        category: 'Fed Policy',
        sentiment: 'positive',
        impact: 'high',
        description: 'Rate hold signals could reduce bond pressure',
        influence: 0.78,
      },
      {
        category: 'Tech Earnings',
        sentiment: 'positive',
        impact: 'high',
        description: 'AI-driven earnings beat tech sector narrative',
        influence: 0.72,
      },
      {
        category: 'Macro Data',
        sentiment: 'negative',
        impact: 'medium',
        description: 'Manufacturing weakness hints at slowdown risks',
        influence: -0.45,
      },
      {
        category: 'Geopolitics',
        sentiment: 'mixed',
        impact: 'medium',
        description: 'Oil supply concerns offset by market resilience',
        influence: 0.15,
      },
    ];

    // Calculate market regime
    const marketRegime = sentimentScores.overall > 0.6 ? 'Bull Market' :
                       sentimentScores.overall > 0.3 ? 'Risk-On' :
                       sentimentScores.overall > -0.3 ? 'Neutral' :
                       sentimentScores.overall > -0.6 ? 'Risk-Off' : 'Bear Market';

    // Save analysis to log
    try {
      await base44.asServiceRole.entities.OrchestratorLog.create({
        action: 'marketSentimentAnalyze',
        status: 'completed',
        metadata: JSON.stringify({
          overallSentiment: sentimentScores.overall,
          marketRegime,
          newsCount: marketNews.length,
        }),
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      // Continue
    }

    return Response.json({
      success: true,
      data: {
        marketNews,
        sentimentScores,
        strategyMappings,
        sentimentDrivers,
        marketRegime,
        analysisTime: new Date().toISOString(),
        confidenceScore: Math.min(...strategyMappings.map(s => s.confidence)),
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});