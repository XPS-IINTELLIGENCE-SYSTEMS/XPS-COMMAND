import { useState } from "react";
import { Layout, Loader2, Sparkles, RotateCw, Check, ChevronDown, ChevronUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { DEFAULT_TOOLS, TOOL_CATEGORIES } from "./dashboardDefaults";

const LAYOUT_PRESETS = [
  { id: "exec", label: "Executive Overview", desc: "Pipeline, calendar, daily summary, top-level KPIs", icon: "👔" },
  { id: "sales", label: "Sales Machine", desc: "Leads, outreach, proposals, follow-ups front & center", icon: "🎯" },
  { id: "ops", label: "Operations Center", desc: "Field tech, scheduling, bids, orchestrator, system health", icon: "⚙️" },
  { id: "intel", label: "Intelligence Hub", desc: "Research, competitors, knowledge base, trends, passive intel", icon: "🧠" },
  { id: "minimal", label: "Minimal Focus", desc: "Only favorites, command notepad, and calendar", icon: "✨" },
  { id: "custom_ai", label: "AI Custom Layout", desc: "Describe what you want — AI builds the perfect layout", icon: "🤖" },
];

const SECTION_POOL = [
  { type: "greeting", title: "Greeting", size: "full" },
  { type: "command_notepad", title: "Command Notepad", size: "half" },
  { type: "quick_workflow", title: "Quick Workflow", size: "half" },
  { type: "create_workflow", title: "Create Workflow", size: "half" },
  { type: "pipeline", title: "Pipeline", size: "full" },
  { type: "calendar", title: "Calendar", size: "full" },
  { type: "summary", title: "Daily Summary", size: "half" },
  { type: "sidebar", title: "Scheduled Items", size: "half" },
  { type: "activity", title: "Activity Stream", size: "full" },
  { type: "favorites", title: "Favorites", size: "full" },
  { type: "tools", title: "All Tools", size: "full" },
  { type: "notes", title: "Quick Notes", size: "half" },
  { type: "quicklinks", title: "Quick Links", size: "half" },
  { type: "system_guardian", title: "System Guardian", size: "full" },
  { type: "financial_sandbox", title: "Financial Sandbox", size: "full" },
  { type: "orchestrator", title: "Orchestrator", size: "full" },
  { type: "focus_dashboard", title: "Focus Dashboard", size: "full" },
];

const PRESET_SECTIONS = {
  exec: ["greeting", "pipeline", "calendar", "summary", "sidebar", "activity", "favorites", "tools"],
  sales: ["greeting", "command_notepad", "quick_workflow", "pipeline", "favorites", "activity", "tools", "calendar"],
  ops: ["greeting", "pipeline", "calendar", "create_workflow", "sidebar", "system_guardian", "orchestrator", "tools"],
  intel: ["greeting", "command_notepad", "activity", "favorites", "tools", "notes", "quicklinks"],
  minimal: ["greeting", "command_notepad", "calendar", "favorites"],
};

const PRESET_FAVORITES = {
  exec: ["master_pipeline", "analytics", "crm", "orchestrator", "system_health"],
  sales: ["xpress_leads", "get_work", "win_work", "outreach_automation", "sentiment_analyst", "crm"],
  ops: ["field_tech", "job_site_map", "bid_center", "scheduler", "workflows", "system_guardian"],
  intel: ["research", "knowledge", "competition", "xps_intel_core", "passive_intel", "master_scraper"],
  minimal: ["xpress_leads", "crm", "win_work"],
};

export default function AutoDashboardConfigurator({ onApply, onClose }) {
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [applied, setApplied] = useState(false);

  const generateLayout = async (presetId) => {
    setSelectedPreset(presetId);
    setLoading(true);
    setPreview(null);
    setApplied(false);

    if (presetId !== "custom_ai") {
      const sectionTypes = PRESET_SECTIONS[presetId] || PRESET_SECTIONS.exec;
      const sections = sectionTypes.map((type, i) => {
        const tmpl = SECTION_POOL.find(s => s.type === type);
        return { id: `sec_${type}_${Date.now() + i}`, type, title: tmpl?.title || type, size: tmpl?.size || "full", collapsed: false };
      });
      const starred = PRESET_FAVORITES[presetId] || [];
      setPreview({ sections, starred, presetId });
      setShowPreview(true);
      setLoading(false);
      return;
    }

    // AI custom layout
    const toolList = DEFAULT_TOOLS.map(t => `${t.id}: ${t.label} — ${t.desc}`).join("\n");
    const sectionList = SECTION_POOL.map(s => `${s.type}: ${s.title} (${s.size})`).join("\n");
    const prompt = `You are a dashboard layout AI for a business management platform. The user wants: "${customPrompt || 'a balanced, productive dashboard'}".

Available dashboard sections:
${sectionList}

Available tools (for favorites):
${toolList}

Return a JSON object with:
- "sections": array of section type strings in display order (pick 5-12 from the list)
- "starred": array of 4-8 tool IDs for the favorites row
- "reasoning": one sentence explaining the layout choice

ONLY return valid JSON, no markdown.`;

    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            sections: { type: "array", items: { type: "string" } },
            starred: { type: "array", items: { type: "string" } },
            reasoning: { type: "string" },
          },
        },
      });
      const validSections = (res.sections || [])
        .filter(type => SECTION_POOL.some(s => s.type === type))
        .map((type, i) => {
          const tmpl = SECTION_POOL.find(s => s.type === type);
          return { id: `sec_${type}_${Date.now() + i}`, type, title: tmpl?.title || type, size: tmpl?.size || "full", collapsed: false };
        });
      const validStarred = (res.starred || []).filter(id => DEFAULT_TOOLS.some(t => t.id === id));
      setPreview({ sections: validSections, starred: validStarred, reasoning: res.reasoning, presetId: "custom_ai" });
      setShowPreview(true);
    } catch (err) {
      console.error("AI layout error:", err);
    }
    setLoading(false);
  };

  const applyLayout = async () => {
    if (!preview) return;
    setLoading(true);
    try {
      const me = await base44.auth.me();
      let cfg = {};
      if (me?.dashboard_config) {
        try { cfg = typeof me.dashboard_config === "string" ? JSON.parse(me.dashboard_config) : me.dashboard_config; } catch {}
      }
      cfg.sections = preview.sections;
      cfg.starred = preview.starred;
      await base44.auth.updateMe({ dashboard_config: JSON.stringify(cfg) });
      setApplied(true);
      onApply?.();
    } catch (err) {
      console.error("Apply layout error:", err);
    }
    setLoading(false);
  };

  return (
    <div className="glass-card rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layout className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-bold text-foreground">Auto Dashboard Configurator</h2>
        </div>
        {onClose && <button onClick={onClose} className="text-[10px] text-muted-foreground hover:text-foreground">Close</button>}
      </div>
      <p className="text-[11px] text-muted-foreground">Select a layout preset or let AI build one for you. Preview before applying.</p>

      {/* Preset grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {LAYOUT_PRESETS.map(p => (
          <button
            key={p.id}
            onClick={() => p.id === "custom_ai" ? setSelectedPreset("custom_ai") : generateLayout(p.id)}
            disabled={loading}
            className={`text-left p-3 rounded-xl border transition-all ${
              selectedPreset === p.id ? "border-primary/50 bg-primary/5" : "border-border/50 hover:border-primary/30 bg-secondary/30"
            }`}
          >
            <div className="text-lg mb-1">{p.icon}</div>
            <div className="text-[11px] font-bold text-foreground">{p.label}</div>
            <div className="text-[9px] text-muted-foreground leading-tight mt-0.5">{p.desc}</div>
          </button>
        ))}
      </div>

      {/* Custom AI prompt */}
      {selectedPreset === "custom_ai" && !showPreview && (
        <div className="space-y-2">
          <input
            value={customPrompt}
            onChange={e => setCustomPrompt(e.target.value)}
            onKeyDown={e => e.key === "Enter" && generateLayout("custom_ai")}
            placeholder="Describe your ideal dashboard layout..."
            className="w-full glass-input rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground"
          />
          <button
            onClick={() => generateLayout("custom_ai")}
            disabled={loading || !customPrompt.trim()}
            className="w-full py-2 rounded-lg metallic-gold-bg text-background text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            Generate AI Layout
          </button>
        </div>
      )}

      {loading && selectedPreset !== "custom_ai" && (
        <div className="flex items-center justify-center py-4 gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground">Generating layout...</span>
        </div>
      )}

      {/* Preview */}
      {showPreview && preview && (
        <div className="space-y-3 border border-border/50 rounded-xl p-4 bg-secondary/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">Layout Preview</span>
            <button onClick={() => setShowPreview(!showPreview)} className="text-muted-foreground">
              {showPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
          {preview.reasoning && <p className="text-[10px] text-primary italic">{preview.reasoning}</p>}

          <div className="space-y-1">
            <span className="text-[10px] font-medium text-muted-foreground">Sections ({preview.sections.length})</span>
            <div className="flex flex-wrap gap-1">
              {preview.sections.map(s => (
                <span key={s.id} className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[9px] font-medium">{s.title}</span>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-medium text-muted-foreground">Favorites ({preview.starred.length})</span>
            <div className="flex flex-wrap gap-1">
              {preview.starred.map(id => {
                const t = DEFAULT_TOOLS.find(t => t.id === id);
                return <span key={id} className="px-2 py-0.5 rounded-md bg-yellow-500/10 text-yellow-500 text-[9px] font-medium">{t?.label || id}</span>;
              })}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={applyLayout}
              disabled={loading || applied}
              className="flex-1 py-2 rounded-lg metallic-gold-bg text-background text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {applied ? <><Check className="w-3.5 h-3.5" /> Applied — Refresh</> :
               loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
               <><Check className="w-3.5 h-3.5" /> Apply Layout</>}
            </button>
            <button
              onClick={() => { setShowPreview(false); setPreview(null); setSelectedPreset(null); setApplied(false); }}
              className="px-4 py-2 rounded-lg glass-card text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}