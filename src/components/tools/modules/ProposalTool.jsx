import { useState } from "react";
import { FileText, Loader2, Sparkles, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";

export default function ProposalTool({ workflowColor }) {
  const [client, setClient] = useState("");
  const [serviceType, setServiceType] = useState("Epoxy Floor Coating");
  const [sqft, setSqft] = useState("");
  const [pricePerSqft, setPricePerSqft] = useState("6");
  const [scope, setScope] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const total = (parseFloat(sqft) || 0) * (parseFloat(pricePerSqft) || 0);

  const generateScope = async () => {
    setGenerating(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Write a professional scope of work for XPS to provide ${serviceType} for ${client || "the client"}. Area: ${sqft || "TBD"} sqft at $${pricePerSqft}/sqft. Include surface prep, materials, application, curing, and warranty.`
    });
    setScope(result || "");
    setGenerating(false);
  };

  const saveProposal = async () => {
    setSaving(true);
    await base44.entities.Proposal.create({
      title: `${serviceType} — ${client}`, client_name: client, service_type: serviceType,
      square_footage: parseFloat(sqft) || 0, price_per_sqft: parseFloat(pricePerSqft) || 0,
      total_value: total, scope_of_work: scope, status: "Draft"
    });
    setSaving(false);
    setSaved(true);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs text-white/40 font-medium">CLIENT</label>
          <Input value={client} onChange={e => setClient(e.target.value)} placeholder="Company name" className="bg-white/[0.04] border-white/[0.1] text-white" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-white/40 font-medium">SERVICE TYPE</label>
          <Input value={serviceType} onChange={e => setServiceType(e.target.value)} className="bg-white/[0.04] border-white/[0.1] text-white" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs text-white/40 font-medium">SQ FT</label>
          <Input value={sqft} onChange={e => setSqft(e.target.value)} placeholder="10000" className="bg-white/[0.04] border-white/[0.1] text-white" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-white/40 font-medium">$/SQFT</label>
          <Input value={pricePerSqft} onChange={e => setPricePerSqft(e.target.value)} className="bg-white/[0.04] border-white/[0.1] text-white" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-white/40 font-medium">TOTAL</label>
          <div className="h-9 flex items-center px-3 rounded-md bg-white/[0.04] border border-white/[0.1] text-white font-bold">${total.toLocaleString()}</div>
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs text-white/40 font-medium">SCOPE OF WORK</label>
        <Textarea value={scope} onChange={e => setScope(e.target.value)} rows={6} placeholder="Describe the scope or let AI generate..." className="bg-white/[0.04] border-white/[0.1] text-white resize-none" />
      </div>
      <div className="flex gap-3">
        <Button onClick={generateScope} disabled={generating} variant="outline" className="gap-2 border-white/[0.15] text-white/80">
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" style={{ color: workflowColor }} />}
          AI Generate Scope
        </Button>
        <Button onClick={saveProposal} disabled={saving || !client || saved} className="gap-2" style={{ backgroundColor: saved ? "#10b981" : undefined }}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saved ? "Saved ✓" : "Save Proposal"}
        </Button>
      </div>
    </div>
  );
}