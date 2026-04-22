import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { 
  TrendingUp, TrendingDown, AlertCircle, Zap, RefreshCw, 
  Eye, Target, Gauge, Clock, Lightbulb, CheckCircle2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function MarketSentimentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  useEffect(() => {
    loadSentimentData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadSentimentData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadSentimentData = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('marketSentimentAnalyzer', {});
      if (res.data?.data) {
        setData(res.data.data);
        setLastRefresh(new Date());
      }
    } catch (err) {
      console.error('Sentiment load error:', err);
    }
    setLoading(false);
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return null;

  const { 
    marketNews, 
    sentimentScores, 
    strategyMappings, 
    sentimentDrivers, 
    marketRegime 
  } = data;

  // Sentiment color mapping
  const getSentimentColor = (value) => {
    if (value > 0.5) return 'text-green-400';
    if (value > 0.2) return 'text-blue-400';
    if (value > -0.2) return 'text-yellow-400';
    if (value > -0.5) return 'text-orange-400';
    return 'text-red-400';
  };

  const getSentimentBg = (value) => {
    if (value > 0.5) return 'bg-green-500/10 border-green-500/30';
    if (value > 0.2) return 'bg-blue-500/10 border-blue-500/30';
    if (value > -0.2) return 'bg-yellow-500/10 border-yellow-500/30';
    if (value > -0.5) return 'bg-orange-500/10 border-orange-500/30';
    return 'bg-red-500/10 border-red-500/30';
  };

  const getRegimeIcon = () => {
    if (marketRegime === 'Bull Market') return <TrendingUp className="w-5 h-5 text-green-400" />;
    if (marketRegime === 'Risk-On') return <TrendingUp className="w-5 h-5 text-blue-400" />;
    if (marketRegime === 'Risk-Off') return <TrendingDown className="w-5 h-5 text-orange-400" />;
    if (marketRegime === 'Bear Market') return <TrendingDown className="w-5 h-5 text-red-400" />;
    return <Gauge className="w-5 h-5 text-yellow-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Market Sentiment Dashboard</h2>
          <p className="text-xs text-muted-foreground">
            Real-time news sentiment mapped to active strategies
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={loadSentimentData}
          disabled={loading}
          className="gap-2"
        >
          {loading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <RefreshCw className="w-3 h-3" />
          )}
          Refresh
        </Button>
      </div>

      {/* Market Regime */}
      <div className={`border rounded-lg p-4 ${getSentimentBg(sentimentScores.overall)}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {getRegimeIcon()}
            <h3 className="text-lg font-bold">{marketRegime}</h3>
          </div>
          <div className={`text-2xl font-bold ${getSentimentColor(sentimentScores.overall)}`}>
            {(sentimentScores.overall * 100).toFixed(0)}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Market sentiment on -100 (bearish) to +100 (bullish) scale
        </p>
      </div>

      {/* Sector Sentiment Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.entries(sentimentScores).filter(([k]) => k !== 'overall').map(([sector, score]) => (
          <div key={sector} className={`border rounded-lg p-3 ${getSentimentBg(score)}`}>
            <div className="text-[10px] text-muted-foreground uppercase font-semibold mb-2 capitalize">
              {sector}
            </div>
            <div className={`text-lg font-bold ${getSentimentColor(score)}`}>
              {(score * 100).toFixed(0)}
            </div>
            <div className="text-[9px] text-muted-foreground mt-1">
              {score > 0.3 ? '↑ Bullish' : score > -0.3 ? '→ Neutral' : '↓ Bearish'}
            </div>
          </div>
        ))}
      </div>

      {/* Latest Market News */}
      <div className="bg-card border rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          Latest Market News
        </h3>
        <div className="space-y-2">
          {marketNews.map((news, i) => (
            <div key={i} className="flex items-start gap-3 pb-2 border-b border-border last:border-b-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{news.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-muted-foreground">{news.source}</span>
                  <span className="text-[10px] text-muted-foreground">•</span>
                  <span className="text-[10px] text-muted-foreground">{news.timeAgo}</span>
                </div>
              </div>
              <div className="flex-shrink-0 flex flex-col items-end gap-1">
                <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  news.impact === 'positive' ? 'bg-green-500/20 text-green-400' :
                  news.impact === 'negative' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {news.impact === 'positive' ? '↑' : news.impact === 'negative' ? '↓' : '→'}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {(news.relevance * 100).toFixed(0)}% relevant
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sentiment Drivers */}
      <div className="bg-card border rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-primary" />
          Key Sentiment Drivers
        </h3>
        <div className="space-y-3">
          {sentimentDrivers.map((driver, i) => (
            <div key={i} className="border border-border/50 rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold">{driver.category}</p>
                  <p className="text-xs text-muted-foreground mt-1">{driver.description}</p>
                </div>
                <div className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ml-2 ${
                  driver.sentiment === 'positive' ? 'bg-green-500/20 text-green-400' :
                  driver.sentiment === 'negative' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {driver.sentiment}
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-muted-foreground">Impact:</span>
                <div className="flex-1 bg-secondary rounded-full h-1.5">
                  <div 
                    className={`h-full rounded-full ${
                      driver.impact === 'high' ? 'bg-primary' : 'bg-primary/50'
                    }`}
                    style={{ width: `${(Math.abs(driver.influence) * 100)}%` }}
                  />
                </div>
                <span className={driver.influence > 0 ? 'text-green-400' : 'text-red-400'}>
                  {driver.influence > 0 ? '+' : ''}{(driver.influence * 100).toFixed(0)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strategy Recommendations */}
      <div className="bg-card border rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          Sentiment-Mapped Strategy Recommendations
        </h3>
        <div className="space-y-3">
          {strategyMappings.map((strategy, i) => {
            const signalColors = {
              buy: 'bg-green-500/10 border-green-500/30 text-green-400',
              hold: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
              sell: 'bg-red-500/10 border-red-500/30 text-red-400',
            };

            return (
              <div key={i} className={`border rounded-lg p-3 ${signalColors[strategy.actionSignal]}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold">{strategy.bucketName}</p>
                    <p className="text-xs text-foreground/70 mt-1">{strategy.recommendation}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-3">
                    <div className={`text-xs font-bold px-3 py-1 rounded-full uppercase whitespace-nowrap ${signalColors[strategy.actionSignal]}`}>
                      {strategy.actionSignal}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {(strategy.confidence * 100).toFixed(0)}% confidence
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-muted-foreground">Confidence:</span>
                  <div className="flex-1 bg-secondary rounded-full h-1.5">
                    <div 
                      className="bg-primary rounded-full h-full"
                      style={{ width: `${(strategy.confidence * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Refresh Status */}
      <div className="text-center text-[10px] text-muted-foreground">
        {lastRefresh && (
          <>Last updated: {lastRefresh.toLocaleTimeString()} • Auto-refreshes every 5 minutes</>
        )}
      </div>
    </div>
  );
}