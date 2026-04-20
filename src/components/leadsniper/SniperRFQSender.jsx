import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Send, Loader2, CheckCircle2, Truck, Star } from "lucide-react";

export default function SniperRFQSender({ scope, materialList }) {
  const [vendors, setVendors] = useState([]);
  const [selected, setSelected] = useState([]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentCount, setSentCount] = useState(0);

  useEffect(() => {
    base44.entities.MaterialVendor.list("-created_date", 100)
      .then(v => {
        setVendors(v);
        setSelected(v.filter(v => v.is_preferred).map(v => v.id));
      })
      .catch(() => setVendors([]));
  }, []);

  const toggleVendor = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
  };

  const sendRFQs = async () => {
    setSending(true);
    let count = 0;
    const selectedVendors = vendors.filter(v => selected.includes(v.id));

    // Build material list text
    const matText = (materialList || []).map(m =>
      `• ${m.item} — Qty: ${m.quantity} — Est. cost: $${m.total_cost?.toLocaleString() || "TBD"}`
    ).join("\n");

    for (const vendor of selectedVendors) {
      // Send RFQ email
      await base44.integrations.Core.SendEmail({
        to: vendor.email,
        subject: `RFQ: ${scope.project_name} — Flooring Materials — Xtreme Polishing Systems`,
        body: `Hi ${vendor.contact_name || "Team"},\n\nWe're requesting a quote for the following materials for an upcoming project:\n\nProject: ${scope.project_name}\nLocation: ${scope.project_city}, ${scope.project_state}\nTotal SF: ${scope.total_flooring_sqft?.toLocaleString() || "TBD"}\nSystem: ${scope.specified_system || "TBD"}\nNeeded by: ${scope.bid_due_date || "ASAP"}\n\n--- MATERIAL LIST ---\n${matText || "See attached scope for details."}\n\nPlease provide:\n1. Unit pricing for each item\n2. Total quote\n3. Estimated lead time\n4. Any volume discounts available\n\nPlease respond by end of business ${scope.bid_due_date ? `before ${scope.bid_due_date}` : "as soon as possible"}.\n\nThank you,\nJeremy\nXtreme Polishing Systems\njeremy@shopxps.com`,
        from_name: "Jeremy — XPS Procurement"
      }).catch(() => {});

      // Create VendorQuote record
      await base44.entities.VendorQuote.create({
        vendor_id: vendor.id,
        vendor_name: vendor.company_name,
        vendor_email: vendor.email,
        scope_id: scope.id,
        scope_name: scope.project_name,
        rfq_sent_date: new Date().toISOString(),
        material_list: JSON.stringify(materialList || []),
        status: "rfq_sent",
      });

      count++;
    }

    setSentCount(count);
    setSent(true);
    setSending(false);
  };

  if (vendors.length === 0) {
    return (
      <div className="text-[10px] text-muted-foreground text-center py-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
        No vendors in system — add vendors in the Vendor Portal first
      </div>
    );
  }

  if (sent) {
    return (
      <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-green-400" />
        <span className="text-xs font-bold text-green-400">RFQ sent to {sentCount} vendors</span>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Truck className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-[11px] font-bold text-foreground">Request Quotes from Vendors</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        {vendors.map(v => (
          <label key={v.id} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
            selected.includes(v.id) ? "border-primary/30 bg-primary/5" : "border-white/[0.06] bg-white/[0.02]"
          }`}>
            <input type="checkbox" checked={selected.includes(v.id)} onChange={() => toggleVendor(v.id)} className="rounded" />
            <div className="min-w-0">
              <div className="text-[10px] font-medium text-foreground truncate">{v.company_name}</div>
              <div className="text-[9px] text-muted-foreground truncate">{v.email}</div>
            </div>
            {v.is_preferred && <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400 flex-shrink-0" />}
          </label>
        ))}
      </div>

      <Button size="sm" onClick={sendRFQs} disabled={sending || selected.length === 0} className="text-xs h-7 metallic-gold-bg text-background w-full">
        {sending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Send className="w-3 h-3 mr-1" />}
        {sending ? "Sending RFQs..." : `Send RFQ to ${selected.length} Vendor${selected.length !== 1 ? "s" : ""}`}
      </Button>
    </div>
  );
}