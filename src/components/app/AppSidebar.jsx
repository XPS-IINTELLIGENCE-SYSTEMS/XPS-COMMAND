import { useState } from "react";
import {
  LayoutDashboard, Users, UserSearch, Bot, FlaskConical, Send, FileText,
  BarChart3, BookOpen, Swords, Link2, Settings, Shield, ChevronLeft,
  ChevronRight, Search, Briefcase, Building2
} from "lucide-react";

const NAV_SECTIONS = [
  {
    label: "MAIN",
    items: [
      { id: "command", label: "Dashboard", icon: LayoutDashboard },
      { id: "crm", label: "CRM", icon: Users },
      { id: "xpress_leads", label: "Leads", icon: UserSearch },
      { id: "ai_assistant", label: "AI Assistant", icon: Bot },
      { id: "research", label: "Research Lab", icon: FlaskConical },
      { id: "get_work", label: "Outreach", icon: Send },
      { id: "win_work", label: "Proposals", icon: FileText },
      { id: "analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "SCRAPER TOOLS",
    items: [
      { id: "find_jobs", label: "Find Jobs", icon: Briefcase },
      { id: "find_companies", label: "Find Companies", icon: Building2 },
    ],
  },
  {
    label: "INTELLIGENCE",
    items: [
      { id: "knowledge", label: "Knowledge Base", icon: BookOpen },
      { id: "competition", label: "Competition", icon: Swords },
      { id: "connectors", label: "Connectors", icon: Link2 },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      { id: "admin", label: "Admin", icon: Shield },
      { id: "settings", label: "Settings", icon: Settings },
    ],
  },
];

export default function AppSidebar({ activeView, onViewChange, collapsed, onToggleCollapse }) {
  return (
    <aside
      className={`flex-shrink-0 border-r border-border bg-card/50 flex flex-col transition-all duration-300 ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-2 px-4 h-14 border-b border-border">
        <img
          src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg"
          alt="XPS"
          className="w-7 h-7 object-contain flex-shrink-0"
        />
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="text-sm font-extrabold metallic-gold tracking-wider leading-none">XPS INTELLIGENCE</div>
            <div className="text-[9px] text-muted-foreground tracking-widest">COMMAND CENTER</div>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="ml-auto p-1 rounded hover:bg-secondary text-muted-foreground"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-2 scrollbar-hide">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-2">
            {!collapsed && (
              <div className="px-4 py-1.5 text-[10px] font-semibold text-muted-foreground tracking-widest">
                {section.label}
              </div>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary border-r-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                  } ${collapsed ? "justify-center px-2" : ""}`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-primary" : ""}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}