import { 
  LayoutDashboard, UserSearch, Send, FileText, BarChart3, Bot, 
  Settings, BookOpen, Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const mainNav = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "leads", label: "Leads", icon: UserSearch },
  { id: "outreach", label: "Outreach", icon: Send },
  { id: "proposals", label: "Proposals", icon: FileText },
  { id: "workflows", label: "AI Workflows", icon: Bot },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

const secondaryNav = [
  { id: "knowledge", label: "Knowledge", icon: BookOpen },
  { id: "admin", label: "Admin", icon: Shield },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ activeView, onViewChange }) {
  return (
    <div className="w-full h-full bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <img
            src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg"
            alt="XPS Logo"
            className="w-8 h-8 object-contain"
          />
          <div>
            <div className="text-xs font-bold metallic-gold tracking-wider">XPS INTELLIGENCE</div>
            <div className="text-[9px] text-muted-foreground tracking-widest">COMMAND CENTER</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="py-4 px-3 space-y-6">
          <div>
            <div className="px-2 mb-2 text-[10px] font-semibold text-muted-foreground/60 tracking-wider uppercase">
              Sales
            </div>
            <div className="space-y-0.5">
              {mainNav.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/60 hover:text-foreground hover:bg-secondary/50"
                    )}
                  >
                    <Icon className={cn("w-[18px] h-[18px]", isActive ? "text-primary" : "text-muted-foreground")} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="px-2 mb-2 text-[10px] font-semibold text-muted-foreground/60 tracking-wider uppercase">
              System
            </div>
            <div className="space-y-0.5">
              {secondaryNav.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/60 hover:text-foreground hover:bg-secondary/50"
                    )}
                  >
                    <Icon className={cn("w-[18px] h-[18px]", isActive ? "text-primary" : "text-muted-foreground")} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      </ScrollArea>
    </div>
  );
}