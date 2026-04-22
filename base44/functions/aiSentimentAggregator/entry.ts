import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { action = 'analyze', symbols = [] } = payload;

    if (symbols.length === 0) {
      return Response.json({ error: 'No symbols provided' }, { status: 400 });
    }

    // Simulated sentiment data per ticker
    const sentimentData = {
      'AAPL': {
        company: 'Apple Inc.',
        sector: 'Technology',
        news: [
          { date: '2026-04-22', headline: 'Apple launches new AI features', sentiment: 0.85, source: 'TechNews' },
          { date: '2026-04-20', headline: 'iPhone sales exceed expectations', sentiment: 0.75, source: 'Bloomberg' },
          { date: '2026-04-18', headline: 'Regulatory scrutiny on App Store', sentiment: -0.4, source: 'Reuters' },
        ],
        social: {
          bullish: 72,
          bearish: 18,
          neutral: 10,
          trend: 'up',
          volume: 4521,
        },
        earnings: {
          nextDate: '2026-07-15',
          sentiment: 0.68,
          estimate: 6.05,
          consensus: 5.95,
          whisper: 6.15,
        },
      },
      'MSFT': {
        company: 'Microsoft Corporation',
        sector: 'Technology',
        news: [
          { date: '2026-04-21', headline: 'Microsoft Copilot integration expands', sentiment: 0.80, source: 'TechCrunch' },
          { date: '2026-04-19', headline: 'Azure cloud growth slows', sentiment: -0.3, source: 'MarketWatch' },
          { date: '2026-04-17', headline: 'Enterprise AI adoption accelerates', sentiment: 0.72, source: 'Forbes' },
        ],
        social: {
          bullish: 68,
          bearish: 22,
          neutral: 10,
          trend: 'up',
          volume: 3842,
        },
        earnings: {
          nextDate: '2026-07-20',
          sentiment: 0.70,
          estimate: 2.96,
          consensus: 2.85,
          whisper: 3.10,
        },
      },
      'GOOGL': {
        company: 'Alphabet Inc.',
        sector: 'Technology',
        news: [
          { date: '2026-04-22', headline: 'Google Search market share rises', sentiment: 0.65, source: 'SearchNews' },
          { date: '2026-04-20', headline: 'Antitrust case settlement possible', sentiment: -0.55, source: 'LegalNews' },
          { date: '2026-04-16', headline: 'YouTube ad revenue strong', sentiment: 0.72, source: 'Investor' },
        ],
        social: {
          bullish: 58,
          bearish: 32,
          neutral: 10,
          trend: 'mixed',
          volume: 2987,
        },
        earnings: {
          nextDate: '2026-07-25',
          sentiment: 0.62,
          estimate: 1.99,
          consensus: 1.87,
          whisper: 2.05,
        },
      },
      'NVDA': {
        company: 'NVIDIA Corporation',
        sector: 'Semiconductors',
        news: [
          { date: '2026-04-21', headline: 'AI chip demand remains strong', sentiment: 0.88, source: 'SemiNews' },
          { date: '2026-04-19', headline: 'Supply chain disruptions easing', sentiment: 0.70, source: 'Reuters' },
          { date: '2026-04-17', headline: 'Competitor releases rival chip', sentiment: -0.35, source: 'TechNews' },
        ],
        social: {
          bullish: 80,
          bearish: 10,
          neutral: 10,
          trend: 'up',
          volume: 5234,
        },
        earnings: {
          nextDate: '2026-05-29',
          sentiment: 0.82,
          estimate: 5.57,
          consensus: 5.32,
          whisper: 5.75,
        },
      },
      'AMZN': {
        company: 'Amazon.com Inc.',
        sector: 'Consumer',
        news: [
          { date: '2026-04-20', headline: 'AWS revenue growth accelerates', sentiment: 0.77, source: 'TechNews' },
          { date: '2026-04-18', headline: 'Retail margins under pressure', sentiment: -0.45, source: 'RetailDaily' },
          { date: '2026-04-15', headline: 'Amazon Prime benefits expanded', sentiment: 0.68, source: 'ConsumerNews' },
        ],
        social: {
          bullish: 65,
          bearish: 25,
          neutral: 10,
          trend: 'neutral',
          volume: 3621,
        },
        earnings: {
          nextDate: '2026-04-28',
          sentiment: 0.69,
          estimate: 0.94,
          consensus: 0.86,
          whisper: 0.98,
        },
      },
    };

    // Analyze sentiment for requested symbols
    const analysis = symbols
      .map(symbol => {
        const data = sentimentData[symbol.toUpperCase()];
        
        if (!data) {
          return {
            symbol,
            error: 'No sentiment data available',
            score: null,
          };
        }

        // Calculate aggregate sentiment score (-1 to 1)
        const newsAvg = data.news.length > 0
          ? data.news.reduce((s, n) => s + n.sentiment, 0) / data.news.length
          : 0;

        const socialScore = ((data.social.bullish - data.social.bearish) / 100);
        const earningsScore = data.earnings.sentiment || 0;

        // Weighted average: news 40%, social 35%, earnings 25%
        const aggregateScore = (newsAvg * 0.4) + (socialScore * 0.35) + (earningsScore * 0.25);

        // Determine sentiment label
        let sentimentLabel = 'NEUTRAL';
        let signal = 'HOLD';
        if (aggregateScore > 0.5) {
          sentimentLabel = 'STRONG BULLISH';
          signal = 'BUY';
        } else if (aggregateScore > 0.2) {
          sentimentLabel = 'BULLISH';
          signal = 'BUY';
        } else if (aggregateScore < -0.5) {
          sentimentLabel = 'STRONG BEARISH';
          signal = 'SELL';
        } else if (aggregateScore < -0.2) {
          sentimentLabel = 'BEARISH';
          signal = 'SELL';
        }

        // Identify risks
        const risks = [];
        const negativeNews = data.news.filter(n => n.sentiment < -0.3);
        if (negativeNews.length > 0) {
          risks.push(`Negative headlines: ${negativeNews.map(n => n.headline).join(', ')}`);
        }
        if (data.social.bearish > 40) {
          risks.push(`High social bearish sentiment (${data.social.bearish}%)`);
        }
        if (Math.abs(data.earnings.estimate - data.earnings.consensus) > 0.2) {
          risks.push(`Large EPS estimate variance (${(data.earnings.estimate - data.earnings.consensus).toFixed(2)})`);
        }

        return {
          symbol,
          company: data.company,
          sector: data.sector,
          score: aggregateScore,
          scorePercent: ((aggregateScore + 1) / 2 * 100).toFixed(0),
          sentiment: sentimentLabel,
          signal,
          news: data.news,
          newsAvgSentiment: newsAvg.toFixed(2),
          social: data.social,
          socialSentiment: socialScore.toFixed(2),
          earnings: data.earnings,
          earningSentiment: earningsScore.toFixed(2),
          risks,
          recommendation:
            aggregateScore > 0.6 ? 'Strong accumulation signal'
            : aggregateScore > 0.2 ? 'Positive momentum, consider adding'
            : aggregateScore < -0.6 ? 'Critical risk, consider reducing exposure'
            : aggregateScore < -0.2 ? 'Negative sentiment, monitor closely'
            : 'Mixed signals, maintain position',
        };
      })
      .filter(a => !a.error);

    // Save sentiment analysis
    try {
      await base44.asServiceRole.entities.OrchestratorLog.create({
        action: 'aiSentimentAggregator',
        status: 'completed',
        metadata: JSON.stringify({
          symbolsAnalyzed: analysis.length,
          avgScore: analysis.length > 0
            ? (analysis.reduce((s, a) => s + a.score, 0) / analysis.length).toFixed(2)
            : 0,
        }),
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      // Continue
    }

    return Response.json({
      success: true,
      data: {
        analysis,
        summary: {
          totalSymbols: analysis.length,
          bullishCount: analysis.filter(a => a.score > 0.2).length,
          bearishCount: analysis.filter(a => a.score < -0.2).length,
          avgScore: analysis.length > 0
            ? (analysis.reduce((s, a) => s + a.score, 0) / analysis.length).toFixed(2)
            : 0,
        },
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});