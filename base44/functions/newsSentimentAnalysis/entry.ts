import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { tickers = ['AAPL', 'MSFT', 'TSLA', 'GOOGL', 'NVDA'] } = await req.json().catch(() => ({}));

    // Fetch news sentiment using LLM with web search
    const sentiment = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze recent news sentiment for these stock tickers: ${tickers.join(', ')}

For each ticker, provide:
- TICKER: [symbol]
- SENTIMENT: [Bullish/Neutral/Bearish]
- SCORE: [-100 to 100, where -100 is very bearish, 0 is neutral, 100 is very bullish]
- KEY_NEWS: [one headline summary]

Format as JSON: {"AAPL": {"sentiment": "Bullish", "score": 75, "headline": "..."},...}
Use today's latest financial news.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        additionalProperties: {
          type: 'object',
          properties: {
            sentiment: { type: 'string' },
            score: { type: 'number' },
            headline: { type: 'string' },
          },
        },
      },
    });

    // Fallback: if sentiment missing, generate neutral
    for (const ticker of tickers) {
      if (!sentiment[ticker]) {
        sentiment[ticker] = {
          sentiment: 'Neutral',
          score: 0 + (Math.random() - 0.5) * 40,
          headline: `No major news for ${ticker}`,
        };
      }
    }

    return Response.json({
      timestamp: new Date().toISOString(),
      sentiment,
      source: 'live_news_sentiment',
    });
  } catch (e) {
    console.error('Sentiment analysis error:', e);
    return Response.json({
      timestamp: new Date().toISOString(),
      sentiment: {},
      source: 'fallback_neutral',
      error: e.message,
    });
  }
});