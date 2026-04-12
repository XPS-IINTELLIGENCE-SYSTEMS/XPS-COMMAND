import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Globe, Image, MessageSquare, BarChart3, Zap, Layout, Terminal, X, Sun, Moon, Radar, Search, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import AdminWebBrowser from "../components/admin/AdminWebBrowser";
import AdminImageCreator from "../components/admin/AdminImageCreator";
import MultiAgentChat from "../components/admin/MultiAgentChat";
import GanttChart from "../components/admin/GanttChart";
import ShadowScraper from "../components/admin/ShadowScraper";
import CommandScraper from "../components/admin/CommandScraper";
import AgentHubView from "../components/dashboard/AgentHubView";

const TOOLS = [
  { id: "browser", label: "Browser", icon: Globe },
  { id: "command_scraper", label: "Command Scraper", icon: Search },
  { id: "scraper", label: "Shadow Scraper", icon: Radar },
  { id: "image", label: "Image AI", icon: Image },
  { id: "chat", label: "Agent Chat", icon: MessageSquare },
  { id: "agents", label: "Agent Hub", icon: Bot },
  { id: "gantt", label: "Gantt", icon: BarChart3 },
  { id: "swarm", label: "Swarm CMD", icon: Zap },
];

function SwarmTerminal() {
  const [cmd, setCmd] = useState("");
  const [output, setOutput] = useState([]);
  const [running, setRunning] = useState(false);

  const execute = async () => {
    if (!cmd.trim() || running) return;
    setOutput(prev => [...prev, { type: "cmd", text: `> ${cmd}` }]);
    setRunning(true);
    try {
      const res = await base44.functions.invoke("swarmOrchestrator", { command: cmd });
      setOutput(prev => [...prev, { type: "ok", text: res.data.message || JSON.stringify(res.data, null, 2) }]);
    } catch (err) {
      setOutput(prev => [...prev, { type: "err", text: err.message }]);
    }
    setCmd("");
    setRunning(false);
  };

  return (
    <div className="flex flex-col h-full bg-black/80 rounded-xl overflow-hidden border border-border">
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1">
        <div className="text-green-400">XPS Swarm Orchestrator v1.0</div>
        <div className="text-muted-foreground">Type a command to activate agents...</div>
        {output.map((line, i) => (
          <div key={i} className={cn(
            line.type === "cmd" ? "text-cyan-400" : line.type === "err" ? "text-red-400" : "text-green-300"
          )}>{line.text}</div>
        ))}
        {running && <div className="text-yellow-400 animate-pulse">Executing...</div>}
      </div>
      <div className="flex border-t border-border/30">
        <span className="px-3 py-2 text-green-400 font-mono text-xs">$</span>
        <input
          value={cmd}
          onChange={(e) => setCmd(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && execute()}
          className="flex-1 bg-transparent text-xs text-green-300 font-mono outline-none py-2"
          placeholder="Enter swarm command..."
        />
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const [activeTool, setActiveTool] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("xps-theme") || "dark");

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    localStorage.setItem("xps-theme", theme);
  }, [theme]);

  const renderTool = () => {
    switch (activeTool) {
      case "browser": return <AdminWebBrowser />;
      case "command_scraper": return <CommandScraper />;
      case "scraper": return <ShadowScraper />;
      case "image": return <AdminImageCreator />;
      case "chat": return <MultiAgentChat />;
      case "agents": return <AgentHubView />;
      case "gantt": return <GanttChart />;
      case "swarm": return <SwarmTerminal />;
      default: return null;
    }
  };

  return (
    <div className="h-[100dvh] w-screen flex flex-col bg-background overflow-hidden" style={{ border: '1.5px solid #a0a0a0', animation: 'silver-border-anim 4s ease infinite' }}>
      {/* Top Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-border bg-card/60 flex-shrink-0">
        <a href="/dashboard" className="flex items-center gap-2 mr-3 hover:opacity-80">
          <img src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg" alt="XPS" className="w-6 h-6 object-contain" />
          <span className="text-xs font-extrabold metallic-gold tracking-wider hidden sm:block" style={{ fontFamily: "'Montserrat', sans-serif" }}>ADMIN</span>
        </a>

        <div className="w-px h-6 bg-border mx-1" />

        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(isActive ? null : tool.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all",
                isActive ? "bg-primary/15 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-transparent"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tool.label}</span>
            </button>
          );
        })}

        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-1.5 rounded-md hover:bg-secondary/50">
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-muted-foreground" /> : <Moon className="w-3.5 h-3.5 text-muted-foreground" />}
          </button>
          {activeTool && (
            <button onClick={() => setActiveTool(null)} className="p-1.5 rounded-md hover:bg-secondary/50">
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-hidden">
        {activeTool ? (
          <div className="h-full">{renderTool()}</div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <Layout className="w-16 h-16 mx-auto text-muted-foreground/20" />
              <div>
                <h2 className="text-lg font-bold xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>OPERATOR COMMAND CENTER</h2>
                <p className="text-sm text-muted-foreground mt-1">Select a tool from the toolbar to begin</p>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                {TOOLS.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => setActiveTool(tool.id)}
                      className="shimmer-card flex flex-col items-center gap-2 px-6 py-4 rounded-xl bg-card/60 border border-border hover:border-primary/30 transition-all"
                    >
                      <div className="shimmer-icon-container w-10 h-10 rounded-xl bg-secondary/60 flex items-center justify-center">
                        <Icon className="w-5 h-5 shimmer-icon metallic-silver-icon" />
                      </div>
                      <span className="text-xs font-semibold text-foreground">{tool.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}