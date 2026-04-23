import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Send, Loader2, Sparkles } from "lucide-react";

export default function PortfolioQueryInterface() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const handleQuery = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await base44.functions.invoke('portfolioNLQuery', { query });
      if (res.data) {
        setResult(res.data);
        setHistory([res.data, ...history].slice(0, 10));
        setQuery("");
      }
    } catch (e) {
      console.error(e);
      setResult({ error: "Failed to analyze query" });
    }
    setLoading(false);
  };

  const suggestedQueries = [
    "What was my best performing trade this month?",
    "Show me all tech trades with over 80% confidence",
    "Which sector had the highest P&L?",
    "Compare my buy vs sell performance",
    "What's my win rate for high confidence trades?",
  ];

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Query Input */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-foreground">Ask about your portfolio</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
            placeholder="e.g., What was my best performing sector this month?"
            className="flex-1 px-4 py-2 bg-secondary border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
          />
          <Button
            onClick={handleQuery}
            disabled={loading || !query.trim()}
            className="gap-2 bg-primary"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Suggested Queries */}
      {!result && history.length === 0 && (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Suggested questions:</div>
          <div className="flex flex-wrap gap-2">
            {suggestedQueries.map((sq, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(sq);
                }}
                className="text-xs px-3 py-1 bg-secondary/50 hover:bg-secondary border rounded-full text-foreground transition-colors"
              >
                {sq}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="bg-secondary/20 border rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-bold text-foreground mb-2">{result.query}</div>
              {result.error ? (
                <div className="text-sm text-red-400">{result.error}</div>
              ) : (
                <>
                  <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap mb-3">
                    {result.analysis}
                  </div>

                  {/* Quick Stats */}
                  {result.insights && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-border">
                      <div>
                        <div className="text-xs text-muted-foreground">Total Trades</div>
                        <div className="font-bold text-foreground">{result.insights.total_trades}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Total P&L</div>
                        <div className={`font-bold ${result.insights.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ${result.insights.total_pnl.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Win Rate</div>
                        <div className="font-bold text-foreground">{result.insights.win_rate}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">High Conf.</div>
                        <div className="font-bold text-foreground">{result.insights.high_confidence_trades}</div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Query History */}
      {history.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-bold text-muted-foreground">Recent Queries</div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {history.map((h, i) => (
              <button
                key={i}
                onClick={() => setResult(h)}
                className="w-full text-left px-3 py-2 bg-secondary/30 hover:bg-secondary/50 rounded-lg text-sm text-foreground transition-colors"
              >
                {h.query}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}