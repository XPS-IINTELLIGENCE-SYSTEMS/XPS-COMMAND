import { 
  LayoutDashboard, Users, UserSearch, Bot, FlaskConical, Send, FileText, 
  BarChart3, BookOpen, Eye, Link2, Shield, Settings, Search
} from "lucide-react";
import { cn } from "@/lib/utils";

const navSections = [
  {
    label: "MAIN",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "crm", label: "CRM", icon: Users },
      { id: "leads", label: "Leads", icon: UserSearch },
      { id: "ai-assistant", label: "AI Assistant", icon: Bot },
      { id: "research", label: "Research Lab", icon: FlaskConical },
      { id: "outreach", label: "Outreach", icon: Send },
      { id: "proposals", label: "Proposals", icon: FileText },
      { id: "analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "INTELLIGENCE",
    items: [
      { id: "knowledge", label: "Knowledge Base", icon: BookOpen },
      { id: "competition", label: "Competition", icon: Eye },
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

export default function Sidebar({ activeView, onViewChange }) {
  return (
    <div className="w-[180px] min-w-[180px] h-full bg-sidebar border-r border-sidebar-border flex flex-col overflow-y-auto">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary/20 flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="text-xs font-bold text-foreground tracking-wider">XPS INTELLIGENCE</div>
            <div className="text-[9px] text-muted-foreground tracking-widest">COMMAND CENTER</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-4">
        {navSections.map((section) => (
          <div key={section.label}>
            <div className="px-2 mb-1.5 text-[10px] font-semibold text-muted-foreground tracking-wider">
              {section.label}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150",
                      isActive
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}