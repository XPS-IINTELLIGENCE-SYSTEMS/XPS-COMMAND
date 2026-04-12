import { useState } from "react";
import { Users, MapPin, Database, Shield, Bot, Box, GitBranch, Activity } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AdminIntegrations from "../admin/AdminIntegrations";

const cards = [
  { name: "Users & Roles", desc: "Manage 247 users across 4 role types", icon: Users, stat: "247 active" },
  { name: "Locations", desc: "60+ XPS franchise locations configured", icon: MapPin, stat: "63 locations" },
  { name: "Database", desc: "PostgreSQL cluster health and metrics", icon: Database, stat: "99.9% uptime" },
  { name: "Security", desc: "RBAC policies, audit trails, and compliance", icon: Shield, stat: "All clear" },
  { name: "AI Factory", desc: "xps-ai-factory model status and endpoints", icon: Bot, stat: "3 models" },
  { name: "Deployments", desc: "Railway + GitHub deployment pipeline", icon: Box, stat: "v2.4.1" },
  { name: "Repositories", desc: "GitHub sync for xps-scraper, open-agent-builder", icon: GitBranch, stat: "4 repos" },
  { name: "Activity Log", desc: "System-wide audit and event logging", icon: Activity, stat: "12.4K events" },
];

const auditLog = [
  { type: "Admin", action: "Updated RBAC policy for Manager role", time: "2 min ago" },
  { type: "System", action: "Auto-deployed v2.4.1 from main branch", time: "1 hour ago" },
  { type: "Admin", action: "Added new location: Nashville, TN", time: "3 hours ago" },
  { type: "System", action: "AI model fine tuning completed", time: "Yesterday" },
  { type: "Admin", action: "Updated email templates for Southeast region", time: "Yesterday" },
];

export default function AdminView() {
  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <div>
        <h1 className="text-xl font-bold text-foreground">Admin Control Plane</h1>
        <p className="text-xs text-muted-foreground mt-0.5">System administration, security, and infrastructure management</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-secondary/50 border border-border">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="integrations" className="text-xs">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-4">
          <div className="grid grid-cols-4 gap-3">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.name} className="bg-card rounded-lg border border-border p-4 hover:border-primary/20 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="w-5 h-5 text-primary/70" />
                    <span className="text-[10px] text-muted-foreground">{card.stat}</span>
                  </div>
                  <div className="text-xs font-semibold text-foreground">{card.name}</div>
                  <p className="text-[10px] text-muted-foreground mt-1">{card.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-card rounded-lg border border-border p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Recent Audit Log</h3>
            <div className="space-y-2">
              {auditLog.map((entry, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                      entry.type === "Admin" ? "bg-primary/15 text-primary" : "bg-xps-blue/15 text-xps-blue"
                    }`}>
                      {entry.type}
                    </span>
                    <span className="text-xs text-foreground">{entry.action}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{entry.time}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="mt-4">
          <AdminIntegrations />
        </TabsContent>
      </Tabs>
    </div>
  );
}