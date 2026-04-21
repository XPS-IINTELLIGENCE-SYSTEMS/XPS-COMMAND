import { Eye, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PatternScanPanel({ patternData }) {
  if (!patternData) return <div className="text-xs text-muted-foreground text-center py-8">Run a pattern scan to detect live signals.</div>;

  const patterns = patternData.patterns || [];

  return (
    <div className="space-y-3">
      {/* Market Regime */}
      {patternData.market_regime && (
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">Market Regime</span>
            <Badge className="text-[9px]">{patternData.market_regime}</Badge>
          </div>
          {patternData.strongest_signal && <p className="text-[10px] text-primary mt-1">Strongest: {patternData.strongest_signal}</p>}
          {patternData.summary && <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{patternData.summary}</p>}
        </div>
      )}

      {/* Patterns */}
      <div className="glass-card rounded-xl p-4">
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><Eye className="w-4 h-4 text-purple-400" />Detected Patterns ({patterns.length})</h3>
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {patterns.map((p, i) => {
            const isBullish = (p.direction || '').toLowerCase().includes('bull') || (p.direction || '').toLowerCase().includes('up') || (p.direction || '').toLowerCase().includes('long');
            return (
              <div key={i} className={`border rounded-lg p-3 text-[10px] ${isBullish ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {isBullish ? <TrendingUp className="w-3.5 h-3.5 text-green-400" /> : <TrendingDown className="w-3.5 h-3.5 text-red-400" />}
                    <span className="font-bold text-foreground">{p.ticker || p.asset}</span>
                    <span className="text-muted-foreground">— {p.pattern}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${(p.confidence || 0) >= 70 ? 'bg-green-400' : (p.confidence || 0) >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`} style={{ width: `${p.confidence || 0}%` }} />
                    </div>
                    <span className="text-muted-foreground">{p.confidence}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[9px] text-muted-foreground mb-1">
                  <span>TF: {p.timeframe}</span>
                  <span>Now: {p.current_price}</span>
                  <span className="text-green-400">Target: {p.target_price}</span>
                  <span className="text-red-400">SL: {p.stop_loss}</span>
                </div>
                {p.reasoning && <p className="text-muted-foreground/80 leading-relaxed">{p.reasoning}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}