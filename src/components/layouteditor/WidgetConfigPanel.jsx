import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ENTITY_OPTIONS = [
  "Lead", "ContractorCompany", "FloorScope", "CommercialJob", "IntelRecord",
  "OutreachEmail", "AgentJob", "AgentActivity", "VendorQuote", "FlooringCompetitor",
  "CompetitorIntelligence", "ScrapeJob", "Proposal", "Invoice", "MaterialVendor"
];

export default function WidgetConfigPanel({ widget, onSave, onClose }) {
  const [config, setConfig] = useState(widget?.config || {});

  useEffect(() => { setConfig(widget?.config || {}); }, [widget]);

  const updateField = (key, value) => setConfig(prev => ({ ...prev, [key]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md mx-4 p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-foreground">Configure Widget</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary"><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {config.title !== undefined && (
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Title</label>
              <Input value={config.title || ""} onChange={(e) => updateField("title", e.target.value)} className="mt-1 text-xs" />
            </div>
          )}
          {config.entity !== undefined && (
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Entity</label>
              <select value={config.entity || ""} onChange={(e) => updateField("entity", e.target.value)} className="w-full mt-1 px-3 py-2 text-xs rounded-lg bg-secondary border border-border text-foreground">
                {ENTITY_OPTIONS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          )}
          {config.groupBy !== undefined && (
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Group By Field</label>
              <Input value={config.groupBy || ""} onChange={(e) => updateField("groupBy", e.target.value)} className="mt-1 text-xs" placeholder="e.g. stage, vertical, status" />
            </div>
          )}
          {config.columns !== undefined && (
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Columns (comma separated)</label>
              <Input value={(config.columns || []).join(", ")} onChange={(e) => updateField("columns", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} className="mt-1 text-xs" placeholder="company, contact_name, stage" />
            </div>
          )}
          {config.content !== undefined && (
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Content (Markdown)</label>
              <textarea value={config.content || ""} onChange={(e) => updateField("content", e.target.value)} className="w-full mt-1 px-3 py-2 text-xs rounded-lg bg-secondary border border-border text-foreground h-32 resize-none" />
            </div>
          )}
          {config.url !== undefined && (
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">URL</label>
              <Input value={config.url || ""} onChange={(e) => updateField("url", e.target.value)} className="mt-1 text-xs" placeholder="https://..." />
            </div>
          )}
          {config.color !== undefined && (
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Color</label>
              <div className="flex gap-2 mt-1 flex-wrap">
                {["#d4af37", "#6366f1", "#22c55e", "#ec4899", "#f59e0b", "#06b6d4", "#ef4444", "#8b5cf6"].map(c => (
                  <button key={c} onClick={() => updateField("color", c)} className={`w-6 h-6 rounded-full border-2 transition-all ${config.color === c ? "border-foreground scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          )}
          {config.limit !== undefined && (
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Limit</label>
              <Input type="number" value={config.limit || 20} onChange={(e) => updateField("limit", parseInt(e.target.value) || 20)} className="mt-1 text-xs" />
            </div>
          )}
          {config.toolId !== undefined && (
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Tool ID</label>
              <Input value={config.toolId || ""} onChange={(e) => updateField("toolId", e.target.value)} className="mt-1 text-xs" placeholder="e.g. analytics, crm, leads" />
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4 pt-3 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose} className="flex-1 text-xs">Cancel</Button>
          <Button size="sm" onClick={() => onSave(config)} className="flex-1 text-xs metallic-gold-bg text-background">
            <Save className="w-3 h-3 mr-1" /> Save
          </Button>
        </div>
      </div>
    </div>
  );
}