import { useState } from "react";
import { X, Phone, Loader2, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function QuickCallModal({ onClose, prefillPhone, prefillName, prefillLeadId }) {
  const [phone, setPhone] = useState(prefillPhone || "");
  const [name, setName] = useState(prefillName || "");
  const [purpose, setPurpose] = useState("");
  const [points, setPoints] = useState("");
  const [calling, setCalling] = useState(false);

  const handleCall = async () => {
    if (!phone.trim()) return toast.error("Phone number required");
    setCalling(true);
    const res = await base44.functions.invoke("makeAiCall", {
      to_phone: phone.trim(),
      to_name: name.trim(),
      purpose: purpose.trim() || undefined,
      lead_id: prefillLeadId || undefined,
      talking_points: points.trim() || undefined,
    });
    setCalling(false);
    if (res.data?.success) {
      toast.success(res.data.message);
      onClose();
    } else {
      toast.error(res.data?.error || "Failed to initiate call");
    }
  };

  const purposes = [
    "Follow up on flooring interest",
    "Discovery call — learn about their project",
    "Proposal walkthrough",
    "Closing — ready to sign",
    "Check-in after project completion",
  ];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-md p-5 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-foreground">AI Voice Call</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4" /></button>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-[11px] text-foreground/80">AI generates a natural voice script using the best neural voice (Amazon Polly Matthew-Neural) and Claude Sonnet for humanistic dialogue.</div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Phone Number</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1234567890" className="w-full px-3 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Contact Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="John Smith" className="w-full px-3 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Call Purpose</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {purposes.map(p => (
                <button key={p} onClick={() => setPurpose(p)} className={`text-[10px] px-2 py-1 rounded-lg border transition-colors ${purpose === p ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border text-muted-foreground hover:border-primary/20'}`}>
                  {p}
                </button>
              ))}
            </div>
            <input value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="Or type a custom purpose..." className="w-full px-3 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Talking Points (optional)</label>
            <textarea value={points} onChange={e => setPoints(e.target.value)} rows={2} placeholder="Key things to mention on the call..." className="w-full px-3 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none" />
          </div>
        </div>

        <button onClick={handleCall} disabled={calling || !phone.trim()} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
          {calling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
          {calling ? "Initiating AI Call..." : "Start AI Voice Call"}
        </button>
      </div>
    </div>
  );
}