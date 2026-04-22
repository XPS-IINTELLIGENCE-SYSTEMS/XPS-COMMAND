import { useState } from "react";
import { Plus, ChevronDown, Sparkles, Layout, Code2, Zap, LayoutDashboard, Wrench, Database } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardCreatorModal from "./DashboardCreatorModal";

export default function DashboardCreatorDropdown() {
  const [open, setOpen] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const [creatorMode, setCreatorMode] = useState(null);
  const navigate = useNavigate();

  const creatorOptions = [
    { id: "auto", label: "Auto Dashboard", icon: Sparkles, desc: "AI generates from database", color: "#d4af37" },
    { id: "full_page", label: "Full Page Builder", icon: Layout, desc: "Complete page design", color: "#3b82f6" },
    { id: "section", label: "Section Creator", icon: LayoutDashboard, desc: "Single section", color: "#14b8a6" },
    { id: "ui_builder", label: "UI Builder", icon: Code2, desc: "Visual component builder", color: "#8b5cf6" },
    { id: "focus_dashboard", label: "Focus Dashboard", icon: Zap, desc: "Focused workspace", color: "#f59e0b" },
    { id: "tool_creator", label: "Tool Creator", icon: Wrench, desc: "Create custom tools", color: "#06b6d4" },
  ];

  const preGeneratedDashboards = [
    { id: "call_center", label: "Call Center", desc: "Sales call management & tracking", color: "#ef4444" },
    { id: "master_ops", label: "Master Ops", desc: "Full operations control center", color: "#8b5cf6" },
    { id: "lead_sniper", label: "Lead Sniper", desc: "Lead targeting & automation", color: "#f59e0b" },
  ];

  const handleSelect = (mode) => {
    setCreatorMode(mode);
    setShowCreator(true);
    setOpen(false);
  };

  const handleLoadDashboard = (dashboardId) => {
    // Load pre-generated dashboard directly
    // TODO: Integrate with your dashboard loading logic
    console.log("Loading dashboard:", dashboardId);
    setOpen(false);
  };

  const handleExistingTool = (toolPath) => {
    navigate(toolPath);
    setOpen(false);
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all text-xs font-medium glass-card hover:scale-105 text-muted-foreground hover:text-foreground"
        >
          <Plus className="w-3.5 h-3.5" style={{ color: "#d4af37" }} />
          Add Dashboard
          <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div className="absolute top-full right-0 mt-2 w-72 z-50 glass-card rounded-xl border border-white/[0.06] overflow-hidden shadow-2xl">
            {/* Quick Options */}
            <div className="p-3 border-b border-white/[0.06] space-y-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">Pre-Generated Dashboards</p>
              {preGeneratedDashboards.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => handleLoadDashboard(opt.id)}
                  className="w-full flex items-start gap-3 p-2.5 rounded-lg hover:bg-white/10 transition-colors text-left"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${opt.color}20` }}>
                    <LayoutDashboard className="w-3.5 h-3.5" style={{ color: opt.color }} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-foreground">{opt.label}</div>
                    <div className="text-[9px] text-muted-foreground">{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Create Mode */}
            <div className="p-3 border-b border-white/[0.06] space-y-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">Create Mode</p>
              {creatorOptions.slice(0, 3).map(opt => (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  className="w-full flex items-start gap-3 p-2.5 rounded-lg hover:bg-white/10 transition-colors text-left group"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${opt.color}20` }}>
                    <opt.icon className="w-3.5 h-3.5" style={{ color: opt.color }} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-foreground">{opt.label}</div>
                    <div className="text-[9px] text-muted-foreground">{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Advanced Options */}
            <div className="p-3 border-b border-white/[0.06] space-y-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">Advanced</p>
              {creatorOptions.slice(3).map(opt => (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  className="w-full flex items-start gap-3 p-2.5 rounded-lg hover:bg-white/10 transition-colors text-left"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${opt.color}20` }}>
                    <opt.icon className="w-3.5 h-3.5" style={{ color: opt.color }} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-foreground">{opt.label}</div>
                    <div className="text-[9px] text-muted-foreground">{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Data Integration */}
            <div className="p-3 space-y-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">Populate from</p>
              <button className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-white/10 transition-colors text-[9px] font-medium text-muted-foreground">
                <Database className="w-3.5 h-3.5 text-accent" /> All Database Information
              </button>
              <button className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-white/10 transition-colors text-[9px] font-medium text-muted-foreground">
                <span className="text-blue-400">🔗</span> HubSpot Data
              </button>
              <button className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-white/10 transition-colors text-[9px] font-medium text-muted-foreground">
                <span className="text-green-400">🔗</span> Supabase Data
              </button>
            </div>
          </div>
        )}

        {/* Close dropdown on blur */}
        {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
      </div>

      {/* Dashboard Creator Modal */}
      {showCreator && (
        <DashboardCreatorModal
          mode={creatorMode}
          onClose={() => { setShowCreator(false); setCreatorMode(null); }}
        />
      )}
    </>
  );
}