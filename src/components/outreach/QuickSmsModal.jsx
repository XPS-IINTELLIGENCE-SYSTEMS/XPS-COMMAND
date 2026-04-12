import { useState } from "react";
import { X, Send, Loader2, Sparkles, MessageSquare } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function QuickSmsModal({ onClose, prefillPhone, prefillName, prefillLeadId }) {
  const [phone, setPhone] = useState(prefillPhone || "");
  const [name, setName] = useState(prefillName || "");
  const [message, setMessage] = useState("");
  const [aiGenerate, setAiGenerate] = useState(true);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!phone.trim()) return toast.error("Phone number required");
    setSending(true);
    const res = await base44.functions.invoke("sendSms", {
      to_phone: phone.trim(),
      to_name: name.trim(),
      message: message.trim() || undefined,
      lead_id: prefillLeadId || undefined,
      auto_generate: aiGenerate || !message.trim(),
    });
    setSending(false);
    if (res.data?.success) {
      toast.success(res.data.message);
      onClose();
    } else {
      toast.error(res.data?.error || "Failed to send SMS");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-md p-5 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-foreground">AI SMS</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4" /></button>
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
            <label className="text-xs text-muted-foreground mb-1 block">Message (optional — AI will generate if blank)</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} placeholder="Leave blank for AI to craft the perfect message..." className="w-full px-3 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={aiGenerate} onChange={e => setAiGenerate(e.target.checked)} className="rounded border-border" />
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs text-foreground">AI-humanize message (Claude Sonnet)</span>
          </label>
        </div>

        <button onClick={handleSend} disabled={sending || !phone.trim()} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {sending ? "Sending..." : "Send AI SMS"}
        </button>
      </div>
    </div>
  );
}