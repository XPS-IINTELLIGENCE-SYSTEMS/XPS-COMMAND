import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

const GOLD = "#d4af37";
const SILVER = "#a0a0a0";
const GLASS_BG = "rgba(255,255,255,0.03)";
const GOLD_30 = "rgba(212,175,55,0.3)";
const SILVER_30 = "rgba(160,160,160,0.3)";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card/95 backdrop-blur-xl border border-white/10 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-[10px] text-muted-foreground mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs font-semibold" style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' && p.value > 999 ? `$${(p.value/1000).toFixed(0)}k` : p.value}</p>
      ))}
    </div>
  );
};

export function MiniBarChart({ data, dataKey = "value", xKey = "name", height = 120, color = GOLD }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey={xKey} tick={{ fontSize: 9, fill: SILVER }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 9, fill: SILVER }} axisLine={false} tickLine={false} width={30} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} fillOpacity={0.8} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MiniLineChart({ data, lines = [{ key: "value", color: GOLD }], xKey = "name", height = 120 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey={xKey} tick={{ fontSize: 9, fill: SILVER }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 9, fill: SILVER }} axisLine={false} tickLine={false} width={30} />
        <Tooltip content={<CustomTooltip />} />
        {lines.map((l) => (
          <Line key={l.key} type="monotone" dataKey={l.key} stroke={l.color} strokeWidth={2} dot={{ r: 3, fill: l.color }} activeDot={{ r: 5, fill: l.color, stroke: "#fff", strokeWidth: 1 }} name={l.key} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function MiniAreaChart({ data, dataKey = "value", xKey = "name", height = 120, color = GOLD }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`area-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey={xKey} tick={{ fontSize: 9, fill: SILVER }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 9, fill: SILVER }} axisLine={false} tickLine={false} width={30} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey={dataKey} stroke={color} fillOpacity={1} fill={`url(#area-${dataKey})`} strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function MiniDonutChart({ data, height = 120 }) {
  const colors = [GOLD, SILVER, "#c0c0c0", "#8a8a6a", "#e8d48b", "#6a6a8a"];
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Tooltip content={<CustomTooltip />} />
        <Pie data={data} cx="50%" cy="50%" innerRadius={25} outerRadius={45} paddingAngle={3} dataKey="value">
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} fillOpacity={0.85} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

export function StatRow({ items }) {
  return (
    <div className="flex gap-3 flex-wrap">
      {items.map((item, i) => (
        <div key={i} className="flex-1 min-w-[80px] rounded-lg bg-white/[0.03] border border-white/5 p-2 text-center">
          <div className="text-lg font-bold metallic-gold">{item.value}</div>
          <div className="text-[9px] text-muted-foreground">{item.label}</div>
        </div>
      ))}
    </div>
  );
}