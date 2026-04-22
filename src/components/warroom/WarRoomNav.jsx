import { Crown, Crosshair, Phone, Users, Mail, Zap, FileText, Palette, BarChart3, Brain, Shield, Activity, Workflow, Calendar, Database, Sparkles } from "lucide-react";

const SECTIONS = [
  { id: "orchestrator", label: "CEO Ops", icon: Crown, color: "#d4af37" },
  { id: "discovery", label: "Discovery", icon: Crosshair, color: "#ef4444" },
  { id: "call_center", label: "Call Center", icon: Phone, color: "#22c55e" },
  { id: "crm", label: "CRM", icon: Users, color: "#6366f1" },
  { id: "outreach", label: "Outreach", icon: Mail, color: "#ec4899" },
  { id: "followup", label: "Follow-Up", icon: Zap, color: "#f59e0b" },
  { id: "bidding", label: "Bids & Proposals", icon: FileText, color: "#06b6d4" },
  { id: "enrichment", label: "Enrichment", icon: Database, color: "#8b5cf6" },
  { id: "branding", label: "Branding", icon: Palette, color: "#a855f7" },
  { id: "google", label: "Google Suite", icon: Calendar, color: "#4285f4" },
  { id: "workflows", label: "Workflows", icon: Workflow, color: "#14b8a6" },
  { id: "sandbox", label: "Sandbox", icon: Activity, color: "#7c3aed" },
  { id: "approvals", label: "Approvals", icon: Shield, color: "#f97316" },
  { id: "enhance", label: "AI Enhance", icon: Sparkles, color: "#10b981" },
  { id: "analytics", label: "Analytics", icon: BarChart3, color: "#3b82f6" },
];

export default function WarRoomNav({ active, onSelect }) {
  return (
    <div className="flex gap-1 p-1 rounded-xl bg-secondary/50 overflow-x-auto scrollbar-hide">
      {SECTIONS.map(s => {
        const Icon = s.icon;
        return (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-bold whitespace-nowrap transition-all ${
              active === s.id ? "metallic-gold-bg text-background" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-3 h-3" />
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

export { SECTIONS };