import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Zap, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SCENARIO_TEMPLATES = [
  { id: 'rates_up_2', label: 'Rates +2%', type: 'interest_rates', params: { interestRateChange: 2 } },
  { id: 'tech_crash_10', label: 'Tech -10%', type: 'sector_crash', params: { crashSectors: { 'Technology': -10 }, crashMagnitude: -10 } },
  { id: 'market_shock_5', label: 'Market -5%', type: 'market_shock', params: { shockMagnitude: -5, correlation: 0.7 } },
  { id: 'rates_down_1', label: 'Rates -1%', type: 'interest_rates', params: { interestRateChange: -1 } },
  { id: 'finance_crash_15', label: 'Finance -15%', type: 'sector_crash', params: { crashSectors: { 'Finance': -15 }, crashMagnitude: -15 } },
];

export default function ScenarioSimulatorView() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const [scenarioType, setScenarioType] = useState('market_shock');
  const [customParams, setCustomParams] = useState('');
  const [view, setView] = useState('templates'); // 'templates', 'custom', 'results'

  const runScenario = async (template = null) => {
    setLoading(true);
    let params = template?.params || {};
    
    if (!template && customParams) {
      try {
        params = JSON.parse(customParams);
      } catch {
        alert('Invalid JSON parameters');
        setLoading(false);
        return;
      }
    }

    try {
      const res = await base44.functions.invoke('scenarioSimulator', {
        scenarioName: template?.label || scenarioName || 'Custom Scenario',
        scenarioType: template?.type || scenarioType,
        parameters: params,
      });

      if (res.data?.data) {
        setResults(res.data.data);
        setView('results');
      }
    } catch (err) {
      console.error('Simulation error:', err);
    }
    setLoading(false);
  };

  if (view === 'templates') {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Run pre-built scenarios to see how your portfolio responds to market changes.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {SCENARIO_TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => runScenario(template)}
              disabled={loading}
              className="p-3 border rounded-lg bg-card hover:bg-secondary transition-colors text-left group"
            >
              <div className="text-xs text-muted-foreground font-semibold">{template.type.replace(/_/g, ' ').toUpperCase()}</div>
              <div className="text-sm font-bold mt-1 group-hover:text-primary transition-colors">{template.label}</div>
            </button>
          ))}
        </div>

        <div className="border-t border-border pt-4">
          <button
            onClick={() => setView('custom')}
            className="text-sm text-primary hover:underline"
          >
            + Create Custom Scenario
          </button>
        </div>
      </div>
    );
  }

  if (view === 'custom') {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold">Scenario Name</label>
          <Input
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
            placeholder="e.g., Fed Rate Hike"
            className="text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold">Scenario Type</label>
          <select
            value={scenarioType}
            onChange={(e) => setScenarioType(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-card text-sm"
          >
            <option value="interest_rates">Interest Rate Change</option>
            <option value="sector_crash">Sector Crash</option>
            <option value="market_shock">Market Shock</option>
            <option value="custom">Custom Impact</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold">Parameters (JSON)</label>
          <textarea
            value={customParams}
            onChange={(e) => setCustomParams(e.target.value)}
            placeholder='{"interestRateChange": 2}'
            className="w-full px-3 py-2 border border-border rounded-lg bg-card text-xs font-mono h-24"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setView('templates')}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            onClick={() => runScenario()}
            disabled={loading || !scenarioName}
            className="flex-1 gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {loading ? 'Simulating...' : 'Run Scenario'}
          </Button>
        </div>
      </div>
    );
  }

  if (!results) return null;

  const impactColor = results.projection.changePercent > 0 ? 'text-green-400' : 'text-red-400';
  const impactBgColor = results.projection.changePercent > 0 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30';

  const chartData = results.impactedHoldings.slice(0, 10).map(h => ({
    symbol: h.symbol,
    impact: h.percentageChange,
  }));

  return (
    <div className="space-y-4">
      {/* Scenario Header */}
      <div className="bg-card border rounded-lg p-4 space-y-2">
        <h3 className="text-sm font-semibold">{results.scenario.name}</h3>
        <p className="text-xs text-muted-foreground">
          Type: <span className="capitalize">{results.scenario.type.replace(/_/g, ' ')}</span>
        </p>
      </div>

      {/* Portfolio Impact */}
      <div className={`border rounded-lg p-4 ${impactBgColor}`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">Portfolio Impact</h3>
          {results.projection.changePercent > 0 ? (
            <TrendingUp className="w-5 h-5 text-green-400" />
          ) : (
            <TrendingDown className="w-5 h-5 text-red-400" />
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-muted-foreground">Baseline Value</div>
            <div className="text-lg font-bold">${results.baseline.value.toFixed(0)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Scenario Value</div>
            <div className={`text-lg font-bold ${impactColor}`}>${results.projection.value.toFixed(0)}</div>
          </div>
          <div className="col-span-2">
            <div className="text-xs text-muted-foreground">Total Change</div>
            <div className={`text-xl font-bold ${impactColor}`}>
              ${results.projection.change.toFixed(0)} ({results.projection.changePercent.toFixed(2)}%)
            </div>
          </div>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border rounded-lg p-3">
          <div className="text-[10px] text-muted-foreground uppercase">Gainers</div>
          <div className="text-2xl font-bold text-green-400 mt-1">{results.projection.gainersCount}</div>
        </div>
        <div className="bg-card border rounded-lg p-3">
          <div className="text-[10px] text-muted-foreground uppercase">Losers</div>
          <div className="text-2xl font-bold text-red-400 mt-1">{results.projection.losersCount}</div>
        </div>
        <div className="bg-card border rounded-lg p-3">
          <div className="text-[10px] text-muted-foreground uppercase">Affected Assets</div>
          <div className="text-2xl font-bold text-primary mt-1">{results.riskMetrics.affectedAssets}</div>
        </div>
      </div>

      {/* Impact Chart */}
      <div className="bg-card border rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3">Top 10 Impacted Holdings</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="symbol" tick={{ fontSize: 11 }} stroke="rgba(255,255,255,0.5)" />
            <YAxis tick={{ fontSize: 11 }} stroke="rgba(255,255,255,0.5)" />
            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
            <Bar dataKey="impact" fill="#d4af37" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recommendations */}
      {results.recommendations.length > 0 && (
        <div className="bg-card border rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            Recommended Adjustments
          </h3>
          <div className="space-y-2">
            {results.recommendations.map((rec, i) => (
              <div key={i} className="text-xs text-muted-foreground p-2 bg-secondary rounded">
                {rec}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Holdings */}
      <div className="bg-card border rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3">Detailed Impact</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {results.impactedHoldings.map((h) => (
            <div key={h.symbol} className="border rounded-lg p-2 text-xs bg-secondary/50">
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold">{h.symbol}</span>
                <span className={h.percentageChange > 0 ? 'text-green-400' : 'text-red-400'}>
                  {h.percentageChange > 0 ? '+' : ''}{h.percentageChange.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground text-[10px]">
                <span>${h.currentValue.toFixed(0)} → ${h.newValue.toFixed(0)}</span>
                <span className={`px-2 py-0.5 rounded font-semibold ${
                  h.recommendation === 'BUY' ? 'bg-green-500/20 text-green-400' :
                  h.recommendation === 'ADD' ? 'bg-green-500/20 text-green-400' :
                  h.recommendation === 'SELL' ? 'bg-red-500/20 text-red-400' :
                  h.recommendation === 'REDUCE' ? 'bg-red-500/20 text-red-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {h.recommendation}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <Button
        variant="outline"
        onClick={() => {
          setResults(null);
          setView('templates');
          setScenarioName('');
          setCustomParams('');
        }}
        className="w-full"
      >
        Run Another Scenario
      </Button>
    </div>
  );
}