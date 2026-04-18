import { useState } from "react";
import { Mail, Search, Copy, Download, ChevronDown, ChevronUp, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const TEMPLATES = [
  { name: "Initial Outreach", subject: "Partnership Opportunity — {company}", body: "Hi {contact},\n\nI came across {company} and was impressed by your work in {vertical}. I'd love to explore how we could work together.\n\nWould you be open to a quick call this week?\n\nBest regards" },
  { name: "Follow-Up", subject: "Following Up — {company}", body: "Hi {contact},\n\nJust wanted to follow up on my previous message. I believe there's a great opportunity for us to collaborate.\n\nLet me know if you have any questions.\n\nBest regards" },
  { name: "Proposal Send", subject: "Proposal for {company}", body: "Hi {contact},\n\nPlease find attached our proposal for {company}. We've tailored this based on your specific needs.\n\nLooking forward to your feedback.\n\nBest regards" },
];

export default function EmailComposer({ leads }) {
  const [selectedLead, setSelectedLead] = useState(null);
  const [search, setSearch] = useState("");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [generating, setGenerating] = useState(false);

  const filteredLeads = leads.filter(l =>
    !search || `${l.company} ${l.contact_name} ${l.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const selectLead = (lead) => {
    setSelectedLead(lead);
    setTo(lead.email || "");
  };

  const applyTemplate = (t) => {
    if (!selectedLead) return;
    const replace = (str) => str
      .replace(/{company}/g, selectedLead.company || "")
      .replace(/{contact}/g, selectedLead.contact_name || "")
      .replace(/{vertical}/g, selectedLead.vertical || "your industry");
    setSubject(replace(t.subject));
    setBody(replace(t.body));
    setShowTemplates(false);
  };

  const generateAI = async () => {
    if (!selectedLead) return;
    setGenerating(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Write a professional, concise outreach email to ${selectedLead.contact_name} at ${selectedLead.company} (${selectedLead.vertical || "their industry"}). The email should be friendly, value-focused, and include a clear call to action. Keep it under 150 words. Return JSON with "subject" and "body" fields.`,
      response_json_schema: {
        type: "object",
        properties: { subject: { type: "string" }, body: { type: "string" } },
      },
    });
    setSubject(result.subject || "");
    setBody(result.body || "");
    setGenerating(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(body);
    toast.success("Email body copied to clipboard");
  };

  return (
    <div className="flex gap-6 max-w-6xl mx-auto">
      {/* Left: Lead Selector */}
      <div className="w-80 flex-shrink-0 space-y-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Lead Selector</h3>
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leads..." className="w-full pl-9 pr-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm text-foreground" />
          </div>
          <div className="max-h-[400px] overflow-y-auto space-y-1">
            {filteredLeads.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No leads found</p>
            ) : filteredLeads.map(lead => (
              <button
                key={lead.id}
                onClick={() => selectLead(lead)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedLead?.id === lead.id ? "bg-primary/10 border border-primary/30" : "hover:bg-secondary/50 border border-transparent"}`}
              >
                <div className="text-sm font-semibold text-foreground">{lead.company}</div>
                <div className="text-[10px] text-muted-foreground">{lead.contact_name} · {lead.email || "no email"}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Composer */}
      <div className="flex-1 space-y-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Email Composer</h3>
            </div>
            {selectedLead && (
              <Button size="sm" variant="outline" onClick={generateAI} disabled={generating} className="gap-1.5">
                {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                AI Draft
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-4">{selectedLead ? `Composing for ${selectedLead.company}` : "Select a lead to begin"}</p>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">To</label>
              <input value={to} onChange={e => setTo(e.target.value)} placeholder="Select a lead first" className="w-full rounded-lg bg-secondary/50 border border-border px-3 py-2 text-sm text-foreground" disabled={!selectedLead} />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Subject</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Email subject..." className="w-full rounded-lg bg-secondary/50 border border-border px-3 py-2 text-sm text-foreground" disabled={!selectedLead} />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Message</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Your email message..." rows={8} className="w-full rounded-lg bg-secondary/50 border border-border px-3 py-2 text-sm text-foreground resize-none" disabled={!selectedLead} />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1 gap-2" onClick={handleCopy} disabled={!body}><Copy className="w-3.5 h-3.5" /> Copy Body</Button>
            <Button variant="outline" className="flex-1 gap-2" disabled={!body} onClick={() => {
              const blob = new Blob([`Subject: ${subject}\n\n${body}`], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url; a.download = "email.txt"; a.click();
            }}><Download className="w-3.5 h-3.5" /> Download</Button>
          </div>
        </div>

        {/* Templates */}
        <div className="rounded-xl border border-border bg-card">
          <button onClick={() => setShowTemplates(!showTemplates)} className="w-full flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-foreground">Email Templates</span>
            </div>
            {showTemplates ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>
          {showTemplates && (
            <div className="px-5 pb-4 space-y-2">
              {TEMPLATES.map(t => (
                <button key={t.name} onClick={() => applyTemplate(t)} className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary/50 border border-border transition-colors">
                  <div className="text-sm font-semibold text-foreground">{t.name}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{t.subject}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}