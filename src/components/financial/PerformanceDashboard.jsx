import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

export default function PerformanceDashboard() {
  const [portfolios, setPortfolios] = useState([]);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [allocationData, setAllocationData] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [portfolioRes, tradeRes] = await Promise.all([
      base44.entities.FinancialPortfolio.filter({ status: 'active' }, '-created_date', 10).catch(() => []),
      base44.entities.TradeLedger.list('-execution_timestamp', 100).catch(() => []),
    ]);

    setPortfolios(portfolioRes);
    setTrades(tradeRes);

    // Build performance trend chart
    if (tradeRes.length > 0) {
      const groupedByTime = {};
      let cumulativePnL = 0;

      tradeRes.slice().reverse().forEach(t => {
        const date = new Date(t.execution_timestamp).toLocaleDateString();
        cumulativePnL += t.pnl;
        if (!groupedByTime[date]) {
          groupedByTime[date] = { date, pnl: 0, cumulative: 0, trades: 0 };
        }
        groupedByTime[date].pnl += t.pnl;
        groupedByTime[date].cumulative = cumulativePnL;
        groupedByTime[date].trades += 1;
      });

      setChartData(Object.values(groupedByTime).slice(-30)); // Last 30 days
    }

    // Build allocation pie chart
    if (portfolioRes.length > 0) {
      const allocation = portfolioRes.map(p => ({
        name: p.bucket || 'Portfolio',
        value: p.current_balance || 0,
      }));
      setAllocationData(allocation);
    }

    setLoading(false);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch(
        `${window.location.origin}/api/functions/exportLedgerCSV`,
        { method: 'POST' }
      );
      const csv = await res.text();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio_report_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export failed:', e);
    }
    setExporting(false);
  };

  const totalBalance = portfolios.reduce((sum, p) => sum + (p.current_balance || 0), 0);
  const totalPnL = portfolios.reduce((sum, p) => sum + (p.total_gain_loss || 0), 0);
  const totalWins = portfolios.reduce((sum, p) => sum + (p.winning_trades || 0), 0);
  const totalTrades = portfolios.reduce((sum, p) => sum + (p.total_trades || 0), 0);
  const winRate = totalTrades > 0 ? ((totalWins / totalTrades) * 100).toFixed(1) : 0;

  const COLORS = ['#d4af37', '#f5e6a3', '#c0c0c0', '#e8e8e8', '#a8a8a8'];

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold metallic-gold">Performance Dashboard</h1>
        <Button onClick={handleExport} disabled={exporting} className="gap-2 bg-primary">
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {exporting ? 'Exporting...' : 'Export CSV'}
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card border rounded-lg p-4">
          <div className="text-xs text-muted-foreground uppercase">Portfolio Value</div>
          <div className="text-2xl font-bold text-primary">${totalBalance.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground mt-1">Across all buckets</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-xs text-muted-foreground uppercase">Total P&L</div>
          <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Realized gains/losses</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-xs text-muted-foreground uppercase">Win Rate</div>
          <div className="text-2xl font-bold text-green-400">{winRate}%</div>
          <div className="text-xs text-muted-foreground mt-1">{totalWins}/{totalTrades} trades</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-xs text-muted-foreground uppercase">Total Trades</div>
          <div className="text-2xl font-bold text-foreground">{totalTrades}</div>
          <div className="text-xs text-muted-foreground mt-1">All time</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* P&L Trend */}
        <div className="lg:col-span-2 bg-card border rounded-lg p-4">
          <h3 className="font-bold mb-4">Cumulative P&L Trend</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  formatter={(value) => `$${value.toFixed(2)}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="cumulative" 
                  stroke="#d4af37" 
                  strokeWidth={2}
                  name="Cumulative P&L"
                  dot={{ fill: '#d4af37', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              No trade data yet
            </div>
          )}
        </div>

        {/* Asset Allocation */}
        <div className="bg-card border rounded-lg p-4">
          <h3 className="font-bold mb-4">Asset Allocation</h3>
          {allocationData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              No allocation data
            </div>
          )}
        </div>
      </div>

      {/* Daily Trade Count */}
      <div className="bg-card border rounded-lg p-4">
        <h3 className="font-bold mb-4">Daily Trade Activity</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              />
              <Legend />
              <Bar dataKey="trades" fill="#d4af37" name="Trades per Day" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No activity data
          </div>
        )}
      </div>
    </div>
  );
}