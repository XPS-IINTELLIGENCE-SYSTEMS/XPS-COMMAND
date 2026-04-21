import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  StickyNote, Plus, Calendar, GitBranch, Bell, ListTodo,
  Send, Loader2, ChevronDown, Trash2, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ACTION_OPTIONS = [
  { id: "task", label: "Add to Tasks", icon: ListTodo, color: "text-blue-400" },
  { id: "schedule", label: "Schedule It", icon: Calendar, color: "text-green-400" },
  { id: "workflow", label: "Add to Workflow", icon: GitBranch, color: "text-purple-400" },
  { id: "reminder", label: "Set Reminder", icon: Bell, color: "text-amber-400" },
  { id: "build", label: "Add to Build List", icon: Plus, color: "text-red-400" },
];

export default function CommandNotepad({ onOpenTool }) {
  const [notes, setNotes] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(null);
  const [showActions, setShowActions] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const items = await base44.entities.AgentTask.filter(
        { task_type: "Custom" },
        "-created_date",
        20
      );
      setNotes(items);
    } catch {
      setNotes([]);
    }
  };

  const addNote = async () => {
    if (!input.trim()) return;
    setSending("add");
    await base44.entities.AgentTask.create({
      task_description: input.trim(),
      task_type: "Custom",
      status: "Queued",
      priority: "Medium",
    });
    setInput("");
    setSending(null);
    loadNotes();
  };

  const handleAction = async (noteId, actionId, noteText) => {
    setSending(noteId);
    setShowActions(null);

    if (actionId === "task") {
      await base44.entities.AgentTask.update(noteId, {
        task_type: "Custom",
        status: "Queued",
        priority: "High",
      });
    } else if (actionId === "schedule") {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      await base44.entities.AgentTask.update(noteId, {
        task_type: "Calendar Event",
        scheduled_for: tomorrow.toISOString(),
        status: "Queued",
      });
    } else if (actionId === "workflow") {
      await base44.entities.AgentTask.update(noteId, {
        task_type: "Workflow",
        status: "Queued",
      });
      onOpenTool?.("workflows");
    } else if (actionId === "reminder") {
      const inOneHour = new Date(Date.now() + 3600000);
      await base44.entities.AgentTask.update(noteId, {
        task_type: "Custom",
        scheduled_for: inOneHour.toISOString(),
        status: "Queued",
        priority: "High",
      });
    } else if (actionId === "build") {
      await base44.entities.AgentTask.update(noteId, {
        task_type: "Business Plan",
        status: "Queued",
      });
    }

    setSending(null);
    loadNotes();
  };

  const deleteNote = async (id) => {
    await base44.entities.AgentTask.delete(id);
    loadNotes();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addNote();
    }
  };

  return (
    <div className="glass-card rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <StickyNote className="w-4 h-4 metallic-gold-icon" />
        <span className="text-[13px] font-bold metallic-gold">Command Notepad</span>
        <span className="text-[10px] text-muted-foreground ml-auto">{notes.length} items</span>
      </div>

      {/* Input row */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a note, task, idea, or command..."
          className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/40"
        />
        <Button
          size="sm"
          onClick={addNote}
          disabled={!input.trim() || sending === "add"}
          className="metallic-gold-bg text-background h-9 px-3"
        >
          {sending === "add" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Plus className="w-3.5 h-3.5" />
          )}
        </Button>
      </div>

      {/* Notes list */}
      <div className="space-y-1.5 max-h-[200px] overflow-y-auto scrollbar-hide">
        {notes.map((note) => (
          <div
            key={note.id}
            className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] group/note"
          >
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-foreground leading-relaxed">
                {note.task_description}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                {note.task_type !== "Custom" && (
                  <Badge variant="secondary" className="text-[8px] px-1.5 py-0">
                    {note.task_type}
                  </Badge>
                )}
                {note.scheduled_for && (
                  <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {new Date(note.scheduled_for).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {/* Actions dropdown */}
            <div className="relative flex items-center gap-0.5 flex-shrink-0">
              {sending === note.id ? (
                <Loader2 className="w-3 h-3 animate-spin text-primary" />
              ) : (
                <>
                  <button
                    onClick={() =>
                      setShowActions(showActions === note.id ? null : note.id)
                    }
                    className="p-1 rounded hover:bg-white/10"
                  >
                    <Send className="w-3 h-3 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="p-1 rounded hover:bg-red-500/20 opacity-0 group-hover/note:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3 text-red-400/60" />
                  </button>
                </>
              )}

              {showActions === note.id && (
                <div className="absolute right-0 top-6 z-50 w-44 bg-card border border-border rounded-lg shadow-xl py-1">
                  {ACTION_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.id}
                        onClick={() =>
                          handleAction(note.id, opt.id, note.task_description)
                        }
                        className="flex items-center gap-2 w-full px-3 py-1.5 text-[11px] text-foreground hover:bg-white/10 transition-colors"
                      >
                        <Icon className={`w-3.5 h-3.5 ${opt.color}`} />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}

        {notes.length === 0 && (
          <p className="text-[10px] text-muted-foreground/50 text-center py-3">
            Notes you add here are readable by agents and can be converted to
            tasks, workflows, reminders, or build items.
          </p>
        )}
      </div>
    </div>
  );
}