import { Users, MapPin, Database, Shield, Bot, Activity } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

const cards = [
  { name: "Users & Roles", desc: "247 active users", icon: Users },
  { name: "Locations", desc: "63 franchise locations", icon: MapPin },
  { name: "Database", desc: "99.9% uptime", icon: Database },
  { name: "Security", desc: "All clear", icon: Shield },
  { name: "AI Models", desc: "3 active models", icon: Bot },
  { name: "Activity Log", desc: "12.4K events", icon: Activity },
];

const auditLog = [
  { action: "Updated RBAC policy for Manager role", time: "2 min ago" },
  { action: "Auto-deployed v2.4.1 from main branch", time: "1 hour ago" },
  { action: "Added new location: Nashville, TN", time: "3 hours ago" },
  { action: "AI model fine tuning completed", time: "Yesterday" },
  { action: "Updated email templates for Southeast region", time: "Yesterday" },
];

export default function AdminView() {
  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-5 overflow-y-auto h-full">
      <div>
        <h1 className="text-lg md:text-xl font-bold text-foreground">Admin</h1>
        <p className="text-[11px] text-muted-foreground">System administration and infrastructure</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.name} className="bg-card rounded-2xl border border-border p-4 hover:border-primary/20 transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <div className="text-sm font-semibold text-foreground">{card.name}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{card.desc}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-card rounded-2xl border border-border p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Recent Activity</h3>
        <div className="space-y-3">
          {auditLog.map((entry, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <span className="text-sm text-foreground">{entry.action}</span>
              <span className="text-[11px] text-muted-foreground flex-shrink-0 ml-3">{entry.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}