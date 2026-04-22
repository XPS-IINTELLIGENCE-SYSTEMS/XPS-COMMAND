import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { base44 } from '@/api/base44Client';
import { Loader2, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BacktestResultsView({ onClose }) {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [daysBack, setDaysBack] = useState(30);
  const [strategy, setStrategy] = useState('balanced');

  const runBacktest = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('backtestSandbox', {
        daysBack,
        strategy,
        action: 'run',
      });
      if (res.data?.data) {
        setResults(res.data.data);
      }
    } catch (err) {
      console.error('Backtest error:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    runBacktest();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
          <p className="text-sm text-muted-foreground">Running 30-day backtest...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">No backtest data available</p>
      </div>
    );
  }

  const isBacktestBetter = results.performanceComparison.outperformance === 'backtest';
  const backtestReturn = parseFloat(results.performanceComparison.backtestReturn);
  const liveReturn = parseFloat(results.performanceComparison.liveReturn);

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">30-Day Backtest Analysis</h2>
          <div className="flex gap-2">
            <select
              value={daysBack}
              onChange={(e) => setDaysBack(parseInt(e.target.value))}
              className="bg-secondary text-foreground rounded px-3 py-2 text-sm"
            >
              <option value={7}>7 Days</option>
              <option value={14}>14 Days</option>
              <option value={30}>30 Days</option>
              <option value={60}>60 Days</option>
            </select>
            <Button onClick={runBacktest} disabled={loading} className="gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Re-run'}
            </Button>
          </div>
        </div>

        {/* Performance Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border rounded-lg p-4">
            <div className="text-xs text-muted-foreground uppercase mb-1">Backtest Return</div>
            <div className={`text-2xl font-bold ${backtestReturn > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {backtestReturn > 0 ? '+' : ''}{backtestReturn.toFixed(2)}%
            </div>
            <div className="text-sm text-muted-foreground mt-2">Simulated 30-day performance</div>
          </div>

          <div className="bg-card border rounded-lg p-4">
            <div className="text-xs text-muted-foreground uppercase mb-1">Live Return</div>
            <div className={`text-2xl font-bold ${liveReturn > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {liveReturn > 0 ? '+' : ''}{liveReturn.toFixed(2)}%
            </div>
            <div className="text-sm text-muted-foreground mt-2">Current trading performance</div>
          </div>

          <div className={`border rounded-lg p-4 ${isBacktestBetter ? 'bg-green-500/10 border-green-500/30' : 'bg-blue-500/10 border-blue-500/30'}`}>
            <div className="text-xs text-muted-foreground uppercase mb-1">Winner</div>
            <div className={`text-2xl font-bold ${isBacktestBetter ? 'text-green-400' : 'text-blue-400'}`}>
              {isBacktestBetter ? 'Backtest' : 'Live Trading'}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              {Math.abs(parseFloat(results.performanceComparison.difference)).toFixed(2)}% difference
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-card border rounded-lg p-3">
          <div className="text-[10px] text-muted-foreground uppercase">Total Trades</div>
          <div className="text-xl font-bold mt-1">{results.backtestMetrics.trades}</div>
        </div>
        <div className="bg-card border rounded-lg p-3">
          <div className="text-[10px] text-muted-foreground uppercase">Win Rate</div>
          <div className="text-xl font-bold text-green-400 mt-1">{results.backtestMetrics.winRate.toFixed(1)}%</div>
        </div>
        <div className="bg-card border rounded-lg p-3">
          <div className="text-[10px] text-muted-foreground uppercase">Avg Win</div>
          <div className="text-xl font-bold text-green-400 mt-1">${results.backtestMetrics.avgWin.toFixed(0)}</div>
        </div>
        <div className="bg-card border rounded-lg p-3">
          <div className="text-[10px] text-muted-foreground uppercase">Sharpe Ratio</div>
          <div className="text-xl font-bold text-purple-400 mt-1">{results.backtestMetrics.sharpeRatio.toFixed(2)}</div>
        </div>
        <div className="bg-card border rounded-lg p-3">
          <div className="text-[10px] text-muted-foreground uppercase">Max Drawdown</div>
          <div className="text-xl font-bold text-red-400 mt-1">{results.backtestMetrics.maxDrawdown.toFixed(1)}%</div>
        </div>
      </div>

      {/* Daily Returns Chart */}
      <div className="bg-card border rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-4">Daily Returns Over Period</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={results.dailyReturns}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="rgba(255,255,255,0.5)" />
            <YAxis tick={{ fontSize: 12 }} stroke="rgba(255,255,255,0.5)" />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              cursor={{ stroke: 'rgba(255,255,255,0.2)' }}
            />
            <Line
              type="monotone"
              dataKey="return"
              stroke="#d4af37"
              isAnimationActive={false}
              dot={false}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Daily Trades Chart */}
      <div className="bg-card border rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-4">Daily Trade Activity</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={results.dailyReturns}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="rgba(255,255,255,0.5)" />
            <YAxis tick={{ fontSize: 12 }} stroke="rgba(255,255,255,0.5)" />
            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
            <Legend />
            <Bar dataKey="wins" stackId="trades" fill="#22c55e" />
            <Bar dataKey="losses" stackId="trades" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recommendations */}
      <div className="bg-card border rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3">Strategy Insights & Recommendations</h3>
        <div className="space-y-2">
          {results.recommendations.length > 0 ? (
            results.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                {rec.startsWith('✓') ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                ) : rec.startsWith('⚠') ? (
                  <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                )}
                <p className="text-foreground">{rec.replace(/^[✓⚠📊]\s/, '')}</p>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No specific recommendations at this time.</p>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Close
        </Button>
        <Button className="gap-2 flex-1">
          <Download className="w-4 h-4" /> Export Report
        </Button>
      </div>
    </div>
  );
}