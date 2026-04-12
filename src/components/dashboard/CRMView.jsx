import { Users, Building2, Star, Target } from "lucide-react";

const stats = [
  { label: "Total Contacts", value: "1,842", icon: Users },
  { label: "Companies", value: "647", icon: Building2 },
  { label: "Active Deals", value: "234", icon: Star },
  { label: "Pipeline Value", value: "$8.4M", icon: Target },
];

const stages = [
  { name: "New", count: 42, value: "$810K", color: "border-t-muted-foreground" },
  { name: "Contacted", count: 38, value: "$720K", color: "border-t-xps-blue" },
  { name: "Qualified", count: 31, value: "$1.2M", color: "border-t-primary" },
  { name: "Proposal", count: 24, value: "$2.1M", color: "border-t-xps-orange" },
  { name: "Negotiation", count: 12, value: "$1.8M", color: "border-t-xps-purple" },
  { name: "Closed Won", count: 87, value: "$1.7M", color: "border-t-xps-green" },
];

export default function CRMView() {
  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <div>
        <h1 className="text-xl font-bold text-foreground">CRM Dashboard</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Customer relationship management and pipeline overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-card rounded-lg border border-border p-4 hover:border-primary/20 transition-colors">
              <Icon className="w-5 h-5 text-primary/70 mb-3" />
              <div className="text-lg md:text-2xl font-bold text-foreground truncate">{stat.value}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-card rounded-lg border border-border p-4">
        <h3 className="text-sm font-semibold text-foreground mb-4">Pipeline Stages</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {stages.map((stage) => (
            <div key={stage.name} className={`bg-secondary/50 rounded-lg p-3 text-center border-t-2 ${stage.color}`}>
              <div className="text-[10px] text-muted-foreground mb-1">{stage.name}</div>
              <div className="text-base md:text-xl font-bold text-foreground">{stage.count}</div>
              <div className="text-[10px] text-primary mt-1">{stage.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}