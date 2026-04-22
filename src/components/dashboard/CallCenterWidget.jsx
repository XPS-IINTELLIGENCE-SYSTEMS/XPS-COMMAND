import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Phone, Loader2, AlertTriangle, CheckCircle2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import WorkflowBuilder from "../callcenter/WorkflowBuilder";

export default function CallCenterWidget() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentCall, setCurrentCall] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showWorkflows, setShowWorkflows] = useState(false);
  const [stats, setStats] = useState({ pending: 0, sold: 0, followup: 0 });

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    setLoading(true);
    try {
      // Fetch call logs to build queue
      const logs = await base44.entities.CallLog.list();
      const pending = logs.filter(l => !["Sold", "No"].includes(l.call_outcome));
      setQueue(pending);
      
      setStats({
        pending: pending.length,
        sold: logs.filter(l => l.call_outcome === "Sold").length,
        followup: logs.filter(l => ["Callback", "No Answer", "Voicemail"].includes(l.call_outcome)).length,
      });
    } catch (error) {
      console.error("Failed to load call queue:", error);
      setQueue([]);
    }
    setLoading(false);
  };

  const startCall = () => {
    if (queue.length === 0) return;
    setCurrentCall(queue[0]);
  };

  const logCall = async (outcome, dealValue = 0) => {
    if (!currentCall) return;
    setSubmitting(true);
    try {
      await base44.entities.CallLog.update(currentCall.id, {
        call_outcome: outcome,
        deal_value: dealValue,
      });
      setCurrentCall(null);
      await loadQueue();
    } catch (error) {
      console.error("Failed to log call:", error);
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-4 h-4 animate-spin text-primary mr-2" />
        <span className="text-xs text-muted-foreground">Loading call queue...</span>
      </div>
    );
  }

  if (showWorkflows) {
    return (
      <div className="space-y-3">
        <button
          onClick={() => setShowWorkflows(false)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          ← Back to Call Center
        </button>
        <WorkflowBuilder onClose={() => setShowWorkflows(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Workflow button */}
      <button
        onClick={() => setShowWorkflows(true)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-bold"
      >
        <span className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5" /> Workflow Automation
        </span>
        →
      </button>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-primary/5 rounded-lg p-3 text-center">
          <div className="text-lg font-black text-primary">{stats.pending}</div>
          <div className="text-[9px] text-muted-foreground">In Queue</div>
        </div>
        <div className="bg-green-500/5 rounded-lg p-3 text-center">
          <div className="text-lg font-black text-green-500">{stats.sold}</div>
          <div className="text-[9px] text-muted-foreground">Sold Today</div>
        </div>
        <div className="bg-yellow-500/5 rounded-lg p-3 text-center">
          <div className="text-lg font-black text-yellow-500">{stats.followup}</div>
          <div className="text-[9px] text-muted-foreground">Follow-up</div>
        </div>
      </div>

      {/* Current Call */}
      {currentCall ? (
        <div className="glass-card rounded-xl p-4 space-y-3 border border-primary/30">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Calling:</div>
            <div className="text-sm font-bold text-foreground">{currentCall.contact_name}</div>
            <div className="text-xs text-muted-foreground">{currentCall.company_name}</div>
            <div className="text-xs text-primary font-mono">{currentCall.phone}</div>
          </div>

          <div className="space-y-2">
            <div className="text-[10px] font-bold text-foreground uppercase tracking-wider">Call Outcome</div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => logCall("No")}
                disabled={submitting}
                className="text-[10px] h-8"
              >
                Not Interested
              </Button>
              <Button
                size="sm"
                onClick={() => logCall("Sold", 500)}
                disabled={submitting}
                className="text-[10px] h-8 bg-green-500/20 text-green-400 hover:bg-green-500/30"
              >
                {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
                Sold
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => logCall("Callback")}
                disabled={submitting}
                className="text-[10px] h-8"
              >
                Callback
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => logCall("No Answer")}
                disabled={submitting}
                className="text-[10px] h-8"
              >
                No Answer
              </Button>
            </div>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setCurrentCall(null)}
            className="w-full text-[10px] text-muted-foreground"
          >
            Skip
          </Button>
        </div>
      ) : queue.length > 0 ? (
        <Button
          onClick={startCall}
          className="w-full metallic-gold-bg text-background font-bold text-sm h-10"
        >
          <Phone className="w-4 h-4 mr-2" /> Start Calling ({queue.length})
        </Button>
      ) : (
        <div className="text-center py-6">
          <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-bold text-foreground">Queue cleared!</p>
          <p className="text-xs text-muted-foreground mt-1">All prospects contacted</p>
        </div>
      )}
    </div>
  );
}