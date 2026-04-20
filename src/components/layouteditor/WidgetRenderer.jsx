import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, TrendingUp } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#d4af37", "#6366f1", "#22c55e", "#ec4899", "#f59e0b", "#06b6d4", "#ef4444", "#8b5cf6", "#14b8a6", "#f97316"];

function StatCardWidget({ config }) {
  const [count, setCount] = useState(null);
  useEffect(() => {
    const load = async () => {
      const items = await base44.entities[config.entity]?.list?.("-created_date", 500).catch(() => []);
      setCount(items?.length || 0);
    };
    load();
  }, [config.entity]);
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{config.title}</p>
        <p className="text-2xl font-extrabold text-foreground">{count ?? <Loader2 className="w-4 h-4 animate-spin" />}</p>
      </div>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: (config.color || "#d4af37") + "15" }}>
        <TrendingUp className="w-5 h-5" style={{ color: config.color || "#d4af37" }} />
      </div>
    </div>
  );
}

function ChartBarWidget({ config }) {
  const [data, setData] = useState([]);
  useEffect(() => {
    const load = async () => {
      const items = await base44.entities[config.entity]?.list?.("-created_date", 500).catch(() => []);
      const groups = {};
      (items || []).forEach(item => { const key = item[config.groupBy] || "Unknown"; groups[key] = (groups[key] || 0) + 1; });
      setData(Object.entries(groups).map(([name, value]) => ({ name, value })).slice(0, 10));
    };
    load();
  }, [config.entity, config.groupBy]);
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data}><XAxis dataKey="name" tick={{ fontSize: 9 }} /><YAxis tick={{ fontSize: 9 }} /><Tooltip /><Bar dataKey="value" fill={config.color || "#6366f1"} radius={[4, 4, 0, 0]} /></BarChart>
    </ResponsiveContainer>
  );
}

function ChartPieWidget({ config }) {
  const [data, setData] = useState([]);
  useEffect(() => {
    const load = async () => {
      const items = await base44.entities[config.entity]?.list?.("-created_date", 500).catch(() => []);
      const groups = {};
      (items || []).forEach(item => { const k = item[config.groupBy] || "Other"; groups[k] = (groups[k] || 0) + 1; });
      setData(Object.entries(groups).map(([name, value]) => ({ name, value })).slice(0, 8));
    };
    load();
  }, [config.entity, config.groupBy]);
  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart><Pie data={data} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name }) => name}>
        {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
      </Pie><Tooltip /></PieChart>
    </ResponsiveContainer>
  );
}

function TextBlockWidget({ config }) {
  return <div className="prose prose-sm prose-invert max-w-none text-xs"><ReactMarkdown>{config.content || ""}</ReactMarkdown></div>;
}

function EntityTableWidget({ config }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const load = async () => {
      const items = await base44.entities[config.entity]?.list?.("-created_date", config.limit || 20).catch(() => []);
      setRows(items || []);
      setLoading(false);
    };
    load();
  }, [config.entity, config.limit]);
  const cols = config.columns || [];
  if (loading) return <div className="flex justify-center py-6"><Loader2 className="w-4 h-4 animate-spin text-primary" /></div>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[10px]">
        <thead><tr className="border-b border-border">{cols.map(c => <th key={c} className="px-2 py-1.5 text-left text-muted-foreground font-medium uppercase tracking-wider">{c}</th>)}</tr></thead>
        <tbody>{rows.map((row, i) => (
          <tr key={row.id || i} className="border-b border-border/50 hover:bg-secondary/30">
            {cols.map(c => <td key={c} className="px-2 py-1.5 text-foreground truncate max-w-[150px]">{String(row[c] ?? "")}</td>)}
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function IframeWidget({ config }) {
  if (!config.url) return <p className="text-xs text-muted-foreground text-center py-8">Set a URL in widget config</p>;
  return <iframe src={config.url} className="w-full rounded-lg border border-border" style={{ height: config.height || 400 }} title="embed" />;
}

function PlaceholderWidget({ widgetType }) {
  return <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">Widget: {widgetType}</div>;
}

export default function WidgetRenderer({ widgetType, config }) {
  switch (widgetType) {
    case "stat_card": return <StatCardWidget config={config} />;
    case "chart_bar": return <ChartBarWidget config={config} />;
    case "chart_pie": return <ChartPieWidget config={config} />;
    case "text_block": return <TextBlockWidget config={config} />;
    case "entity_table": return <EntityTableWidget config={config} />;
    case "iframe_embed": return <IframeWidget config={config} />;
    default: return <PlaceholderWidget widgetType={widgetType} />;
  }
}