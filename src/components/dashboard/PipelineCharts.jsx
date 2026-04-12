import { useState, useEffect } from "react";
import { Loader2, TrendingUp, Users, DollarSign, FileText } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Area, AreaChart } from "recharts";

const CHART_COLORS = [
  "hsl(40, 60%, 58%)",   // gold
  "hsl(40, 40%, 45%)",   // warm bronze  
  "hsl(220, 40%, 55%)",  // steel blue
  "hsl(145, 50%, 42%)",  // emerald
  "hsl(280, 40%, 55%)",  // purple
  "hsl(15, 60%, 55%)",   // copper
  "hsl(200, 50%, 50%)",  // ocean
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card/95 backdrop-blur-md border border-border rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-[11px]">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-semibold text-foreground">
            {typeof p.value === "number" && p.name !== "Count" ? `$${p.value.toLocaleString()}` : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function PipelineCharts() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const [leads, proposals, invoices, emails] = await Promise.all([
      base44.entities.Lead.list("-created_date", 500),
      base44.entities.Proposal.list("-created_date", 200),
      base44.entities.Invoice.list("-created_date", 200),
      base44.entities.OutreachEmail.list("-created_date", 200),
    ]);

    const stages = ["New", "Contacted", "Qualified", "Proposal", "Negotiation", "Won", "Lost"];
    const stageData = stages.map(s => ({
      name: s,
      Count: leads.filter(l => l.stage === s).length,
      Value: leads.filter(l => l.stage === s).reduce((sum, l) => sum + (l.estimated_value || 0), 0),
    }));

    const verticals = {};
    leads.forEach(l => {
      const v = l.vertical || "Other";
      verticals[v] = (verticals[v] || 0) + (l.estimated_value || 0);
    });
    const verticalData = Object.entries(verticals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);

    const now = new Date();
    const activityData = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayLabel = d.toLocaleDateString("en", { month: "short", day: "numeric" });
      activityData.push({
        day: dayLabel,
        Leads: leads.filter(l => l.created_date?.slice(0, 10) === dateStr).length,
        Emails: emails.filter(e => e.created_date?.slice(0, 10) === dateStr).length,
        Proposals: proposals.filter(p => p.created_date?.slice(0, 10) === dateStr).length,
      });
    }

    const totalPipeline = leads.filter(l => !["Won", "Lost"].includes(l.stage)).reduce((s, l) => s + (l.estimated_value || 0), 0);
    const totalWon = leads.filter(l => l.stage === "Won").reduce((s, l) => s + (l.estimated_value || 0), 0);
    const totalInvoiced = invoices.reduce((s, i) => s + (i.total || 0), 0);
    const totalPaid = invoices.filter(i => i.status === "Paid").reduce((s, i) => s + (i.total || 0), 0);

    setData({ stageData, verticalData, activityData, totalPipeline, totalWon, totalInvoiced, totalPaid, leadCount: leads.length, proposalCount: proposals.length });
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="text-xs text-muted-foreground">Loading analytics...</span>
      </div>
    );
  }
  if (!data) return null;

  const kpis = [
    { label: "Total Leads", value: data.leadCount, icon: Users, color: "text-primary" },
    { label: "Pipeline Value", value: `$${data.totalPipeline.toLocaleString()}`, icon: TrendingUp, color: "text-blue-400" },
    { label: "Won Revenue", value: `$${data.totalWon.toLocaleString()}`, icon: DollarSign, color: "text-emerald-400" },
    { label: "Collected", value: `$${data.totalPaid.toLocaleString()}`, icon: FileText, color: "text-primary" },
  ];

  return (
    <div className="space-y-5">
      {/* KPI Cards — premium style */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map(kpi => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="shimmer-card glass-card relative overflow-hidden rounded-xl p-4 group cursor-default">
              <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full bg-primary/5 transition-all group-hover:bg-primary/10" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <div className="shimmer-icon-container w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                    <Icon className={`w-4 h-4 shimmer-icon metallic-gold-icon`} />
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {kpi.value}
                </div>
                <div className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase mt-1">{kpi.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pipeline by Stage */}
        <div className="glass-panel rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-foreground">Pipeline by Stage</h3>
            <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded-full bg-secondary">{data.leadCount} leads</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.stageData} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--secondary))", opacity: 0.5 }} />
              <Bar dataKey="Count" radius={[6, 6, 0, 0]} maxBarSize={40}>
                {data.stageData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Vertical */}
        <div className="glass-panel rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-foreground">Revenue by Vertical</h3>
            <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded-full bg-secondary">{data.verticalData.length} verticals</span>
          </div>
          <div className="flex items-center">
            <ResponsiveContainer width="50%" height={220}>
              <PieChart>
                <Pie data={data.verticalData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={45} strokeWidth={2} stroke="hsl(var(--card))">
                  {data.verticalData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-[50%] pl-2 space-y-1.5">
              {data.verticalData.map((v, i) => (
                <div key={v.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="text-[10px] text-muted-foreground truncate flex-1">{v.name}</span>
                  <span className="text-[10px] font-semibold text-foreground">${(v.value / 1000).toFixed(0)}k</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Timeline — full width area chart */}
      <div className="glass-panel rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-foreground">30-Day Activity</h3>
          <div className="flex items-center gap-3">
            {[
              { name: "Leads", color: CHART_COLORS[0] },
              { name: "Emails", color: CHART_COLORS[3] },
              { name: "Proposals", color: CHART_COLORS[2] },
            ].map(l => (
              <div key={l.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                <span className="text-[10px] text-muted-foreground">{l.name}</span>
              </div>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data.activityData}>
            <defs>
              <linearGradient id="gradLeads" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS[0]} stopOpacity={0.3} />
                <stop offset="100%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradEmails" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS[3]} stopOpacity={0.3} />
                <stop offset="100%" stopColor={CHART_COLORS[3]} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradProposals" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS[2]} stopOpacity={0.3} />
                <stop offset="100%" stopColor={CHART_COLORS[2]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} interval={4} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="Leads" stroke={CHART_COLORS[0]} strokeWidth={2} fill="url(#gradLeads)" />
            <Area type="monotone" dataKey="Emails" stroke={CHART_COLORS[3]} strokeWidth={2} fill="url(#gradEmails)" />
            <Area type="monotone" dataKey="Proposals" stroke={CHART_COLORS[2]} strokeWidth={2} fill="url(#gradProposals)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}