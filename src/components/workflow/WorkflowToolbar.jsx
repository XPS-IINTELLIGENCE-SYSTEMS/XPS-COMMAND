import { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Save, Play, Pause, Clock, Download, Upload, Share2,
  Copy, Trash2, Loader2, Sparkles, ArrowLeft, MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TRIGGERS = [
  "Manual", "Daily at 6 AM", "Daily at 8 AM", "Daily at 12 PM",
  "Every 6 Hours", "Hourly", "Weekly Monday", "Weekly Friday",
  "On New Lead", "On Lead Scored", "On Proposal Approved",
  "On Email Opened", "On Bid Found", "Webhook",
];

export default function WorkflowToolbar({
  workflow, name, setName, description, setDescription,
  trigger, setTrigger, status, setStatus, nodes,
  onSave, onBack, saving
}) {
  const [showMore, setShowMore] = useState(false);
  const [aiOptimizing, setAiOptimizing] = useState(false);

  const exportWorkflow = () => {
    const data = {
      name, description, trigger, status,
      nodes: nodes.map(n => ({ type: n.type, label: n.label, agent: n.agent, config: n.config, on_error: n.on_error })),
      exported_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workflow-${name.replace(/\s+/g, "-").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importWorkflow = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const text = await file.text();
      const data = JSON.parse(text);
      if (data.name) setName(data.name);
      if (data.description) setDescription(data.description);
      if (data.trigger) setTrigger(data.trigger);
      // Nodes are handled by parent via custom event
      window.dispatchEvent(new CustomEvent("import-workflow-nodes", { detail: data.nodes || [] }));
    };
    input.click();
  };

  const aiOptimize = async () => {
    setAiOptimizing(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an XPS workflow optimization AI. Analyze this workflow and suggest improvements:\nName: ${name}\nDescription: ${description}\nTrigger: ${trigger}\nSteps: ${JSON.stringify(nodes.map(n => ({ type: n.type, label: n.label, agent: n.agent, config: n.config })))}\n\nSuggest: 1) Missing steps that would improve results 2) Better ordering 3) Agent assignments 4) Parameter optimizations. Be specific to the flooring/epoxy contractor business. Return a short text summary.`,
    });
    alert(result);
    setAiOptimizing(false);
  };

  return (
    <div className="border-b border-border bg-card/80 backdrop-blur-sm">
      {/* Row 1: Name + Main Actions */}
      <div className="flex items-center gap-3 px-4 py-2.5">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
        </button>

        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Workflow Name"
          className="h-9 text-base font-bold max-w-xs bg-transparent border-none shadow-none focus-visible:ring-0 px-1"
        />

        <div className="flex-1" />

        <Button variant="outline" size="sm" onClick={aiOptimize} disabled={aiOptimizing} className="gap-1.5 h-8 text-xs">
          <Sparkles className="w-3.5 h-3.5" /> {aiOptimizing ? "Analyzing..." : "AI Optimize"}
        </Button>
        <Button variant="outline" size="sm" onClick={onSave} disabled={saving} className="gap-1.5 h-8 text-xs">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
        </Button>
        <Button
          size="sm"
          onClick={() => { setStatus(status === "Active" ? "Paused" : "Active"); }}
          className={`gap-1.5 h-8 text-xs ${status === "Active" ? "bg-green-600 hover:bg-green-700" : ""}`}
        >
          {status === "Active" ? <><Pause className="w-3.5 h-3.5" /> Active</> : <><Play className="w-3.5 h-3.5" /> Activate</>}
        </Button>

        <div className="relative">
          <button onClick={() => setShowMore(!showMore)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground">
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {showMore && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMore(false)} />
              <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-border bg-card shadow-xl z-50 py-1">
                <button onClick={() => { exportWorkflow(); setShowMore(false); }} className="flex items-center gap-2 w-full px-3 py-2.5 text-xs hover:bg-secondary/60">
                  <Download className="w-3.5 h-3.5 text-muted-foreground" /> Export Workflow
                </button>
                <button onClick={() => { importWorkflow(); setShowMore(false); }} className="flex items-center gap-2 w-full px-3 py-2.5 text-xs hover:bg-secondary/60">
                  <Upload className="w-3.5 h-3.5 text-muted-foreground" /> Import Workflow
                </button>
                <button onClick={() => { navigator.clipboard.writeText(JSON.stringify({ name, description, trigger, nodes })); setShowMore(false); }} className="flex items-center gap-2 w-full px-3 py-2.5 text-xs hover:bg-secondary/60">
                  <Copy className="w-3.5 h-3.5 text-muted-foreground" /> Copy as JSON
                </button>
                <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/workflows/${name.replace(/\s+/g, "-").toLowerCase()}`); setShowMore(false); }} className="flex items-center gap-2 w-full px-3 py-2.5 text-xs hover:bg-secondary/60">
                  <Share2 className="w-3.5 h-3.5 text-muted-foreground" /> Share Link
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Row 2: Description + Trigger + Status */}
      <div className="flex items-center gap-3 px-4 py-1.5 border-t border-border/50">
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what this workflow does..."
          className="h-8 text-xs bg-transparent border-none shadow-none focus-visible:ring-0 px-1 flex-1"
        />
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <Select value={trigger} onValueChange={setTrigger}>
            <SelectTrigger className="h-8 text-xs w-44 bg-secondary/50 border-border">
              <SelectValue placeholder="Trigger" />
            </SelectTrigger>
            <SelectContent>
              {TRIGGERS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-2.5 h-2.5 rounded-full ${status === "Active" ? "bg-green-400" : status === "Paused" ? "bg-yellow-400" : "bg-secondary"}`} />
          <span className="text-xs text-muted-foreground">{status}</span>
        </div>
        <span className="text-xs text-muted-foreground">{nodes.length} steps</span>
      </div>
    </div>
  );
}