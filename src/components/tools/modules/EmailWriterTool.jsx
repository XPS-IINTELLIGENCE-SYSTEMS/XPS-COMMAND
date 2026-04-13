import { useState, useEffect } from "react";
import { Send, Loader2, Sparkles, User, AtSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";

export default function EmailWriterTool({ onChatCommand, workflowColor }) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    base44.entities.Lead.list("-score", 10).then(l => setLeads(l || []));
  }, []);

  const generateEmail = async () => {
    setGenerating(true);
    const target = to || "the top lead";
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Write a professional outreach email from XPS (Xtreme Polishing Systems), a premium epoxy flooring & concrete polishing company. 
Target: ${target}. Subject should be compelling. Body should be concise, professional, mention our high-quality products and services.
Return JSON with subject and body fields.`,
      response_json_schema: {
        type: "object",
        properties: {
          subject: { type: "string" },
          body: { type: "string" }
        }
      }
    });
    setSubject(result.subject || "");
    setBody(result.body || "");
    setGenerating(false);
  };

  const sendEmail = async () => {
    if (!to || !subject || !body) return;
    setSending(true);
    await base44.integrations.Core.SendEmail({ to, subject, body });
    await base44.entities.OutreachEmail.create({
      to_email: to, to_name: to, subject, body, status: "Sent", email_type: "Initial Outreach", sent_at: new Date().toISOString()
    });
    setSending(false);
    setSent(true);
    if (onChatCommand) onChatCommand(`Email sent to ${to}: "${subject}"`);
  };

  return (
    <div className="space-y-4">
      {/* Quick-fill from leads */}
      {leads.length > 0 && (
        <div className="space-y-1.5">
          <label className="text-xs text-white/40 font-medium">QUICK SELECT LEAD</label>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {leads.slice(0, 5).map(l => (
              <button key={l.id} onClick={() => { setTo(l.email || ""); setSubject(""); setBody(""); }}
                className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.06] border border-white/[0.1] hover:border-white/[0.2] text-white/70 hover:text-white transition-all">
                <User className="w-3 h-3 inline mr-1" style={{ color: workflowColor }} />{l.company}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs text-white/40 font-medium">TO</label>
        <div className="relative">
          <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input value={to} onChange={e => setTo(e.target.value)} placeholder="recipient@email.com" className="pl-9 bg-white/[0.04] border-white/[0.1] text-white" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-white/40 font-medium">SUBJECT</label>
        <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Email subject line..." className="bg-white/[0.04] border-white/[0.1] text-white" />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-white/40 font-medium">BODY</label>
        <Textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write your email or let AI generate it..." rows={8} className="bg-white/[0.04] border-white/[0.1] text-white resize-none" />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button onClick={generateEmail} disabled={generating} variant="outline" className="gap-2 border-white/[0.15] text-white/80 hover:text-white">
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" style={{ color: workflowColor }} />}
          {generating ? "Generating..." : "AI Generate"}
        </Button>
        <Button onClick={sendEmail} disabled={sending || !to || !body || sent} className="gap-2" style={{ backgroundColor: sent ? "#10b981" : undefined }}>
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {sent ? "Sent ✓" : sending ? "Sending..." : "Send Email"}
        </Button>
      </div>
    </div>
  );
}