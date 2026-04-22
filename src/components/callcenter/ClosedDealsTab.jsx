import { useState } from "react";
import { Trophy, FileText, Send, Loader2, DollarSign, Building2, Mail, ExternalLink } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ClosedDealsTab({ callLogs, onRefresh }) {
  const [creatingInvoice, setCreatingInvoice] = useState(null);

  const createAndSendInvoice = async (log) => {
    setCreatingInvoice(log.id);
    try {
      // Create invoice entity
      await base44.entities.Invoice.create({
        client_name: log.company_name,
        client_email: log.email,
        amount: log.deal_value || 0,
        status: "Draft",
        line_items: log.products_sold || "[]",
        notes: `Auto-generated from Call Center. ${log.notes || ""}`,
      });

      // Update call log
      await base44.entities.CallLog.update(log.id, { invoice_created: true });

      // Send email notification
      if (log.email) {
        await base44.integrations.Core.SendEmail({
          to: log.email,
          subject: `Invoice from XPS — ${log.company_name}`,
          body: `Hi ${log.contact_name},\n\nThank you for your order! Your invoice has been created and is attached.\n\nTotal: $${(log.deal_value || 0).toLocaleString()}\n\nPlease let us know if you have any questions.\n\nBest,\nXPS Sales Team`,
        });
        await base44.entities.CallLog.update(log.id, { invoice_sent: true });
      }
      onRefresh?.();
    } catch (err) {
      console.error("Invoice error:", err);
    }
    setCreatingInvoice(null);
  };

  if (callLogs.length === 0) {
    return (
      <div className="text-center py-16">
        <Trophy className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No closed deals yet. Start calling!</p>
      </div>
    );
  }

  const totalRevenue = callLogs.reduce((sum, l) => sum + (l.deal_value || 0), 0);

  return (
    <div className="space-y-3">
      {/* Revenue summary */}
      <div className="glass-card rounded-xl p-4 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-muted-foreground">Total Closed Revenue</span>
          <div className="text-2xl font-black text-green-400">${totalRevenue.toLocaleString()}</div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-muted-foreground">Deals Closed</span>
          <div className="text-2xl font-black text-primary">{callLogs.length}</div>
        </div>
      </div>

      {/* Closed deal cards */}
      <div className="space-y-2">
        {callLogs.map(log => (
          <div key={log.id} className="glass-card rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-sm font-bold text-foreground">{log.company_name}</span>
                <span className="text-[10px] text-muted-foreground ml-2">{log.contact_name}</span>
              </div>
              <div className="flex items-center gap-2">
                {log.deal_value > 0 && (
                  <span className="text-sm font-black text-green-400 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" />{log.deal_value.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-2">
              {log.location && <span>{log.location}</span>}
              {log.vertical && <span>• {log.vertical}</span>}
              <span>• {new Date(log.created_date).toLocaleDateString()}</span>
            </div>

            {log.notes && (
              <p className="text-[10px] text-foreground/70 mb-2 bg-secondary/30 rounded-lg p-2">{log.notes}</p>
            )}

            {log.ai_pitch && (
              <p className="text-[10px] text-primary/80 mb-2">💡 {log.ai_pitch}</p>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => createAndSendInvoice(log)}
                disabled={log.invoice_created || creatingInvoice === log.id}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  log.invoice_created
                    ? "bg-green-500/10 text-green-400"
                    : "metallic-gold-bg text-background hover:brightness-110"
                } disabled:opacity-50`}
              >
                {creatingInvoice === log.id ? <Loader2 className="w-3 h-3 animate-spin" /> : log.invoice_created ? <Trophy className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                {log.invoice_created ? "Invoice Sent ✓" : "Create & Send Invoice"}
              </button>

              {log.email && (
                <a href={`mailto:${log.email}`} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-bold">
                  <Mail className="w-3 h-3" /> Email
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}