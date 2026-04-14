import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, TrendingUp, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const COLORS = ["#d4af37", "#c0c0c0", "#60a5fa", "#a78bfa", "#f97316", "#22c55e", "#ef4444", "#06b6d4"];

export default function StrategicAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const [leads, proposals, invoices] = await Promise.all([
      base44.entities.Lead.list("-created_date", 1000),
      base44.entities.Proposal.list("-created_date", 500),
      base44.entities.Invoice.list("-created_date", 500),
    ]);

    // Lead conversion funnel
    const stages = ["Incoming", "Validated", "Qualified", "Prioritized", "Contacted", "Proposal", "Negotiation", "Won", "Lost"];
    const funnel = stages.map(s => ({ stage: s, count: leads.filter(l => l.stage === s).length }));

    // Revenue by source
    const sources = {};
    leads.filter(l => l.stage === "Won").forEach(l => {
      const src = l.ingestion_source || "Manual";
      sources[src] = (sources[src] || 0) + (l.estimated_value || 0);
    });
    const sourceData = Object.entries(sources).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    // By vertical
    const verticals = {};
    leads.forEach(l => {
      const v = l.vertical || "Other";
      if (!verticals[v]) verticals[v] = { total: 0, won: 0, value: 0 };
      verticals[v].total++;
      if (l.stage === "Won") { verticals[v].won++; verticals[v].value += (l.estimated_value || 0); }
    });
    const verticalData = Object.entries(verticals).map(([name, d]) => ({
      name, total: d.total, won: d.won, value: d.value, conversion: d.total > 0 ? Math.round((d.won / d.total) * 100) : 0,
    })).sort((a, b) => b.value - a.value);

    // Pipeline by state
    const stateMap = {};
    leads.forEach(l => {
      const st = l.state || "Unknown";
      stateMap[st] = (stateMap[st] || 0) + (l.estimated_value || 0);
    });
    const stateData = Object.entries(stateMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);

    // Pipeline forecast (simplified)
    const activeValue = leads.filter(l => !["Won", "Lost"].includes(l.stage)).reduce((s, l) => s + (l.estimated_value || 0), 0);
    const wonValue = leads.filter(l => l.stage === "Won").reduce((s, l) => s + (l.estimated_value || 0), 0);

    setData({ funnel, sourceData, verticalData, stateData, activeValue, wonValue, totalLeads: leads.length });
    setLoading(false);
  };

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  if (!data) return null;

  return (
    <div className="space-y-4">
      {/* Conversion Funnel */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="text-base font-bold text-foreground">Lead Conversion Funnel</h3>
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.funnel}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="stage" tick={{ fontSize: 10, fill: "#999" }} />
              <YAxis tick={{ fontSize: 10, fill: "#999" }} />
              <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 8 }} />
              <Bar dataKey="count" fill="#d4af37" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue by Source */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-bold text-foreground mb-3">Revenue by Lead Source</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.sourceData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: $${(value / 1000).toFixed(0)}k`} labelLine={false}>
                  {data.sourceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => `$${(v / 1000).toFixed(0)}k`} contentStyle={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top States */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-bold text-foreground mb-3">Pipeline by State (Top 10)</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.stateData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#999" }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#999" }} width={40} />
                <Tooltip formatter={(v) => `$${(v / 1000).toFixed(0)}k`} contentStyle={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 8 }} />
                <Bar dataKey="value" fill="#c0c0c0" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Vertical performance table */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-bold text-foreground mb-3">Performance by Vertical</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-2 px-2">Vertical</th>
                <th className="text-right py-2 px-2">Leads</th>
                <th className="text-right py-2 px-2">Won</th>
                <th className="text-right py-2 px-2">Conv %</th>
                <th className="text-right py-2 px-2">Value</th>
              </tr>
            </thead>
            <tbody>
              {data.verticalData.slice(0, 10).map(v => (
                <tr key={v.name} className="border-b border-border/30">
                  <td className="py-2 px-2 font-medium text-foreground">{v.name}</td>
                  <td className="py-2 px-2 text-right">{v.total}</td>
                  <td className="py-2 px-2 text-right text-green-400">{v.won}</td>
                  <td className="py-2 px-2 text-right font-semibold" style={{ color: v.conversion > 30 ? "#22c55e" : v.conversion > 15 ? "#eab308" : "#ef4444" }}>{v.conversion}%</td>
                  <td className="py-2 px-2 text-right text-primary">${(v.value / 1000).toFixed(0)}k</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}