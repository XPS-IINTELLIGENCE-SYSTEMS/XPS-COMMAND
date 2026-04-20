import { useState, useMemo } from "react";
import { TrendingUp, DollarSign, BarChart3, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";

const PROJECT_TYPES = ["warehouse", "retail", "restaurant", "healthcare", "industrial", "education", "government", "hotel", "automotive", "fitness", "mixed_use", "other"];
const TYPE_COLORS = {
  warehouse: "#d4af37", retail: "#06b6d4", restaurant: "#f59e0b", healthcare: "#22c55e",
  industrial: "#8b5cf6", education: "#ec4899", government: "#ef4444", hotel: "#14b8a6",
  automotive: "#f97316", fitness: "#84cc16", mixed_use: "#0ea5e9", other: "#64748b",
};

export default function SniperForecasting({ gcs, scopes }) {
  const [months, setMonths] = useState(6);

  const forecast = useMemo(() => {
    // Segment analysis by project type
    const segments = {};
    PROJECT_TYPES.forEach(pt => { segments[pt] = { contacted: 0, responded: 0, scopes: 0, submitted: 0, won: 0, totalValue: 0 }; });

    // Count GCs by project type
    gcs.forEach(gc => {
      let types = [];
      try { types = JSON.parse(gc.project_types || "[]"); } catch {}
      const contacted = gc.bid_list_status !== "not_contacted";
      const responded = ["active", "approved"].includes(gc.bid_list_status);
      types.forEach(pt => {
        if (!segments[pt]) segments[pt] = { contacted: 0, responded: 0, scopes: 0, submitted: 0, won: 0, totalValue: 0 };
        if (contacted) segments[pt].contacted++;
        if (responded) segments[pt].responded++;
      });
    });

    // Count scopes by project type
    scopes.forEach(s => {
      const pt = s.project_type || "other";
      if (!segments[pt]) return;
      segments[pt].scopes++;
      if (["submitted", "under_review", "won", "lost", "no_response"].includes(s.bid_status)) segments[pt].submitted++;
      if (s.bid_status === "won") {
        segments[pt].won++;
        segments[pt].totalValue += s.contract_value || s.total_bid_price || 0;
      }
    });

    // Calculate rates and projections
    const totalContacted = gcs.filter(g => g.bid_list_status !== "not_contacted").length;
    const totalResponded = gcs.filter(g => ["active", "approved"].includes(g.bid_list_status)).length;
    const responseRate = totalContacted > 0 ? totalResponded / totalContacted : 0.15; // default 15%
    const allSubmitted = scopes.filter(s => ["submitted", "under_review", "won", "lost", "no_response"].includes(s.bid_status));
    const allWon = scopes.filter(s => s.bid_status === "won");
    const overallWinRate = allSubmitted.length > 0 ? allWon.length / allSubmitted.length : 0.25; // default 25%
    const avgProjectValue = allWon.length > 0
      ? allWon.reduce((sum, s) => sum + (s.contract_value || s.total_bid_price || 0), 0) / allWon.length
      : 75000; // default $75k

    // Monthly projection: new GCs discovered per month × response rate × win rate × avg value
    const newGCsPerMonth = gcs.length > 0 ? Math.ceil(gcs.length / Math.max(1, monthsSinceFirst(gcs))) : 30;
    const monthlyScopes = Math.round(newGCsPerMonth * responseRate);
    const monthlyWins = monthlyScopes * overallWinRate;
    const monthlyRevenue = monthlyWins * avgProjectValue;

    // Build monthly chart data
    const chartData = [];
    const now = new Date();
    for (let i = 0; i < months; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      // Growth factor: compound 5% monthly as database grows
      const growth = Math.pow(1.05, i);
      chartData.push({
        month: label,
        projected: Math.round(monthlyRevenue * growth),
        conservative: Math.round(monthlyRevenue * growth * 0.6),
        optimistic: Math.round(monthlyRevenue * growth * 1.4),
      });
    }

    // Segment breakdown for chart
    const segmentData = PROJECT_TYPES
      .filter(pt => segments[pt].contacted > 0 || segments[pt].scopes > 0)
      .map(pt => ({
        type: pt,
        contacted: segments[pt].contacted,
        responded: segments[pt].responded,
        scopes: segments[pt].scopes,
        won: segments[pt].won,
        winRate: segments[pt].submitted > 0 ? ((segments[pt].won / segments[pt].submitted) * 100).toFixed(0) : "—",
        avgValue: segments[pt].won > 0 ? Math.round(segments[pt].totalValue / segments[pt].won) : null,
        responseRate: segments[pt].contacted > 0 ? ((segments[pt].responded / segments[pt].contacted) * 100).toFixed(0) : "—",
      }));

    return {
      responseRate, overallWinRate, avgProjectValue, newGCsPerMonth,
      monthlyScopes, monthlyWins, monthlyRevenue,
      chartData, segmentData,
      totalRevenue6mo: chartData.reduce((s, d) => s + d.projected, 0),
    };
  }, [gcs, scopes, months]);

  return (
    <div className="glass-card rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 metallic-gold-icon" />
          <span className="text-xs font-bold metallic-gold">Revenue Forecast</span>
        </div>
        <select
          value={months}
          onChange={e => setMonths(Number(e.target.value))}
          className="h-7 rounded-lg px-2 text-[10px] bg-secondary border border-border text-foreground"
        >
          <option value={3}>3 Months</option>
          <option value={6}>6 Months</option>
          <option value={12}>12 Months</option>
        </select>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <KPI label="Response Rate" value={`${(forecast.responseRate * 100).toFixed(1)}%`} color="#06b6d4" />
        <KPI label="Win Rate" value={`${(forecast.overallWinRate * 100).toFixed(1)}%`} color="#22c55e" />
        <KPI label="Avg Project Value" value={`$${(forecast.avgProjectValue / 1000).toFixed(0)}K`} color="#d4af37" />
        <KPI label="Monthly Proj. Rev" value={`$${(forecast.monthlyRevenue / 1000).toFixed(0)}K`} color="#8b5cf6" />
        <KPI label={`${months}mo Total`} value={`$${(forecast.totalRevenue6mo / 1000).toFixed(0)}K`} color="#f59e0b" />
      </div>

      {/* Revenue Chart */}
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={forecast.chartData} barGap={2}>
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#888" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#888" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
            <Tooltip
              contentStyle={{ background: "hsl(240 8% 7%)", border: "1px solid hsl(240 6% 14%)", borderRadius: 8, fontSize: 11 }}
              formatter={(v) => [`$${v.toLocaleString()}`, ""]}
            />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="conservative" name="Conservative" fill="#64748b" radius={[3,3,0,0]} />
            <Bar dataKey="projected" name="Projected" fill="#d4af37" radius={[3,3,0,0]} />
            <Bar dataKey="optimistic" name="Optimistic" fill="#22c55e" radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Segment Breakdown */}
      {forecast.segmentData.length > 0 && (
        <div>
          <h3 className="text-[11px] font-bold text-foreground mb-2">Segment Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-left">
                  <th className="py-1.5 px-2">Type</th>
                  <th className="py-1.5 px-2">Contacted</th>
                  <th className="py-1.5 px-2">Response %</th>
                  <th className="py-1.5 px-2">Scopes</th>
                  <th className="py-1.5 px-2">Win %</th>
                  <th className="py-1.5 px-2">Avg Value</th>
                </tr>
              </thead>
              <tbody>
                {forecast.segmentData.map(seg => (
                  <tr key={seg.type} className="border-b border-border/20">
                    <td className="py-1.5 px-2 font-medium capitalize" style={{ color: TYPE_COLORS[seg.type] || "#888" }}>{seg.type.replace(/_/g, " ")}</td>
                    <td className="py-1.5 px-2 text-foreground">{seg.contacted}</td>
                    <td className="py-1.5 px-2 text-foreground">{seg.responseRate}%</td>
                    <td className="py-1.5 px-2 text-foreground">{seg.scopes}</td>
                    <td className="py-1.5 px-2 text-foreground">{seg.winRate}%</td>
                    <td className="py-1.5 px-2 text-foreground">{seg.avgValue ? `$${(seg.avgValue/1000).toFixed(0)}K` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function KPI({ label, value, color }) {
  return (
    <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2 text-center">
      <div className="text-sm sm:text-base font-bold" style={{ color }}>{value}</div>
      <div className="text-[9px] text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

function monthsSinceFirst(gcs) {
  if (!gcs.length) return 1;
  const dates = gcs.map(g => new Date(g.discovered_date || g.created_date)).filter(d => !isNaN(d));
  if (!dates.length) return 1;
  const earliest = Math.min(...dates);
  return Math.max(1, Math.round((Date.now() - earliest) / (30 * 24 * 60 * 60 * 1000)));
}