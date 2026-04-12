import { Search, Settings, Bell, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";

const viewTitles = {
  dashboard: "Dashboard",
  crm: "CRM",
  leads: "Leads",
  "ai-assistant": "AI Assistant",
  research: "Research Lab",
  outreach: "Outreach",
  proposals: "Proposals",
  analytics: "Analytics",
  knowledge: "Knowledge Base",
  competition: "Competition Watch",
  connectors: "Connectors",
  admin: "Admin",
  settings: "Settings",
};

export default function TopBar({ activeView }) {
  return (
    <div className="h-12 min-h-[48px] border-b border-border flex items-center justify-between px-4 bg-card/50">
      <div className="flex items-center gap-3">
        <div className="text-sm font-medium text-foreground">
          {viewTitles[activeView] || "Dashboard"}
        </div>
      </div>

      <div className="flex-1 max-w-md mx-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search leads, companies, proposals..."
            className="pl-8 h-8 text-xs bg-secondary/50 border-border focus:border-primary/50"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-1.5 rounded-md hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors">
          <Settings className="w-4 h-4" />
        </button>
        <button className="p-1.5 rounded-md hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full" />
        </button>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3" />
          Tampa, FL
        </div>
        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
          MR
        </div>
      </div>
    </div>
  );
}