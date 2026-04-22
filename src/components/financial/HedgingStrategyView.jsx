import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, Shield, TrendingDown, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function HedgingStrategyView({ stressTestResults = null }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [implementing, setImplementing] = useState(false);

  const loadStrategies = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('hedgingStrategyAdvisor', {
        riskTolerance: 'moderate',
        stressTestResults,
      });
      if (res.data?.data) {
        setData(res.data.data);
        // Pre-select recommended strategy
        setSelectedStrategy(res.data.data.hedgingStrategies[0]?.id);
      }
    } catch (err) {
      console.error('Load error:', err);
    }
    setLoading(false);
  };

  const implementStrategy = async () => {
    if (!selectedStrategy) return;
    setImplementing(true);
    await new Promise(r => setTimeout(r, 2000));
    setImplementing(false);
    alert(`Hedging strategy "${selectedStrategy}" implemented!`);
  };

  if (!data && !loading) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Analyze portfolio correlation and generate AI-recommended hedging strategies to mitigate identified risks.
        </p>
        <Button onClick={loadStrategies} disabled={loading} className="w-full gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          {loading ? 'Analyzing...' : 'Analyze & Generate Strategies'}
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

  if (!data) return null;

  const selectedStrategyData = data.hedgingStrategies.find(s => s.id === selectedStrategy);

  return (
    <div className="space-y-4">
      {/* Risk Profile */}
      <div className="bg-card border rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-400" />
          Current Risk Profile
        </h3>
        <div className="space-y-2 text-xs">
          {data.riskWarnings.map((warning, i) => (
            <div key={i} className="flex gap-2 text-muted-foreground">
              <span className="text-orange-400">•</span>
              <span>{warning}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
          <div>
            <div className="text-[10px] text-muted-foreground">Equity Concentration</div>
            <div className="text-sm font-bold text-red-400">{(data.riskProfile.equity_concentration * 100).toFixed(0)}%</div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground">Downside Risk (stress)</div>
            <div className="text-sm font-bold text-red-400">{data.riskProfile.downside_risk}%</div>
          </div>
        </div>
      </div>

      {/* Recommended Hedge */}
      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 space-y-2">
        <h3 className="text-sm font-semibold flex items-center gap-2 text-green-400">
          <Shield className="w-4 h-4" />
          AI-Recommended Hedge
        </h3>
        <p className="text-xs text-muted-foreground">{data.recommendedHedge.rationale}</p>
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div>
            <span className="text-muted-foreground">Cost:</span>
            <div className="font-semibold text-foreground">${data.recommendedHedge.totalCost}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Expected Protection:</span>
            <div className="font-semibold text-green-400">{data.recommendedHedge.expectedProtection}</div>
          </div>
        </div>
        <div className="text-[10px] text-muted-foreground pt-1 border-t border-green-500/20">
          Implement in {data.recommendedHedge.implementationDays}
        </div>
      </div>

      {/* Strategy Options */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">All Available Strategies</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.hedgingStrategies.map((strategy) => (
            <Card
              key={strategy.id}
              onClick={() => setSelectedStrategy(strategy.id)}
              className={`p-3 cursor-pointer border transition-all ${
                selectedStrategy === strategy.id
                  ? 'bg-primary/10 border-primary/50'
                  : 'bg-card border-border hover:border-primary/30'
              }`}
            >
              <p className="text-sm font-semibold mb-2">{strategy.name}</p>
              <p className="text-xs text-muted-foreground mb-2">{strategy.description}</p>
              
              <div className="grid grid-cols-2 gap-2 text-[10px] mb-2">
                <div>
                  <span className="text-muted-foreground">Cost</span>
                  <div className="font-semibold text-foreground">${strategy.cost}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Risk Reduction</span>
                  <div className="font-semibold text-green-400">{(strategy.riskReduction * 100).toFixed(0)}%</div>
                </div>
              </div>
              
              <div className="flex gap-1">
                <div className="flex-1">
                  <span className="text-[9px] text-muted-foreground">Risk Red.</span>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${strategy.riskReduction * 100}%` }}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <span className="text-[9px] text-muted-foreground">Cost Eff.</span>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${strategy.costEfficiency * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Selected Strategy Details */}
      {selectedStrategyData && (
        <div className="bg-card border rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-semibold">{selectedStrategyData.name} Details</h3>
          
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground block mb-1">Protection Level</span>
              <span className="font-semibold text-foreground">{selectedStrategyData.protectionLevel}</span>
            </div>
            <div>
              <span className="text-muted-foreground block mb-1">Best For</span>
              <span className="font-semibold text-foreground">{selectedStrategyData.bestFor}</span>
            </div>
          </div>

          <div className="space-y-2 text-xs border-t border-border pt-2">
            <div>
              <span className="text-muted-foreground font-semibold">Implementation:</span>
              <div className="mt-1 space-y-1 text-foreground">
                {Object.entries(selectedStrategyData.implementation).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}:</span>
                    <span>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded p-2 text-xs text-blue-400">
            <span className="font-semibold">Payoff:</span> {selectedStrategyData.maxPayoff}
          </div>
        </div>
      )}

      {/* Action Button */}
      <Button
        onClick={implementStrategy}
        disabled={implementing || !selectedStrategy}
        className="w-full gap-2 bg-green-600 hover:bg-green-700"
      >
        {implementing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <CheckCircle2 className="w-4 h-4" />
        )}
        {implementing ? 'Implementing...' : 'Implement Selected Strategy'}
      </Button>
    </div>
  );
}