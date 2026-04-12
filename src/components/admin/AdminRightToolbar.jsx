import { Image, Video, Layout, Wand2, Globe, Search, Radar, MessageSquare, BarChart3, Zap, Bot, FileText, Palette, Type, Box } from "lucide-react";
import { cn } from "@/lib/utils";

const tools = [
  { id: "image", icon: Image, label: "Image AI" },
  { id: "browser", icon: Globe, label: "Browser" },
  { id: "scraper", icon: Radar, label: "Scraper" },
  { id: "chat", icon: MessageSquare, label: "Multi-Agent" },
  { id: "agents", icon: Bot, label: "Agent Hub" },
  { id: "gantt", icon: BarChart3, label: "Gantt" },
  { id: "swarm", icon: Zap, label: "Swarm CMD" },
];

export default function AdminRightToolbar({ activeTool, onToolChange }) {
  return (
    <div className="w-11 min-w-[44px] h-full border-l border-white/10 bg-black/40 flex flex-col items-center py-2 gap-1 overflow-y-auto">
      <div className="text-[7px] font-bold text-white/30 uppercase tracking-widest mb-1 rotate-0">TOOLS</div>
      {tools.map((tool) => {
        const Icon = tool.icon;
        const isActive = activeTool === tool.id;
        return (
          <button
            key={tool.id}
            onClick={() => onToolChange(isActive ? null : tool.id)}
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-all group relative",
              isActive ? "bg-primary/20 text-primary" : "text-white/40 hover:text-white/70 hover:bg-white/5"
            )}
            title={tool.label}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="absolute right-full mr-2 px-2 py-1 rounded bg-black/90 text-[9px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
              {tool.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}