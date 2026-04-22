import { useState } from "react";
import { Clock, Phone, Mail, Calendar, Loader2, ArrowRight, MessageCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function FollowUpTab({ callLogs, queue, onRefresh }) {
  const [scheduling, setScheduling] = useState(null);

  const scheduleCallback = async (log) => {
    setScheduling(log.id);
    const callbackDate = new Date(Date.now() + 2 * 86400000); // 2 days from now
    try {
      // Create calendar event
      await base44.entities.CalendarEvent.create({
        title: `Callback: ${log.company_name} — ${log.contact_name}`,
        date: callbackDate.toISOString().split("T")[0],
        start_time: "10:00",
        end_time: "10:30",
        color: "#3b82f6",
        description: `Follow-up call for ${log.company_name}.\nPhone: ${log.phone}\nEmail: ${log.email}\nNotes: ${log.notes || "None"}`,
        project_type: "ScheduledCall",
        ai_generated: true,
      });

      // Update callback date
      await base44.entities.CallLog.update(log.id, {
        callback_date: callbackDate.toISOString(),
      });
      onRefresh?.();
    } catch (err) { console.error(err); }
    setScheduling(null);
  };

  const requeue = async (log) => {
    await base44.entities.CallLog.update(log.id, { call_outcome: "Pending" });
    onRefresh?.();
  };

  if (callLogs.length === 0) {
    return (
      <div className="text-center py-16">
        <Clock className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No follow-ups scheduled</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-[10px] text-muted-foreground mb-2">{callLogs.length} follow-ups pending</div>

      {callLogs.map(log => (
        <div key={log.id} className="glass-card rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-sm font-bold text-foreground">{log.company_name}</span>
              <span className="text-[10px] text-muted-foreground ml-2">{log.contact_name}</span>
              <span className={`ml-2 text-[8px] font-bold px-1.5 py-0.5 rounded ${
                log.call_outcome === "Callback" ? "bg-blue-500/20 text-blue-400" :
                log.call_outcome === "Voicemail" ? "bg-purple-500/20 text-purple-400" :
                "bg-gray-500/20 text-gray-400"
              }`}>{log.call_outcome}</span>
            </div>
            {log.callback_date && (
              <span className="text-[10px] text-primary flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(log.callback_date).toLocaleDateString()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-2">
            {log.phone && <span className="flex items-center gap-0.5"><Phone className="w-2.5 h-2.5" />{log.phone}</span>}
            {log.email && <span className="flex items-center gap-0.5"><Mail className="w-2.5 h-2.5" />{log.email}</span>}
            {log.location && <span>{log.location}</span>}
          </div>

          {log.notes && <p className="text-[10px] text-foreground/70 mb-2">{log.notes}</p>}

          <div className="flex items-center gap-1.5">
            {log.phone && (
              <a href={`tel:${log.phone}`} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-[10px] font-bold">
                <Phone className="w-3 h-3" /> Call Now
              </a>
            )}
            <button
              onClick={() => scheduleCallback(log)}
              disabled={scheduling === log.id}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-bold disabled:opacity-50"
            >
              {scheduling === log.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Calendar className="w-3 h-3" />}
              Schedule Callback
            </button>
            <button
              onClick={() => requeue(log)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary text-[10px] font-bold"
            >
              <ArrowRight className="w-3 h-3" /> Re-queue
            </button>
            {log.email && (
              <a href={`mailto:${log.email}`} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-secondary text-foreground text-[10px] font-bold">
                <Mail className="w-3 h-3" /> Email
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}