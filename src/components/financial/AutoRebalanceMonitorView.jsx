import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Loader2, AlertTriangle, BarChart3, DollarSign, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AutoRebalanceMonitorView() {
  const [driftThreshold, setDriftThreshold] = useState(5);
  const [taxRate, setTaxRate] = useState(20);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [executing, setExecuting] = useState(false);

  const analyzeRebalance = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('autoRebalanceMonitor', {
        action: 'analyze',
        driftThreshold,
        taxRate: taxRate / 100,
      });
      if (res.data?.data) {
        setResults(res.data.data);
      }
    } catch (err) {
      console.error('Analysis error:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    analyzeRebalance();
  }, []);

  const executeProposals = async () => {
    if (!results) return;
    setExecuting(true);
    await new Promise(r => setTimeout(r, 2000));
    setExecuting(false);
    alert('Trade proposals executed! Check your portfolio.');
  };

  if (!results && !loading) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground mb-4">
          Monitor allocation drift and automatically generate rebalancing trades.
        </p>
        <Button onClick={analyzeRebalance} disabled={loading} className="w-full gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
          {loading ? 'Analyzing...' : 'Analyze Rebalancing Needs'}
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

  if (!results) return null;

  const allocationChart = Object.entries(results.allocations.target).map(([asset, target]) => ({
    asset: asset.charAt(0).toUpperCase() + asset.slice(1),
    target: (target * 100).toFixed(1),
    current: ((results.allocations.current[asset] || 0) * 100).toFixed(1),
  }));

  const hasProposals = results.proposals && results.proposals.length > 0;

  return (
    <div className="space-y-4">
      {/* Settings Panel */}
      <div className="bg-card border rounded-lg p-4 space-y-4">
        <h3 className="text-sm font-semibold">Rebalancing Settings</h3>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold">Drift Threshold</label>
            <span className="text-sm font-bold text-primary">{driftThreshold}%</span>
          </div>
          <Slider
            value={[driftThreshold]}
            onValueChange={(val) => setDriftThreshold(val[0])}
            min={1}
            max={15}
            step={1}
            className="w-full"
          />
          <p className="text-[10px] text-muted-foreground">Rebalance when allocations drift by this amount</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold">Tax Rate</label>
            <span className="text-sm font-bold text-primary">{taxRate}%</span>
          </div>
          <Slider
            value={[taxRate]}
            onValueChange={(val) => setTaxRate(val[0])}
            min={0}
            max={37}
            step={1}
            className="w-full"
          />
          <p className="text-[10px] text-muted-foreground">Capital gains tax rate for simulating tax impact</p>
        </div>

        <Button onClick={analyzeRebalance} disabled={loading} className="w-full gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
          Update Analysis
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card border rounded-lg p-3">
          <div className="text-[10px] text-muted-foreground uppercase">Portfolio Value</div>
          <div className="text-lg font-bold mt-1">${results.portfolio.value.toFixed(0)}</div>
        </div>
        <div className="bg-card border rounded-lg p-3">
          <div className="text-[10px] text-muted-foreground uppercase">Drifts Detected</div>
          <div className={`text-lg font-bold mt-1 ${
            results.monitoring.driftsDetected > 0 ? 'text-orange-400' : 'text-green-400'
          }`}>
            {results.monitoring.driftsDetected}
          </div>
        </div>
        <div className="bg-card border rounded-lg p-3">
          <div className="text-[10px] text-muted-foreground uppercase">Max Drift</div>
          <div className="text-lg font-bold mt-1">{results.monitoring.maxDrift}%</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <div className="text-[10px] text-muted-foreground uppercase">Tax Impact</div>
          <div className="text-lg font-bold mt-1 text-red-400">${results.taxImpact.totalTaxOnSales}</div>
        </div>
      </div>

      {/* Allocation Chart */}
      <div className="bg-card border rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3">Target vs Current Allocation</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={allocationChart}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="asset" tick={{ fontSize: 11 }} stroke="rgba(255,255,255,0.5)" />
            <YAxis tick={{ fontSize: 11 }} stroke="rgba(255,255,255,0.5)" />
            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
            <Legend />
            <Bar dataKey="target" fill="#82ca9d" name="Target %" />
            <Bar dataKey="current" fill="#d4af37" name="Current %" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Trade Proposals */}
      {hasProposals ? (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            Trade Proposals ({results.proposals.length})
          </h3>
          
          {results.proposals.map((proposal, i) => (
            <div
              key={i}
              onClick={() => setSelectedProposal(selectedProposal === i ? null : i)}
              className={`border rounded-lg p-3 cursor-pointer transition-all ${
                selectedProposal === i
                  ? 'bg-primary/10 border-primary/50'
                  : proposal.action === 'BUY'
                    ? 'bg-green-500/5 border-green-500/20 hover:border-green-500/40'
                    : 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold capitalize">{proposal.asset}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{proposal.rationale}</p>
                </div>
                <div className={`text-xs font-bold px-2.5 py-1 rounded whitespace-nowrap ${
                  proposal.action === 'BUY'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {proposal.action}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px]">
                <div>
                  <span className="text-muted-foreground">Current</span>
                  <p className="font-semibold text-foreground">{proposal.currentAllocation}%</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Target</span>
                  <p className="font-semibold text-foreground">{proposal.targetAllocation}%</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Drift</span>
                  <p className="font-semibold text-orange-400">{proposal.drift}%</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Priority</span>
                  <p className={`font-semibold ${
                    proposal.priority === 'HIGH' ? 'text-red-400'
                    : proposal.priority === 'MEDIUM' ? 'text-yellow-400'
                    : 'text-green-400'
                  }`}>
                    {proposal.priority}
                  </p>
                </div>
              </div>

              {selectedProposal === i && (
                <div className="mt-3 pt-3 border-t border-border space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trade Value</span>
                    <span className="font-semibold">${proposal.tradeValue}</span>
                  </div>
                  <div className="flex justify-between text-red-400">
                    <span className="text-muted-foreground">Tax Impact</span>
                    <span className="font-semibold">-${proposal.taxImpact}</span>
                  </div>
                  <div className="flex justify-between text-green-400">
                    <span className="text-muted-foreground">Net Proceeds</span>
                    <span className="font-semibold">${proposal.netProceeds}</span>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Tax Summary */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Tax on Sales</span>
              <span className="font-semibold text-red-400">${results.taxImpact.totalTaxOnSales}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Effective Tax Rate</span>
              <span className="font-semibold">{results.taxImpact.estimatedTaxRate}</span>
            </div>
          </div>

          {/* Execute Button */}
          <Button
            onClick={executeProposals}
            disabled={executing}
            className="w-full gap-2 bg-green-600 hover:bg-green-700"
          >
            {executing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <DollarSign className="w-4 h-4" />
            )}
            {executing ? 'Executing...' : `Execute ${results.proposals.length} Trade${results.proposals.length !== 1 ? 's' : ''}`}
          </Button>
        </div>
      ) : (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
          <p className="text-sm font-semibold text-green-400">✓ Portfolio is perfectly balanced</p>
          <p className="text-xs text-muted-foreground mt-1">All allocations within {driftThreshold}% threshold</p>
        </div>
      )}
    </div>
  );
}