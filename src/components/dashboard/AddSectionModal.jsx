import { useState } from "react";
import { X, Plus, Calendar, FileText, Star, LayoutGrid, Clock, Bot, BarChart3, Wrench, MessageSquare, List, Activity, Zap, StickyNote, GitBranch, Shield, DollarSign, Crown, Target } from "lucide-react";

const SECTION_TEMPLATES = [
  { type: "command_notepad", label: "Command Notepad", desc: "Smart notes → tasks, workflows, schedules, reminders", icon: StickyNote, color: "#d4af37" },
  { type: "quick_workflow", label: "Quick Workflow", desc: "Drag & drop workflow builder with save & schedule", icon: GitBranch, color: "#8b5cf6" },
  { type: "pipeline", label: "Pipeline", desc: "Interactive XPS master workflow pipeline", icon: Zap, color: "#d4af37" },
  { type: "calendar", label: "Calendar", desc: "Daily / Weekly / Monthly schedule", icon: Calendar, color: "#d4af37" },
  { type: "summary", label: "Daily Summary", desc: "Today's KPIs and activity", icon: FileText, color: "#22c55e" },
  { type: "activity", label: "Activity Stream", desc: "Real-time AI agent actions & approvals", icon: Activity, color: "#8b5cf6" },
  { type: "favorites", label: "Favorites Grid", desc: "Pinned tool cards", icon: Star, color: "#f59e0b" },
  { type: "tools", label: "All Tools Grid", desc: "Full tool card grid", icon: LayoutGrid, color: "#6366f1" },
  { type: "sidebar", label: "Scheduled Items", desc: "Automations & items sidebar", icon: Clock, color: "#06b6d4" },
  { type: "notes", label: "Quick Notes", desc: "Freeform text/notes widget", icon: MessageSquare, color: "#ec4899" },
  { type: "quicklinks", label: "Quick Links", desc: "Custom link list", icon: List, color: "#14b8a6" },
  { type: "system_guardian", label: "System Guardian", desc: "Live health score, fix history, autonomous repair status", icon: Shield, color: "#22c55e" },
  { type: "financial_sandbox", label: "Financial Sandbox", desc: "Mock $20K portfolio tracker with AI-managed buckets", icon: DollarSign, color: "#d4af37" },
  { type: "orchestrator", label: "Orchestrator", desc: "AI CEO — autonomous ops, agent coordination, self-scheduling", icon: Crown, color: "#d4af37" },
  { type: "focus_dashboard", label: "Focus Dashboard", desc: "Custom drag & drop tool boards for focused workflows", icon: Target, color: "#6366f1" },
];

export default function AddSectionModal({ existingSections, onAdd, onClose }) {
  const existingTypes = existingSections.map(s => s.type);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-sm font-bold text-foreground">Add Section</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
          {SECTION_TEMPLATES.map(tmpl => {
            const exists = existingTypes.includes(tmpl.type) && ["pipeline", "calendar", "summary", "favorites", "tools"].includes(tmpl.type);
            return (
              <button
                key={tmpl.type}
                onClick={() => { onAdd(tmpl.type); onClose(); }}
                disabled={exists}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                  exists ? "opacity-40 cursor-not-allowed" : "hover:bg-white/[0.05] active:scale-[0.98]"
                } glass-card`}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${tmpl.color}18` }}>
                  <tmpl.icon className="w-4 h-4" style={{ color: tmpl.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-foreground">{tmpl.label}</div>
                  <div className="text-[10px] text-muted-foreground">{tmpl.desc}</div>
                </div>
                {exists ? (
                  <span className="text-[9px] text-muted-foreground">Added</span>
                ) : (
                  <Plus className="w-4 h-4 text-primary flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}