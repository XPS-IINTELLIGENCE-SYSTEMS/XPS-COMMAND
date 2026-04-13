import { useState, useEffect, useCallback } from "react";
import { Phone, Mail, Send, MessageSquare, Clock, CalendarCheck, Loader2, Package, Hammer } from "lucide-react";
import { base44 } from "@/api/base44Client";
import HScrollRow from "../shared/HScrollRow";
import HCard from "../shared/HCard";
import NavIcon from "../shared/NavIcon";

const CONTACT_TOOLS = [
  { id: "email", label: "AI Email Writer", Icon: Mail, cmd: "Write an outreach email for my top lead" },
  { id: "send", label: "AI Auto-Send", Icon: Send, cmd: "Send outreach emails to my top 5 leads" },
  { id: "call", label: "AI Call Prep", Icon: Phone, cmd: "Prepare a call script for my highest scored lead" },
  { id: "sms", label: "AI SMS Outreach", Icon: MessageSquare, cmd: "Send a follow-up SMS to my most recent lead" },
  { id: "followup", label: "AI Follow-Up Engine", Icon: Clock, cmd: "Set up follow-up sequences for all contacted leads" },
  { id: "scheduler", label: "AI Meeting Scheduler", Icon: CalendarCheck, cmd: "Schedule a meeting with my highest scored lead" },
];

export default function ContactView({ onChatCommand }) {
  const [leads, setLeads] = useState([]);
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [l, e] = await Promise.all([
        base44.entities.Lead.list("-score", 200),
        base44.entities.OutreachEmail.list("-created_date", 50),
      ]);
      setLeads(l || []);
      setEmails(e || []);
      setLoading(false);
    })();
  }, []);

  const fire = (cmd) => { if (onChatCommand) onChatCommand(cmd); };

  const qualified = leads.filter(l => (l.pipeline_status === "Qualified" || l.stage === "Qualified") && l.stage !== "Contacted");
  const needsFollowup = leads.filter(l => l.stage === "Contacted");
  const recentEmails = emails.slice(0, 15);

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 md:p-6 space-y-6">
        <div className="text-center pt-2 pb-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-4">
            <NavIcon id="get_work" size="sm" active />
            <span className="text-xs font-semibold text-foreground">CONTACT · OUTREACH</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>CONTACT</h1>
          <p className="mt-2 text-xs text-muted-foreground">Outreach tools, who needs contacting, and recent activity</p>
        </div>

        <HScrollRow title="OUTREACH TOOLS" subtitle="Click to run" icon={Phone} count={CONTACT_TOOLS.length}>
          {CONTACT_TOOLS.map(t => (
            <HCard key={t.id} title={t.label} icon={t.Icon} onClick={() => fire(t.cmd)}>
              <div className="text-[9px] text-primary opacity-0 group-hover:opacity-100 transition-opacity mt-1">Run →</div>
            </HCard>
          ))}
        </HScrollRow>

        <HScrollRow title="NEEDS FIRST CONTACT" subtitle="Qualified but not yet contacted" icon={Mail} count={qualified.length} accentColor="text-cyan-400">
          {qualified.slice(0, 15).map(l => (
            <HCard key={l.id} title={l.company} subtitle={l.contact_name} meta={l.email || l.phone || "No info"} icon={l.lead_type === "XPress" ? Package : Hammer} onClick={() => fire(`Write an outreach email for ${l.company}`)} />
          ))}
          {qualified.length === 0 && <EmptyCard text="All qualified leads contacted" />}
        </HScrollRow>

        <HScrollRow title="NEEDS FOLLOW-UP" subtitle="Contacted but no response" icon={Clock} count={needsFollowup.length} accentColor="text-orange-400">
          {needsFollowup.slice(0, 15).map(l => (
            <HCard key={l.id} title={l.company} subtitle={l.contact_name} meta={l.stage} icon={l.lead_type === "XPress" ? Package : Hammer} onClick={() => fire(`Follow up with ${l.company}`)} />
          ))}
          {needsFollowup.length === 0 && <EmptyCard text="No leads need follow-up" />}
        </HScrollRow>

        <HScrollRow title="RECENT EMAILS" subtitle="Latest outreach" icon={Send} count={recentEmails.length}>
          {recentEmails.map(e => (
            <HCard key={e.id} title={e.to_name || e.to_email} subtitle={e.subject} meta={e.status} icon={Mail} />
          ))}
          {recentEmails.length === 0 && <EmptyCard text="No emails sent yet" />}
        </HScrollRow>
      </div>
    </div>
  );
}

function EmptyCard({ text }) {
  return (
    <div className="flex-shrink-0 w-[240px] rounded-xl p-4 bg-white/[0.02] border border-white/[0.06] flex items-center justify-center">
      <span className="text-[11px] text-muted-foreground/50">{text}</span>
    </div>
  );
}