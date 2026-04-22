import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { base44 } from '@/api/base44Client';
import { Loader2, AlertTriangle, TrendingDown, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

const HISTORICAL_SHOCKS = [
  { id: '2008_crisis', label: '2008 Financial Crisis', icon: '📉', desc: '-50% over 30 days' },
  { id: 'covid_crash', label: 'COVID-19 Crash', icon: '🦠', desc: '-35% over 14 days' },
  { id: '2020_flash_crash', label: 'Flash Crash (2020)', icon: '⚡', desc: '-12% in 1 day' },
  { id: 'black_monday', label: 'Black Monday Scenario', icon: '💀', desc: '-22% over 5 days' },
  { id: 'high_volatility', label: 'High Volatility Spike', icon: '📊', desc: '-5% ±50% volatility' },
  { id: 'moderate_correction', label: 'Moderate Correction', icon: '📈', desc: '-8% over 7 days' },
];

export default function StressTestView({ onClose }) {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedShock, setSelectedShock] = useState('high_volatility');
  const [customMagnitude, setCustomMagnitude] = useState(-5);
  const [customVolatility, setCustomVolatility] = useState(20);
  const [useCustom, setUseCustom] = useState(false);

  const runStressTest = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('stressTestSandbox', {
        shockType: useCustom ? 'custom' : selectedShock,
        shockMagnitude: customMagnitude,
        volatilitySpikePercent: customVolatility,
        durationDays: 5,
        action: 'run',
      });
      if (res.data?.data) {
        setResults(res.data.data);
      }
    } catch (err) {
      console.error('Stress test error:', err);
    }
    setLoading(false);
  };

  if (!results && !loading) {
    return (
      <div className="space-y-6">
        {/* Shock Selection */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Select Shock Scenario</h3>
          <div className="grid grid-cols-2 gap-3">
            {HISTORICAL_SHOCKS.map((shock) => (
              <button
                key={shock.id}
                onClick={() => {
                  setSelectedShock(shock.id);
                  setUseCustom(false);
                }}
                className={`p-3 rounded-lg border transition-all text-left ${
                  selectedShock === shock.id && !useCustom
                    ? 'bg-primary/10 border-primary/50'
                    : 'bg-secondary border-border hover:border-primary/30'
                }`}
              >
                <div className="text-lg mb-1">{shock.icon}</div>
                <div className="text-xs font-semibold">{shock.label}</div>
                <div className="text-[10px] text-muted-foreground mt-1">{shock.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Shock */}
        <div className="border rounded-lg p-4 space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={useCustom}
              onChange={(e) => setUseCustom(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm font-semibold">Custom Shock Parameters</span>
          </label>

          {useCustom && (
            <div className="space-y-4 pl-7">
              <div>
                <label className="text-xs text-muted-foreground block mb-2">Market Crash Magnitude: {customMagnitude}%</label>
                <Slider
                  value={[customMagnitude]}
                  onValueChange={(val) => setCustomMagnitude(val[0])}
                  min={-50}
                  max={0}
                  step={1}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-2">Volatility Spike: {customVolatility}%</label>
                <Slider
                  value={[customVolatility]}
                  onValueChange={(val) => setCustomVolatility(val[0])}
                  min={5}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Run Button */}
        <Button
          onClick={runStressTest}
          disabled={loading}
          className="w-full gap-2 bg-destructive hover:bg-destructive/90"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          {loading ? 'Running Stress Test...' : 'Run Stress Test'}
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Simulating shock scenario...</p>
        </div>
      </div>
    );
  }

  // Results view
  const maxLoss = results.stressMetrics.maxLossPercent;
  const resilience = results.stressMetrics.portfolioResilience;
  const recoveryDays = results.stressMetrics.recoveryDays;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <h2 className="text-xl font-bold">Stress Test Results</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Portfolio resilience under {results.shockType.replace(/_/g, ' ')} scenario
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className={`border rounded-lg p-3 ${maxLoss < -30 ? 'bg-red-500/10 border-red-500/30' : 'bg-orange-500/10 border-orange-500/30'}`}>
          <div className="text-[10px] text-muted-foreground uppercase">Max Loss</div>
          <div className={`text-lg font-bold mt-1 ${maxLoss < -30 ? 'text-red-400' : 'text-orange-400'}`}>
            {maxLoss.toFixed(1)}%
          </div>
        </div>
        <div className="bg-card border rounded-lg p-3">
          <div className="text-[10px] text-muted-foreground uppercase">Dollar Loss</div>
          <div className="text-lg font-bold text-red-400 mt-1">
            ${Math.abs(results.stressMetrics.maxLoss).toFixed(0)}
          </div>
        </div>
        <div className={`border rounded-lg p-3 ${resilience > 70 ? 'bg-green-500/10 border-green-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
          <div className="text-[10px] text-muted-foreground uppercase">Resilience</div>
          <div className={`text-lg font-bold mt-1 ${resilience > 70 ? 'text-green-400' : 'text-yellow-400'}`}>
            {resilience.toFixed(0)}%
          </div>
        </div>
        <div className={`border rounded-lg p-3 ${recoveryDays <= 5 ? 'bg-green-500/10 border-green-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
          <div className="text-[10px] text-muted-foreground uppercase">Recovery Time</div>
          <div className={`text-lg font-bold mt-1 ${recoveryDays <= 5 ? 'text-green-400' : 'text-yellow-400'}`}>
            {recoveryDays} days
          </div>
        </div>
      </div>

      {/* Portfolio Value Chart */}
      <div className="bg-card border rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3">Portfolio Value Under Stress</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={results.dailyImpact}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="rgba(255,255,255,0.5)" />
            <YAxis tick={{ fontSize: 12 }} stroke="rgba(255,255,255,0.5)" />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              formatter={(value) => value.toFixed(2)}
            />
            <Line
              type="monotone"
              dataKey="portfolioValue"
              stroke="#d4af37"
              isAnimationActive={false}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Impact by Bucket */}
      <div className="bg-card border rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3">Impact by Portfolio Bucket</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={results.bucketImpact}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="bucketName" tick={{ fontSize: 11 }} stroke="rgba(255,255,255,0.5)" />
            <YAxis tick={{ fontSize: 12 }} stroke="rgba(255,255,255,0.5)" />
            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
            <Bar dataKey="maxLossPercent" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recommendations */}
      <div className="bg-card border rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3">Risk Assessment & Recommendations</h3>
        <div className="space-y-2">
          {results.recommendations.length > 0 ? (
            results.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                {rec.startsWith('✓') ? (
                  <Shield className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                ) : rec.startsWith('⚠️') ? (
                  <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                )}
                <p className="text-foreground">{rec.replace(/^[✓⚠️📊]\s/, '')}</p>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No specific recommendations.</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          onClick={() => {
            setResults(null);
            setLoading(false);
          }}
          className="flex-1"
        >
          Back
        </Button>
        <Button onClick={onClose} className="flex-1">
          Close
        </Button>
      </div>
    </div>
  );
}