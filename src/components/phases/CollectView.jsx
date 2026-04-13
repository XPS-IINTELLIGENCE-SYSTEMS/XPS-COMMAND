import { useState, useEffect } from "react";
import { DollarSign, Receipt, Send, Bell, CreditCard, BookOpen, Heart, Star, Archive, BarChart3, RefreshCcw, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import HScrollRow from "../shared/HScrollRow";
import HCard from "../shared/HCard";
import NavIcon from "../shared/NavIcon";

const COLLECT_TOOLS = [
  { id: "invoice", label: "AI Final Invoice", Icon: Receipt, cmd: "Generate a final invoice for the latest completed proposal" },
  { id: "deliver", label: "AI Invoice Delivery", Icon: Send, cmd: "Send the latest invoice to the client" },
  { id: "followup", label: "AI Payment Follow-Up", Icon: Bell, cmd: "Follow up on all overdue invoices" },
  { id: "payment", label: "AI Payment Processing", Icon: CreditCard, cmd: "Show me all unpaid invoices and their status" },
  { id: "books", label: "AI Bookkeeping Sync", Icon: BookOpen, cmd: "Show me a financial summary of all paid invoices" },
  { id: "thanks", label: "AI Thank You", Icon: Heart, cmd: "Send a thank you email to our latest paid client" },
  { id: "review", label: "AI Review Request", Icon: Star, cmd: "Send a review request to our last paid client" },
  { id: "pnl", label: "AI Job P&L", Icon: BarChart3, cmd: "Calculate profit/loss for all completed jobs" },
  { id: "referral", label: "AI Referral Engine", Icon: RefreshCcw, cmd: "Identify past clients for referral outreach" },
];

export default function CollectView({ onChatCommand }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await base44.entities.Invoice.list("-created_date", 100);
      setInvoices(data || []);
      setLoading(false);
    })();
  }, []);

  const fire = (cmd) => { if (onChatCommand) onChatCommand(cmd); };

  const overdue = invoices.filter(i => i.status === "Overdue");
  const sent = invoices.filter(i => i.status === "Sent" || i.status === "Viewed");
  const paid = invoices.filter(i => i.status === "Paid");
  const drafts = invoices.filter(i => i.status === "Draft");

  const overdueValue = overdue.reduce((s, i) => s + (i.total || 0), 0);
  const paidValue = paid.reduce((s, i) => s + (i.total || 0), 0);

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 md:p-8 space-y-10">
        <div className="text-center pt-2 pb-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-4">
            <NavIcon id="get_paid" size="sm" active />
            <span className="text-xs font-semibold text-foreground">COLLECT · INVOICING</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>COLLECT</h1>
          <p className="mt-2 text-xs text-muted-foreground">
            ${paidValue.toLocaleString()} collected · ${overdueValue.toLocaleString()} outstanding
          </p>
        </div>

        <HScrollRow title="COLLECTION TOOLS" icon={DollarSign} count={COLLECT_TOOLS.length}>
          {COLLECT_TOOLS.map(t => (
            <HCard key={t.id} title={t.label} icon={t.Icon} onClick={() => fire(t.cmd)}>
              <div className="text-[9px] text-primary opacity-0 group-hover:opacity-100 transition-opacity mt-1">Run →</div>
            </HCard>
          ))}
        </HScrollRow>

        <HScrollRow title="OVERDUE" subtitle="Needs immediate attention" icon={Bell} count={overdue.length}>
          {overdue.map(i => (
            <HCard key={i.id} title={i.client_name} subtitle={`${i.invoice_number} · Overdue`} meta={`$${(i.total || 0).toLocaleString()}`} icon={Bell} onClick={() => fire(`Follow up on invoice ${i.invoice_number}`)} />
          ))}
          {overdue.length === 0 && <EmptyCard text="No overdue invoices" />}
        </HScrollRow>

        <HScrollRow title="SENT & AWAITING" icon={Send} count={sent.length}>
          {sent.map(i => (
            <HCard key={i.id} title={i.client_name} subtitle={`${i.invoice_number} · ${i.status}`} meta={`$${(i.total || 0).toLocaleString()}`} icon={Send} />
          ))}
          {sent.length === 0 && <EmptyCard text="No sent invoices" />}
        </HScrollRow>

        <HScrollRow title="PAID" icon={CreditCard} count={paid.length}>
          {paid.map(i => (
            <HCard key={i.id} title={i.client_name} subtitle={i.invoice_number} meta={`$${(i.total || 0).toLocaleString()}`} icon={CreditCard} />
          ))}
          {paid.length === 0 && <EmptyCard text="No paid invoices yet" />}
        </HScrollRow>

        <HScrollRow title="DRAFTS" icon={Receipt} count={drafts.length}>
          {drafts.map(i => (
            <HCard key={i.id} title={i.client_name} subtitle={i.invoice_number} meta={`$${(i.total || 0).toLocaleString()}`} icon={Receipt} onClick={() => fire(`Finalize invoice ${i.invoice_number}`)} />
          ))}
          {drafts.length === 0 && <EmptyCard text="No draft invoices" />}
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