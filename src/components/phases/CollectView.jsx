import { useState, useEffect } from "react";
import { DollarSign, Receipt, Send, Bell, CreditCard, BookOpen, Heart, Star, BarChart3, RefreshCcw, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getIconColor } from "@/lib/iconColors";
import HScrollRow from "../shared/HScrollRow";
import HCard from "../shared/HCard";
import NavIcon from "../shared/NavIcon";

const WORKFLOW_ID = "get_paid";

const COLLECT_TOOLS = [
  { id: "invoice", label: "AI Final Invoice", Icon: Receipt },
  { id: "invoice_deliver", label: "AI Invoice Delivery", Icon: Send },
  { id: "payment_followup", label: "AI Payment Follow-Up", Icon: Bell },
  { id: "payment", label: "AI Payment Processing", Icon: CreditCard },
  { id: "books", label: "AI Bookkeeping Sync", Icon: BookOpen },
  { id: "thanks", label: "AI Thank You", Icon: Heart },
  { id: "review", label: "AI Review Request", Icon: Star },
  { id: "pnl", label: "AI Job P&L", Icon: BarChart3 },
  { id: "referral", label: "AI Referral Engine", Icon: RefreshCcw },
];

export default function CollectView({ onChatCommand, onOpenTool }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const color = getIconColor(WORKFLOW_ID);

  useEffect(() => {
    (async () => {
      const data = await base44.entities.Invoice.list("-created_date", 100);
      setInvoices(data || []);
      setLoading(false);
    })();
  }, []);

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
      <div className="p-4 md:p-8 space-y-12">
        <div className="text-center pt-2 pb-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-4">
            <NavIcon id={WORKFLOW_ID} size="sm" active />
            <span className="text-xs font-semibold text-white">COLLECT · INVOICING</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>COLLECT</h1>
          <p className="mt-2 text-xs text-white/40">${paidValue.toLocaleString()} collected · ${overdueValue.toLocaleString()} outstanding</p>
        </div>

        <HScrollRow title="COLLECTION TOOLS" icon={DollarSign} count={COLLECT_TOOLS.length}>
          {COLLECT_TOOLS.map(t => (
            <HCard key={t.id} title={t.label} icon={t.Icon} iconColor={color} onClick={() => onOpenTool?.(t.id, WORKFLOW_ID)}>
              <div className="text-[9px] opacity-0 group-hover:opacity-100 transition-opacity mt-1" style={{ color }}>Open tool →</div>
            </HCard>
          ))}
        </HScrollRow>

        <HScrollRow title="OVERDUE" subtitle="Needs immediate attention" icon={Bell} count={overdue.length}>
          {overdue.map(i => (
            <HCard key={i.id} title={i.client_name} subtitle={`${i.invoice_number} · Overdue`} meta={`$${(i.total || 0).toLocaleString()}`} icon={Bell} iconColor={color} onClick={() => onOpenTool?.("payment_followup", WORKFLOW_ID)} />
          ))}
          {overdue.length === 0 && <EmptyCard text="No overdue invoices" />}
        </HScrollRow>

        <HScrollRow title="SENT & AWAITING" icon={Send} count={sent.length}>
          {sent.map(i => (
            <HCard key={i.id} title={i.client_name} subtitle={`${i.invoice_number} · ${i.status}`} meta={`$${(i.total || 0).toLocaleString()}`} icon={Send} iconColor={color} />
          ))}
          {sent.length === 0 && <EmptyCard text="No sent invoices" />}
        </HScrollRow>

        <HScrollRow title="PAID" icon={CreditCard} count={paid.length}>
          {paid.map(i => (
            <HCard key={i.id} title={i.client_name} subtitle={i.invoice_number} meta={`$${(i.total || 0).toLocaleString()}`} icon={CreditCard} iconColor={color} />
          ))}
          {paid.length === 0 && <EmptyCard text="No paid invoices yet" />}
        </HScrollRow>

        <HScrollRow title="DRAFTS" icon={Receipt} count={drafts.length}>
          {drafts.map(i => (
            <HCard key={i.id} title={i.client_name} subtitle={i.invoice_number} meta={`$${(i.total || 0).toLocaleString()}`} icon={Receipt} iconColor={color} onClick={() => onOpenTool?.("invoice", WORKFLOW_ID)} />
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