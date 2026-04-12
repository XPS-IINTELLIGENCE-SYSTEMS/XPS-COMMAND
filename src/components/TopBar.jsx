import { Search, Settings, Bell, Sun, Moon } from "lucide-react";
import { Input } from "@/components/ui/input";

const viewTitles = {
  dashboard: "Dashboard",
  crm: "CRM",
  leads: "Leads",
  workflows: "AI Workflows",
  research: "Research Lab",
  outreach: "Outreach",
  proposals: "Proposals",
  analytics: "Analytics",
  reports: "AI Reports",
  knowledge: "Knowledge Base",
  competition: "Competition Watch",
  connectors: "Connectors",
  admin: "Admin",
  settings: "Settings",
  editor: "Editor Studio",
  operator: "Operator",
};

export default function TopBar({ activeView, children, theme, onThemeToggle }) {
  const toggleButtons = children ? (Array.isArray(children) ? children : [children]) : [];
  return (
    <div className="h-12 min-h-[48px] border-b border-border flex items-center justify-between px-4 bg-card/50">
      <div className="flex items-center gap-3">
        {toggleButtons[0]}
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
        <button
          onClick={onThemeToggle}
          className="p-1.5 rounded-md hover:bg-secondary/50 text-foreground transition-colors"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 metallic-silver-icon" /> : <Moon className="w-4 h-4" />}
        </button>
        <button className="p-1.5 rounded-md hover:bg-secondary/50 text-foreground transition-colors">
          <Settings className="w-4 h-4 metallic-silver-icon" />
        </button>
        <button className="p-1.5 rounded-md hover:bg-secondary/50 text-foreground transition-colors relative">
          <Bell className="w-4 h-4 metallic-silver-icon" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 metallic-gold-bg rounded-full" />
        </button>

        <div className="w-7 h-7 rounded-full metallic-gold-bg flex items-center justify-center text-[10px] font-bold text-background">
          MR
        </div>
        {toggleButtons[1]}
      </div>
    </div>
  );
}