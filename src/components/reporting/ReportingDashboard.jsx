import { Activity, Users, DollarSign, Target, Zap, TrendingUp, BarChart3, Percent } from "lucide-react";
import MetricCard from "./MetricCard";
import PerformanceCharts from "./PerformanceCharts";
import TrendInsights from "./TrendInsights";
import MonthlySummary from "./MonthlySummary";

const metrics = [
  { label: "Total Leads", value: "278", change: 14.4, changeLabel: "vs Feb 2026", icon: Users, color: "#3b82f6" },
  { label: "Revenue", value: "$97K", change: 19.8, changeLabel: "vs Feb 2026", icon: DollarSign, color: "#22c55e" },
  { label: "Conversion Rate", value: "32%", change: 6.7, changeLabel: "+2pp MoM", icon: Target, color: "#d4af37" },
  { label: "Workflows Run", value: "1,847", change: 22.1, changeLabel: "Mar total", icon: Zap, color: "#8b5cf6" },
  { label: "AI Accuracy", value: "87%", change: 4.8, changeLabel: "Scoring model", icon: BarChart3, color: "#f97316" },
  { label: "Pipeline Value", value: "$412K", change: 11.2, changeLabel: "Active deals", icon: Activity, color: "#06b6d4" },
  { label: "Email Open Rate", value: "42%", change: 3.1, changeLabel: "Last 30 days", icon: Percent, color: "#ec4899" },
  { label: "Growth Rate", value: "18.6%", change: 18.6, changeLabel: "Month-over-month", icon: TrendingUp, color: "#22c55e" },
];

export default function ReportingDashboard() {
  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-sm font-bold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 metallic-gold-icon" />
          AI Performance Reports
        </h1>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Aggregated metrics from active workflows · Real-time analysis · Automated summaries
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>

      {/* Charts */}
      <PerformanceCharts />

      {/* Insights + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TrendInsights />
        <MonthlySummary />
      </div>
    </div>
  );
}