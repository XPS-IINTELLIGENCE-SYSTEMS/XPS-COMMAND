import { useState } from "react";
import { Code, Layers, Rocket, ChevronDown, ChevronUp, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const PIE_COLORS = ['#d4af37', '#6366f1', '#22c55e', '#ef4444', '#8b5cf6', '#f59e0b', '#06b6d4', '#ec4899'];

export default function CoinDesignPanel({ simulation }) {
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  let tokenomics = {};
  let deploySteps = [];
  let launchStrategy = {};
  try { tokenomics = JSON.parse(simulation?.tokenomics || '{}'); } catch {}
  try { deploySteps = JSON.parse(simulation?.deployment_steps || '[]'); } catch {}
  try { launchStrategy = JSON.parse(simulation?.launch_strategy || '{}'); } catch {}

  const dist = tokenomics.distribution || [];
  const pieData = dist.map(d => ({ name: d.category, value: d.percentage }));

  const copyCode = () => {
    navigator.clipboard.writeText(simulation?.smart_contract_code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!simulation?.tokenomics) return <div className="text-xs text-muted-foreground text-center py-8">Create a coin to see design details.</div>;

  return (
    <div className="space-y-3">
      {/* Tokenomics */}
      <div className="glass-card rounded-xl p-4">
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><Layers className="w-4 h-4 text-primary" />Tokenomics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={45} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
            {dist.map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px]">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span className="text-foreground font-semibold flex-1">{d.category}</span>
                <span className="text-primary font-bold">{d.percentage}%</span>
                <span className="text-muted-foreground text-[8px]">{d.vesting}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3 text-[9px]">
          <div className="bg-white/[0.03] rounded-lg p-2"><span className="text-muted-foreground block">Buy Tax</span><span className="font-bold text-foreground">{tokenomics.buy_tax_pct || 0}%</span></div>
          <div className="bg-white/[0.03] rounded-lg p-2"><span className="text-muted-foreground block">Sell Tax</span><span className="font-bold text-foreground">{tokenomics.sell_tax_pct || 0}%</span></div>
          <div className="bg-white/[0.03] rounded-lg p-2"><span className="text-muted-foreground block">Max Wallet</span><span className="font-bold text-foreground">{tokenomics.max_wallet_pct || 0}%</span></div>
        </div>
      </div>

      {/* Smart Contract Code */}
      <div className="glass-card rounded-xl p-4">
        <button onClick={() => setShowCode(!showCode)} className="flex items-center justify-between w-full">
          <span className="text-sm font-bold text-foreground flex items-center gap-2"><Code className="w-4 h-4 text-green-400" />Smart Contract Code</span>
          {showCode ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showCode && simulation?.smart_contract_code && (
          <div className="mt-3 relative">
            <Button size="sm" variant="ghost" onClick={copyCode} className="absolute top-2 right-2 text-[9px] h-6 gap-1">
              <Copy className="w-3 h-3" />{copied ? 'Copied!' : 'Copy'}
            </Button>
            <pre className="bg-black/50 rounded-lg p-3 text-[9px] text-green-400 overflow-x-auto max-h-[400px] leading-relaxed whitespace-pre-wrap font-mono">
              {simulation.smart_contract_code}
            </pre>
          </div>
        )}
      </div>

      {/* Deployment Steps */}
      <div className="glass-card rounded-xl p-4">
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><Rocket className="w-4 h-4 text-orange-400" />Deployment Process</h3>
        <div className="space-y-2">
          {deploySteps.map((step, i) => (
            <div key={i} className="flex gap-3 text-[10px]">
              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[9px] font-bold flex-shrink-0">{step.step || i + 1}</div>
              <div className="flex-1">
                <div className="font-bold text-foreground">{step.title}</div>
                <div className="text-muted-foreground">{step.description}</div>
                {step.command && <code className="text-[8px] text-green-400 bg-black/30 rounded px-1.5 py-0.5 mt-1 block">{step.command}</code>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Launch Strategy */}
      {launchStrategy.type && (
        <div className="glass-card rounded-xl p-4 text-[10px]">
          <h3 className="text-sm font-bold text-foreground mb-2">Launch Strategy</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/[0.03] rounded-lg p-2"><span className="text-muted-foreground block">Type</span><span className="font-bold text-foreground">{launchStrategy.type}</span></div>
            <div className="bg-white/[0.03] rounded-lg p-2"><span className="text-muted-foreground block">Initial Liquidity</span><span className="font-bold text-foreground">${launchStrategy.initial_liquidity_usd?.toLocaleString()}</span></div>
          </div>
          {launchStrategy.marketing_plan && <p className="text-muted-foreground mt-2 leading-relaxed">{launchStrategy.marketing_plan}</p>}
        </div>
      )}
    </div>
  );
}