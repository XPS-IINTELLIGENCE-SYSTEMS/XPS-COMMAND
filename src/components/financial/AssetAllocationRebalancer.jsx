import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, CheckCircle2, AlertCircle, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const RISK_PROFILES = [
  { id: 'conservative', label: 'Conservative', icon: '🛡️', desc: 'Stable, income-focused' },
  { id: 'moderate', label: 'Moderate', icon: '⚖️', desc: 'Balanced growth & income' },
  { id: 'aggressive', label: 'Aggressive', icon: '🚀', desc: 'Growth-focused' },
];

export default function AssetAllocationRebalancer() {
  const [selectedProfile, setSelectedProfile] = useState('moderate');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);

  const calculate = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('assetAllocationCalculator', {
        riskProfile: selectedProfile,
      });
      if (res.data?.data) {
        setResults(res.data.data);
      }
    } catch (err) {
      console.error('Calculation error:', err);
    }
    setLoading(false);
  };

  const executeRebalance = async () => {
    if (!results) return;
    setExecuting(true);
    // Simulate execution
    await new Promise(r => setTimeout(r, 2000));
    setExecuting(false);
    alert('Rebalancing plan executed! Check your trades.');
  };

  if (!results && !loading) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold">Select Risk Profile</label>
          <div className="grid grid-cols-3 gap-3">
            {RISK_PROFILES.map((profile) => (
              <button
                key={profile.id}
                onClick={() => setSelectedProfile(profile.id)}
                className={`p-3 rounded-lg border transition-all text-center ${
                  selectedProfile === profile.id
                    ? 'bg-primary/10 border-primary/50'
                    : 'bg-secondary border-border hover:border-primary/30'
                }`}
              >
                <div className="text-2xl mb-1">{profile.icon}</div>
                <div className="text-xs font-semibold">{profile.label}</div>
                <div className="text-[10px] text-muted-foreground mt-1">{profile.desc}</div>
              </button>
            ))}
          </div>
        </div>
        <Button onClick={calculate} disabled={loading} className="w-full gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
          {loading ? 'Calculating...' : 'Calculate Allocation'}
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const chartData = Object.entries(results.targetAllocation).map(([asset, target]) => ({
    asset: asset.charAt(0).toUpperCase() + asset.slice(1),
    current: (results.currentAllocation[asset] * 100).toFixed(1),
    target: (target * 100).toFixed(1),
  }));

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card border rounded-lg p-3">
          <div className="text-[10px] text-muted-foreground uppercase">Rebalancing Drift</div>
          <div className="text-xl font-bold text-primary mt-1">{results.summary.rebalancingDrift.toFixed(1)}%</div>
        </div>
        <div className="bg-card border rounded-lg p-3">
          <div className="text-[10px] text-muted-foreground uppercase">Trades Required</div>
          <div className="text-xl font-bold mt-1">{results.summary.tradesRequired}</div>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
          <div className="text-[10px] text-muted-foreground uppercase">Tax Savings</div>
          <div className="text-xl font-bold text-green-400 mt-1">${results.summary.estimatedTaxSavings.toFixed(0)}</div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <div className="text-[10px] text-muted-foreground uppercase">Net Benefit</div>
          <div className="text-xl font-bold text-blue-400 mt-1">${results.summary.netBenefit.toFixed(0)}</div>
        </div>
      </div>

      {/* Allocation Chart */}
      <div className="bg-card border rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3">Current vs. Target Allocation</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="asset" tick={{ fontSize: 12 }} stroke="rgba(255,255,255,0.5)" />
            <YAxis tick={{ fontSize: 12 }} stroke="rgba(255,255,255,0.5)" />
            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
            <Legend />
            <Bar dataKey="current" fill="#d4af37" />
            <Bar dataKey="target" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Rebalancing Plan */}
      <div className="bg-card border rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3">Rebalancing Trades</h3>
        <div className="space-y-2">
          {results.rebalancingPlan.map((trade, i) => (
            <div key={i} className={`border rounded-lg p-3 ${
              trade.action === 'BUY' ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold">{trade.asset}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{trade.rationale}</p>
                </div>
                <div className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ml-2 ${
                  trade.action === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {trade.action}
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span>{trade.currentPercent}%</span>
                <ArrowRight className="w-3 h-3" />
                <span className="font-semibold text-foreground">{trade.targetPercent}%</span>
                <span className="ml-auto">${trade.tradeAmount.toFixed(0)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => {
            setResults(null);
            setSelectedProfile('moderate');
          }}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          onClick={executeRebalance}
          disabled={executing}
          className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
        >
          {executing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          {executing ? 'Executing...' : 'Execute Rebalance'}
        </Button>
      </div>
    </div>
  );
}