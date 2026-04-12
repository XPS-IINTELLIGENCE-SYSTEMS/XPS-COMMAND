import { 
  Globe, Bug, UserPlus, Sparkles, Image, Video, Code, Bot, 
  GitBranch, StickyNote, FileText, Database, Search, Mail,
  BarChart3, Zap, Layers, Pencil
} from "lucide-react";
import { cn } from "@/lib/utils";

const actions = [
  { id: "browser", label: "Web Browser", icon: Globe, color: "text-blue-400" },
  { id: "scraping", label: "Scraping", icon: Bug, color: "text-green-400" },
  { id: "leads", label: "New Leads", icon: UserPlus, color: "text-emerald-400" },
  { id: "insights", label: "AI Insights", icon: Sparkles, color: "text-yellow-400" },
  { id: "image", label: "Image Gen", icon: Image, color: "text-pink-400" },
  { id: "video", label: "Video Gen", icon: Video, color: "text-purple-400" },
  { id: "ui", label: "UI Creator", icon: Code, color: "text-cyan-400" },
  { id: "agent", label: "Agent Creator", icon: Bot, color: "text-orange-400" },
  { id: "workflow", label: "Workflows", icon: GitBranch, color: "text-indigo-400" },
  { id: "notes", label: "Notes", icon: StickyNote, color: "text-amber-400" },
  { id: "proposals", label: "Proposals", icon: FileText, color: "text-teal-400" },
  { id: "data", label: "Data Query", icon: Database, color: "text-violet-400" },
  { id: "research", label: "Research", icon: Search, color: "text-sky-400" },
  { id: "outreach", label: "Outreach", icon: Mail, color: "text-rose-400" },
  { id: "analytics", label: "Analytics", icon: BarChart3, color: "text-lime-400" },
  { id: "automations", label: "Automations", icon: Zap, color: "text-fuchsia-400" },
];

export default function OperatorActionBar({ activePanel, onPanelChange }) {
  return (
    <div className="h-14 min-h-[56px] border-t border-border bg-card/80 backdrop-blur-sm flex items-center px-3 gap-1 overflow-x-auto">
      {actions.map((action) => {
        const Icon = action.icon;
        const isActive = activePanel === action.id;
        return (
          <button
            key={action.id}
            onClick={() => onPanelChange(action.id)}
            className={cn(
              "flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg text-[9px] font-medium transition-all duration-200 whitespace-nowrap min-w-[56px]",
              isActive
                ? "bg-primary/15 border border-primary/30 text-primary shadow-[0_0_10px_rgba(212,175,55,0.15)]"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            )}
            title={action.label}
          >
            <Icon className={cn("w-4 h-4", isActive ? "text-primary" : action.color)} />
            <span className="truncate max-w-[52px]">{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}