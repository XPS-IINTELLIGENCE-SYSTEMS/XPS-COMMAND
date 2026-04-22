import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Phone, Loader2, CheckCircle2, AlertCircle, Clock, DollarSign, TrendingUp, Plus, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CallCenterDashboard() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentCall, setCurrentCall] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({ pending: 0, sold: 0, followup: 0, revenue: 0 });
  const [editingNotes, setEditingNotes] = useState("");
  const [dealValue, setDealValue] = useState(0);

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const logs = await base44.entities.CallLog.list();
      const pending = logs.filter(l => !["Sold", "No"].includes(l.call_outcome));
      setQueue(pending);
      
      const sold = logs.filter(l => l.call_outcome === "Sold");
      const totalRevenue = sold.reduce((sum, l) => sum + (l.deal_value || 0), 0);
      
      setStats({
        pending: pending.length,
        sold: sold.length,
        followup: logs.filter(l => ["Callback", "No Answer", "Voicemail"].includes(l.call_outcome)).length,
        revenue: totalRevenue,
      });
    } catch (error) {
      console.error("Failed to load call queue:", error);
    }
    setLoading(false);
  };

  const startCall = () => {
    if (queue.length === 0) return;
    setCurrentCall(queue[0]);
    setDealValue(0);
    setEditingNotes("");
  };

  const logCall = async (outcome) => {
    if (!currentCall) return;
    setSubmitting(true);
    try {
      await base44.entities.CallLog.update(currentCall.id, {
        call_outcome: outcome,
        deal_value: outcome === "Sold" ? dealValue : 0,
        notes: editingNotes,
      });
      setCurrentCall(null);
      await loadQueue();
    } catch (error) {
      console.error("Failed to log call:", error);
    }
    setSubmitting(false);
  };

  if (loading && queue.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-primary mr-2" />
        <span className="text-sm text-muted-foreground">Loading call queue...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card rounded-xl p-4 border border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase">In Queue</span>
            <Phone className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-black text-primary">{stats.pending}</div>
        </div>
        <div className="glass-card rounded-xl p-4 border border-green-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase">Sold</span>
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-2xl font-black text-green-500">{stats.sold}</div>
        </div>
        <div className="glass-card rounded-xl p-4 border border-yellow-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase">Follow-up</span>
            <Clock className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="text-2xl font-black text-yellow-500">{stats.followup}</div>
        </div>
        <div className="glass-card rounded-xl p-4 border border-emerald-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase">Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-black text-emerald-500">${stats.revenue.toLocaleString()}</div>
        </div>
      </div>

      {/* Call Interface */}
      {currentCall ? (
        <div className="glass-card rounded-xl p-6 border border-primary/30 space-y-5">
          {/* Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground font-bold mb-1 uppercase tracking-wider">Contact Name</div>
              <div className="text-lg font-bold text-foreground">{currentCall.contact_name}</div>
              <div className="text-sm text-muted-foreground">{currentCall.company_name}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-bold mb-1 uppercase tracking-wider">Phone</div>
              <div className="text-lg font-mono text-primary font-bold">{currentCall.phone}</div>
              {currentCall.email && <div className="text-xs text-muted-foreground">{currentCall.email}</div>}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs text-muted-foreground font-bold mb-2 block uppercase tracking-wider">Call Notes</label>
            <textarea
              value={editingNotes}
              onChange={(e) => setEditingNotes(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg bg-secondary border border-border text-foreground placeholder-muted-foreground resize-none h-24"
              placeholder="Add call notes, pain points, objections, next steps..."
            />
          </div>

          {/* Deal Value (for sales) */}
          <div>
            <label className="text-xs text-muted-foreground font-bold mb-2 block uppercase tracking-wider">Deal Value (if closing)</label>
            <input
              type="number"
              value={dealValue}
              onChange={(e) => setDealValue(Number(e.target.value) || 0)}
              className="w-full text-sm px-3 py-2 rounded-lg bg-secondary border border-border text-foreground"
              placeholder="$0"
            />
          </div>

          {/* Outcome Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => logCall("No")}
              disabled={submitting}
              className="text-xs h-10"
            >
              Not Interested
            </Button>
            <Button
              size="sm"
              onClick={() => logCall("Sold")}
              disabled={submitting}
              className="text-xs h-10 bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-500/30"
            >
              {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
              Sold
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => logCall("Callback")}
              disabled={submitting}
              className="text-xs h-10"
            >
              Callback
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => logCall("No Answer")}
              disabled={submitting}
              className="text-xs h-10"
            >
              No Answer
            </Button>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setCurrentCall(null)}
            className="w-full text-xs text-muted-foreground"
          >
            Skip & Next
          </Button>
        </div>
      ) : queue.length > 0 ? (
        <div className="text-center py-12">
          <Button
            onClick={startCall}
            className="metallic-gold-bg text-background font-bold h-12 text-lg px-8"
          >
            <Phone className="w-5 h-5 mr-2" /> Start Calling ({queue.length} in queue)
          </Button>
        </div>
      ) : (
        <div className="text-center py-16 glass-card rounded-xl p-8">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3 opacity-60" />
          <p className="text-lg font-bold text-foreground">Queue Cleared!</p>
          <p className="text-sm text-muted-foreground mt-1">All prospects contacted</p>
        </div>
      )}
    </div>
  );
}