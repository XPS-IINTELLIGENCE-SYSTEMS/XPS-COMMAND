import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const stats = [
  { label: "Emails Sent", value: "4,218", sub: "+18% vs last month" },
  { label: "Open Rate", value: "34.2%", sub: "+2.1% vs last month" },
  { label: "Response Rate", value: "12.8%", sub: "+3.4% vs last month" },
  { label: "Meetings Booked", value: "89", sub: "+22% vs last month" },
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
  { name: "Southeast FL", value: 35, color: "hsl(40, 60%, 58%)" },
  { name: "Central FL", value: 25, color: "hsl(40, 50%, 48%)" },
  { name: "Southwest FL", value: 20, color: "hsl(240, 5%, 45%)" },
  { name: "Northeast FL", value: 12, color: "hsl(240, 5%, 35%)" },
  { name: "Northwest FL", value: 8, color: "hsl(240, 5%, 25%)" },
];

export default function AnalyticsView() {
  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-5 overflow-y-auto h-full">
      <div>
        <h1 className="text-lg md:text-xl font-bold text-foreground">Analytics</h1>
        <p className="text-[11px] text-muted-foreground">Performance overview and pipeline metrics</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card rounded-2xl border border-border p-3 md:p-4">
            <div className="text-[11px] text-muted-foreground">{stat.label}</div>
            <div className="text-xl font-bold text-foreground mt-1">{stat.value}</div>
            <div className="text-[11px] text-primary/80 mt-0.5">{stat.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
        <div className="md:col-span-2 bg-card rounded-2xl border border-border p-3 md:p-4">
          <h3 className="text-sm font-semibold text-foreground">Revenue vs Target</h3>
          <p className="text-[11px] text-muted-foreground mb-4">Monthly actual vs target revenue</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 6%, 14%)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(240, 5%, 55%)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(240, 5%, 55%)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}K`} />
              <Tooltip contentStyle={{ background: 'hsl(240, 8%, 7%)', border: '1px solid hsl(240, 6%, 14%)', borderRadius: 12, fontSize: 11 }} />
              <Bar dataKey="actual" fill="hsl(40, 60%, 58%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="target" fill="hsl(240, 6%, 18%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-2xl border border-border p-4">
          <h3 className="text-sm font-semibold text-foreground">Territory</h3>
          <p className="text-[11px] text-muted-foreground mb-2">Lead distribution</p>
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
              <div key={item.name} className="flex items-center justify-between text-[11px]">
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