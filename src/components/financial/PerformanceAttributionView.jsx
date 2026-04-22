import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, BarChart3, Lightbulb, Zap } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#d4af37', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#a4de6c'];

export default function PerformanceAttributionView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeWindow, setTimeWindow] = useState(30);
  const [activeTab, setActiveTab] = useState('sectors');

  useEffect(() => {
    loadAnalysis();
  }, [timeWindow]);

  const loadAnalysis = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('performanceAttributionAnalyzer', {
        action: 'analyze',
        timeWindowDays: timeWindow,
      });
      if (res.data?.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Load error:', err);
    }
    setLoading(false);
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return null;

  const sectorChartData = data.sectorAttribution.map(s => ({
    name: s.name,
    value: Math.abs(s.gain),
    contribution: s.contribution,
  })).filter(d => d.value > 0);

  const strategyChartData = data.strategyAttribution.map(s => ({
    name: s.name,
    gain: s.gain,
    count: s.count,
  })).slice(0, 8);

  return (
    <div className="space-y-4">
      {/* Time Window Selector */}
      <div className="flex gap-2">
        {[7, 14, 30, 60, 90].map((days) => (
          <button
            key={days}
            onClick={() => setTimeWindow(days)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              timeWindow === days
                ? 'bg-primary/20 border-primary/50 text-primary'
                : 'bg-card border-border hover:border-primary/30'
            }`}
          >
            {days}d
          </button>
        ))}
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card border rounded-lg p-3">
          <div className="text-[10px] text-muted-foreground uppercase">Total Trades</div>
          <div className="text-2xl font-bold mt-1">{data.summary.totalTrades}</div>
          <div className="text-[9px] text-muted-foreground mt-1">
            {data.summary.winningTrades}W / {data.summary.losingTrades}L
          </div>
        </div>

        <div className={`border rounded-lg p-3 ${
          data.summary.totalGain > 0 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
        }`}>
          <div className="text-[10px] text-muted-foreground uppercase">Total Gain</div>
          <div className={`text-2xl font-bold mt-1 ${data.summary.totalGain > 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${data.summary.totalGain.toFixed(0)}
          </div>
          <div className="text-[9px] text-muted-foreground mt-1">
            ${data.summary.avgGainPerTrade.toFixed(2)} avg
          </div>
        </div>

        <div className="bg-card border rounded-lg p-3">
          <div className="text-[10px] text-muted-foreground uppercase">Win Rate</div>
          <div className={`text-2xl font-bold mt-1 ${data.summary.winRate > 50 ? 'text-green-400' : 'text-orange-400'}`}>
            {data.summary.winRate.toFixed(1)}%
          </div>
          <div className="text-[9px] text-muted-foreground mt-1">
            {data.summary.totalTrades > 0 ? ((data.summary.winningTrades / data.summary.totalTrades) * 100).toFixed(0) : 0}% profitable
          </div>
        </div>

        <div className="bg-card border rounded-lg p-3">
          <div className="text-[10px] text-muted-foreground uppercase">Volatility (σ)</div>
          <div className="text-2xl font-bold mt-1">${data.summary.gainStdDev.toFixed(2)}</div>
          <div className="text-[9px] text-muted-foreground mt-1">Trade variance</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-border">
        {[
          { id: 'sectors', label: '📊 By Sector', icon: BarChart3 },
          { id: 'strategies', label: '🎯 By Strategy' },
          { id: 'trades', label: '📈 Best/Worst' },
          { id: 'insights', label: '💡 Insights' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'sectors' && (
        <div className="space-y-4">
          {sectorChartData.length > 0 && (
            <div className="bg-card border rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-3">Contribution by Sector</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={sectorChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, contribution }) => `${name} (${contribution.toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sectorChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Sector Leaderboard */}
          <div className="bg-card border rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-3">Sector Performance</h3>
            <div className="space-y-2">
              {data.sectorAttribution.map((sector, i) => (
                <div key={sector.name} className="border rounded-lg p-2.5 bg-secondary/30">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <p className="text-xs font-semibold">{sector.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{sector.count} trades</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${sector.gain > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${sector.gain.toFixed(0)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">{sector.contribution.toFixed(1)}% of total</div>
                    </div>
                  </div>
                  <div className="h-1.5 bg-card rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/50"
                      style={{ width: `${Math.min(sector.contribution, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'strategies' && (
        <div className="space-y-4">
          <div className="bg-card border rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-3">Strategy Effectiveness</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={strategyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="rgba(255,255,255,0.5)" />
                <YAxis tick={{ fontSize: 11 }} stroke="rgba(255,255,255,0.5)" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                <Legend />
                <Bar dataKey="gain" fill="#d4af37" name="Total Gain ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'trades' && (
        <div className="space-y-4">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              Best Trades
            </h3>
            {data.bestTrades.map((trade, i) => (
              <div key={i} className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <p className="text-sm font-semibold">{trade.symbol}</p>
                    <p className="text-[10px] text-muted-foreground">{trade.type} • {trade.sector}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-400">${trade.gain.toFixed(0)}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(trade.date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />
              Worst Trades
            </h3>
            {data.worstTrades.map((trade, i) => (
              <div key={i} className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <p className="text-sm font-semibold">{trade.symbol}</p>
                    <p className="text-[10px] text-muted-foreground">{trade.type} • {trade.sector}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-400">${trade.gain.toFixed(0)}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(trade.date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="space-y-3">
          {data.insights.map((insight, i) => (
            <div key={i} className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 flex gap-3">
              <Lightbulb className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">{insight}</p>
            </div>
          ))}
        </div>
      )}

      {/* Refresh Button */}
      <Button
        variant="outline"
        onClick={loadAnalysis}
        disabled={loading}
        className="w-full gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
        {loading ? 'Analyzing...' : 'Refresh Analysis'}
      </Button>
    </div>
  );
}