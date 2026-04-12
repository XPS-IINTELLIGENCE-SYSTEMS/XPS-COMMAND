import { 
  Image, Globe, Radar, MessageSquare, BarChart3, Zap, Bot, Search,
  Paperclip, HardDrive, Database, GitBranch, FileText, Wand2, Video,
  Layout, Type, Palette, Eye
} from "lucide-react";
import { cn } from "@/lib/utils";

const mainTools = [
  { id: "image", icon: Image, label: "Image AI", color: "text-purple-400" },
  { id: "browser", icon: Globe, label: "Web Browser", color: "text-blue-400" },
  { id: "command_scraper", icon: Search, label: "Command Scraper", color: "text-cyan-400" },
  { id: "shadow_scraper", icon: Radar, label: "Shadow Scraper", color: "text-red-400" },
  { id: "chat", icon: MessageSquare, label: "Multi-Agent Chat", color: "text-green-400" },
  { id: "agents", icon: Bot, label: "Agent Hub", color: "text-yellow-400" },
  { id: "gantt", icon: BarChart3, label: "Gantt Chart", color: "text-indigo-400" },
  { id: "swarm", icon: Zap, label: "Swarm CMD", color: "text-orange-400" },
];

const creativeTools = [
  { id: "video", icon: Video, label: "Video Creator", color: "text-pink-400" },
  { id: "ui_builder", icon: Layout, label: "UI Builder", color: "text-teal-400" },
  { id: "typography", icon: Type, label: "Typography", color: "text-slate-400" },
  { id: "palette", icon: Palette, label: "Color Palette", color: "text-amber-400" },
];

const connectTools = [
  { id: "attach", icon: Paperclip, label: "Attachments", color: "text-white/60" },
  { id: "drive", icon: HardDrive, label: "Google Drive", color: "text-green-400" },
  { id: "supabase", icon: Database, label: "Supabase", color: "text-emerald-400" },
  { id: "github", icon: GitBranch, label: "GitHub", color: "text-white/60" },
];

function ToolButton({ tool, activeTool, onToolChange }) {
  const Icon = tool.icon;
  const isActive = activeTool === tool.id;
  return (
    <button
      onClick={() => onToolChange(isActive ? null : tool.id)}
      className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center transition-all group relative",
        isActive 
          ? "bg-primary/20 text-primary ring-1 ring-primary/40" 
          : "text-white/30 hover:text-white/80 hover:bg-white/8"
      )}
      title={tool.label}
    >
      <Icon className={cn("w-[18px] h-[18px]", isActive && tool.color)} />
      <span className="absolute right-full mr-3 px-2.5 py-1.5 rounded-lg bg-black/95 border border-white/10 text-[10px] text-white font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
        {tool.label}
      </span>
    </button>
  );
}

export default function AdminRightToolbar({ activeTool, onToolChange }) {
  return (
    <div className="flex flex-col">
      {/* Right side vertical tools */}
      <div className="w-[56px] min-w-[56px] flex flex-col items-center py-3 gap-1 mr-0.5">
        <div className="text-[7px] font-bold text-white/20 uppercase tracking-[0.2em] mb-2">TOOLS</div>
        
        {/* Main tools */}
        {mainTools.map((tool) => (
          <ToolButton key={tool.id} tool={tool} activeTool={activeTool} onToolChange={onToolChange} />
        ))}

        {/* Divider */}
        <div className="w-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-2" />
        
        {/* Creative tools */}
        <div className="text-[6px] font-bold text-white/15 uppercase tracking-[0.15em] mb-1">CREATE</div>
        {creativeTools.map((tool) => (
          <ToolButton key={tool.id} tool={tool} activeTool={activeTool} onToolChange={onToolChange} />
        ))}
        
        {/* Divider */}
        <div className="w-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-2" />
        
        {/* Connect tools */}
        <div className="text-[6px] font-bold text-white/15 uppercase tracking-[0.15em] mb-1">CONNECT</div>
        {connectTools.map((tool) => (
          <ToolButton key={tool.id} tool={tool} activeTool={activeTool} onToolChange={onToolChange} />
        ))}
      </div>

      {/* Corner wrap - bottom right tools */}
      <div className="flex items-center justify-center gap-1 px-1.5 pb-3 mr-0.5">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
          <Eye className="w-[18px] h-[18px] text-white/20" />
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
          <Wand2 className="w-[18px] h-[18px] text-white/20" />
        </div>
      </div>
    </div>
  );
}