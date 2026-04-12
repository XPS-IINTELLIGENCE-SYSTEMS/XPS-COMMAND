import { 
  LayoutDashboard, Users, UserSearch, Bot, FlaskConical, Send, FileText, 
  BarChart3, BookOpen, Eye, Link2, Shield, Settings, Search, Pencil
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
      { id: "editor", label: "Editor", icon: Pencil },
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
          <img
            src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg"
            alt="XPS Logo"
            className="w-9 h-9 object-contain"
          />
          <div>
            <div className="text-xs font-bold metallic-gold tracking-wider">XPS INTELLIGENCE</div>
            <div className="text-[9px] metallic-gold tracking-widest">COMMAND CENTER</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-4">
        {navSections.map((section) => (
          <div key={section.label}>
            <div className="px-2 mb-1.5 text-[10px] font-semibold text-white/50 tracking-wider">
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
                      "w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
                      isActive
                        ? "bg-white/[0.07] backdrop-blur-md border border-white/[0.12] shadow-[0_0_12px_rgba(212,175,55,0.15),inset_0_1px_0_rgba(255,255,255,0.05)] metallic-gold"
                        : "text-white/80 hover-metallic"
                    )}
                  >
                    <Icon className={cn("w-3.5 h-3.5 flex-shrink-0", isActive ? "metallic-gold-icon" : "metallic-silver-icon")} />
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