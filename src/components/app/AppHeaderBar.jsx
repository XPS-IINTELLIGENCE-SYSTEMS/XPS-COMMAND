import { useState } from "react";
import { Search, Bell, Sun, Moon, User, LogOut, Settings, MapPin, MessageSquare } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AppHeaderBar({ activeView, theme, onThemeToggle, chatOpen, onChatToggle, onViewChange }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const viewLabels = {
    command: "Dashboard", crm: "CRM", xpress_leads: "Leads", ai_assistant: "AI Assistant",
    research: "Research Lab", get_work: "Outreach", win_work: "Proposals", analytics: "Analytics",
    find_jobs: "Find Jobs", find_companies: "Find Companies",
    knowledge: "Knowledge Base", competition: "Competition", connectors: "Connectors",
    admin: "Admin Control", settings: "Settings",
  };

  return (
    <header className="h-12 border-b border-border bg-card/80 backdrop-blur-md flex items-center px-4 gap-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">⊞</span>
        <span className="font-medium text-foreground">{viewLabels[activeView] || "Dashboard"}</span>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search leads, companies, proposals..."
            className="w-full h-8 pl-9 pr-3 bg-secondary/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5">
        <button onClick={onThemeToggle} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground">
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-primary rounded-full" />
        </button>
        <button
          onClick={onChatToggle}
          className={`p-1.5 rounded-lg transition-colors lg:hidden ${chatOpen ? "bg-primary/10 text-primary" : "hover:bg-secondary text-muted-foreground"}`}
        >
          <MessageSquare className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-1.5 ml-1 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3" />
          <span className="hidden sm:inline">Tampa, FL</span>
        </div>

        {/* Avatar menu */}
        <div className="relative ml-1">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary"
          >
            XP
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-border bg-card shadow-xl z-50 py-1">
                <button
                  onClick={() => { setMenuOpen(false); onViewChange("settings"); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-secondary/60"
                >
                  <Settings className="w-3.5 h-3.5 text-muted-foreground" /> Settings
                </button>
                <div className="border-t border-border my-1" />
                <button
                  onClick={() => base44.auth.logout()}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-secondary/60"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}