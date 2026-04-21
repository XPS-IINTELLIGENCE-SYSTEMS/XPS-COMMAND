import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Eye, Zap } from "lucide-react";

export default function LaunchSimulationPanel({ simulation }) {
  let priceData = [];
  let patterns = [];
  try { priceData = JSON.parse(simulation?.price_simulation_data || '[]'); } catch {}
  try { patterns = JSON.parse(simulation?.pattern_analysis || '[]'); } catch {}

  if (priceData.length === 0) return <div className="text-xs text-muted-foreground text-center py-8">Run launch simulation to see price action.</div>;

  const peak = Math.max(...priceData.map(d => d.price || 0));
  const low = Math.min(...priceData.map(d => d.price || 0));
  const final = priceData[priceData.length - 1]?.price || 0;
  const initial = priceData[0]?.price || 0.001;
  const roi = initial > 0 ? ((final - initial) / initial * 100) : 0;

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="glass-card rounded-lg p-2.5 text-[10px] border border-border max-w-[220px]">
        <div className="font-bold text-foreground">Day {d.day}</div>
        <div className="text-primary font-bold">${d.price?.toFixed(6)}</div>
        <div className="text-muted-foreground">Vol: {d.volume} · MC: {d.market_cap}</div>
        <div className="text-muted-foreground flex items-center gap-1"><Users className="w-2.5 h-2.5" />{d.holders} holders</div>
        {d.key_event && <div className="text-foreground/80 mt-1 border-t border-border/30 pt-1">{d.key_event}</div>}
        {d.pattern_detected && <div className="text-purple-400"><Eye className="w-2.5 h-2.5 inline mr-1" />{d.pattern_detected}</div>}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {[
          { label: 'Launch', value: `$${initial.toFixed(6)}`, color: 'text-muted-foreground' },
          { label: 'Peak', value: `$${peak.toFixed(6)}`, color: 'text-green-400' },
          { label: 'Low', value: `$${low.toFixed(6)}`, color: 'text-red-400' },
          { label: 'Final', value: `$${final.toFixed(6)}`, color: 'text-primary' },
          { label: 'ROI', value: `${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%`, color: roi >= 0 ? 'text-green-400' : 'text-red-400' },
        ].map((s, i) => (
          <div key={i} className="glass-card rounded-lg p-2.5 text-center">
            <div className="text-[8px] text-muted-foreground uppercase">{s.label}</div>
            <div className={`text-sm font-black ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Price Chart */}
      <div className="glass-card rounded-xl p-4">
        <h3 className="text-sm font-bold text-foreground mb-3">30-Day Price Simulation</h3>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={priceData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="cryptoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#888' }} axisLine={false} tickLine={false} tickFormatter={v => `D${v}`} />
              <YAxis tick={{ fontSize: 9, fill: '#888' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={initial} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
              <Area type="monotone" dataKey="price" stroke="#d4af37" strokeWidth={2} fill="url(#cryptoGrad)" dot={{ r: 2, fill: '#d4af37' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Patterns Detected */}
      {patterns.length > 0 && (
        <div className="glass-card rounded-xl p-4">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><Eye className="w-4 h-4 text-purple-400" />Patterns Detected ({patterns.length})</h3>
          <div className="space-y-2">
            {patterns.map((p, i) => (
              <div key={i} className="border border-purple-500/20 rounded-lg p-2.5 text-[10px]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">{p.pattern}</span>
                  <div className="flex items-center gap-2">
                    <Badge className="text-[7px]" variant={p.tradeable ? 'default' : 'secondary'}>{p.tradeable ? 'Tradeable' : 'Informational'}</Badge>
                    <span className="text-muted-foreground">Days {p.day_range}</span>
                  </div>
                </div>
                <div className="text-muted-foreground mt-1">{p.significance}</div>
                <div className="text-primary mt-0.5">{p.expected_outcome}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      {simulation?.ai_insights && (
        <div className="glass-card rounded-xl p-4">
          <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2"><Zap className="w-4 h-4 metallic-gold-icon" />Launch Assessment</h3>
          <p className="text-[10px] text-muted-foreground leading-relaxed">{simulation.ai_insights}</p>
        </div>
      )}
    </div>
  );
}