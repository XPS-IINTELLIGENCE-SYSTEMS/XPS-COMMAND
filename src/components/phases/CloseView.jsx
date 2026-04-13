import { useState, useEffect } from "react";
import { Trophy, FileText, DollarSign, Send, Clock, Swords, PenLine, Stamp, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import HScrollRow from "../shared/HScrollRow";
import HCard from "../shared/HCard";
import NavIcon from "../shared/NavIcon";

const CLOSE_TOOLS = [
  { id: "proposal", label: "AI Proposal Generator", Icon: FileText, cmd: "Generate a proposal for my highest scored lead" },
  { id: "bid", label: "AI Bid Calculator", Icon: DollarSign, cmd: "Calculate a bid for 10,000 sqft standard epoxy" },
  { id: "deliver", label: "AI Proposal Delivery", Icon: Send, cmd: "Send the latest proposal to the client" },
  { id: "followup", label: "AI Proposal Follow-Up", Icon: Clock, cmd: "Follow up on all sent proposals" },
  { id: "negotiate", label: "AI Negotiation Coach", Icon: Swords, cmd: "Help me handle price objections" },
  { id: "revise", label: "AI Quick Revise", Icon: PenLine, cmd: "Revise the latest proposal to $8/sqft" },
  { id: "esign", label: "AI E-Sign", Icon: Stamp, cmd: "Send e-sign request for latest proposal" },
];

export default function CloseView({ onChatCommand }) {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await base44.entities.Proposal.list("-created_date", 100);
      setProposals(data || []);
      setLoading(false);
    })();
  }, []);

  const fire = (cmd) => { if (onChatCommand) onChatCommand(cmd); };

  const drafts = proposals.filter(p => p.status === "Draft");
  const sent = proposals.filter(p => p.status === "Sent" || p.status === "Viewed");
  const won = proposals.filter(p => p.status === "Approved");
  const lost = proposals.filter(p => p.status === "Rejected");
  const wonValue = won.reduce((s, p) => s + (p.total_value || 0), 0);

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 md:p-8 space-y-10">
        <div className="text-center pt-2 pb-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-4">
            <NavIcon id="win_work" size="sm" active />
            <span className="text-xs font-semibold text-foreground">CLOSE · PROPOSALS</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>CLOSE</h1>
          <p className="mt-2 text-xs text-muted-foreground">Proposals, bids, negotiations, and wins — ${wonValue.toLocaleString()} won</p>
        </div>

        <HScrollRow title="CLOSING TOOLS" icon={Trophy} count={CLOSE_TOOLS.length}>
          {CLOSE_TOOLS.map(t => (
            <HCard key={t.id} title={t.label} icon={t.Icon} onClick={() => fire(t.cmd)}>
              <div className="text-[9px] text-primary opacity-0 group-hover:opacity-100 transition-opacity mt-1">Run →</div>
            </HCard>
          ))}
        </HScrollRow>

        <HScrollRow title="DRAFTS" subtitle="Proposals being prepared" icon={FileText} count={drafts.length}>
          {drafts.map(p => (
            <HCard key={p.id} title={p.client_name} subtitle={p.service_type} meta={`$${(p.total_value || 0).toLocaleString()}`} icon={FileText} onClick={() => fire(`Show proposal for ${p.client_name}`)} />
          ))}
          {drafts.length === 0 && <EmptyCard text="No draft proposals" />}
        </HScrollRow>

        <HScrollRow title="SENT & PENDING" subtitle="Waiting for response" icon={Send} count={sent.length}>
          {sent.map(p => (
            <HCard key={p.id} title={p.client_name} subtitle={`${p.service_type} · ${p.status}`} meta={`$${(p.total_value || 0).toLocaleString()}`} icon={Send} onClick={() => fire(`Follow up on proposal for ${p.client_name}`)} />
          ))}
          {sent.length === 0 && <EmptyCard text="No pending proposals" />}
        </HScrollRow>

        <HScrollRow title="WON" subtitle="Closed and approved" icon={Trophy} count={won.length}>
          {won.map(p => (
            <HCard key={p.id} title={p.client_name} subtitle={p.service_type} meta={`$${(p.total_value || 0).toLocaleString()}`} icon={Trophy} />
          ))}
          {won.length === 0 && <EmptyCard text="No won deals yet" />}
        </HScrollRow>

        <HScrollRow title="LOST" count={lost.length}>
          {lost.map(p => (
            <HCard key={p.id} title={p.client_name} subtitle={p.service_type} meta={`$${(p.total_value || 0).toLocaleString()}`} icon={FileText} />
          ))}
          {lost.length === 0 && <EmptyCard text="No lost proposals" />}
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