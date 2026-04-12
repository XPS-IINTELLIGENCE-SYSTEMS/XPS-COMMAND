import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const stats = [
  { label: "Emails Sent", value: "4,218", change: "+18% vs last month", color: "text-xps-green" },
  { label: "Open Rate", value: "34.2%", change: "+2.1% vs last month", color: "text-xps-green" },
  { label: "Response Rate", value: "12.8%", change: "+3.4% vs last month", color: "text-xps-green" },
  { label: "Meetings Booked", value: "89", change: "+22% vs last month", color: "text-xps-green" },
];

const revenueData = [
  { month: "Sep", actual: 280000, target: 350000 },
  { month: "Oct", actual: 320000, target: 360000 },
  { month: "Nov", actual: 390000, target: 370000 },
  { month: "Dec", actual: 450000, target: 400000 },
  { month: "Jan", actual: 410000, target: 420000 },
  { month: "Feb", actual: 480000, target: 450000 },
  { month: "Mar", actual: 520000, target: 480000 },
];

const territoryData = [
  { name: "Southeast FL", value: 35, color: "#D4A853" },
  { name: "Central FL", value: 25, color: "#D4A853CC" },
  { name: "Southwest FL", value: 20, color: "#D4A85399" },
  { name: "Northeast FL", value: 12, color: "#D4A85366" },
  { name: "Northwest FL", value: 8, color: "#D4A85333" },
];

export default function AnalyticsView() {
  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 overflow-y-auto h-full">
      <div>
        <h1 className="text-xl font-bold text-foreground">Analytics Center</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Executive overview of sales performance and pipeline metrics</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card rounded-lg border border-border p-4">
            <div className="text-[10px] text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold text-foreground mt-1">{stat.value}</div>
            <div className={`text-[10px] mt-1 ${stat.color}`}>{stat.change}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
        <div className="md:col-span-2 bg-card rounded-lg border border-border p-3 md:p-4">
          <h3 className="text-sm font-semibold text-foreground">Revenue vs Target</h3>
          <p className="text-[10px] text-muted-foreground mb-4">Monthly actual vs target revenue</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#666' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#666' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}K`} />
              <Tooltip contentStyle={{ background: '#14141B', border: '1px solid #2A2A35', borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="actual" fill="#D4A853" radius={[3, 3, 0, 0]} />
              <Bar dataKey="target" fill="#333" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="text-sm font-semibold text-foreground">Territory Distribution</h3>
          <p className="text-[10px] text-muted-foreground mb-2">Lead distribution by territory</p>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={territoryData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={2}>
                {territoryData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {territoryData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-medium text-foreground">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}