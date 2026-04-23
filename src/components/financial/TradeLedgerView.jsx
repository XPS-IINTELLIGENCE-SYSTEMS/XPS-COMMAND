import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, TrendingUp, TrendingDown, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import TradeExplanationModal from "./TradeExplanationModal.jsx";

export default function TradeLedgerView() {
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [explainModalOpen, setExplainModalOpen] = useState(false);

  useEffect(() => {
    loadLedger();
  }, []);

  const loadLedger = async () => {
    const data = await base44.entities.TradeLedger
      .filter({}, '-execution_timestamp', 100)
      .catch(() => []);
    setLedger(data);
    setLoading(false);
  };

  const filtered = ledger.filter(t => 
    t.ticker?.includes(filter.toUpperCase()) || 
    t.cycle_id?.includes(filter)
  );

  const totalPnL = filtered.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const winCount = filtered.filter(t => t.win).length;
  const winRate = filtered.length > 0 ? ((winCount / filtered.length) * 100).toFixed(1) : 0;

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Input 
          placeholder="Filter by ticker or cycle ID..." 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-1"
        />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-card border rounded-lg p-3">
          <div className="text-xs text-muted-foreground">Total Trades</div>
          <div className="text-xl font-bold">{filtered.length}</div>
        </div>
        <div className="bg-card border rounded-lg p-3">
          <div className="text-xs text-muted-foreground">Win Rate</div>
          <div className="text-xl font-bold text-green-400">{winRate}%</div>
        </div>
        <div className={`bg-card border rounded-lg p-3 ${totalPnL >= 0 ? 'border-green-600' : 'border-red-600'}`}>
          <div className="text-xs text-muted-foreground">Total P&L</div>
          <div className={`text-xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)}
          </div>
        </div>
      </div>

      <TradeExplanationModal 
        trade={selectedTrade} 
        open={explainModalOpen} 
        onOpenChange={setExplainModalOpen}
      />

      {/* Trade Ledger */}
      <div className="space-y-2">
        <div className="text-sm font-bold text-muted-foreground">Trade History — Click to explain</div>
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No trades found</div>
        ) : (
          filtered.map((trade, i) => (
            <div 
              key={i} 
              onClick={() => {
                setSelectedTrade(trade);
                setExplainModalOpen(true);
              }}
              className="bg-card border rounded-lg p-3 space-y-2 cursor-pointer hover:border-primary/50 hover:bg-secondary/10 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold">
                  {trade.action === 'BUY' ? 
                    <TrendingUp className="w-4 h-4 text-green-400" /> : 
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  }
                  {trade.ticker} {trade.action}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`font-bold text-sm ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {trade.pnl >= 0 ? '+' : ''}{trade.pnl?.toFixed(2)}
                  </div>
                  <Zap className="w-4 h-4 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              <div className="text-xs text-muted-foreground grid grid-cols-4 gap-2">
                <div>{trade.shares} @ ${trade.entry_price}</div>
                <div>{trade.confidence}% confidence</div>
                <div>{trade.pnl_pct}% {trade.win ? '✓' : '✗'}</div>
                <div>{new Date(trade.execution_timestamp).toLocaleTimeString()}</div>
              </div>

              {trade.groq_reflection && (
                <div className="text-xs bg-secondary/20 rounded p-2 text-muted-foreground italic">
                  "{trade.groq_reflection}"
                </div>
              )}

              <div className="text-[10px] text-muted-foreground/60">Cycle: {trade.cycle_id}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}