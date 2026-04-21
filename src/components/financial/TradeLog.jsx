import { useState } from "react";
import { ArrowUpRight, ArrowDownRight, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const BUCKET_LABELS = { low_risk: 'Low', mid_risk: 'Mid', high_risk: 'High', day_trading: 'Day', business_venture: 'Biz' };
const BUCKET_COLORS = { low_risk: '#22c55e', mid_risk: '#f59e0b', high_risk: '#ef4444', day_trading: '#8b5cf6', business_venture: '#d4af37' };

export default function TradeLog({ portfolios, selectedBucket }) {
  const [expandedTrade, setExpandedTrade] = useState(null);

  const allTrades = [];
  for (const p of portfolios) {
    if (selectedBucket && p.bucket !== selectedBucket) continue;
    let trades = [];
    try { trades = JSON.parse(p.trade_history || '[]'); } catch {}
    for (const t of trades) allTrades.push({ ...t, bucket: t.bucket || p.bucket });
  }
  allTrades.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-foreground">Trade Log (Live)</h3>
        <span className="text-[10px] text-muted-foreground">{allTrades.length} trades</span>
      </div>
      <div className="space-y-1.5 max-h-[450px] overflow-y-auto">
        {allTrades.map((trade, i) => {
          const isProfit = (trade.pnl || 0) >= 0;
          const isExpanded = expandedTrade === i;
          return (
            <div key={i} className="border border-border/50 rounded-lg p-2.5 hover:bg-white/[0.02] transition-colors cursor-pointer"
              onClick={() => setExpandedTrade(isExpanded ? null : i)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  {isProfit ? <ArrowUpRight className="w-3.5 h-3.5 text-green-400 flex-shrink-0" /> : <ArrowDownRight className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-foreground uppercase">{trade.action || 'TRADE'}</span>
                      <span className="text-[11px] text-foreground">{trade.ticker || trade.asset || '—'}</span>
                      {trade.live_price && <span className="text-[9px] text-muted-foreground">@${trade.live_price}</span>}
                    </div>
                    <div className="text-[9px] text-muted-foreground">
                      {trade.date ? new Date(trade.date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className={`text-[11px] font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                    {isProfit ? '+' : ''}${(trade.pnl || 0).toFixed(2)}
                  </div>
                  <Badge className="text-[7px] px-1.5 py-0" style={{ backgroundColor: `${BUCKET_COLORS[trade.bucket]}20`, color: BUCKET_COLORS[trade.bucket] }}>
                    {BUCKET_LABELS[trade.bucket] || '—'}
                  </Badge>
                  {isExpanded ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
                </div>
              </div>
              {isExpanded && (
                <div className="mt-2 pt-2 border-t border-border/30 space-y-1.5">
                  {trade.reason && (
                    <div className="text-[10px] text-foreground/80 leading-relaxed bg-white/[0.02] rounded-md p-2">
                      <span className="font-bold text-primary">Reason: </span>{trade.reason}
                    </div>
                  )}
                  {trade.market_context && (
                    <div className="text-[9px] text-muted-foreground">
                      <span className="text-foreground/60 font-semibold">Market: </span>{trade.market_context}
                    </div>
                  )}
                  <div className="flex gap-4 text-[9px] text-muted-foreground">
                    {trade.live_price && <span>Price: ${trade.live_price}</span>}
                    {trade.shares && <span>Shares: {trade.shares}</span>}
                    {trade.amount && <span>Amount: ${trade.amount.toLocaleString()}</span>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {allTrades.length === 0 && (
          <div className="text-center text-xs text-muted-foreground py-8">No trades yet. Run a cycle to start.</div>
        )}
      </div>
    </div>
  );
}