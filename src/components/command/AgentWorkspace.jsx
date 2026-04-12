import { useState } from "react";
import { cn } from "@/lib/utils";
import { Globe, Image, Video, Code, Radar, Terminal, MessageCircle, X, Minus } from "lucide-react";
import AgentChat from "./AgentChat";
import BrowserPanel from "./BrowserPanel";
import ImageGenerator from "../editor/ImageGenerator";
import VideoCreator from "../editor/VideoCreator";
import UIBuilder from "../editor/UIBuilder";
import ShadowScraper from "../admin/ShadowScraper";
import AdminChat from "../admin/AdminChat";

const AGENT_TOOLS = {
  xps_assistant: ["browser", "image", "video", "ui", "scraper", "terminal"],
  ceo_orchestrator: ["browser", "terminal", "scraper"],
  lead_gen: ["browser", "scraper", "terminal"],
  sales_director: ["browser", "image", "ui"],
  seo_marketing: ["browser", "image", "video", "ui", "scraper"],
  social_media: ["image", "video", "browser"],
  billing_controller: ["browser", "ui"],
  prediction: ["browser", "terminal"],
  simulation: ["browser", "terminal"],
  recommendation: ["browser", "terminal"],
  scraper: ["browser", "scraper", "terminal"],
  code_agent: ["browser", "ui", "terminal"],
  validation: ["browser", "terminal"],
  security: ["browser", "terminal"],
  security_ops: ["browser", "terminal", "scraper"],
  reputation: ["browser", "image", "scraper"],
  maintenance: ["browser", "terminal"],
  logging: ["browser", "terminal"],
};

const ALL_TOOLS = [
  { id: "browser", label: "Browser", icon: Globe },
  { id: "image", label: "Image Gen", icon: Image },
  { id: "video", label: "Video", icon: Video },
  { id: "ui", label: "UI Builder", icon: Code },
  { id: "scraper", label: "Scraper", icon: Radar },
  { id: "terminal", label: "Terminal", icon: Terminal },
];

export default function AgentWorkspace({ agent }) {
  const agentTools = AGENT_TOOLS[agent.id] || ["browser", "terminal"];
  const availableTools = ALL_TOOLS.filter(t => agentTools.includes(t.id));
  const [activeTool, setActiveTool] = useState(availableTools[0]?.id || "browser");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMinimized, setChatMinimized] = useState(false);

  const Icon = agent.icon;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Tool tabs bar */}
      <div className="flex items-center gap-0.5 px-2 py-1 border-b border-border bg-card/20 flex-shrink-0">
        <div className="flex items-center gap-1.5 mr-2 flex-shrink-0">
          <Icon className={cn("w-3.5 h-3.5", agent.color)} />
          <span className="text-[10px] font-bold text-foreground">{agent.name}</span>
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        </div>
        <div className="h-4 w-px bg-border flex-shrink-0 mr-1" />
        {availableTools.map(t => {
          const TIcon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTool(t.id)}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all whitespace-nowrap",
                activeTool === t.id ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              <TIcon className="w-3 h-3" />
              {t.label}
            </button>
          );
        })}

        {/* Chat toggle */}
        <button
          onClick={() => { setChatOpen(!chatOpen); setChatMinimized(false); }}
          className={cn(
            "ml-auto flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all",
            chatOpen ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          )}
        >
          <MessageCircle className="w-3 h-3" />
          Chat
        </button>
      </div>

      {/* Full workspace area */}
      <div className="flex-1 overflow-hidden relative">
        {/* Tool takes full space */}
        <div className="absolute inset-0">
          {activeTool === "browser" && <BrowserPanel />}
          {activeTool === "image" && <div className="p-4 h-full overflow-y-auto"><ImageGenerator /></div>}
          {activeTool === "video" && <div className="p-4 h-full overflow-y-auto"><VideoCreator /></div>}
          {activeTool === "ui" && <div className="p-4 h-full overflow-y-auto"><UIBuilder /></div>}
          {activeTool === "scraper" && <ShadowScraper />}
          {activeTool === "terminal" && <AdminChat />}
        </div>

        {/* Floating chat overlay */}
        {chatOpen && !chatMinimized && (
          <div className="absolute bottom-3 right-3 w-[380px] h-[500px] max-h-[70vh] max-w-[90vw] rounded-xl border border-border bg-card shadow-2xl shadow-black/40 flex flex-col overflow-hidden z-50">
            {/* Chat header */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card/80 flex-shrink-0">
              <Icon className={cn("w-3.5 h-3.5", agent.color)} />
              <span className="text-[11px] font-bold text-foreground flex-1">{agent.name}</span>
              <button onClick={() => setChatMinimized(true)} className="p-0.5 rounded hover:bg-secondary/50">
                <Minus className="w-3 h-3 text-muted-foreground" />
              </button>
              <button onClick={() => setChatOpen(false)} className="p-0.5 rounded hover:bg-secondary/50">
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <AgentChat agent={agent} onClose={() => setChatOpen(false)} hideHeader />
            </div>
          </div>
        )}

        {/* Minimized chat bubble */}
        {chatOpen && chatMinimized && (
          <button
            onClick={() => setChatMinimized(false)}
            className="absolute bottom-3 right-3 w-12 h-12 rounded-full metallic-gold-bg flex items-center justify-center shadow-lg shadow-black/30 z-50 hover:scale-110 transition-transform"
          >
            <MessageCircle className="w-5 h-5 text-background" />
          </button>
        )}
      </div>
    </div>
  );
}