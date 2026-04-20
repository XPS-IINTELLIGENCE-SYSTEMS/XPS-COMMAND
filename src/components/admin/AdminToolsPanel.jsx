import { useState } from "react";
import { Eye, Copy, Zap, Shield } from "lucide-react";
import ShadowScraperPanel from "./ShadowScraperPanel";
import KeyHarvesterPanel from "./KeyHarvesterPanel";
import CloneSystemPanel from "./CloneSystemPanel";

const ADMIN_TOOLS = [
  { id: "shadow_scraper", name: "Shadow Scraper", desc: "Deep web scraping engine — runs invisible background scrapes", icon: Eye, color: "#ef4444" },
  { id: "key_harvester", name: "Key Harvester", desc: "Extract and aggregate business intelligence from multiple data sources", icon: Zap, color: "#f59e0b" },
  { id: "clone_system", name: "Clone System", desc: "Clone and duplicate workflows, scrape configs, and agent setups", icon: Copy, color: "#8b5cf6" },
];

export default function AdminToolsPanel() {
  const [activeTool, setActiveTool] = useState(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Shield className="w-4 h-4 text-red-400" />
        <h3 className="text-xs font-extrabold uppercase tracking-[0.2em] text-red-400">Admin-Only Tools</h3>
        <span className="text-[9px] text-red-400/60 border border-red-400/30 rounded px-1.5 py-0.5">RESTRICTED</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {ADMIN_TOOLS.map(tool => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(activeTool === tool.id ? null : tool.id)}
              className={`rounded-xl border p-4 text-left transition-all ${
                activeTool === tool.id
                  ? "border-primary bg-primary/5 shadow-lg"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <Icon className="w-5 h-5 mb-2" style={{ color: tool.color }} />
              <div className="font-semibold text-sm">{tool.name}</div>
              <div className="text-[11px] text-muted-foreground mt-1">{tool.desc}</div>
            </button>
          );
        })}
      </div>

      {activeTool === "shadow_scraper" && <ShadowScraperPanel />}
      {activeTool === "key_harvester" && <KeyHarvesterPanel />}
      {activeTool === "clone_system" && <CloneSystemPanel />}
    </div>
  );
}