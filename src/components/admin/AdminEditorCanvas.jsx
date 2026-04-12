import { useState } from "react";
import { Layout, Image, Video, Type, Wand2, Sparkles, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AdminWebBrowser from "./AdminWebBrowser";
import AdminImageCreator from "./AdminImageCreator";
import MultiAgentChat from "./MultiAgentChat";
import GanttChart from "../admin/GanttChart";
import ShadowScraper from "../admin/ShadowScraper";
import CommandScraper from "./CommandScraper";
import AgentHubView from "../dashboard/AgentHubView";

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
    <div className="flex flex-col h-full bg-black/60 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1">
        <div className="text-green-400">XPS Swarm Orchestrator v1.0</div>
        <div className="text-white/30">Type a command to activate agents...</div>
        {output.map((line, i) => (
          <div key={i} className={line.type === "cmd" ? "text-cyan-400" : line.type === "err" ? "text-red-400" : "text-green-300"}>
            {line.text}
          </div>
        ))}
        {running && <div className="text-yellow-400 animate-pulse">Executing...</div>}
      </div>
      <div className="flex border-t border-white/10">
        <span className="px-3 py-2 text-green-400 font-mono text-xs">$</span>
        <input value={cmd} onChange={(e) => setCmd(e.target.value)} onKeyDown={(e) => e.key === "Enter" && execute()}
          className="flex-1 bg-transparent text-xs text-green-300 font-mono outline-none py-2" placeholder="Enter swarm command..." />
      </div>
    </div>
  );
}

function EditorHome() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center space-y-6 max-w-lg">
        <div className="flex items-center justify-center gap-4 mb-2">
          {[Image, Video, Layout, Type].map((Icon, i) => (
            <div key={i} className="shimmer-card w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Icon className="w-6 h-6 shimmer-icon text-white/30" />
            </div>
          ))}
        </div>
        <div>
          <h2 className="text-xl font-extrabold xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            CREATIVE STUDIO
          </h2>
          <p className="text-xs text-white/40 mt-2 leading-relaxed">
            Select a tool from the right toolbar — or tell the admin chat what you want to create.
            Image generation, web browsing, multi-agent discussions, scraping, and more.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {["Generate Image", "Browse Web", "Run Scraper", "Multi-Agent Chat", "Swarm Command"].map((label) => (
            <span key={label} className="text-[10px] text-white/30 px-3 py-1.5 rounded-full border border-white/10">
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminEditorCanvas({ activeTool }) {
  switch (activeTool) {
    case "browser": return <AdminWebBrowser />;
    case "scraper": return <CommandScraper />;
    case "image": return <AdminImageCreator />;
    case "chat": return <MultiAgentChat />;
    case "agents": return <AgentHubView />;
    case "gantt": return <GanttChart />;
    case "swarm": return <SwarmTerminal />;
    default: return <EditorHome />;
  }
}