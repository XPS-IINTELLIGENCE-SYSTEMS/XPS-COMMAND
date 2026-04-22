import { useState } from "react";
import { Mail, Send, Edit3, Copy, Trash2, Check, X, ChevronDown, ChevronUp, Eye, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const CATEGORY_COLORS = {
  "GC Bid List Intro": "#3b82f6",
  "Contractor Intro": "#d4af37",
  "Epoxy Company Intro": "#22c55e",
  "Follow-Up": "#f59e0b",
  "Sales": "#ef4444",
  "Proposal": "#8b5cf6",
  "Thank You": "#ec4899",
  "Custom": "#64748b",
};

export default function EmailTemplateCard({ template, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendTo, setSendTo] = useState("jeremy@shopxps.com");
  const [showSend, setShowSend] = useState(false);
  const [editData, setEditData] = useState({
    name: template.name || "",
    subject: template.subject || "",
    body: template.body || "",
    category: template.category || "Custom",
    tone: template.tone || "Professional",
  });

  const catColor = CATEGORY_COLORS[template.category] || "#64748b";

  const handleSave = async () => {
    await base44.entities.MessageTemplate.update(template.id, editData);
    setEditing(false);
    onUpdate?.();
  };

  const handleSend = async () => {
    setSending(true);
    setSent(false);
    const htmlBody = buildBrandedHtml(editData.subject || template.subject, editData.body || template.body);
    await base44.integrations.Core.SendEmail({
      from_name: "Jeremy Bensen — Xtreme Polishing Systems",
      to: sendTo,
      subject: editData.subject || template.subject || "XPS Outreach",
      body: htmlBody,
    });
    await base44.entities.MessageTemplate.update(template.id, { usage_count: (template.usage_count || 0) + 1 });
    setSending(false);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    onUpdate?.();
  };

  const handleCopy = () => {
    const text = `Subject: ${template.subject}\n\n${template.body}`;
    navigator.clipboard.writeText(text);
  };

  const handleDelete = async () => {
    await base44.entities.MessageTemplate.delete(template.id);
    onDelete?.();
  };

  const shortName = (template.name || "").replace(/^\[.*?\]\s*/, "").slice(0, 60);

  return (
    <div className="glass-card rounded-xl overflow-hidden transition-all">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${catColor}20` }}>
          <Mail className="w-4 h-4" style={{ color: catColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground truncate">{shortName || "Untitled"}</span>
            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold" style={{ backgroundColor: `${catColor}15`, color: catColor }}>
              {template.category || "Custom"}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground truncate mt-0.5">{template.subject || "No subject"}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
          <button onClick={() => { setExpanded(true); setEditing(true); }} className="p-1.5 rounded-lg hover:bg-primary/20 text-primary"><Edit3 className="w-3.5 h-3.5" /></button>
          <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-blue-500/20 text-blue-400"><Copy className="w-3.5 h-3.5" /></button>
          <button onClick={() => { setExpanded(true); setShowSend(!showSend); }} className="p-1.5 rounded-lg hover:bg-green-500/20 text-green-400"><Send className="w-3.5 h-3.5" /></button>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="border-t border-border/30 p-3 space-y-3">
          {editing ? (
            <div className="space-y-2">
              <Input value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} placeholder="Template name" className="text-xs" />
              <Input value={editData.subject} onChange={e => setEditData({...editData, subject: e.target.value})} placeholder="Subject line" className="text-xs" />
              <div className="flex gap-2">
                <select value={editData.category} onChange={e => setEditData({...editData, category: e.target.value})} className="glass-input rounded-lg px-2 py-1.5 text-[10px] text-foreground flex-1">
                  {Object.keys(CATEGORY_COLORS).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={editData.tone} onChange={e => setEditData({...editData, tone: e.target.value})} className="glass-input rounded-lg px-2 py-1.5 text-[10px] text-foreground flex-1">
                  {["Professional", "Casual", "Urgent", "Friendly", "Formal"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <Textarea value={editData.body} onChange={e => setEditData({...editData, body: e.target.value})} className="text-xs min-h-[200px]" />
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="outline" onClick={() => setEditing(false)}><X className="w-3 h-3 mr-1" /> Cancel</Button>
                <Button size="sm" onClick={handleSave}><Check className="w-3 h-3 mr-1" /> Save</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-secondary/30 rounded-lg p-3">
                <div className="text-[9px] font-bold text-primary mb-1">Subject</div>
                <p className="text-xs text-foreground">{template.subject || "—"}</p>
              </div>
              <div className="bg-secondary/30 rounded-lg p-3">
                <div className="text-[9px] font-bold text-primary mb-1">Body</div>
                <pre className="text-xs text-foreground/80 whitespace-pre-wrap font-inter leading-relaxed">{template.body}</pre>
              </div>
              <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
                <span>Tone: {template.tone}</span>
                <span>Used: {template.usage_count || 0}x</span>
              </div>
            </>
          )}

          {/* Send panel */}
          {showSend && !editing && (
            <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3 space-y-2">
              <div className="text-[10px] font-bold text-green-400">Send This Template</div>
              <div className="flex gap-2">
                <Input value={sendTo} onChange={e => setSendTo(e.target.value)} placeholder="Recipient email" className="text-xs flex-1" />
                <Button size="sm" onClick={handleSend} disabled={sending || !sendTo} className="bg-green-600 hover:bg-green-700">
                  {sending ? <Loader2 className="w-3 h-3 animate-spin" /> : sent ? <Check className="w-3 h-3" /> : <Send className="w-3 h-3" />}
                  {sent ? "Sent!" : "Send"}
                </Button>
              </div>
            </div>
          )}

          {/* Delete */}
          <div className="flex justify-end">
            <button onClick={handleDelete} className="flex items-center gap-1 text-[9px] text-destructive/60 hover:text-destructive"><Trash2 className="w-3 h-3" /> Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}

function buildBrandedHtml(subject, body) {
  const escaped = (body || "").replace(/\n/g, "<br/>");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="margin:0;padding:0;background:#0a0a0f;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:20px 0;">
<tr><td align="center">
<table width="640" cellpadding="0" cellspacing="0" style="background:#111118;border:1px solid #2a2a35;border-radius:12px;overflow:hidden;">
<!-- Gold header bar -->
<tr><td style="background:linear-gradient(90deg,#b8860b,#d4af37,#f5e6a3,#d4af37,#b8860b);height:4px;"></td></tr>
<!-- Logo area -->
<tr><td style="padding:24px 32px 16px;text-align:center;">
<div style="font-size:22px;font-weight:900;color:#d4af37;letter-spacing:1px;">XTREME POLISHING SYSTEMS</div>
<div style="font-size:11px;color:#888;margin-top:4px;">XPS Xpress &bull; Polished Concrete University &bull; 60+ Locations Nationwide</div>
</td></tr>
<!-- Content -->
<tr><td style="padding:0 32px 24px;">
<div style="font-size:14px;color:#e0e0e0;line-height:1.7;">${escaped}</div>
</td></tr>
<!-- Signature -->
<tr><td style="padding:0 32px 24px;">
<table cellpadding="0" cellspacing="0"><tr>
<td style="border-left:3px solid #d4af37;padding-left:12px;">
<div style="font-weight:700;color:#d4af37;font-size:13px;">Jeremy Bensen</div>
<div style="color:#999;font-size:11px;">AI Marketing & Sales Director</div>
<div style="color:#999;font-size:11px;">Xtreme Polishing Systems (XPS Xpress)</div>
<div style="color:#999;font-size:11px;">jeremy@shopxps.com &bull; xpsxpress.com</div>
</td></tr></table>
</td></tr>
<!-- Stats bar -->
<tr><td style="background:#1a1a25;padding:16px 32px;">
<table width="100%" cellpadding="0" cellspacing="0"><tr>
<td style="text-align:center;"><div style="font-size:18px;font-weight:900;color:#d4af37;">60+</div><div style="font-size:9px;color:#888;">LOCATIONS</div></td>
<td style="text-align:center;"><div style="font-size:18px;font-weight:900;color:#d4af37;">50K+</div><div style="font-size:9px;color:#888;">PROJECTS</div></td>
<td style="text-align:center;"><div style="font-size:18px;font-weight:900;color:#d4af37;">10yr</div><div style="font-size:9px;color:#888;">WARRANTY</div></td>
<td style="text-align:center;"><div style="font-size:18px;font-weight:900;color:#d4af37;">5K+</div><div style="font-size:9px;color:#888;">TRAINED</div></td>
</tr></table>
</td></tr>
<!-- Footer -->
<tr><td style="padding:16px 32px;text-align:center;">
<div style="font-size:10px;color:#555;">Xtreme Polishing Systems &bull; "Floors For Life" &bull; xpsxpress.com</div>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}