import { Users, DollarSign, FileText, Target, TrendingUp, TrendingDown } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const stats = [
  { label: "Active Leads", value: "2,847", change: "+12.4%", up: true, icon: Users, color: "text-primary" },
  { label: "Pipeline Value", value: "$4.2M", change: "+8.7%", up: true, icon: DollarSign, color: "text-xps-gold" },
  { label: "Proposals Sent", value: "342", change: "+23.1%", up: true, icon: FileText, color: "text-xps-blue" },
  { label: "Close Rate", value: "34.2%", change: "-1.3%", up: false, icon: Target, color: "text-xps-purple" },
];

const revenueData = [
  { month: "Jul", value: 280000 }, { month: "Aug", value: 310000 }, { month: "Sep", value: 295000 },
  { month: "Oct", value: 380000 }, { month: "Nov", value: 420000 }, { month: "Dec", value: 450000 },
  { month: "Jan", value: 470000 }, { month: "Feb", value: 520000 }, { month: "Mar", value: 540000 },
];

const pipelineData = [
  { name: "Prospecting", value: 420, color: "#D4A853" },
  { name: "Qualified", value: 310, color: "#D4A853CC" },
  { name: "Proposal", value: 180, color: "#D4A85399" },
  { name: "Negotiation", value: 90, color: "#D4A85366" },
  { name: "Closed Won", value: 140, color: "#4CAF50" },
];

const topLeads = [
  { name: "Ace Hardware Distribution", score: 92, value: "$45,000" },
  { name: "Tampa Bay Brewing Co.", score: 87, value: "$28,000" },
  { name: "Sunshine Auto Group", score: 84, value: "$62,000" },
];

const recentActivity = [
  { action: "New lead scored 92", detail: "Ace Hardware Distribution", time: "2 min ago" },
  { action: "Proposal viewed", detail: "Gulf Coast Logistics", time: "15 min ago" },
  { action: "Meeting scheduled", detail: "Palm Medical Center", time: "1 hour ago" },
];

export default function DashboardView() {
  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto h-full">
      <div>
        <h1 className="text-xl font-bold text-foreground">Good morning, Marcus</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Here's your sales intelligence briefing for today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-card rounded-lg border border-[#8a8a8a]/30 p-4 hover:border-primary/20 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <Icon className={`w-5 h-5 ${stat.color} opacity-70`} />
                <div className={`flex items-center gap-1 text-[10px] font-medium ${stat.up ? "text-xps-green" : "text-xps-red"}`}>
                  {stat.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {stat.change}
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
        <div className="md:col-span-2 bg-card rounded-lg border border-[#8a8a8a]/30 p-3 md:p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Revenue Pipeline</h3>
              <p className="text-[10px] text-muted-foreground">Monthly pipeline value trend</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4A853" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#D4A853" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#666' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#666' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}K`} />
              <Tooltip contentStyle={{ background: '#14141B', border: '1px solid #2A2A35', borderRadius: 8, fontSize: 11 }} />
              <Area type="monotone" dataKey="value" stroke="#D4A853" fill="url(#goldGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-lg border border-[#8a8a8a]/30 p-4">
          <h3 className="text-sm font-semibold text-foreground">Pipeline Stages</h3>
          <p className="text-[10px] text-muted-foreground mb-2">Lead distribution by stage</p>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={pipelineData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={2}>
                {pipelineData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {pipelineData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-medium text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
        <div className="bg-card rounded-lg border border-[#8a8a8a]/30 p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Top Leads</h3>
          <div className="space-y-2.5">
            {topLeads.map((lead) => (
              <div key={lead.name} className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-foreground">{lead.name}</div>
                  <div className="text-[10px] text-muted-foreground">Score: {lead.score}</div>
                </div>
                <div className="text-xs font-semibold text-primary">{lead.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-lg border border-[#8a8a8a]/30 p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Recent Activity</h3>
          <div className="space-y-2.5">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-foreground">{item.action}</div>
                  <div className="text-[10px] text-muted-foreground">{item.detail}</div>
                </div>
                <div className="text-[10px] text-muted-foreground">{item.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}