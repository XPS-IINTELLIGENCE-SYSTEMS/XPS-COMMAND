import { Mail, MessageSquare, Plus, Send, Users, ArrowUpRight, Phone, Loader2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useState, useEffect } from "react";
import QuickSmsModal from "../outreach/QuickSmsModal";
import QuickCallModal from "../outreach/QuickCallModal";

export default function OutreachView() {
  const [smsOpen, setSmsOpen] = useState(false);
  const [callOpen, setCallOpen] = useState(false);
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ sent: 0, opened: 0, replied: 0, sms: 0 });

  const loadData = async () => {
    setLoading(true);
    const data = await base44.entities.OutreachEmail.list("-created_date", 100);
    setEmails(data || []);

    const sent = (data || []).filter(e => ["Sent", "Opened", "Replied"].includes(e.status)).length;
    const opened = (data || []).filter(e => e.status === "Opened").length;
    const replied = (data || []).filter(e => e.status === "Replied").length;
    const sms = (data || []).filter(e => e.subject === "SMS").length;

    setStats({ sent, opened, replied, sms });
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const statCards = [
    { label: "Emails Sent", value: String(stats.sent), sub: "Total outreach" },
    { label: "Opened", value: String(stats.opened), sub: "Tracked opens" },
    { label: "Replied", value: String(stats.replied), sub: "Responses" },
    { label: "SMS Sent", value: String(stats.sms), sub: "Text messages" },
  ];

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-5 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-foreground">Outreach</h1>
          <p className="text-sm text-muted-foreground">AI-powered email & SMS campaigns</p>
        </div>
        <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5 rounded-xl" onClick={loadData}>
          <RefreshCcw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-card rounded-2xl border border-border p-3 md:p-4">
            <div className="text-sm text-muted-foreground">{stat.label}</div>
            <div className="text-xl font-bold text-foreground mt-1">{stat.value}</div>
            <div className="text-sm text-primary/80 mt-0.5">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <button onClick={() => setSmsOpen(true)} className="flex items-center gap-3 p-4 bg-primary/10 rounded-2xl border border-primary/20 active:scale-[0.98] transition-transform">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-foreground">AI SMS</div>
            <div className="text-sm text-muted-foreground">Send smart text</div>
          </div>
        </button>
        <button onClick={() => setCallOpen(true)} className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border active:scale-[0.98] transition-transform">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
            <Phone className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-foreground">AI Call</div>
            <div className="text-sm text-muted-foreground">AI voice outreach</div>
          </div>
        </button>
        <button className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border active:scale-[0.98] transition-transform">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
            <Send className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-foreground">AI Mass Email</div>
            <div className="text-sm text-muted-foreground">Use chat to send</div>
          </div>
        </button>
        <button className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border active:scale-[0.98] transition-transform">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
            <Users className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-foreground">AI Sequence</div>
            <div className="text-sm text-muted-foreground">Use chat to build</div>
          </div>
        </button>
      </div>

      {smsOpen && <QuickSmsModal onClose={() => setSmsOpen(false)} />}
      {callOpen && <QuickCallModal onClose={() => setCallOpen(false)} />}

      {/* Recent outreach activity */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Recent Activity</h3>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : emails.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-1">No outreach yet</p>
            <p className="text-sm text-muted-foreground/70">Use the chat: "Send an email to [lead]" or "SMS [lead]"</p>
          </div>
        ) : (
          <div className="space-y-2">
            {emails.slice(0, 20).map((e) => (
              <div key={e.id} className="bg-card rounded-2xl border border-border p-3 md:p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                  {e.subject === "SMS" ? <MessageSquare className="w-4 h-4 text-muted-foreground" /> : <Mail className="w-4 h-4 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    {e.to_name || e.to_email} — {e.subject === "SMS" ? "SMS" : e.subject}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {e.status} · {e.email_type || "Custom"} · {new Date(e.created_date).toLocaleDateString()}
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-lg ${e.status === "Sent" ? "bg-green-500/10 text-green-500" : e.status === "Draft" ? "bg-secondary text-muted-foreground" : "bg-primary/10 text-primary"}`}>
                  {e.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}