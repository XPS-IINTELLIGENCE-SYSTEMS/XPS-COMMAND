import { useState, useEffect } from "react";
import { Bot, Zap, MessageSquare, Shield } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

const AI_MODES = [
  {
    id: "full_auto",
    label: "Full Autonomous",
    desc: "AI works independently — accesses tools, connectors, and takes actions automatically",
    icon: Zap,
    color: "text-amber-400",
    subToggles: [
      { key: "ai_gmail", label: "Gmail Access" },
      { key: "ai_drive", label: "Google Drive Access" },
      { key: "ai_calendar", label: "Calendar Access" },
      { key: "ai_sheets", label: "Sheets Access" },
      { key: "ai_hubspot", label: "HubSpot Access" },
      { key: "ai_scraper", label: "Web Scraping" },
      { key: "ai_outreach", label: "Send Emails / SMS" },
      { key: "ai_proposals", label: "Generate Proposals" },
      { key: "ai_task_scheduler", label: "Schedule Tasks" },
    ],
  },
  {
    id: "semi_auto",
    label: "Semi-Autonomous",
    desc: "AI suggests actions and drafts — you approve before execution",
    icon: Shield,
    color: "text-blue-400",
    subToggles: [
      { key: "ai_suggest_emails", label: "Suggest Emails" },
      { key: "ai_suggest_proposals", label: "Suggest Proposals" },
      { key: "ai_research", label: "Research Leads" },
      { key: "ai_analyze", label: "Analyze Data" },
      { key: "ai_draft_content", label: "Draft Content" },
    ],
  },
  {
    id: "basic_chat",
    label: "Basic Chat",
    desc: "AI answers questions only — no actions, no tool access",
    icon: MessageSquare,
    color: "text-muted-foreground",
    subToggles: [],
  },
];

export default function SettingsAIMode() {
  const [mode, setMode] = useState("semi_auto");
  const [toggles, setToggles] = useState({});
  const { toast } = useToast();

  useEffect(() => {
    loadPrefs();
  }, []);

  const loadPrefs = async () => {
    const me = await base44.auth.me();
    if (me?.ai_mode) setMode(me.ai_mode);
    if (me?.ai_toggles) setToggles(me.ai_toggles);
  };

  const selectMode = async (id) => {
    setMode(id);
    await base44.auth.updateMe({ ai_mode: id });
    toast({ title: "AI Mode Updated", description: AI_MODES.find(m => m.id === id)?.label });
  };

  const toggleSub = async (key) => {
    const next = { ...toggles, [key]: !toggles[key] };
    setToggles(next);
    await base44.auth.updateMe({ ai_toggles: next });
  };

  const currentMode = AI_MODES.find(m => m.id === mode);

  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
          <Bot className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">AI Autonomy Mode</h3>
          <p className="text-[10px] text-muted-foreground">Control what the AI assistant can do</p>
        </div>
      </div>

      {/* Mode selection */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {AI_MODES.map(m => {
          const Icon = m.icon;
          const isActive = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => selectMode(m.id)}
              className={cn(
                "p-3 rounded-xl border text-center transition-all",
                isActive ? "border-primary/50 bg-primary/10" : "border-border/30 hover:border-border/60"
              )}
            >
              <Icon className={cn("w-5 h-5 mx-auto mb-1.5", isActive ? m.color : "text-muted-foreground")} />
              <div className={cn("text-xs font-semibold", isActive ? "text-foreground" : "text-muted-foreground")}>{m.label}</div>
              <div className="text-[9px] text-muted-foreground mt-0.5 leading-tight">{m.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Sub-toggles for current mode */}
      {currentMode?.subToggles.length > 0 && (
        <div className="border-t border-border/30 pt-3 space-y-2">
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {currentMode.label} Permissions
          </div>
          {currentMode.subToggles.map(t => (
            <div key={t.key} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/[0.03] transition-colors">
              <span className="text-xs text-foreground">{t.label}</span>
              <Switch
                checked={toggles[t.key] !== false}
                onCheckedChange={() => toggleSub(t.key)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}