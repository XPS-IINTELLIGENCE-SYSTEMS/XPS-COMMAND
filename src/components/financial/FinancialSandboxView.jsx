import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { DollarSign, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import PortfolioHeader from "./PortfolioHeader.jsx";
import PortfolioGrowthChart from "./PortfolioGrowthChart.jsx";
import BucketCards from "./BucketCards.jsx";
import BucketPerformanceBars from "./BucketPerformanceBars.jsx";
import HoldingsTable from "./HoldingsTable.jsx";
import TradeLog from "./TradeLog.jsx";
import AIRecommendations from "./AIRecommendations.jsx";
import AIReflectionLog from "./AIReflectionLog.jsx";

export default function FinancialSandboxView() {
  const [portfolios, setPortfolios] = useState([]);
  const [intelRecords, setIntelRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [data, intel] = await Promise.all([
      base44.entities.FinancialPortfolio.filter({ status: 'active' }, '-created_date', 10).catch(() => []),
      base44.entities.IntelRecord.filter({ category: 'financial' }, '-created_date', 30).catch(() => []),
    ]);
    setPortfolios(data);
    setIntelRecords(intel);
    setLoading(false);
  };

  const initPortfolio = async () => {
    setInitializing(true);
    await base44.functions.invoke('financialSandbox', { action: 'init' }).catch(() => {});
    await loadData();
    setInitializing(false);
  };

  const runCycle = async () => {
    setRunning(true);
    await base44.functions.invoke('financialSandbox', { action: 'daily_cycle' }).catch(() => {});
    await loadData();
    setRunning(false);
  };

  const totalValue = portfolios.reduce((s, p) => s + (p.current_balance || 0), 0);
  const totalPnl = portfolios.reduce((s, p) => s + (p.total_gain_loss || 0), 0);
  const totalDayPnl = portfolios.reduce((s, p) => s + (p.day_gain_loss || 0), 0);
  const totalTrades = portfolios.reduce((s, p) => s + (p.total_trades || 0), 0);
  const totalPnlPct = totalValue > 0 ? ((totalPnl / 20000) * 100) : 0;

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  if (portfolios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <DollarSign className="w-14 h-14 metallic-gold-icon" />
        <h2 className="text-xl font-extrabold metallic-gold">Financial Sandbox</h2>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Initialize a simulated $20,000 portfolio with live market data across 5 AI-managed risk buckets.
        </p>
        <Button onClick={initPortfolio} disabled={initializing} className="metallic-gold-bg text-background gap-2 px-6 py-3">
          {initializing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {initializing ? 'Initializing...' : 'Start $20K Portfolio'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 sm:p-6 max-w-[1200px] mx-auto">
      <PortfolioHeader totalValue={totalValue} totalPnl={totalPnl} totalPnlPct={totalPnlPct}
        totalDayPnl={totalDayPnl} totalTrades={totalTrades} running={running} onRunCycle={runCycle} />

      <BucketCards portfolios={portfolios} selectedBucket={selectedBucket} onSelect={setSelectedBucket} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PortfolioGrowthChart intelRecords={intelRecords} totalCurrent={totalValue} />
        <BucketPerformanceBars portfolios={portfolios} />
      </div>

      <HoldingsTable portfolios={portfolios} selectedBucket={selectedBucket} />

      {/* Recommendations — full width */}
      <AIRecommendations intelRecords={intelRecords} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TradeLog portfolios={portfolios} selectedBucket={selectedBucket} />
        <AIReflectionLog portfolios={portfolios} intelRecords={intelRecords} selectedBucket={selectedBucket} />
      </div>
    </div>
  );
}