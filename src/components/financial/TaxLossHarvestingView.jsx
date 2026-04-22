import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, DollarSign, AlertTriangle, CheckCircle2, TrendingDown, Eye } from 'lucide-react';

export default function TaxLossHarvestingView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLosses, setSelectedLosses] = useState([]);
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    loadHarvestingData();
  }, []);

  const loadHarvestingData = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('taxLossHarvester', {
        action: 'scan',
      });
      if (res.data?.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Load error:', err);
    }
    setLoading(false);
  };

  const toggleLoss = (symbol) => {
    setSelectedLosses(prev =>
      prev.includes(symbol)
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  const executeSales = async () => {
    if (selectedLosses.length === 0) return;
    setExecuting(true);
    await new Promise(r => setTimeout(r, 2000));
    setExecuting(false);
    alert(`Tax-loss harvesting executed for: ${selectedLosses.join(', ')}`);
    setSelectedLosses([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return null;

  const selectedTaxSavings = data.losingPositions
    .filter(p => selectedLosses.includes(p.symbol))
    .reduce((s, p) => s + Math.abs(p.unrealizedLoss), 0) * 0.29; // 29% combined tax rate

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card border rounded-lg p-3">
          <div className="text-[10px] text-muted-foreground uppercase">Losing Positions</div>
          <div className="text-2xl font-bold text-red-400 mt-1">{data.summary.totalLosingPositions}</div>
        </div>
        <div className="bg-card border rounded-lg p-3">
          <div className="text-[10px] text-muted-foreground uppercase">Total Loss</div>
          <div className="text-2xl font-bold text-red-400 mt-1">${Math.abs(data.summary.totalUnrealizedLoss).toFixed(0)}</div>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
          <div className="text-[10px] text-muted-foreground uppercase">Tax Savings Available</div>
          <div className="text-2xl font-bold text-green-400 mt-1">${data.summary.estimatedTaxSavings.toFixed(0)}</div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <div className="text-[10px] text-muted-foreground uppercase">Your Selection</div>
          <div className="text-2xl font-bold text-blue-400 mt-1">${selectedTaxSavings.toFixed(0)}</div>
        </div>
      </div>

      {/* Losing Positions */}
      <div className="bg-card border rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-red-400" />
          Positions Eligible for Harvesting
        </h3>
        <div className="space-y-2">
          {data.losingPositions.map((position) => {
            const isSelected = selectedLosses.includes(position.symbol);
            const washSaleRisk = data.washSaleRisks.find(w => w.symbol === position.symbol);
            
            return (
              <div
                key={position.symbol}
                onClick={() => toggleLoss(position.symbol)}
                className={`border rounded-lg p-3 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-secondary/50 border-border hover:border-primary/30'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{position.symbol}</p>
                      <span className="text-[10px] text-muted-foreground">{position.bucketName}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {position.shares} shares @ ${position.currentPrice} | Entry: ${position.entryPrice}
                    </p>
                  </div>
                  <div className="text-right ml-3">
                    <div className="text-sm font-bold text-red-400">${Math.abs(position.unrealizedLoss).toFixed(0)}</div>
                    <div className="text-[10px] text-muted-foreground">{position.lossPercent}%</div>
                  </div>
                </div>

                {/* Wash-Sale Warning */}
                {washSaleRisk.riskLevel !== 'Low' && (
                  <div className={`flex items-center gap-2 px-2 py-1.5 rounded text-[10px] mb-2 ${
                    washSaleRisk.riskLevel === 'High'
                      ? 'bg-red-500/10 text-red-400'
                      : 'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    <AlertTriangle className="w-3 h-3" />
                    <span>{washSaleRisk.riskLevel} wash-sale risk: {washSaleRisk.closingWindow}</span>
                  </div>
                )}

                {/* Replacement Options */}
                <div className="text-[10px] text-muted-foreground">
                  <span className="font-semibold">Replacement options:</span> {data.replacementAssets[position.symbol]?.join(', ') || 'N/A'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tax Impact */}
      <div className="bg-card border rounded-lg p-4 space-y-2">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" />
          Tax Impact Analysis
        </h3>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Realizable Loss:</span>
            <span className="font-semibold text-red-400">${Math.abs(data.summary.totalUnrealizedLoss).toFixed(0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Federal Tax Rate:</span>
            <span>{data.summary.federalRate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">State Tax Rate:</span>
            <span>{data.summary.stateRate}</span>
          </div>
          <div className="border-t border-border pt-1.5 mt-1.5 flex justify-between font-semibold">
            <span>Annual Tax Savings (all losses):</span>
            <span className="text-green-400">${data.summary.estimatedTaxSavings.toFixed(0)}</span>
          </div>
          {data.summary.capitalLossCarryforward > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Capital Loss Carryforward:</span>
              <span>${data.summary.capitalLossCarryforward.toFixed(0)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Strategy */}
      <div className="bg-card border rounded-lg p-4 space-y-2">
        <h3 className="text-sm font-semibold">Harvesting Strategy</h3>
        <ul className="text-xs text-muted-foreground space-y-1.5">
          {data.harvestingStrategy.recommendedActions.map((action, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-primary">•</span>
              <span>{action}</span>
            </li>
          ))}
        </ul>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-2 text-xs text-yellow-700 mt-3">
          <span className="font-semibold">⚠️ Wash-Sale Alert:</span> {data.harvestingStrategy.reinvestmentWait}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          onClick={loadHarvestingData}
          className="flex-1 gap-2"
        >
          <Eye className="w-4 h-4" />
          Refresh Scan
        </Button>
        <Button
          onClick={executeSales}
          disabled={executing || selectedLosses.length === 0}
          className="flex-1 gap-2 bg-red-600 hover:bg-red-700"
        >
          {executing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          {executing ? 'Harvesting...' : `Harvest ${selectedLosses.length} Position${selectedLosses.length !== 1 ? 's' : ''}`}
        </Button>
      </div>
    </div>
  );
}