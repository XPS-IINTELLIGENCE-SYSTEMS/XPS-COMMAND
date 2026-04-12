import { Search, Bell, Sun, Moon, Sparkles } from "lucide-react";
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
    <div className="h-14 min-h-[56px] border-b border-border flex items-center justify-between px-5 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        {toggleButtons[0]}
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 metallic-gold-icon" />
          <div className="text-sm font-bold xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            {viewTitles[activeView] || "Dashboard"}
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 metallic-silver-icon" />
          <Input
            placeholder="Search leads, companies, proposals..."
            className="pl-9 h-9 text-xs bg-secondary/30 border-border/50 rounded-xl focus:border-primary/50 chat-input-metallic"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onThemeToggle}
          className="shimmer-card p-2 rounded-xl hover:bg-secondary/50 text-muted-foreground transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 shimmer-icon metallic-silver-icon" /> : <Moon className="w-4 h-4 shimmer-icon metallic-silver-icon" />}
        </button>
        <button className="shimmer-card p-2 rounded-xl hover:bg-secondary/50 text-muted-foreground transition-colors relative">
          <Bell className="w-4 h-4 shimmer-icon metallic-silver-icon" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
        </button>
        <div className="shimmer-card w-9 h-9 rounded-xl metallic-gold-bg flex items-center justify-center text-[11px] font-bold text-background cursor-pointer">
          JR
        </div>
        {toggleButtons[1]}
      </div>
    </div>
  );
}