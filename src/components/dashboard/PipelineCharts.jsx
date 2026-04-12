import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";

const COLORS = ["#94a3b8", "#60a5fa", "#facc15", "#f97316", "#a78bfa", "#34d399", "#f87171"];

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

    // Stage distribution
    const stages = ["New", "Contacted", "Qualified", "Proposal", "Negotiation", "Won", "Lost"];
    const stageData = stages.map(s => ({
      name: s,
      count: leads.filter(l => l.stage === s).length,
      value: leads.filter(l => l.stage === s).reduce((sum, l) => sum + (l.estimated_value || 0), 0),
    }));

    // Revenue by vertical
    const verticals = {};
    leads.forEach(l => {
      const v = l.vertical || "Other";
      verticals[v] = (verticals[v] || 0) + (l.estimated_value || 0);
    });
    const verticalData = Object.entries(verticals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);

    // Activity over time (last 30 days)
    const now = new Date();
    const activityData = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayLabel = d.toLocaleDateString("en", { month: "short", day: "numeric" });
      activityData.push({
        day: dayLabel,
        leads: leads.filter(l => l.created_date?.slice(0, 10) === dateStr).length,
        emails: emails.filter(e => e.created_date?.slice(0, 10) === dateStr).length,
        proposals: proposals.filter(p => p.created_date?.slice(0, 10) === dateStr).length,
      });
    }

    // Financial summary
    const totalPipeline = leads.filter(l => !["Won", "Lost"].includes(l.stage)).reduce((s, l) => s + (l.estimated_value || 0), 0);
    const totalWon = leads.filter(l => l.stage === "Won").reduce((s, l) => s + (l.estimated_value || 0), 0);
    const totalInvoiced = invoices.reduce((s, i) => s + (i.total || 0), 0);
    const totalPaid = invoices.filter(i => i.status === "Paid").reduce((s, i) => s + (i.total || 0), 0);

    setData({ stageData, verticalData, activityData, totalPipeline, totalWon, totalInvoiced, totalPaid, leadCount: leads.length });
    setLoading(false);
  };

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>;
  if (!data) return null;

  return (
    <div className="space-y-4">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { label: "Total Leads", value: data.leadCount },
          { label: "Pipeline Value", value: `$${data.totalPipeline.toLocaleString()}` },
          { label: "Won Revenue", value: `$${data.totalWon.toLocaleString()}` },
          { label: "Collected", value: `$${data.totalPaid.toLocaleString()}` },
        ].map(kpi => (
          <div key={kpi.label} className="bg-card rounded-xl border border-border p-3">
            <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
            <div className="text-lg font-bold text-foreground">{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Pipeline by Stage */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-xs font-bold text-foreground mb-3">Pipeline by Stage</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.stageData}>
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.stageData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Vertical */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-xs font-bold text-foreground mb-3">Revenue by Vertical</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={data.verticalData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {data.verticalData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} formatter={(v) => `$${v.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="text-xs font-bold text-foreground mb-3">30-Day Activity</h3>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={data.activityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="day" tick={{ fontSize: 8, fill: "hsl(var(--muted-foreground))" }} interval={4} axisLine={false} />
            <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
            <Line type="monotone" dataKey="leads" stroke="#60a5fa" strokeWidth={2} dot={false} name="Leads" />
            <Line type="monotone" dataKey="emails" stroke="#34d399" strokeWidth={2} dot={false} name="Emails" />
            <Line type="monotone" dataKey="proposals" stroke="#facc15" strokeWidth={2} dot={false} name="Proposals" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}