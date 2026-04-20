import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Mail, Loader2 } from "lucide-react";

export default function SniperOutreachLog() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.OutreachEmail.list("-created_date", 30)
      .then(setEmails)
      .catch(() => setEmails([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-primary" /></div>;

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Mail className="w-4 h-4 metallic-gold-icon" />
        <span className="text-xs font-bold metallic-gold">Recent Outreach</span>
        <span className="text-[10px] text-muted-foreground ml-1">{emails.length} emails</span>
      </div>
      {emails.length === 0 ? (
        <p className="text-[10px] text-muted-foreground text-center py-4">No outreach emails logged yet</p>
      ) : (
        <div className="space-y-1.5 max-h-[240px] overflow-y-auto">
          {emails.map(e => (
            <div key={e.id} className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/[0.03] text-[10px]">
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                e.status === "Sent" ? "bg-green-500/20 text-green-400" :
                e.status === "Opened" ? "bg-blue-500/20 text-blue-400" :
                e.status === "Replied" ? "bg-primary/20 text-primary" :
                "bg-secondary text-muted-foreground"
              }`}>{e.status}</span>
              <span className="text-foreground font-medium truncate flex-1">{e.to_name || e.to_email}</span>
              <span className="text-muted-foreground truncate max-w-[180px] hidden sm:block">{e.subject}</span>
              <span className="text-muted-foreground/60 flex-shrink-0">{e.sent_at ? new Date(e.sent_at).toLocaleDateString() : "—"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}