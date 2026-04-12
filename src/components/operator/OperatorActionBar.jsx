import { 
  Globe, Bug, UserPlus, Sparkles, Image, Video, Code, Bot, 
  GitBranch, StickyNote, FileText, Database, Search, Mail,
  BarChart3, Zap, Layers, Pencil
} from "lucide-react";
import { cn } from "@/lib/utils";

const actions = [
  { id: "browser", label: "Web Browser", icon: Globe },
  { id: "scraping", label: "Scraping", icon: Bug },
  { id: "insights", label: "AI Insights", icon: Sparkles },
  { id: "image", label: "Image Gen", icon: Image },
  { id: "video", label: "Video Gen", icon: Video },
  { id: "ui", label: "UI Creator", icon: Code },
  { id: "agent", label: "Agent Creator", icon: Bot },
  { id: "workflow", label: "Workflows", icon: GitBranch },
  { id: "notes", label: "Notes", icon: StickyNote },
  { id: "proposals", label: "Proposals", icon: FileText },
  { id: "data", label: "Data Query", icon: Database },
  { id: "research", label: "Research", icon: Search },
  { id: "outreach", label: "Outreach", icon: Mail },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "automations", label: "Automations", icon: Zap },
];

export default function OperatorActionBar({ activePanel, onPanelChange }) {
  return (
    <div className="h-14 min-h-[56px] border-t border-border bg-card/80 backdrop-blur-sm flex items-center px-2 md:px-3 gap-0.5 md:gap-1 overflow-x-auto">
      {actions.map((action) => {
        const Icon = action.icon;
        const isActive = activePanel === action.id;
        return (
          <button
            key={action.id}
            onClick={() => onPanelChange(action.id)}
            className={cn(
              "flex flex-col items-center gap-0.5 px-1.5 md:px-2.5 py-1.5 rounded-lg text-[8px] md:text-[9px] font-medium transition-all duration-200 whitespace-nowrap min-w-[44px] md:min-w-[56px]",
              isActive
                ? "bg-primary/15 border border-primary/30 metallic-gold shadow-[0_0_10px_rgba(212,175,55,0.15)]"
                : "text-muted-foreground hover-metallic"
            )}
            title={action.label}
          >
            <Icon className={cn("w-4 h-4", isActive ? "metallic-gold-icon" : "metallic-silver-icon")} />
            <span className="truncate max-w-[52px]">{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}