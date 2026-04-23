import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Play, Loader2, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import NewsSentimentPanel from "./NewsSentimentPanel.jsx";

export default function LiveTradingSimulator() {
  const [trades, setTrades] = useState([]);
  const [reflection, setReflection] = useState("");
  const [loading, setLoading] = useState(false);
  const [pnl, setPnl] = useState(0);
  const [liveMarketPrices, setLiveMarketPrices] = useState({});
  const [marketSource, setMarketSource] = useState("");
  const [newsSentiment, setNewsSentiment] = useState({});

  const runTrade = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('groqTradingCycle', {});
      if (res.data?.trades) {
        setTrades(res.data.trades);
        setReflection(res.data.reflection);
        setPnl(res.data.pnl);
        setLiveMarketPrices(res.data.liveMarketPrices || {});
        setMarketSource(res.data.marketDataSource || '');
        setNewsSentiment(res.data.newsSentiment || {});
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={runTrade} disabled={loading} className="flex-1 gap-2 bg-primary">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {loading ? 'Groq Trading...' : 'Execute Groq Trading Cycle'}
        </Button>
      </div>

      {marketSource && (
        <div className="text-[10px] text-muted-foreground text-center">
          Market data: {marketSource} • {new Date().toLocaleTimeString()}
        </div>
      )}

      {Object.keys(liveMarketPrices).length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="bg-secondary/20 border rounded-lg p-3">
            <div className="text-xs font-bold text-muted-foreground mb-2">Live Market Prices</div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {Object.entries(liveMarketPrices).map(([ticker, price]) => (
                <div key={ticker} className="bg-background rounded px-2 py-1">
                  <div className="font-bold text-foreground">{ticker}</div>
                  <div className="text-primary">${price.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-secondary/20 border rounded-lg p-3">
            <NewsSentimentPanel sentiment={newsSentiment} />
          </div>
        </div>
      )}

      {trades.length > 0 && (
        <div className="space-y-4">
          <div className="bg-card border rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-2">P&L This Cycle</div>
            <div className={`text-2xl font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}
            </div>
          </div>

          <div className="space-y-2">
            {trades.map((trade, i) => (
              <div key={i} className="bg-card border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm flex items-center gap-2">
                    {trade.action === 'BUY' ? 
                      <TrendingUp className="w-4 h-4 text-green-400" /> : 
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    }
                    {trade.ticker} {trade.action}
                    {trade.livePrice && <RefreshCw className="w-3 h-3 text-blue-400" title="Live Price" />}
                  </div>
                  <div className={`font-bold text-sm ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground grid grid-cols-2 gap-2">
                  <div>{trade.shares} @ ${trade.price.toFixed(2)}</div>
                  <div>{trade.pnl_pct.toFixed(2)}% {trade.win ? '✓' : '✗'}</div>
                  <div>{trade.confidence}% confidence</div>
                  <div>{trade.livePrice ? 'Live Price' : 'Simulated'}</div>
                </div>
              </div>
            ))}
          </div>

          {reflection && (
            <div className="bg-secondary/30 border border-border rounded-lg p-3 text-xs leading-relaxed text-muted-foreground">
              <div className="font-bold text-foreground mb-2">Groq Reflection:</div>
              {reflection}
            </div>
          )}
        </div>
      )}
    </div>
  );
}