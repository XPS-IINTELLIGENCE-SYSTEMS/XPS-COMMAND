import { useState } from "react";
import { 
  Image, Globe, Radar, MessageSquare, BarChart3, Zap, Bot, Search,
  Paperclip, HardDrive, Database, GitBranch, Video, Layout, Type, Palette,
  ChevronDown, ChevronUp, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import AdminChat from "./AdminChat";
import AdminEditorCanvas from "./AdminEditorCanvas";
import { useIsMobile } from "@/hooks/use-mobile";

const toolCategories = [
  {
    label: "TOOLS",
    tools: [
      { id: "image", icon: Image, label: "Image AI", color: "text-purple-400" },
      { id: "browser", icon: Globe, label: "Web Browser", color: "text-blue-400" },
      { id: "command_scraper", icon: Search, label: "Command Scraper", color: "text-cyan-400" },
      { id: "shadow_scraper", icon: Radar, label: "Shadow Scraper", color: "text-red-400" },
      { id: "chat", icon: MessageSquare, label: "Multi-Agent Chat", color: "text-green-400" },
      { id: "agents", icon: Bot, label: "Agent Hub", color: "text-yellow-400" },
      { id: "gantt", icon: BarChart3, label: "Gantt Chart", color: "text-indigo-400" },
      { id: "swarm", icon: Zap, label: "Swarm CMD", color: "text-orange-400" },
    ],
  },
  {
    label: "CREATE",
    tools: [
      { id: "video", icon: Video, label: "Video Creator", color: "text-pink-400" },
      { id: "ui_builder", icon: Layout, label: "UI Builder", color: "text-teal-400" },
      { id: "typography", icon: Type, label: "Typography", color: "text-slate-400" },
      { id: "palette", icon: Palette, label: "Color Palette", color: "text-amber-400" },
    ],
  },
  {
    label: "CONNECT",
    tools: [
      { id: "attach", icon: Paperclip, label: "Attachments", color: "text-white/60" },
      { id: "drive", icon: HardDrive, label: "Google Drive", color: "text-green-400" },
      { id: "supabase", icon: Database, label: "Supabase", color: "text-emerald-400" },
      { id: "github", icon: GitBranch, label: "GitHub", color: "text-white/60" },
    ],
  },
];

function DesktopToolbar({ activeTool, setActiveTool }) {
  return (
    <div className="w-[52px] min-w-[52px] flex flex-col items-center py-2 gap-0.5 mr-[1px]">
      {toolCategories.map((cat, ci) => (
        <div key={cat.label} className="flex flex-col items-center">
          {ci > 0 && <div className="w-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-1.5" />}
          <div className="text-[6px] font-bold text-white/20 uppercase tracking-[0.15em] mb-1">{cat.label}</div>
          {cat.tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(isActive ? null : tool.id)}
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center transition-all group relative",
                  isActive
                    ? "bg-primary/20 text-primary ring-1 ring-primary/40"
                    : "text-white/30 hover:text-white/80 hover:bg-white/8"
                )}
                title={tool.label}
              >
                <Icon className={cn("w-[16px] h-[16px]", isActive && tool.color)} />
                <span className="absolute right-full mr-2 px-2 py-1 rounded-lg bg-black/95 border border-white/10 text-[9px] text-white font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                  {tool.label}
                </span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function MobileToolDropdown({ activeTool, setActiveTool }) {
  const [open, setOpen] = useState(false);
  const [expandedCat, setExpandedCat] = useState(null);

  const activeLabel = toolCategories.flatMap(c => c.tools).find(t => t.id === activeTool)?.label || "Select Tool";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white/[0.06] border border-white/10 rounded-xl text-sm font-semibold text-foreground"
      >
        <span>{activeTool ? activeLabel : "Tools"}</span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-white/10 rounded-xl overflow-hidden z-50 max-h-[60vh] overflow-y-auto shadow-2xl">
          {toolCategories.map((cat) => (
            <div key={cat.label}>
              <button
                onClick={() => setExpandedCat(expandedCat === cat.label ? null : cat.label)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-white/[0.03] border-b border-white/[0.06] text-[11px] font-bold text-muted-foreground uppercase tracking-wider"
              >
                {cat.label}
                {expandedCat === cat.label ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              {expandedCat === cat.label && (
                <div className="py-1">
                  {cat.tools.map((tool) => {
                    const Icon = tool.icon;
                    const isActive = activeTool === tool.id;
                    return (
                      <button
                        key={tool.id}
                        onClick={() => {
                          setActiveTool(isActive ? null : tool.id);
                          setOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2.5 transition-all",
                          isActive ? "bg-primary/15 text-primary" : "text-foreground/70 hover:bg-white/[0.06]"
                        )}
                      >
                        <Icon className={cn("w-4 h-4", isActive ? tool.color : "text-muted-foreground")} />
                        <span className="text-sm font-medium">{tool.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminInlineView() {
  const [activeTool, setActiveTool] = useState(null);
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/[0.08] flex items-center gap-3 flex-shrink-0">
          <img
            src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg"
            alt="XPS"
            className="w-6 h-6 object-contain"
          />
          <span className="text-sm font-extrabold metallic-gold tracking-wider" style={{ fontFamily: "'Montserrat', sans-serif" }}>ADMIN</span>
        </div>

        {/* Tool Dropdown */}
        <div className="px-3 py-2 flex-shrink-0">
          <MobileToolDropdown activeTool={activeTool} setActiveTool={setActiveTool} />
        </div>

        {/* Active Tool or Chat */}
        <div className="flex-1 overflow-hidden">
          {activeTool ? (
            <div className="h-full flex flex-col">
              <div className="px-3 py-2 flex items-center justify-between flex-shrink-0">
                <span className="text-xs font-bold text-muted-foreground uppercase">{toolCategories.flatMap(c=>c.tools).find(t=>t.id===activeTool)?.label}</span>
                <button onClick={() => setActiveTool(null)} className="p-1 rounded-lg hover:bg-white/10">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <div className="flex-1 overflow-auto">
                <AdminEditorCanvas activeTool={activeTool} />
              </div>
            </div>
          ) : (
            <AdminChat />
          )}
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="h-full flex overflow-hidden">
      {/* Left: Chat */}
      <div className="w-[320px] min-w-[320px] border-r border-white/[0.08] flex-shrink-0">
        <AdminChat />
      </div>

      {/* Center: Editor Canvas */}
      <div className="flex-1 overflow-hidden">
        <AdminEditorCanvas activeTool={activeTool} />
      </div>

      {/* Right: Tools flush to right edge */}
      <div className="border-l border-white/[0.08] flex flex-col justify-between">
        <DesktopToolbar activeTool={activeTool} setActiveTool={setActiveTool} />
      </div>
    </div>
  );
}