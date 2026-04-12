import { useState } from "react";
import { 
  Users, MapPin, Database, Shield, Bot, Activity, ArrowUpRight,
  BarChart3, Globe, Swords, Plug, Pencil, Radio, FileBarChart,
  Server, Cpu, Zap, Clock, AlertTriangle, CheckCircle2, ChevronRight,
  GitBranch, Key, RefreshCw, HardDrive, Wifi, Terminal
} from "lucide-react";
import { cn } from "@/lib/utils";
import AdminSystemHealth from "../admin/AdminSystemHealth";
import AdminIntegrationHub from "../admin/AdminIntegrationHub";
import AdminAIModels from "../admin/AdminAIModels";
import AdminActivityLog from "../admin/AdminActivityLog";
import AdminPowerTools from "../admin/AdminPowerTools";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "health", label: "System Health" },
  { id: "integrations", label: "Integrations" },
  { id: "ai", label: "AI Models" },
  { id: "tools", label: "Power Tools" },
  { id: "activity", label: "Activity Log" },
];

const overviewCards = [
  { name: "Users & Roles", desc: "247 active users · 12 admins", icon: Users, stat: "247", trend: "+8 this week" },
  { name: "Franchise Locations", desc: "63 locations across 14 states", icon: MapPin, stat: "63", trend: "+2 this month" },
  { name: "Database", desc: "99.97% uptime · 2.4TB stored", icon: Database, stat: "99.97%", trend: "Healthy" },
  { name: "Security", desc: "0 incidents · Last scan: 2h ago", icon: Shield, stat: "0", trend: "All clear" },
  { name: "AI Models", desc: "3 active · 847K tokens/day", icon: Bot, stat: "3", trend: "847K tok/day" },
  { name: "Automations", desc: "18 workflows · 4.2K runs today", icon: Zap, stat: "18", trend: "4.2K runs" },
  { name: "API Requests", desc: "124K today · 2.1M this month", icon: Server, stat: "124K", trend: "+12% vs yesterday" },
  { name: "Deployments", desc: "v2.4.1 · Last: 3h ago", icon: GitBranch, stat: "v2.4.1", trend: "Stable" },
];

const quickActions = [
  { name: "Research Lab", desc: "Web research & competitor intel", icon: Globe },
  { name: "Competition Watch", desc: "Monitor competitor pricing & activity", icon: Swords },
  { name: "CRM Deep Dive", desc: "Full pipeline & contact explorer", icon: BarChart3 },
  { name: "Editor Studio", desc: "UI builder, image gen, video, web", icon: Pencil },
  { name: "Operator Console", desc: "Direct agent control & command", icon: Radio },
  { name: "AI Reports", desc: "Performance analytics & trend reports", icon: FileBarChart },
];

export default function AdminView() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-3 md:px-6 pt-3 md:pt-5 pb-0">
        <h1 className="text-lg md:text-xl font-bold text-foreground">Admin Command Center</h1>
        <p className="text-[11px] text-muted-foreground mb-3">System administration, infrastructure, and power tools</p>

        {/* Tab bar */}
        <div className="flex gap-1 overflow-x-auto pb-0 -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-3 py-2 text-xs font-medium rounded-t-xl border-b-2 transition-colors whitespace-nowrap",
                activeTab === tab.id
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-border" />

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4">
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "health" && <AdminSystemHealth />}
        {activeTab === "integrations" && <AdminIntegrationHub />}
        {activeTab === "ai" && <AdminAIModels />}
        {activeTab === "tools" && <AdminPowerTools />}
        {activeTab === "activity" && <AdminActivityLog />}
      </div>
    </div>
  );
}

function OverviewTab() {
  return (
    <>
      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        {overviewCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.name} className="bg-card rounded-2xl border border-border p-3 md:p-4 hover:border-primary/20 transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="text-lg md:text-xl font-bold text-foreground">{card.stat}</span>
              </div>
              <div className="text-xs font-semibold text-foreground">{card.name}</div>
              <div className="text-[10px] text-primary/80 mt-0.5">{card.trend}</div>
            </div>
          );
        })}
      </div>

      {/* Power Tools / Quick Access */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" /> Admin Power Tools
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <div key={action.name} className="bg-card rounded-2xl border border-border p-4 hover:border-primary/20 transition-colors cursor-pointer flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground">{action.name}</div>
                  <div className="text-[11px] text-muted-foreground">{action.desc}</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent activity preview */}
      <div className="bg-card rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
          <span className="text-[10px] text-primary font-medium cursor-pointer">View All →</span>
        </div>
        <RecentActivityList limit={5} />
      </div>
    </>
  );
}

const activityEntries = [
  { action: "Updated RBAC policy for Manager role", type: "security", time: "2 min ago" },
  { action: "Auto-deployed v2.4.1 from main branch", type: "deploy", time: "1 hour ago" },
  { action: "AI model fine-tuning completed — accuracy +2.3%", type: "ai", time: "2 hours ago" },
  { action: "Added new location: Nashville, TN", type: "location", time: "3 hours ago" },
  { action: "Bulk email campaign sent to 342 leads", type: "outreach", time: "5 hours ago" },
];

export function RecentActivityList({ limit = 5 }) {
  return (
    <div className="space-y-2.5">
      {activityEntries.slice(0, limit).map((entry, i) => (
        <div key={i} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
          <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
            {entry.type === "security" && <Shield className="w-3.5 h-3.5 text-muted-foreground" />}
            {entry.type === "deploy" && <GitBranch className="w-3.5 h-3.5 text-muted-foreground" />}
            {entry.type === "ai" && <Bot className="w-3.5 h-3.5 text-muted-foreground" />}
            {entry.type === "location" && <MapPin className="w-3.5 h-3.5 text-muted-foreground" />}
            {entry.type === "outreach" && <Zap className="w-3.5 h-3.5 text-muted-foreground" />}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm text-foreground">{entry.action}</span>
          </div>
          <span className="text-[11px] text-muted-foreground flex-shrink-0">{entry.time}</span>
        </div>
      ))}
    </div>
  );
}