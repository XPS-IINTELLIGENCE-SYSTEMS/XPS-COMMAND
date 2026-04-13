import { useState, useEffect } from "react";
import { CalendarCheck, Loader2, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";

export default function SchedulerTool({ onChatCommand, workflowColor }) {
  const [title, setTitle] = useState("");
  const [contact, setContact] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    base44.entities.Lead.list("-score", 10).then(l => setLeads(l || []));
  }, []);

  const scheduleCall = async () => {
    if (!title || !contact) return;
    setSaving(true);
    const scheduledTime = date && time ? new Date(`${date}T${time}`).toISOString() : new Date().toISOString();
    await base44.entities.ScheduledCall.create({
      title, contact_name: contact, scheduled_time: scheduledTime,
      call_type: "Discovery", status: "Scheduled", talking_points: notes
    });
    setSaving(false);
    setSaved(true);
    if (onChatCommand) onChatCommand(`Scheduled call: "${title}" with ${contact}`);
  };

  return (
    <div className="space-y-4">
      {leads.length > 0 && (
        <div className="space-y-1.5">
          <label className="text-xs text-white/40 font-medium">QUICK SELECT</label>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {leads.slice(0, 5).map(l => (
              <button key={l.id} onClick={() => { setContact(l.contact_name || l.company); setTitle(`Call with ${l.company}`); }}
                className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.06] border border-white/[0.1] hover:border-white/[0.2] text-white/70 hover:text-white transition-all">
                <User className="w-3 h-3 inline mr-1" style={{ color: workflowColor }} />{l.company}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs text-white/40 font-medium">MEETING TITLE</label>
        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Discovery call with..." className="bg-white/[0.04] border-white/[0.1] text-white" />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-white/40 font-medium">CONTACT</label>
        <Input value={contact} onChange={e => setContact(e.target.value)} placeholder="Contact name" className="bg-white/[0.04] border-white/[0.1] text-white" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs text-white/40 font-medium">DATE</label>
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-white/[0.04] border-white/[0.1] text-white" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-white/40 font-medium">TIME</label>
          <Input type="time" value={time} onChange={e => setTime(e.target.value)} className="bg-white/[0.04] border-white/[0.1] text-white" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-white/40 font-medium">NOTES</label>
        <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Talking points or agenda..." rows={3} className="bg-white/[0.04] border-white/[0.1] text-white resize-none" />
      </div>

      <Button onClick={scheduleCall} disabled={saving || !title || saved} className="gap-2 w-full" style={{ backgroundColor: saved ? "#10b981" : undefined }}>
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarCheck className="w-4 h-4" />}
        {saved ? "Scheduled ✓" : "Schedule Meeting"}
      </Button>
    </div>
  );
}