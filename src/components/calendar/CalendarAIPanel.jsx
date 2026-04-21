import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, Loader2, X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function CalendarAIPanel({ weekStart, days, existingEvents, onCreateEvents, onClose }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);

    const existingStr = existingEvents.map(e =>
      `${e.date} ${e.start_time}-${e.end_time}: ${e.title}`
    ).join("\n") || "None";

    const weekDates = days.map(d => format(d, "yyyy-MM-dd (EEEE)")).join(", ");

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an AI scheduling assistant for a flooring/construction company (XPS - Xtreme Polishing Systems). The user wants to schedule events on their calendar.

User request: "${prompt}"

Current week dates: ${weekDates}
Existing events this week:
${existingStr}

Generate calendar events that fit the request. Use 15-minute time blocks. Avoid conflicts with existing events. Return events as JSON array.`,
      response_json_schema: {
        type: "object",
        properties: {
          events: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                date: { type: "string", description: "YYYY-MM-DD" },
                start_time: { type: "string", description: "HH:MM 24h" },
                end_time: { type: "string", description: "HH:MM 24h" },
                description: { type: "string" },
                color: { type: "string" },
                project_type: { type: "string", enum: ["Lead", "CommercialJob", "Proposal", "ScheduledCall", "AgentTask", "Custom"] },
              },
            },
          },
        },
      },
    });

    const generated = (res.events || []).map(e => ({
      ...e,
      ai_generated: true,
      color: e.color || "#6366f1",
    }));
    setSuggestions(generated);
    setLoading(false);
  };

  const removeItem = (idx) => {
    setSuggestions(s => s.filter((_, i) => i !== idx));
  };

  return (
    <div className="border-b border-border/50 p-4 bg-primary/[0.02]">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-xs font-bold text-foreground">AI Schedule Assistant</span>
        <button onClick={onClose} className="ml-auto p-1 rounded hover:bg-secondary">
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      <div className="flex gap-2 mb-3">
        <Input
          placeholder="e.g. Schedule 3 site visits this week, mornings only..."
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleGenerate()}
          className="flex-1 glass-input text-xs"
        />
        <Button size="sm" onClick={handleGenerate} disabled={loading || !prompt.trim()}>
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Generate"}
        </Button>
      </div>

      {suggestions.length > 0 && (
        <div className="space-y-1.5 mb-3">
          <div className="text-[10px] text-muted-foreground font-medium">Suggested events — review and add:</div>
          {suggestions.map((s, i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-lg glass-card text-xs">
              <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground truncate">{s.title}</div>
                <div className="text-[10px] text-muted-foreground">{s.date} · {s.start_time} – {s.end_time}</div>
              </div>
              <button onClick={() => removeItem(i)} className="p-1 rounded hover:bg-secondary">
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
          ))}
          <Button size="sm" onClick={() => { onCreateEvents(suggestions); setSuggestions([]); setPrompt(""); }} className="w-full">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add {suggestions.length} Events
          </Button>
        </div>
      )}
    </div>
  );
}