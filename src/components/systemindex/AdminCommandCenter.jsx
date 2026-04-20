import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Terminal, Save, Plus, Trash2, Loader2, Shield, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const DIRECTIVE_TYPES = [
  { value: "rule", label: "Rule", color: "#22c55e", desc: "System must always obey" },
  { value: "directive", label: "Directive", color: "#6366f1", desc: "Standing instruction for agents" },
  { value: "prompt", label: "Prompt Override", color: "#f59e0b", desc: "Custom prompt for specific agent" },
  { value: "command", label: "Quick Command", color: "#ec4899", desc: "One-time executable instruction" },
  { value: "policy", label: "Policy", color: "#ef4444", desc: "Business logic constraint" },
];

export default function AdminCommandCenter() {
  const [directives, setDirectives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newDirective, setNewDirective] = useState({ type: "rule", name: "", content: "", target: "all_agents", is_active: true });
  const [showForm, setShowForm] = useState(false);
  const [executing, setExecuting] = useState(null);

  useEffect(() => { loadDirectives(); }, []);

  const loadDirectives = async () => {
    const user = await base44.auth.me();
    if (user?.system_directives) {
      try {
        setDirectives(JSON.parse(user.system_directives));
      } catch { setDirectives([]); }
    }
    setLoading(false);
  };

  const saveDirectives = async (updated) => {
    setSaving(true);
    await base44.auth.updateMe({ system_directives: JSON.stringify(updated) });
    setDirectives(updated);
    setSaving(false);
  };

  const addDirective = () => {
    if (!newDirective.name.trim() || !newDirective.content.trim()) return;
    const item = { ...newDirective, id: `d_${Date.now()}`, created: new Date().toISOString() };
    const updated = [...directives, item];
    saveDirectives(updated);
    setNewDirective({ type: "rule", name: "", content: "", target: "all_agents", is_active: true });
    setShowForm(false);
  };

  const toggleDirective = (id) => {
    const updated = directives.map(d => d.id === id ? { ...d, is_active: !d.is_active } : d);
    saveDirectives(updated);
  };

  const deleteDirective = (id) => {
    const updated = directives.filter(d => d.id !== id);
    saveDirectives(updated);
  };

  const executeCommand = async (directive) => {
    setExecuting(directive.id);
    try {
      await base44.integrations.Core.InvokeLLM({
        prompt: `Execute this system command for XPS Intelligence Platform:\n\n${directive.content}\n\nRespond with what action was taken.`,
      });
    } catch {}
    setExecuting(null);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <Terminal className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold metallic-gold">System Instructions</h1>
            <p className="text-xs text-muted-foreground">Set rules, directives, and commands for agents and the system</p>
          </div>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="text-xs metallic-gold-bg text-background">
          <Plus className="w-3 h-3 mr-1" /> New Directive
        </Button>
      </div>

      {/* New directive form */}
      {showForm && (
        <div className="p-4 bg-card border border-primary/30 rounded-xl space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase">Type</label>
              <select value={newDirective.type} onChange={e => setNewDirective(p => ({ ...p, type: e.target.value }))} className="w-full mt-1 px-3 py-2 text-xs rounded-lg bg-secondary border border-border text-foreground">
                {DIRECTIVE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label} — {t.desc}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase">Name</label>
              <Input value={newDirective.name} onChange={e => setNewDirective(p => ({ ...p, name: e.target.value }))} className="mt-1 text-xs" placeholder="e.g. Always verify emails" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase">Target</label>
              <select value={newDirective.target} onChange={e => setNewDirective(p => ({ ...p, target: e.target.value }))} className="w-full mt-1 px-3 py-2 text-xs rounded-lg bg-secondary border border-border text-foreground">
                <option value="all_agents">All Agents</option>
                <option value="xps_assistant">XPS Assistant</option>
                <option value="scraper">Scraper Agents</option>
                <option value="outreach">Outreach Agents</option>
                <option value="system">System Only</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground uppercase">Instruction (Natural Language)</label>
            <Textarea value={newDirective.content} onChange={e => setNewDirective(p => ({ ...p, content: e.target.value }))} className="mt-1 text-xs h-24" placeholder="Write in plain English what the system or agent must do..." />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={addDirective} className="text-xs metallic-gold-bg text-background">
              <Save className="w-3 h-3 mr-1" /> Save Directive
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowForm(false)} className="text-xs">Cancel</Button>
          </div>
        </div>
      )}

      {/* Active directives */}
      <div className="space-y-2">
        {directives.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-xl">
            <Shield className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No directives set yet</p>
            <p className="text-[11px] text-muted-foreground/60">Create rules and instructions for your AI agents</p>
          </div>
        ) : (
          directives.map(d => {
            const typeInfo = DIRECTIVE_TYPES.find(t => t.value === d.type) || DIRECTIVE_TYPES[0];
            return (
              <div key={d.id} className={`p-4 bg-card border rounded-xl transition-colors ${d.is_active ? "border-border" : "border-border/50 opacity-60"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="text-[9px]" style={{ backgroundColor: typeInfo.color + "20", color: typeInfo.color }}>{typeInfo.label}</Badge>
                      <span className="text-sm font-semibold text-foreground">{d.name}</span>
                      {d.is_active ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <AlertTriangle className="w-3 h-3 text-yellow-500" />}
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap">{d.content}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[9px] text-muted-foreground/60">Target: {d.target}</span>
                      <span className="text-[9px] text-muted-foreground/60">Created: {new Date(d.created).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {d.type === "command" && (
                      <Button size="sm" variant="outline" onClick={() => executeCommand(d)} disabled={executing === d.id} className="text-[10px] h-7">
                        {executing === d.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Run"}
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => toggleDirective(d.id)} className="text-[10px] h-7">
                      {d.is_active ? "Disable" : "Enable"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteDirective(d.id)} className="text-[10px] h-7 text-destructive">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}