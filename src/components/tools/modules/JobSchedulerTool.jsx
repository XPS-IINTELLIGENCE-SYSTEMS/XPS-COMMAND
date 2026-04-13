import { useState, useEffect } from "react";
import { CalendarClock, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";

export default function JobSchedulerTool({ workflowColor }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.entities.Lead.list("-created_date", 50).then(l => {
      setLeads((l || []).filter(lead => lead.stage === "Won" || lead.stage === "Negotiation"));
      setLoading(false);
    });
  }, []);

  const scheduleJob = async () => {
    if (!selected || !date) return;
    setSaving(true);
    await base44.entities.AgentTask.create({
      task_description: `Job scheduled: ${selected.company} on ${date}. ${notes}`,
      task_type: "Workflow", status: "Queued", priority: "High",
      scheduled_for: new Date(date).toISOString(),
      related_entity_type: "Lead", related_entity_id: selected.id
    });
    setSaving(false);
    setSaved(true);
  };

  if (loading) return <div className="flex items-center gap-2 py-8 justify-center text-white/40"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="text-sm text-white font-semibold">Select a job to schedule</div>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {leads.map(l => (
          <button key={l.id} onClick={() => setSelected(l)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all text-left ${selected?.id === l.id ? 'bg-white/[0.08] border-white/[0.2]' : 'bg-white/[0.04] border-white/[0.08] hover:border-white/[0.15]'}`}>
            <div>
              <div className="text-sm text-white font-medium">{l.company}</div>
              <div className="text-xs text-white/40">{l.location || `${l.city || ""}, ${l.state || ""}`} · {l.stage}</div>
            </div>
          </button>
        ))}
        {leads.length === 0 && <div className="text-xs text-white/40 text-center py-4">No won/negotiating jobs found</div>}
      </div>
      <div className="space-y-1.5">
        <label className="text-xs text-white/40 font-medium">SCHEDULE DATE</label>
        <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-white/[0.04] border-white/[0.1] text-white" />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs text-white/40 font-medium">NOTES</label>
        <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Crew, equipment, special instructions..." className="bg-white/[0.04] border-white/[0.1] text-white resize-none" />
      </div>
      <Button onClick={scheduleJob} disabled={saving || !selected || !date || saved} className="gap-2 w-full" style={{ backgroundColor: saved ? "#10b981" : workflowColor }}>
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarClock className="w-4 h-4" />}
        {saved ? "Scheduled ✓" : "Schedule Job"}
      </Button>
    </div>
  );
}