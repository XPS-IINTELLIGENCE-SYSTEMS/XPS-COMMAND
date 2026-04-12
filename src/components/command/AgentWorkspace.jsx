import { useState } from "react";
import { cn } from "@/lib/utils";
import { Globe, Image, Video, Code, Radar, Terminal, ArrowLeft, PanelRightOpen, PanelRightClose } from "lucide-react";
import AgentChat from "./AgentChat";
import BrowserPanel from "./BrowserPanel";
import ImageGenerator from "../editor/ImageGenerator";
import VideoCreator from "../editor/VideoCreator";
import UIBuilder from "../editor/UIBuilder";
import ShadowScraper from "../admin/ShadowScraper";
import AdminChat from "../admin/AdminChat";

// Map agent roles to the tools they get
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

export default function AgentWorkspace({ agent, onClose }) {
  const agentTools = AGENT_TOOLS[agent.id] || ["browser", "terminal"];
  const availableTools = ALL_TOOLS.filter(t => agentTools.includes(t.id));
  const [activeTool, setActiveTool] = useState(availableTools[0]?.id || "browser");
  const [showTools, setShowTools] = useState(true);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Top bar with agent name + tool tabs */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border bg-card/30 flex-shrink-0 overflow-x-auto">
        <button onClick={onClose} className="p-1 rounded-md hover:bg-secondary/50 mr-1 flex-shrink-0">
          <ArrowLeft className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <div className="flex items-center gap-1.5 mr-3 flex-shrink-0">
          <agent.icon className={`w-3.5 h-3.5 ${agent.color || "text-primary"}`} />
          <span className="text-[10px] font-bold text-foreground truncate max-w-[100px]">{agent.name}</span>
        </div>
        <div className="h-4 w-px bg-border flex-shrink-0" />
        {availableTools.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => { setActiveTool(t.id); setShowTools(true); }}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-all whitespace-nowrap",
                activeTool === t.id && showTools ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-3 h-3" />
              <span className="hidden md:inline">{t.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => setShowTools(!showTools)}
          className="ml-auto p-1 rounded-md hover:bg-secondary/50 flex-shrink-0"
          title={showTools ? "Hide tools" : "Show tools"}
        >
          {showTools ? <PanelRightClose className="w-3.5 h-3.5 text-muted-foreground" /> : <PanelRightOpen className="w-3.5 h-3.5 text-muted-foreground" />}
        </button>
      </div>

      {/* Split: Chat + Tool */}
      <div className="flex-1 flex overflow-hidden">
        {/* Agent Chat — always visible */}
        <div className={cn("flex flex-col overflow-hidden border-r border-border", showTools ? "w-1/2 md:w-2/5" : "flex-1")}>
          <AgentChat agent={agent} onClose={onClose} hideHeader />
        </div>

        {/* Tool Panel — toggleable */}
        {showTools && (
          <div className="flex-1 overflow-hidden">
            {activeTool === "browser" && <BrowserPanel />}
            {activeTool === "image" && <div className="p-4 h-full overflow-y-auto"><ImageGenerator /></div>}
            {activeTool === "video" && <div className="p-4 h-full overflow-y-auto"><VideoCreator /></div>}
            {activeTool === "ui" && <div className="p-4 h-full overflow-y-auto"><UIBuilder /></div>}
            {activeTool === "scraper" && <ShadowScraper />}
            {activeTool === "terminal" && <AdminChat />}
          </div>
        )}
      </div>
    </div>
  );
}