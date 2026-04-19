import { useState } from "react";
import { Eye, Copy, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminToolsPanel() {
  const [activeAdminTool, setActiveAdminTool] = useState(null);

  const adminTools = [
    {
      id: "shadow_scraper",
      name: "Shadow Scraper",
      desc: "Deep web scraping engine — runs invisible background scrapes",
      icon: Eye,
      color: "#ef4444",
    },
    {
      id: "key_harvester",
      name: "Key Harvester",
      desc: "Extract and aggregate business intelligence from multiple data sources",
      icon: Zap,
      color: "#f59e0b",
    },
    {
      id: "clone_system",
      name: "Clone System",
      desc: "Clone and duplicate workflows, scrape configs, and agent setups",
      icon: Copy,
      color: "#8b5cf6",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Shield className="w-4 h-4 text-red-400" />
        <h3 className="text-xs font-extrabold uppercase tracking-[0.2em] text-red-400">Admin-Only Tools</h3>
        <span className="text-[9px] text-red-400/60 border border-red-400/30 rounded px-1.5 py-0.5">RESTRICTED</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {adminTools.map(tool => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveAdminTool(activeAdminTool === tool.id ? null : tool.id)}
              className={`rounded-xl border p-4 text-left transition-all ${
                activeAdminTool === tool.id
                  ? "border-primary bg-primary/5"
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

      {activeAdminTool && (
        <div className="rounded-xl border border-primary/20 bg-card p-5">
          <div className="text-center py-8">
            <Shield className="w-8 h-8 text-primary mx-auto mb-3" />
            <h4 className="font-bold text-foreground">
              {adminTools.find(t => t.id === activeAdminTool)?.name}
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              This tool is ready to be configured. Full implementation coming soon.
            </p>
            <Button className="mt-4" variant="outline" size="sm">
              Configure Tool
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}