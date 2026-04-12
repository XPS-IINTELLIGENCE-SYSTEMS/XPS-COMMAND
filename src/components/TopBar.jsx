import { Search, Bell, Sun, Moon } from "lucide-react";
import { Input } from "@/components/ui/input";

const viewTitles = {
  dashboard: "Dashboard",
  leads: "Leads",
  workflows: "AI Workflows",
  research: "Web Research",
  outreach: "Outreach",
  proposals: "Proposals",
  analytics: "Analytics",
  knowledge: "Knowledge Base",
  admin: "Admin",
  settings: "Settings",
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

      <div className="flex items-center gap-2">
        <button
          onClick={onThemeToggle}
          className="p-2 rounded-xl hover:bg-secondary/50 text-muted-foreground transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button className="p-2 rounded-xl hover:bg-secondary/50 text-muted-foreground transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
        </button>
        <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center text-[11px] font-bold text-primary">
          JR
        </div>
        {toggleButtons[1]}
      </div>
    </div>
  );
}