import { DollarSign, ArrowUpRight, ArrowDownRight, Loader2, Play, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PortfolioHeader({ totalValue, totalPnl, totalPnlPct, totalDayPnl, totalTrades, running, onRunCycle }) {
  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl metallic-gold-bg flex items-center justify-center">
            <DollarSign className="w-7 h-7 text-background" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Portfolio</span>
              <span className="flex items-center gap-1 text-[8px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-full">
                <Wifi className="w-2.5 h-2.5" /> LIVE
              </span>
            </div>
            <div className="text-3xl font-black metallic-gold">
              ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Started at $20,000.00 · {totalTrades} total trades</div>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="text-right">
            <div className="text-[9px] text-muted-foreground uppercase">Total P&L</div>
            <div className={`text-lg font-bold flex items-center justify-end gap-1 ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalPnl >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              ${Math.abs(totalPnl).toFixed(2)}
            </div>
            <div className={`text-[10px] font-semibold ${totalPnlPct >= 0 ? 'text-green-400/80' : 'text-red-400/80'}`}>
              {totalPnlPct >= 0 ? '+' : ''}{totalPnlPct.toFixed(2)}%
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-muted-foreground uppercase">This Cycle</div>
            <div className={`text-lg font-bold ${totalDayPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalDayPnl >= 0 ? '+' : ''}${Math.abs(totalDayPnl).toFixed(2)}
            </div>
          </div>
          <Button onClick={onRunCycle} disabled={running} className="metallic-gold-bg text-background gap-2 ml-2">
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {running ? 'Trading...' : 'Run Cycle'}
          </Button>
        </div>
      </div>
    </div>
  );
}