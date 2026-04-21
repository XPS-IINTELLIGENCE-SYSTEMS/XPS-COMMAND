import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, Trash2, Sparkles, Loader2, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, parseISO } from "date-fns";
import ProjectLinker from "./ProjectLinker";

const COLORS = ["#d4af37", "#6366f1", "#06b6d4", "#22c55e", "#f59e0b", "#ec4899", "#ef4444", "#8b5cf6", "#14b8a6", "#f97316"];

function buildTimeOptions() {
  const opts = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const val = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      const label = format(new Date(2000, 0, 1, h, m), "h:mm a");
      opts.push({ val, label });
    }
  }
  return opts;
}

const TIME_OPTIONS = buildTimeOptions();

export default function CalendarEventModal({ date, startTime, endTime, event, onSave, onDelete, onClose }) {
  const isEdit = !!event;
  const [title, setTitle] = useState(event?.title || "");
  const [desc, setDesc] = useState(event?.description || "");
  const [start, setStart] = useState(startTime || "09:00");
  const [end, setEnd] = useState(endTime || "10:00");
  const [color, setColor] = useState(event?.color || "#d4af37");
  const [projectType, setProjectType] = useState(event?.project_type || "Custom");
  const [projectId, setProjectId] = useState(event?.project_id || "");
  const [projectLabel, setProjectLabel] = useState(event?.project_label || "");
  const [showLinker, setShowLinker] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    await onSave({
      title: title.trim(),
      description: desc,
      date,
      start_time: start,
      end_time: end,
      color,
      project_type: projectType,
      project_id: projectId || undefined,
      project_label: projectLabel || undefined,
    });
    setSaving(false);
  };

  const handleAISuggest = async () => {
    setAiLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an AI scheduling assistant for a flooring/construction business. Given this calendar event, suggest a better title, description, and preparation notes.

Event: "${title || "New Event"}"
Date: ${date}
Time: ${start} - ${end}
${projectLabel ? `Project: ${projectLabel}` : ""}
${desc ? `Notes: ${desc}` : ""}

Return JSON: { "title": "...", "description": "...", "ai_notes": "..." }`,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          ai_notes: { type: "string" },
        },
      },
    });
    if (res.title) setTitle(res.title);
    if (res.description) setDesc(res.description);
    setAiLoading(false);
  };

  const handleProjectSelect = (type, id, label) => {
    setProjectType(type);
    setProjectId(id);
    setProjectLabel(label);
    setShowLinker(false);
  };

  const dateLabel = (() => {
    try { return format(parseISO(date), "EEEE, MMMM d, yyyy"); }
    catch { return date; }
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="glass-panel rounded-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
          <h3 className="text-sm font-bold text-foreground">{isEdit ? "Edit Event" : "New Event"}</h3>
          <div className="flex items-center gap-1">
            {isEdit && (
              <button onClick={() => onDelete(event.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="text-[11px] text-muted-foreground font-medium">{dateLabel}</div>

          {/* Title + AI */}
          <div className="flex gap-2">
            <Input
              placeholder="Event title..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="flex-1 glass-input text-sm"
              autoFocus
            />
            <button
              type="button"
              onClick={handleAISuggest}
              disabled={aiLoading}
              className="p-2 rounded-lg glass-card hover:border-primary/30 transition-all"
              title="AI Suggest"
            >
              {aiLoading ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <Sparkles className="w-4 h-4 text-primary" />}
            </button>
          </div>

          {/* Time pickers */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[10px] text-muted-foreground mb-1 block">Start</label>
              <select
                value={start}
                onChange={e => setStart(e.target.value)}
                className="w-full rounded-lg glass-input px-2 py-1.5 text-xs text-foreground bg-transparent"
              >
                {TIME_OPTIONS.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-muted-foreground mb-1 block">End</label>
              <select
                value={end}
                onChange={e => setEnd(e.target.value)}
                className="w-full rounded-lg glass-input px-2 py-1.5 text-xs text-foreground bg-transparent"
              >
                {TIME_OPTIONS.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="text-[10px] text-muted-foreground mb-1.5 block">Color</label>
            <div className="flex gap-1.5">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${color === c ? "border-white scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Project link */}
          <div>
            <label className="text-[10px] text-muted-foreground mb-1.5 block">Linked Project</label>
            {projectLabel ? (
              <div className="flex items-center gap-2 p-2 rounded-lg glass-card">
                <Link2 className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs text-foreground flex-1 truncate">{projectLabel}</span>
                <span className="text-[9px] text-muted-foreground">{projectType}</span>
                <button type="button" onClick={() => { setProjectId(""); setProjectLabel(""); setProjectType("Custom"); }} className="text-muted-foreground hover:text-foreground">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowLinker(true)}
                className="w-full flex items-center gap-2 p-2 rounded-lg glass-card text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
              >
                <Link2 className="w-3.5 h-3.5" /> Attach a project...
              </button>
            )}
          </div>

          {/* Description */}
          <textarea
            placeholder="Description or notes..."
            value={desc}
            onChange={e => setDesc(e.target.value)}
            className="w-full glass-input rounded-lg px-3 py-2 text-xs text-foreground min-h-[60px] resize-none bg-transparent"
          />

          <Button type="submit" disabled={saving || !title.trim()} className="w-full">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {isEdit ? "Update Event" : "Create Event"}
          </Button>
        </form>

        {showLinker && (
          <ProjectLinker
            onSelect={handleProjectSelect}
            onClose={() => setShowLinker(false)}
          />
        )}
      </div>
    </div>
  );
}