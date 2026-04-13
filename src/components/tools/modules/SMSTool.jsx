import { useState, useEffect } from "react";
import { MessageSquare, Loader2, Sparkles, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";

export default function SMSTool({ onChatCommand, workflowColor }) {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    base44.entities.Lead.list("-score", 10).then(l => setLeads(l || []));
  }, []);

  const generateMessage = async () => {
    setGenerating(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Write a short professional SMS message from XPS (Xtreme Polishing Systems) for a follow-up or outreach. Keep it under 160 characters. Professional but friendly. Return JSON with message field.`,
      response_json_schema: { type: "object", properties: { message: { type: "string" } } }
    });
    setMessage(result.message || "");
    setGenerating(false);
  };

  const sendSMS = async () => {
    if (!phone || !message) return;
    setSending(true);
    // Use native SMS link on mobile, or send via backend
    if (/Mobi|Android/i.test(navigator.userAgent)) {
      window.open(`sms:${phone}?body=${encodeURIComponent(message)}`, "_self");
    } else {
      if (onChatCommand) onChatCommand(`Send SMS to ${phone}: "${message}"`);
    }
    setSending(false);
    setSent(true);
  };

  return (
    <div className="space-y-4">
      {leads.length > 0 && (
        <div className="space-y-1.5">
          <label className="text-xs text-white/40 font-medium">QUICK SELECT</label>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {leads.filter(l => l.phone).slice(0, 5).map(l => (
              <button key={l.id} onClick={() => setPhone(l.phone)}
                className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.06] border border-white/[0.1] hover:border-white/[0.2] text-white/70 hover:text-white transition-all">
                <User className="w-3 h-3 inline mr-1" style={{ color: workflowColor }} />{l.company}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs text-white/40 font-medium">PHONE NUMBER</label>
        <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 123-4567" className="bg-white/[0.04] border-white/[0.1] text-white" />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-white/40 font-medium">MESSAGE <span className="text-white/20">({message.length}/160)</span></label>
        <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Type your SMS message..." rows={3} maxLength={320} className="bg-white/[0.04] border-white/[0.1] text-white resize-none" />
      </div>

      <div className="flex items-center gap-3 pt-1">
        <Button onClick={generateMessage} disabled={generating} variant="outline" className="gap-2 border-white/[0.15] text-white/80">
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" style={{ color: workflowColor }} />}
          AI Generate
        </Button>
        <Button onClick={sendSMS} disabled={sending || !phone || !message || sent} className="gap-2" style={{ backgroundColor: sent ? "#10b981" : undefined }}>
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {sent ? "Sent ✓" : "Send SMS"}
        </Button>
      </div>
    </div>
  );
}