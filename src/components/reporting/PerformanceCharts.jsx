import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const monthlyData = [
  { month: "Oct", leads: 145, conversions: 38, revenue: 42000, score: 72 },
  { month: "Nov", leads: 189, conversions: 52, revenue: 58000, score: 76 },
  { month: "Dec", leads: 167, conversions: 44, revenue: 49000, score: 74 },
  { month: "Jan", leads: 210, conversions: 61, revenue: 68000, score: 79 },
  { month: "Feb", leads: 243, conversions: 73, revenue: 81000, score: 83 },
  { month: "Mar", leads: 278, conversions: 89, revenue: 97000, score: 87 },
];

const pipelineData = [
  { name: "Prospecting", value: 34, color: "#3b82f6" },
  { name: "Qualified", value: 28, color: "#8b5cf6" },
  { name: "Proposal", value: 18, color: "#d4af37" },
  { name: "Negotiation", value: 12, color: "#f97316" },
  { name: "Closed Won", value: 8, color: "#22c55e" },
];

const workflowPerf = [
  { name: "Lead Gen", success: 94, fail: 6 },
  { name: "Scraping", success: 87, fail: 13 },
  { name: "Scoring", success: 96, fail: 4 },
  { name: "Outreach", success: 78, fail: 22 },
  { name: "Profiling", success: 91, fail: 9 },
  { name: "Closing", success: 82, fail: 18 },
];

const tooltipStyle = {
  contentStyle: { background: "hsl(240 8% 7%)", border: "1px solid hsl(240 6% 16%)", borderRadius: 8, fontSize: 11, color: "#fff" },
  itemStyle: { color: "#fff", fontSize: 11 },
  labelStyle: { color: "#aaa", fontSize: 10 },
};

export default function PerformanceCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Revenue & Leads trend */}
      <div className="p-4 rounded-xl bg-card border border-border">
        <h3 className="text-xs font-semibold text-white mb-1">Revenue & Lead Trend</h3>
        <p className="text-[9px] text-muted-foreground mb-3">6-month rolling performance</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradLeads" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 6% 14%)" />
            <XAxis dataKey="month" tick={{ fill: "#888", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#888", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipStyle} />
            <Area type="monotone" dataKey="revenue" stroke="#d4af37" fill="url(#gradRevenue)" strokeWidth={2} name="Revenue ($)" />
            <Area type="monotone" dataKey="leads" stroke="#3b82f6" fill="url(#gradLeads)" strokeWidth={2} name="Leads" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Pipeline distribution */}
      <div className="p-4 rounded-xl bg-card border border-border">
        <h3 className="text-xs font-semibold text-white mb-1">Pipeline Distribution</h3>
        <p className="text-[9px] text-muted-foreground mb-3">Current stage breakdown</p>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={pipelineData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
              {pipelineData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip {...tooltipStyle} />
            <Legend
              iconType="circle"
              iconSize={6}
              wrapperStyle={{ fontSize: 10, color: "#888" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Workflow success rate */}
      <div className="p-4 rounded-xl bg-card border border-border lg:col-span-2">
        <h3 className="text-xs font-semibold text-white mb-1">Workflow Success Rates</h3>
        <p className="text-[9px] text-muted-foreground mb-3">Node-level performance across active workflows</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={workflowPerf} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 6% 14%)" horizontal={false} />
            <XAxis type="number" tick={{ fill: "#888", fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <YAxis type="category" dataKey="name" tick={{ fill: "#ccc", fontSize: 10 }} axisLine={false} tickLine={false} width={70} />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="success" fill="#22c55e" stackId="a" radius={[0, 0, 0, 0]} name="Success %" />
            <Bar dataKey="fail" fill="#ef4444" stackId="a" radius={[0, 4, 4, 0]} name="Fail %" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}