import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

export default function PortfolioGrowthChart({ intelRecords, totalCurrent }) {
  const chartData = [{ date: 'Start', value: 20000, pnl: 0 }];

  const reports = intelRecords
    .filter(r => (r.tags || '').includes('financial-sandbox') && (r.tags || '').includes('report'))
    .sort((a, b) => new Date(a.scraped_at || a.created_date) - new Date(b.scraped_at || b.created_date));

  for (const report of reports) {
    const match = (report.title || '').match(/\$(\d[\d,]*)/);
    if (match) {
      const value = parseFloat(match[1].replace(/,/g, ''));
      const dt = new Date(report.scraped_at || report.created_date);
      chartData.push({
        date: dt.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        value, pnl: value - 20000,
      });
    }
  }

  if (chartData.length <= 1 || Math.abs((chartData[chartData.length - 1]?.value || 0) - totalCurrent) > 5) {
    chartData.push({ date: 'Now', value: totalCurrent, pnl: totalCurrent - 20000 });
  }

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="glass-card rounded-lg p-2.5 text-[10px] border border-border">
        <div className="font-bold text-foreground">{d.date}</div>
        <div className="text-primary font-semibold">${d.value?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        <div className={d.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
          P&L: {d.pnl >= 0 ? '+' : ''}${d.pnl?.toFixed(2)}
        </div>
      </div>
    );
  };

  return (
    <div className="glass-card rounded-xl p-4">
      <h3 className="text-sm font-bold text-foreground mb-3">Portfolio Growth (Live)</h3>
      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#888' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: '#888' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} tickFormatter={v => `$${(v / 1000).toFixed(1)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={20000} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
            <Area type="monotone" dataKey="value" stroke="#d4af37" strokeWidth={2} fill="url(#growthGrad)" dot={{ r: 3, fill: '#d4af37' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}