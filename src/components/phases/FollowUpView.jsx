import { useState, useEffect } from "react";
import { Clock, Mail, Phone, MessageSquare, Bell, CalendarCheck, Loader2, Package, Hammer } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getIconColor } from "@/lib/iconColors";
import HScrollRow from "../shared/HScrollRow";
import HCard from "../shared/HCard";
import NavIcon from "../shared/NavIcon";

const WORKFLOW_ID = "follow_up";

const FOLLOWUP_TOOLS = [
  { id: "drip", label: "AI Follow-Up Sequences", Icon: Clock },
  { id: "reminder", label: "AI Reminder Engine", Icon: Bell },
  { id: "email_followup", label: "AI Email Follow-Up", Icon: Mail },
  { id: "call_followup", label: "AI Call Follow-Up", Icon: Phone },
  { id: "sms_followup", label: "AI SMS Follow-Up", Icon: MessageSquare },
  { id: "schedule", label: "AI Re-Schedule", Icon: CalendarCheck },
];

export default function FollowUpView({ onChatCommand, onOpenTool }) {
  const [leads, setLeads] = useState([]);
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const color = getIconColor(WORKFLOW_ID);

  useEffect(() => {
    (async () => {
      const [l, e] = await Promise.all([
        base44.entities.Lead.list("-created_date", 300),
        base44.entities.OutreachEmail.list("-created_date", 50),
      ]);
      setLeads(l || []);
      setEmails(e || []);
      setLoading(false);
    })();
  }, []);

  const contacted = leads.filter(l => l.stage === "Contacted");
  const proposalSent = leads.filter(l => l.stage === "Proposal");
  const noReply = emails.filter(e => e.status === "Sent" && e.email_type !== "Follow-Up");
  const followupsSent = emails.filter(e => e.email_type === "Follow-Up");

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 md:p-8 space-y-12">
        <div className="text-center pt-2 pb-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-4">
            <NavIcon id={WORKFLOW_ID} size="sm" active />
            <span className="text-xs font-semibold text-white">FOLLOW-UP · SEQUENCES</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>FOLLOW-UP</h1>
          <p className="mt-2 text-xs text-white/40">Automated drip sequences, reminders, and re-engagement</p>
        </div>

        <HScrollRow title="FOLLOW-UP TOOLS" subtitle="Click to open tool" icon={Clock} count={FOLLOWUP_TOOLS.length}>
          {FOLLOWUP_TOOLS.map(t => (
            <HCard key={t.id} title={t.label} icon={t.Icon} iconColor={color} onClick={() => onOpenTool?.(t.id, WORKFLOW_ID)}>
              <div className="text-[9px] opacity-0 group-hover:opacity-100 transition-opacity mt-1" style={{ color }}>Open tool →</div>
            </HCard>
          ))}
        </HScrollRow>

        <HScrollRow title="CONTACTED — AWAITING REPLY" subtitle="No response yet" icon={Mail} count={contacted.length}>
          {contacted.slice(0, 20).map(l => (
            <HCard key={l.id} title={l.company} subtitle={l.contact_name} meta={l.email || l.phone || "No info"} icon={l.lead_type === "XPress" ? Package : Hammer} iconColor={color} onClick={() => onOpenTool?.("email_followup", WORKFLOW_ID)} />
          ))}
          {contacted.length === 0 && <EmptyCard text="No leads awaiting reply" />}
        </HScrollRow>

        <HScrollRow title="PROPOSAL FOLLOW-UP" subtitle="Proposals sent, no decision" icon={Bell} count={proposalSent.length}>
          {proposalSent.slice(0, 15).map(l => (
            <HCard key={l.id} title={l.company} subtitle={l.contact_name} meta={l.estimated_value ? `$${l.estimated_value.toLocaleString()}` : "Proposal sent"} icon={l.lead_type === "XPress" ? Package : Hammer} iconColor={color} onClick={() => onOpenTool?.("email_followup", WORKFLOW_ID)} />
          ))}
          {proposalSent.length === 0 && <EmptyCard text="No proposals awaiting response" />}
        </HScrollRow>

        <HScrollRow title="EMAILS AWAITING REPLY" icon={Mail} count={noReply.length}>
          {noReply.slice(0, 15).map(e => (
            <HCard key={e.id} title={e.to_name || e.to_email} subtitle={e.subject} meta={e.status} icon={Mail} iconColor={color} onClick={() => onOpenTool?.("email_followup", WORKFLOW_ID)} />
          ))}
          {noReply.length === 0 && <EmptyCard text="No emails awaiting reply" />}
        </HScrollRow>

        <HScrollRow title="FOLLOW-UPS SENT" icon={Clock} count={followupsSent.length}>
          {followupsSent.slice(0, 15).map(e => (
            <HCard key={e.id} title={e.to_name || e.to_email} subtitle={e.subject} meta={e.status} icon={Clock} iconColor={color} />
          ))}
          {followupsSent.length === 0 && <EmptyCard text="No follow-ups sent yet" />}
        </HScrollRow>
      </div>
    </div>
  );
}

function EmptyCard({ text }) {
  return (
    <div className="flex-shrink-0 w-[240px] rounded-xl p-4 bg-black/60 border border-white/[0.06] flex items-center justify-center">
      <span className="text-[11px] text-muted-foreground/50">{text}</span>
    </div>
  );
}