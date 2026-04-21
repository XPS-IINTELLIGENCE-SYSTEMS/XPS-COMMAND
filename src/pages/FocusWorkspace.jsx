import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Save, Share2, Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import WorkspaceNotes from "../components/focus/WorkspaceNotes";
import WorkspaceToolPanel from "../components/focus/WorkspaceToolPanel";
import WorkspaceToolPicker from "../components/focus/WorkspaceToolPicker";
import { toast } from "sonner";

export default function FocusWorkspace() {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [workspace, setWorkspace] = useState(null);
  const [cardName, setCardName] = useState("Workspace");
  const [saving, setSaving] = useState(false);
  const [showToolPicker, setShowToolPicker] = useState(false);

  // Default workspace state
  const defaultWorkspace = {
    notes: "",
    activeTools: ["notes", "email", "proposal", "calendar"],
    toolData: {},
  };

  useEffect(() => { loadWorkspace(); }, [cardId]);

  const loadWorkspace = async () => {
    const me = await base44.auth.me().catch(() => null);
    if (!me) { setLoading(false); return; }
    let cfg = {};
    try { cfg = typeof me.dashboard_config === "string" ? JSON.parse(me.dashboard_config) : (me.dashboard_config || {}); } catch {}
    
    // Get card name
    const cards = cfg.focus_cards || [];
    const card = cards.find(c => c.id === cardId);
    if (card) setCardName(card.name);

    // Get workspace data
    const workspaces = cfg.focus_workspaces || {};
    setWorkspace(workspaces[cardId] || defaultWorkspace);
    setLoading(false);
  };

  const saveWorkspace = useCallback(async (updated) => {
    setSaving(true);
    const data = updated || workspace;
    const me = await base44.auth.me().catch(() => null);
    if (!me) { setSaving(false); return; }
    let cfg = {};
    try { cfg = typeof me.dashboard_config === "string" ? JSON.parse(me.dashboard_config) : (me.dashboard_config || {}); } catch {}
    if (!cfg.focus_workspaces) cfg.focus_workspaces = {};
    cfg.focus_workspaces[cardId] = data;
    await base44.auth.updateMe({ dashboard_config: JSON.stringify(cfg) }).catch(() => {});
    setSaving(false);
    toast.success("Workspace saved");
  }, [cardId, workspace]);

  const updateWorkspace = (updates) => {
    const updated = { ...workspace, ...updates };
    setWorkspace(updated);
  };

  const addTool = (toolId) => {
    if (!workspace) return;
    if (workspace.activeTools.includes(toolId)) return;
    const updated = { ...workspace, activeTools: [...workspace.activeTools, toolId] };
    setWorkspace(updated);
    setShowToolPicker(false);
  };

  const removeTool = (toolId) => {
    if (!workspace) return;
    const updated = { ...workspace, activeTools: workspace.activeTools.filter(t => t !== toolId) };
    setWorkspace(updated);
  };

  const handleShare = async () => {
    const text = `Focus Workspace: ${cardName}\n\n${workspace?.notes || "(no notes)"}`;
    if (navigator.share) {
      await navigator.share({ title: cardName, text }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center hex-bg">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col hex-bg overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0 glass-panel">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/dashboard")} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-lg font-bold text-white">{cardName}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleShare} className="text-white/60 hover:text-white gap-1.5">
            <Share2 className="w-4 h-4" /> Share
          </Button>
          <Button size="sm" onClick={() => saveWorkspace()} disabled={saving} className="gap-1.5 metallic-gold-bg text-background font-bold">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save
          </Button>
        </div>
      </div>

      {/* Main workspace area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Notes — left panel */}
        <div className="w-full lg:w-1/2 border-r border-border flex flex-col overflow-hidden">
          <WorkspaceNotes
            content={workspace?.notes || ""}
            onChange={(val) => updateWorkspace({ notes: val })}
          />
        </div>

        {/* Tools — right panel */}
        <div className="hidden lg:flex lg:w-1/2 flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border">
            <span className="text-xs font-bold text-white">Tools</span>
            <button
              onClick={() => setShowToolPicker(true)}
              className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 font-medium"
            >
              <Plus className="w-3 h-3" /> Add Tool
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {workspace?.activeTools?.map(toolId => (
              <WorkspaceToolPanel
                key={toolId}
                toolId={toolId}
                onRemove={() => removeTool(toolId)}
                onOpenFull={(viewId) => navigate(`/dashboard`)}
              />
            ))}
            {(!workspace?.activeTools || workspace.activeTools.length === 0) && (
              <div className="text-center py-12 text-sm text-muted-foreground">
                <p>No tools added yet</p>
                <button onClick={() => setShowToolPicker(true)} className="mt-2 text-primary hover:text-primary/80 text-xs font-medium">
                  + Add your first tool
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tool picker modal */}
      {showToolPicker && (
        <WorkspaceToolPicker
          activeTools={workspace?.activeTools || []}
          onAdd={addTool}
          onClose={() => setShowToolPicker(false)}
        />
      )}
    </div>
  );
}