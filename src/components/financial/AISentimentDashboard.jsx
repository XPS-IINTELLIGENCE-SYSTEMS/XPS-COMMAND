import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, TrendingDown, AlertCircle, Newspaper, Users, DollarSign } from 'lucide-react';

const DEFAULT_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'AMZN'];

export default function AISentimentDashboard() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [symbols, setSymbols] = useState(DEFAULT_SYMBOLS);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [newSymbol, setNewSymbol] = useState('');

  useEffect(() => {
    analyzeSentiment();
  }, [symbols]);

  const analyzeSentiment = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('aiSentimentAggregator', {
        action: 'analyze',
        symbols,
      });
      if (res.data?.data) {
        setAnalysis(res.data.data);
      }
    } catch (err) {
      console.error('Sentiment analysis error:', err);
    }
    setLoading(false);
  };

  const addSymbol = () => {
    if (newSymbol && !symbols.includes(newSymbol.toUpperCase())) {
      setSymbols([...symbols, newSymbol.toUpperCase()]);
      setNewSymbol('');
    }
  };

  const removeSymbol = (sym) => {
    setSymbols(symbols.filter(s => s !== sym));
  };

  const getSentimentColor = (score) => {
    if (score > 0.5) return 'text-green-400';
    if (score > 0.2) return 'text-lime-400';
    if (score < -0.5) return 'text-red-400';
    if (score < -0.2) return 'text-orange-400';
    return 'text-yellow-400';
  };

  const getSentimentBg = (score) => {
    if (score > 0.5) return 'bg-green-500/10 border-green-500/30';
    if (score > 0.2) return 'bg-lime-500/10 border-lime-500/30';
    if (score < -0.5) return 'bg-red-500/10 border-red-500/30';
    if (score < -0.2) return 'bg-orange-500/10 border-orange-500/30';
    return 'bg-yellow-500/10 border-yellow-500/30';
  };

  if (loading && !analysis) {
    return (
      <div className="flex items-center justify-center py-12 bg-card border rounded-lg">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-card border rounded-lg p-4 text-center text-muted-foreground">
        No sentiment data available
      </div>
    );
  }

  const selectedData = analysis?.analysis?.find(a => a.symbol === selectedSymbol) || analysis?.analysis?.[0];

  return (
    <div className="space-y-4">
      {/* Add Symbol Section */}
      <div className="bg-card border rounded-lg p-3 space-y-2">
        <h3 className="text-xs font-semibold">Add Symbol</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
            onKeyPress={(e) => e.key === 'Enter' && addSymbol()}
            placeholder="Ticker symbol"
            maxLength="5"
            className="flex-1 px-2 py-1.5 border border-border rounded bg-secondary text-xs"
          />
          <Button onClick={addSymbol} size="sm" variant="outline">Add</Button>
        </div>
      </div>

      {/* Symbol Pills */}
      <div className="flex flex-wrap gap-2">
        {symbols.map((sym) => (
          <button
            key={sym}
            onClick={() => setSelectedSymbol(selectedSymbol === sym ? null : sym)}
            className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
              selectedSymbol === sym
                ? 'bg-primary/20 border-primary/50 text-primary'
                : 'bg-card border-border hover:border-primary/30'
            }`}
          >
            {sym}
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeSymbol(sym);
              }}
              className="ml-1.5 text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          </button>
        ))}
      </div>

      {!analysis || analysis.analysis.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          Loading sentiment data...
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2">
              <div className="text-[10px] text-muted-foreground uppercase">Bullish</div>
              <div className="text-lg font-bold text-green-400">{analysis.summary.bullishCount}</div>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2">
              <div className="text-[10px] text-muted-foreground uppercase">Neutral</div>
              <div className="text-lg font-bold text-yellow-400">
                {analysis.summary.totalSymbols - analysis.summary.bullishCount - analysis.summary.bearishCount}
              </div>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2">
              <div className="text-[10px] text-muted-foreground uppercase">Bearish</div>
              <div className="text-lg font-bold text-red-400">{analysis.summary.bearishCount}</div>
            </div>
          </div>

          {/* Main Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Symbol List */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold">Holdings Sentiment</h3>
              {analysis.analysis.map((item) => (
                <button
                  key={item.symbol}
                  onClick={() => setSelectedSymbol(item.symbol)}
                  className={`w-full p-2 rounded-lg border text-left transition-all ${
                    selectedSymbol === item.symbol
                      ? 'bg-primary/10 border-primary/50'
                      : `${getSentimentBg(item.score)} hover:border-primary/30`
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-semibold text-xs">{item.symbol}</p>
                    <span className={`text-xs font-bold ${getSentimentColor(item.score)}`}>
                      {(item.scorePercent / 100 * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">{item.sentiment}</p>
                </button>
              ))}
            </div>

            {/* Detailed Analysis */}
            {selectedData && (
              <div className="md:col-span-2 space-y-3">
                {/* Header */}
                <div className={`border rounded-lg p-3 ${getSentimentBg(selectedData.score)}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-lg font-bold">{selectedData.symbol}</p>
                      <p className="text-xs text-muted-foreground">{selectedData.company} • {selectedData.sector}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getSentimentColor(selectedData.score)}`}>
                        {(selectedData.scorePercent)}%
                      </div>
                      <p className="text-xs text-muted-foreground">{selectedData.sentiment}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={`text-xs ${
                      selectedData.signal === 'BUY' ? 'bg-green-500/20 text-green-400' :
                      selectedData.signal === 'SELL' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {selectedData.signal}
                    </Badge>
                    <p className="text-xs text-muted-foreground flex-1">{selectedData.recommendation}</p>
                  </div>
                </div>

                {/* Sentiment Breakdown */}
                <div className="bg-card border rounded-lg p-3 space-y-2">
                  <h4 className="text-xs font-semibold">Sentiment Sources</h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Newspaper className="w-3 h-3 text-blue-400" />
                        <span>News</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-400"
                            style={{ width: `${((parseFloat(selectedData.newsAvgSentiment) + 1) / 2 * 100)}%` }}
                          />
                        </div>
                        <span className="w-10 text-right font-semibold">{selectedData.newsAvgSentiment}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3 text-purple-400" />
                        <span>Social</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-400"
                            style={{ width: `${((parseFloat(selectedData.socialSentiment) + 1) / 2 * 100)}%` }}
                          />
                        </div>
                        <span className="w-10 text-right font-semibold">{selectedData.socialSentiment}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-3 h-3 text-green-400" />
                        <span>Earnings</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-400"
                            style={{ width: `${((parseFloat(selectedData.earningSentiment) + 1) / 2 * 100)}%` }}
                          />
                        </div>
                        <span className="w-10 text-right font-semibold">{selectedData.earningSentiment}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* News Feed */}
                <div className="bg-card border rounded-lg p-3 space-y-2">
                  <h4 className="text-xs font-semibold">Recent News</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedData.news.map((article, i) => (
                      <div key={i} className="text-[10px] p-2 bg-secondary/30 rounded border border-border/50">
                        <p className="font-semibold line-clamp-2">{article.headline}</p>
                        <div className="flex justify-between mt-1 text-muted-foreground">
                          <span>{article.source}</span>
                          <span className={getSentimentColor(article.sentiment)}>
                            {article.sentiment > 0 ? '↑' : article.sentiment < 0 ? '↓' : '→'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risks */}
                {selectedData.risks.length > 0 && (
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 space-y-1">
                    <h4 className="text-xs font-semibold text-orange-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Risk Factors
                    </h4>
                    {selectedData.risks.map((risk, i) => (
                      <p key={i} className="text-[10px] text-muted-foreground">• {risk}</p>
                    ))}
                  </div>
                )}

                {/* Earnings */}
                <div className="bg-card border rounded-lg p-3">
                  <h4 className="text-xs font-semibold mb-2">Next Earnings</h4>
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <div>
                      <span className="text-muted-foreground block">Date</span>
                      <span className="font-semibold">{new Date(selectedData.earnings.nextDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Est. EPS</span>
                      <span className="font-semibold">${selectedData.earnings.estimate.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Whisper</span>
                      <span className="font-semibold text-primary">${selectedData.earnings.whisper.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Refresh Button */}
      <Button
        variant="outline"
        onClick={analyzeSentiment}
        disabled={loading}
        className="w-full gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '🔄'}
        {loading ? 'Analyzing...' : 'Refresh Sentiment'}
      </Button>
    </div>
  );
}