import { useState } from "react";
import { cn } from "@/lib/utils";
import { Radar, Terminal, Shield } from "lucide-react";
import ShadowScraper from "../admin/ShadowScraper";
import CommandScraper from "../admin/CommandScraper";
import AdminChat from "../admin/AdminChat";

const TABS = [
  { id: "command", label: "Command Chat", icon: Terminal },
  { id: "shadow", label: "Shadow Scraper", icon: Radar },
  { id: "scraper", label: "Command Scraper", icon: Shield },
];

export default function AdminView() {
  const [tab, setTab] = useState("command");

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Tab Header */}
      <div className="flex items-center gap-1 px-4 py-2.5 border-b border-border bg-card/30 flex-shrink-0">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                tab === t.id ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              <Icon className={cn("w-3.5 h-3.5", tab === t.id ? "metallic-gold-icon" : "metallic-silver-icon")} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {tab === "command" && <AdminChat />}
        {tab === "shadow" && <ShadowScraper />}
        {tab === "scraper" && <CommandScraper />}
      </div>
    </div>
  );
}