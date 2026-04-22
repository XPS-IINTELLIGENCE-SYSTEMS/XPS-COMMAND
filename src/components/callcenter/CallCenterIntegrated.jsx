import { useContext, useState } from "react";
import { useMasterDashboard } from "@/hooks/useMasterDashboard";
import { Phone, CheckCircle2, PhoneOff, MessageSquare, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CallCenterIntegrated() {
  const { queue, selectedLead, data, actions } = useMasterDashboard();
  const [callForm, setCallForm] = useState({
    contact_name: "",
    company_name: "",
    phone: "",
    call_outcome: "Pending",
    deal_value: 0,
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const currentContact = queue[0];

  const handleStartCall = (contact) => {
    setCallForm({
      contact_name: contact.contact_name || "",
      company_name: contact.company_name || "Unknown",
      phone: contact.phone || "",
      source_type: contact.source_type,
      source_id: contact.source_id,
      call_outcome: "Pending",
      deal_value: 0,
      notes: "",
    });
  };

  const handleLogCall = async () => {
    if (!callForm.contact_name || !callForm.phone) return;
    setSubmitting(true);
    try {
      await actions.logCall(callForm);
      setCallForm({
        contact_name: "",
        company_name: "",
        phone: "",
        call_outcome: "Pending",
        deal_value: 0,
        notes: "",
      });
    } catch (e) {
      console.error("Call log failed:", e);
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-4">
      {/* Current Contact in Queue */}
      {currentContact && !callForm.contact_name && (
        <div className="glass-card rounded-xl p-4 border border-green-500/30 bg-green-500/5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-bold text-foreground">{currentContact.company_name}</h3>
              <p className="text-sm text-muted-foreground">{currentContact.contact_name}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Score: {currentContact.score} | Priority: {currentContact.priority}</p>
            </div>
            <span className="text-[9px] px-2 py-1 rounded-full bg-green-500/20 text-green-400 font-bold">Ready to Call</span>
          </div>
          <Button
            onClick={() => handleStartCall(currentContact)}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4" /> Start Call
          </Button>
        </div>
      )}

      {/* Active Call Form */}
      {callForm.contact_name && (
        <div className="glass-card rounded-xl p-4 border border-blue-500/30 bg-blue-500/5 space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="font-bold text-foreground">Call in Progress</span>
          </div>

          <div>
            <label className="text-[9px] font-bold text-muted-foreground uppercase">Contact</label>
            <p className="text-sm font-bold text-foreground">{callForm.contact_name} @ {callForm.company_name}</p>
            <p className="text-[10px] text-muted-foreground">{callForm.phone}</p>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-bold text-muted-foreground uppercase">Call Outcome</label>
            <select
              value={callForm.call_outcome}
              onChange={(e) => setCallForm(prev => ({ ...prev, call_outcome: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground border border-border"
            >
              <option>Pending</option>
              <option>Sold</option>
              <option>Callback</option>
              <option>Best Lead</option>
              <option>No Answer</option>
              <option>Voicemail</option>
              <option>Wrong Number</option>
            </select>
          </div>

          {callForm.call_outcome === "Sold" && (
            <div>
              <label className="text-[9px] font-bold text-muted-foreground uppercase">Deal Value</label>
              <input
                type="number"
                value={callForm.deal_value}
                onChange={(e) => setCallForm(prev => ({ ...prev, deal_value: parseFloat(e.target.value) || 0 }))}
                placeholder="$"
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground border border-border"
              />
            </div>
          )}

          <div>
            <label className="text-[9px] font-bold text-muted-foreground uppercase">Notes</label>
            <textarea
              value={callForm.notes}
              onChange={(e) => setCallForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="What was the outcome? Any follow-up needed?"
              className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground border border-border h-20 resize-none"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleLogCall}
              disabled={submitting}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Log Call
            </Button>
            <Button
              onClick={() => setCallForm({ contact_name: "", company_name: "", phone: "", call_outcome: "Pending", deal_value: 0, notes: "" })}
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2"
            >
              <PhoneOff className="w-4 h-4" /> Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Queue Stats */}
      <div className="glass-card rounded-xl p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-foreground">Call Queue</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-[10px]">
          <div className="text-center p-2 rounded-lg bg-secondary">
            <div className="font-black text-lg text-primary">{queue.filter(q => !q.logged).length}</div>
            <div className="text-muted-foreground">Not Called</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-secondary">
            <div className="font-black text-lg text-green-400">{data.callLogs.filter(l => l.call_outcome === "Sold").length}</div>
            <div className="text-muted-foreground">Sold</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-secondary">
            <div className="font-black text-lg text-yellow-400">{queue.filter(q => ["Callback", "No Answer"].includes(q.lastLog?.call_outcome)).length}</div>
            <div className="text-muted-foreground">Follow-up</div>
          </div>
        </div>
      </div>

      {/* Recent Calls */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Recent Calls</h3>
        {data.callLogs.slice(0, 5).map((log, i) => (
          <div key={i} className="glass-card rounded-lg p-2 text-[9px]">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-foreground">{log.company_name}</p>
                <p className="text-muted-foreground">{log.contact_name}</p>
              </div>
              <span className={`px-2 py-1 rounded-full font-bold ${
                log.call_outcome === "Sold" ? "bg-green-500/20 text-green-400" :
                ["Callback", "No Answer"].includes(log.call_outcome) ? "bg-yellow-500/20 text-yellow-400" :
                "bg-secondary text-muted-foreground"
              }`}>{log.call_outcome}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}