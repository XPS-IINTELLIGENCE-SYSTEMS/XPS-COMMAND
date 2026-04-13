import { useState, useEffect } from "react";
import { Send, Loader2, Sparkles, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

export default function AutoSendTool({ onChatCommand, workflowColor }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState([]);

  useEffect(() => {
    base44.entities.Lead.list("-score", 20).then(l => {
      setLeads((l || []).filter(lead => lead.email && (lead.pipeline_status === "Qualified" || lead.stage === "Qualified")));
      setLoading(false);
    });
  }, []);

  const sendAll = async () => {
    setSending(true);
    const sent = [];
    for (const lead of leads.slice(0, 5)) {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Write a short outreach email from XPS to ${lead.company} (${lead.contact_name}). They are a ${lead.vertical || "commercial"} business. Keep it professional, 3 paragraphs max. Return JSON with subject and body.`,
        response_json_schema: { type: "object", properties: { subject: { type: "string" }, body: { type: "string" } } }
      });
      await base44.integrations.Core.SendEmail({ to: lead.email, subject: result.subject, body: result.body });
      sent.push({ company: lead.company, email: lead.email, subject: result.subject });
    }
    setResults(sent);
    setSending(false);
  };

  if (loading) return <div className="flex items-center gap-2 py-8 justify-center text-white/40"><Loader2 className="w-4 h-4 animate-spin" /> Loading qualified leads...</div>;

  return (
    <div className="space-y-4">
      <div className="text-sm text-white font-semibold">{leads.length} qualified leads with email addresses</div>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {leads.slice(0, 10).map(l => (
          <div key={l.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            <div>
              <div className="text-sm text-white font-medium">{l.company}</div>
              <div className="text-xs text-white/40">{l.email}</div>
            </div>
            {results.find(r => r.email === l.email) && <CheckCircle className="w-4 h-4 text-green-400" />}
          </div>
        ))}
      </div>
      <Button onClick={sendAll} disabled={sending || leads.length === 0 || results.length > 0} className="gap-2 w-full" style={{ backgroundColor: results.length > 0 ? "#10b981" : undefined }}>
        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {results.length > 0 ? `${results.length} Emails Sent ✓` : sending ? "Sending..." : `Send to Top ${Math.min(5, leads.length)} Leads`}
      </Button>
      {results.length > 0 && (
        <div className="text-xs text-white/40 space-y-1 pt-2">
          {results.map((r, i) => <div key={i}>✓ {r.company} — "{r.subject}"</div>)}
        </div>
      )}
    </div>
  );
}