import { Server, Cpu, HardDrive, Wifi, Clock, CheckCircle2, AlertTriangle, RefreshCw, Database, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const services = [
  { name: "API Gateway", status: "operational", uptime: "99.99%", latency: "42ms", icon: Server },
  { name: "Database Cluster", status: "operational", uptime: "99.97%", latency: "8ms", icon: Database },
  { name: "AI Inference Engine", status: "operational", uptime: "99.92%", latency: "320ms", icon: Cpu },
  { name: "Email Service", status: "operational", uptime: "99.95%", latency: "180ms", icon: Wifi },
  { name: "Background Jobs", status: "degraded", uptime: "98.8%", latency: "1.2s", icon: Zap },
  { name: "File Storage", status: "operational", uptime: "99.99%", latency: "25ms", icon: HardDrive },
];

const metrics = [
  { label: "Avg Response Time", value: "142ms", change: "-12ms" },
  { label: "Error Rate", value: "0.03%", change: "-0.01%" },
  { label: "Active Connections", value: "1,247", change: "+89" },
  { label: "CPU Utilization", value: "34%", change: "+2%" },
  { label: "Memory Usage", value: "62%", change: "-4%" },
  { label: "Storage Used", value: "2.4 TB", change: "+120 GB" },
];

const incidents = [
  { title: "Background job queue delay", severity: "warning", time: "45 min ago", desc: "Queue processing delayed — auto-scaling triggered" },
  { title: "Scheduled maintenance window", severity: "info", time: "Tomorrow 2:00 AM", desc: "Database cluster rolling update — zero downtime expected" },
];

function StatusDot({ status }) {
  return (
    <span className={cn(
      "w-2 h-2 rounded-full flex-shrink-0",
      status === "operational" ? "bg-green-500" : status === "degraded" ? "bg-yellow-500" : "bg-red-500"
    )} />
  );
}

export default function AdminSystemHealth() {
  return (
    <div className="space-y-4">
      {/* Overall status banner */}
      <div className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
        <div className="flex-1">
          <div className="text-sm font-semibold text-foreground">All Systems Operational</div>
          <div className="text-[11px] text-muted-foreground">1 service with minor degradation · Last checked 30s ago</div>
        </div>
        <button className="p-2 rounded-xl hover:bg-secondary transition-colors">
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Infrastructure metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {metrics.map((m) => (
          <div key={m.label} className="bg-card rounded-2xl border border-border p-3">
            <div className="text-[11px] text-muted-foreground">{m.label}</div>
            <div className="text-lg font-bold text-foreground mt-1">{m.value}</div>
            <div className="text-[10px] text-primary/80">{m.change}</div>
          </div>
        ))}
      </div>

      {/* Service status */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Service Status</h3>
        <div className="space-y-2">
          {services.map((svc) => {
            const Icon = svc.icon;
            return (
              <div key={svc.name} className="bg-card rounded-2xl border border-border p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <StatusDot status={svc.status} />
                    <span className="text-sm font-medium text-foreground">{svc.name}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground ml-4">{svc.uptime} uptime · {svc.latency} avg</div>
                </div>
                <span className="text-[10px] text-muted-foreground capitalize">{svc.status}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Incidents */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Active Incidents</h3>
        <div className="space-y-2">
          {incidents.map((inc) => (
            <div key={inc.title} className={cn(
              "bg-card rounded-2xl border p-4",
              inc.severity === "warning" ? "border-yellow-500/30" : "border-border"
            )}>
              <div className="flex items-start gap-2">
                {inc.severity === "warning" ? (
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <div className="text-sm font-medium text-foreground">{inc.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{inc.desc}</div>
                  <div className="text-[10px] text-muted-foreground/60 mt-1">{inc.time}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}