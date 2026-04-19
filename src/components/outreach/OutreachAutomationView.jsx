import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Mail, Send, RefreshCcw, Clock, Loader2, Check, Eye, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

function FollowUpCard({ email, onSend, sending }) {
  return (
    <div className="glass-card rounded-xl p-4 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-foreground text-sm">{email.to_name || email.to_email}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
              email.status === "Queued" ? "bg-yellow-500/10 text-yellow-400" :
              email.status === "Sent" ? "bg-green-500/10 text-green-400" :
              "bg-secondary text-muted-foreground"
            }`}>{email.status}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{email.subject}</p>
          <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-2">{email.body?.replace(/<[^>]*>/g, '').slice(0, 200)}</p>
          {email.notes && <p className="text-[10px] text-primary/60 mt-1">{email.notes}</p>}
        </div>
        {email.status === "Queued" && (
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            <Button size="sm" className="gap-1 text-xs" onClick={() => onSend(email.id)} disabled={sending}>
              {sending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              Send
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OutreachAutomationView() {
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [sending, setSending] = useState({});
  const [sendingAll, setSendingAll] = useState(false);
  const [lastScan, setLastScan] = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.OutreachEmail.filter({ email_type: "Follow-Up" }, "-created_date", 100);
    setFollowUps(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const runScan = async () => {
    setScanning(true);
    const res = await base44.functions.invoke("outreachFollowUp", { action: "scan" });
    setLastScan(res.data);
    toast({
      title: "Follow-Up Scan Complete",
      description: `Scanned ${res.data?.scanned || 0} stale bids, generated ${res.data?.generated || 0} follow-ups`
    });
    setScanning(false);
    load();
  };

  const sendOne = async (emailId) => {
    setSending(p => ({ ...p, [emailId]: true }));
    await base44.functions.invoke("outreachFollowUp", { action: "send", email_id: emailId });
    toast({ title: "Follow-up sent" });
    setSending(p => ({ ...p, [emailId]: false }));
    load();
  };

  const sendAll = async () => {
    setSendingAll(true);
    const res = await base44.functions.invoke("outreachFollowUp", { action: "send_all" });
    toast({ title: "All Follow-Ups Sent", description: `${res.data?.sent || 0} emails sent` });
    setSendingAll(false);
    load();
  };

  const queued = followUps.filter(e => e.status === "Queued");
  const sent = followUps.filter(e => e.status === "Sent");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Outreach Automation</h2>
            <p className="text-xs text-muted-foreground">Auto follow-ups for stale bids (5+ days no response)</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCcw className="w-3.5 h-3.5" />
          </Button>
          <Button size="sm" onClick={runScan} disabled={scanning} className="gap-1.5">
            {scanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            Scan & Generate
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl glass-card text-center">
          <Clock className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{queued.length}</p>
          <p className="text-[10px] text-muted-foreground">Queued</p>
        </div>
        <div className="p-3 rounded-xl glass-card text-center">
          <Check className="w-4 h-4 text-green-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{sent.length}</p>
          <p className="text-[10px] text-muted-foreground">Sent</p>
        </div>
        <div className="p-3 rounded-xl glass-card text-center">
          <Mail className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{followUps.length}</p>
          <p className="text-[10px] text-muted-foreground">Total</p>
        </div>
      </div>

      {/* Send all queued */}
      {queued.length > 0 && (
        <Button onClick={sendAll} disabled={sendingAll} className="w-full gap-2">
          {sendingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Send All {queued.length} Queued Follow-Ups
        </Button>
      )}

      {/* Last scan result */}
      {lastScan && (
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
          <Eye className="w-3.5 h-3.5 text-primary inline mr-1" />
          Last scan: {lastScan.scanned} stale bids checked, {lastScan.generated} follow-ups generated
        </div>
      )}

      {/* Follow-up list */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Loading...</div>
      ) : followUps.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          <Mail className="w-8 h-8 mx-auto mb-2 opacity-30" />
          No follow-ups yet. Click "Scan & Generate" to check for stale bids.
        </div>
      ) : (
        <div className="space-y-2">
          {followUps.map(email => (
            <FollowUpCard key={email.id} email={email} onSend={sendOne} sending={!!sending[email.id]} />
          ))}
        </div>
      )}
    </div>
  );
}