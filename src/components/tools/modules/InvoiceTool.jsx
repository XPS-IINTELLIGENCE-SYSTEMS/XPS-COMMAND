import { useState } from "react";
import { Receipt, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";

export default function InvoiceTool({ workflowColor }) {
  const [client, setClient] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("Epoxy Floor Coating");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [invoiceNum, setInvoiceNum] = useState(`INV-${Date.now().toString().slice(-6)}`);

  const saveInvoice = async () => {
    setSaving(true);
    await base44.entities.Invoice.create({
      invoice_number: invoiceNum, client_name: client, client_email: email,
      line_items: JSON.stringify([{ description, qty: 1, unit_price: parseFloat(amount) || 0, total: parseFloat(amount) || 0 }]),
      total: parseFloat(amount) || 0, status: "Draft", payment_terms: "Net 30"
    });
    setSaving(false);
    setSaved(true);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs text-white/40 font-medium">INVOICE #</label>
          <Input value={invoiceNum} onChange={e => setInvoiceNum(e.target.value)} className="bg-white/[0.04] border-white/[0.1] text-white" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-white/40 font-medium">CLIENT</label>
          <Input value={client} onChange={e => setClient(e.target.value)} placeholder="Company name" className="bg-white/[0.04] border-white/[0.1] text-white" />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs text-white/40 font-medium">CLIENT EMAIL</label>
        <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="billing@company.com" className="bg-white/[0.04] border-white/[0.1] text-white" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs text-white/40 font-medium">DESCRIPTION</label>
          <Input value={description} onChange={e => setDescription(e.target.value)} className="bg-white/[0.04] border-white/[0.1] text-white" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-white/40 font-medium">AMOUNT</label>
          <Input value={amount} onChange={e => setAmount(e.target.value)} placeholder="5000" className="bg-white/[0.04] border-white/[0.1] text-white" />
        </div>
      </div>
      <div className="rounded-xl p-3 bg-white/[0.04] border border-white/[0.1] flex items-center justify-between">
        <span className="text-sm text-white/40">TOTAL DUE</span>
        <span className="text-xl font-bold text-white">${(parseFloat(amount) || 0).toLocaleString()}</span>
      </div>
      <Button onClick={saveInvoice} disabled={saving || !client || saved} className="gap-2 w-full" style={{ backgroundColor: saved ? "#10b981" : undefined }}>
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saved ? "Invoice Created ✓" : "Create Invoice"}
      </Button>
    </div>
  );
}