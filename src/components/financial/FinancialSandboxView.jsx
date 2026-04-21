import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  DollarSign, TrendingUp, TrendingDown, BarChart3, PieChart,
  Play, Loader2, RefreshCw, Briefcase, Shield, Zap, Target,
  ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const BUCKET_META = {
  low_risk: { label: 'Low Risk', icon: Shield, color: '#22c55e', bg: 'bg-green-500/10' },
  mid_risk: { label: 'Mid Risk', icon: BarChart3, color: '#f59e0b', bg: 'bg-yellow-500/10' },
  high_risk: { label: 'High Risk', icon: Zap, color: '#ef4444', bg: 'bg-red-500/10' },
  day_trading: { label: 'Day Trading', icon: TrendingUp, color: '#8b5cf6', bg: 'bg-purple-500/10' },
  business_venture: { label: 'Ventures', icon: Briefcase, color: '#d4af37', bg: 'bg-primary/10' },
};

export default function FinancialSandboxView() {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [initializing, setInitializing] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const data = await base44.entities.FinancialPortfolio.filter({ status: 'active' }, '-created_date', 10).catch(() => []);
    setPortfolios(data);
    setLoading(false);
  };

  const initPortfolio = async () => {
    setInitializing(true);
    await base44.functions.invoke('financialSandbox', { action: 'init' }).catch(() => {});
    await loadData();
    setInitializing(false);
  };

  const runDailyCycle = async () => {
    setRunning(true);
    await base44.functions.invoke('financialSandbox', { action: 'daily_cycle' }).catch(() => {});
    await loadData();
    setRunning(false);
  };

  const totalValue = portfolios.reduce((s, p) => s + (p.current_balance || 0), 0);
  const totalPnl = portfolios.reduce((s, p) => s + (p.total_gain_loss || 0), 0);
  const totalDayPnl = portfolios.reduce((s, p) => s + (p.day_gain_loss || 0), 0);
  const totalPnlPct = totalValue > 0 ? ((totalPnl / 20000) * 100) : 0;

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  if (portfolios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <DollarSign className="w-12 h-12 metallic-gold-icon" />
        <h2 className="text-lg font-bold metallic-gold">Financial Sandbox</h2>
        <p className="text-sm text-muted-foreground">Initialize your $20,000 mock portfolio</p>
        <Button onClick={initPortfolio} disabled={initializing} className="metallic-gold-bg text-background gap-2">
          {initializing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {initializing ? 'Initializing...' : 'Start $20K Portfolio'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-[1100px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-extrabold metallic-gold flex items-center gap-2">
            <DollarSign className="w-6 h-6 metallic-gold-icon" />
            Financial Sandbox
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Mock $20K portfolio — AI-managed daily</p>
        </div>
        <Button onClick={runDailyCycle} disabled={running} className="metallic-gold-bg text-background gap-2">
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {running ? 'Simulating...' : 'Run Daily Cycle'}
        </Button>
      </div>

      {/* Total Portfolio */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Portfolio Value</div>
            <div className="text-3xl font-black metallic-gold">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <div className="text-[10px] text-muted-foreground">Total P&L</div>
              <div className={`text-lg font-bold flex items-center gap-1 ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalPnl >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                ${Math.abs(totalPnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                <span className="text-xs">({totalPnlPct >= 0 ? '+' : ''}{totalPnlPct.toFixed(1)}%)</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-muted-foreground">Today</div>
              <div className={`text-lg font-bold ${totalDayPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalDayPnl >= 0 ? '+' : ''}${totalDayPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bucket Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {portfolios.map((p) => {
          const meta = BUCKET_META[p.bucket] || BUCKET_META.low_risk;
          const Icon = meta.icon;
          const pnlPct = p.initial_balance ? ((p.total_gain_loss || 0) / p.initial_balance * 100) : 0;
          const isUp = (p.total_gain_loss || 0) >= 0;

          return (
            <div key={p.id} className={`glass-card rounded-xl p-4 border-l-2`} style={{ borderLeftColor: meta.color }}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${meta.bg}`}>
                  <Icon className="w-4 h-4" style={{ color: meta.color }} />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">{meta.label}</div>
                  <div className="text-[9px] text-muted-foreground">{p.portfolio_name}</div>
                </div>
              </div>

              <div className="text-xl font-black text-foreground">
                ${(p.current_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className={`text-xs font-semibold ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                  {isUp ? '+' : ''}${(p.total_gain_loss || 0).toFixed(2)} ({pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(1)}%)
                </div>
                <Badge variant="secondary" className="text-[8px]">
                  {p.total_trades || 0} trades
                </Badge>
              </div>

              {p.day_gain_loss !== 0 && (
                <div className={`text-[10px] mt-1 ${(p.day_gain_loss || 0) >= 0 ? 'text-green-400/70' : 'text-red-400/70'}`}>
                  Today: {(p.day_gain_loss || 0) >= 0 ? '+' : ''}${(p.day_gain_loss || 0).toFixed(2)}
                </div>
              )}

              {p.ai_reflection && (
                <div className="mt-3 pt-2 border-t border-border/50">
                  <p className="text-[9px] text-muted-foreground italic leading-relaxed line-clamp-3">{p.ai_reflection}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}