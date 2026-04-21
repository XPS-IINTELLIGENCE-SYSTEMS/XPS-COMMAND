import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

const BUCKET_COLORS = { low_risk: '#22c55e', mid_risk: '#f59e0b', high_risk: '#ef4444', day_trading: '#8b5cf6', business_venture: '#d4af37' };

export default function BucketPerformanceBars({ portfolios }) {
  const data = portfolios.map(p => ({
    name: { low_risk: 'Low', mid_risk: 'Mid', high_risk: 'High', day_trading: 'Day', business_venture: 'Biz' }[p.bucket] || p.bucket,
    pnlPct: p.initial_balance ? ((p.total_gain_loss || 0) / p.initial_balance * 100) : 0,
    color: BUCKET_COLORS[p.bucket] || '#888',
    dayPnl: p.day_gain_loss || 0,
    pnl: p.total_gain_loss || 0,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="glass-card rounded-lg p-2.5 text-[10px] border border-border">
        <div className="font-bold text-foreground">{d.name}</div>
        <div className={d.pnlPct >= 0 ? 'text-green-400' : 'text-red-400'}>
          {d.pnlPct >= 0 ? '+' : ''}{d.pnlPct.toFixed(2)}% (${d.pnl >= 0 ? '+' : ''}{d.pnl.toFixed(2)})
        </div>
      </div>
    );
  };

  return (
    <div className="glass-card rounded-xl p-4">
      <h3 className="text-sm font-bold text-foreground mb-3">Bucket Performance (%)</h3>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} tickFormatter={v => `${v.toFixed(0)}%`} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" />
            <Bar dataKey="pnlPct" radius={[4, 4, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.pnlPct >= 0 ? entry.color : '#ef4444'} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}