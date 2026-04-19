import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { X, Loader2, Plus, GripVertical, Trash2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const STEP_TYPES = [
  { type: "scrape_leads", label: "Scrape Leads", desc: "Find companies via AI search", color: "#d4af37" },
  { type: "scrape_jobs", label: "Scrape Jobs", desc: "Find commercial projects", color: "#22c55e" },
  { type: "score_leads", label: "Score Leads", desc: "AI-score all leads", color: "#6366f1" },
  { type: "enrich_contacts", label: "Enrich Contacts", desc: "Find decision-maker info", color: "#8b5cf6" },
  { type: "deep_research", label: "Deep Research", desc: "Company intelligence report", color: "#06b6d4" },
  { type: "send_email", label: "Send Email", desc: "AI outreach email", color: "#ec4899" },
  { type: "send_sms", label: "Send SMS", desc: "Text message outreach", color: "#f59e0b" },
  { type: "generate_proposal", label: "Generate Proposal", desc: "AI proposal for top leads", color: "#14b8a6" },
  { type: "email_report", label: "Email Report", desc: "Send results summary", color: "#ef4444" },
  { type: "add_to_crm", label: "Add to CRM", desc: "Push results to CRM stage", color: "#84cc16" },
  { type: "wait", label: "Wait / Delay", desc: "Pause before next step", color: "#64748b" },
  { type: "filter", label: "Filter", desc: "Only pass leads matching criteria", color: "#a855f7" },
];

const TRIGGERS = ["Manual", "Daily", "Weekly", "On New Lead", "On Lead Scored", "On Proposal Approved"];

export default function WorkflowEditorModal({ workflow, onClose, onSaved }) {
  const isEditing = !!workflow;
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(workflow?.name || "");
  const [description, setDescription] = useState(workflow?.description || "");
  const [trigger, setTrigger] = useState(workflow?.trigger || "Manual");
  const [steps, setSteps] = useState(() => {
    try { return JSON.parse(workflow?.steps || "[]"); } catch { return []; }
  });
  const [showPicker, setShowPicker] = useState(false);

  const addStep = (type) => {
    const def = STEP_TYPES.find(s => s.type === type);
    setSteps(prev => [...prev, {
      id: `step_${Date.now()}`,
      type,
      label: def?.label || type,
      config: {},
      status: "pending",
    }]);
    setShowPicker(false);
  };

  const removeStep = (idx) => {
    setSteps(prev => prev.filter((_, i) => i !== idx));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(steps);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setSteps(items);
  };

  const updateStepConfig = (idx, key, value) => {
    setSteps(prev => prev.map((s, i) => i === idx ? { ...s, config: { ...s.config, [key]: value } } : s));
  };

  const handleSave = async () => {
    if (!name) return;
    setSaving(true);
    const payload = {
      name,
      description,
      trigger,
      steps: JSON.stringify(steps),
      status: workflow?.status || "Draft",
    };
    if (isEditing) {
      await base44.entities.Workflow.update(workflow.id, payload);
    } else {
      await base44.entities.Workflow.create(payload);
    }
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold">{isEditing ? "Edit Workflow" : "New Workflow"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4" /></button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Name & Description */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Workflow Name</label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Weekly Lead Pipeline" className="bg-secondary/50" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Trigger</label>
              <Select value={trigger} onValueChange={setTrigger}>
                <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
                <SelectContent>{TRIGGERS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Description</label>
            <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="What does this workflow do?" className="bg-secondary/50" />
          </div>

          {/* Steps - Drag & Drop */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Workflow Steps</label>
              <span className="text-xs text-muted-foreground">{steps.length} steps</span>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="workflow-steps">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                    {steps.map((step, idx) => {
                      const def = STEP_TYPES.find(s => s.type === step.type);
                      return (
                        <Draggable key={step.id} draggableId={step.id} index={idx}>
                          {(prov, snapshot) => (
                            <div
                              ref={prov.innerRef}
                              {...prov.draggableProps}
                              className={`rounded-xl border p-4 transition-all ${snapshot.isDragging ? "border-primary shadow-lg shadow-primary/10 bg-card" : "border-border bg-card/50"}`}
                            >
                              <div className="flex items-center gap-3">
                                <div {...prov.dragHandleProps} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                                  <GripVertical className="w-4 h-4" />
                                </div>
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: def?.color || "#666" }} />
                                <div className="flex-1">
                                  <div className="text-sm font-semibold text-foreground">Step {idx + 1}: {step.label}</div>
                                  <div className="text-[11px] text-muted-foreground">{def?.desc || ""}</div>
                                </div>
                                <button onClick={() => removeStep(idx)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-red-400">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              {/* Step config fields */}
                              <StepConfig step={step} idx={idx} onUpdate={updateStepConfig} />
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {/* Connector line */}
            {steps.length > 0 && (
              <div className="flex justify-center py-2">
                <div className="w-px h-6 bg-border" />
              </div>
            )}

            {/* Add step button */}
            <div className="relative">
              <Button variant="outline" size="sm" onClick={() => setShowPicker(!showPicker)} className="w-full gap-1.5 border-dashed">
                <Plus className="w-3.5 h-3.5" /> Add Step
              </Button>

              {showPicker && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-card border border-border rounded-xl shadow-2xl z-20 p-3 grid grid-cols-2 gap-2 max-h-72 overflow-y-auto">
                  {STEP_TYPES.map(st => (
                    <button
                      key={st.type}
                      onClick={() => addStep(st.type)}
                      className="flex items-center gap-2.5 p-3 rounded-lg text-left hover:bg-secondary/60 transition-colors"
                    >
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: st.color }} />
                      <div>
                        <div className="text-xs font-semibold text-foreground">{st.label}</div>
                        <div className="text-[10px] text-muted-foreground">{st.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !name} className="gap-1.5">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            {isEditing ? "Update Workflow" : "Create Workflow"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function StepConfig({ step, idx, onUpdate }) {
  const [open, setOpen] = useState(false);
  const needsConfig = ["scrape_leads", "scrape_jobs", "send_email", "wait", "filter"].includes(step.type);
  if (!needsConfig) return null;

  return (
    <div className="mt-3 ml-7">
      <button onClick={() => setOpen(!open)} className="text-[11px] text-primary flex items-center gap-1">
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
        Configure
      </button>
      {open && (
        <div className="mt-2 space-y-2 p-3 rounded-lg bg-secondary/30 border border-border">
          {step.type === "scrape_leads" && (
            <>
              <MiniInput label="Keywords" value={step.config?.keywords || ""} onChange={v => onUpdate(idx, "keywords", v)} placeholder="epoxy, concrete" />
              <MiniInput label="Location" value={step.config?.location || ""} onChange={v => onUpdate(idx, "location", v)} placeholder="FL" />
              <MiniInput label="Count" value={step.config?.count || ""} onChange={v => onUpdate(idx, "count", v)} placeholder="25" />
            </>
          )}
          {step.type === "scrape_jobs" && (
            <>
              <MiniInput label="Location" value={step.config?.location || ""} onChange={v => onUpdate(idx, "location", v)} placeholder="Tampa, FL" />
              <MiniInput label="Project Type" value={step.config?.project_type || ""} onChange={v => onUpdate(idx, "project_type", v)} placeholder="warehouse" />
            </>
          )}
          {step.type === "send_email" && (
            <MiniInput label="Email Template" value={step.config?.template || ""} onChange={v => onUpdate(idx, "template", v)} placeholder="Initial Outreach" />
          )}
          {step.type === "wait" && (
            <MiniInput label="Wait Duration" value={step.config?.duration || ""} onChange={v => onUpdate(idx, "duration", v)} placeholder="e.g., 24 hours, 3 days" />
          )}
          {step.type === "filter" && (
            <MiniInput label="Filter Criteria" value={step.config?.criteria || ""} onChange={v => onUpdate(idx, "criteria", v)} placeholder="score > 60, has email" />
          )}
        </div>
      )}
    </div>
  );
}

function MiniInput({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-muted-foreground mb-1">{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-7 px-2 text-xs bg-card border border-border rounded-md focus:outline-none focus:border-primary/50"
      />
    </div>
  );
}