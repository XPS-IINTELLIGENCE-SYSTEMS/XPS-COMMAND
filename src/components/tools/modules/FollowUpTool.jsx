import { useState, useEffect } from "react";
import { Clock, Loader2, Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";

export default function FollowUpTool({ onChatCommand, workflowColor }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [generating, setGenerating] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  useEffect(() => {
    base44.entities.Lead.list("-created_date", 50).then(l => {
      setLeads((l || []).filter(lead => lead.stage === "Contacted" || lead.stage === "Proposal"));
      setLoading(false);
    });
  }, []);

  const generateFollowUp = async (lead) => {
    setSelectedLead(lead);
    setGenerating(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Write a follow-up email from XPS to ${lead.company} (${lead.contact_name}). They were contacted previously. Be professional, reference our epoxy flooring products/services. Keep it concise.`,
    });
    setMessage(result || "");
    setGenerating(false);
  };

  const sendFollowUp = async () => {
    if (!selectedLead?.email || !message) return;
    await base44.integrations.Core.SendEmail({
      to: selectedLead.email, subject: `Following up — XPS & ${selectedLead.company}`, body: message
    });
    await base44.entities.OutreachEmail.create({
      to_email: selectedLead.email, to_name: selectedLead.contact_name, subject: `Following up — XPS & ${selectedLead.company}`, body: message, status: "Sent", email_type: "Follow-Up"
    });
    setMessage(""); setSelectedLead(null);
  };

  if (loading) return <div className="flex items-center gap-2 py-8 justify-center text-white/40"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="text-sm text-white font-semibold">{leads.length} leads need follow-up</div>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {leads.slice(0, 10).map(l => (
          <button key={l.id} onClick={() => generateFollowUp(l)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all text-left ${selectedLead?.id === l.id ? 'bg-white/[0.08] border-white/[0.2]' : 'bg-white/[0.04] border-white/[0.08] hover:border-white/[0.15]'}`}>
            <div>
              <div className="text-sm text-white font-medium">{l.company}</div>
              <div className="text-xs text-white/40">{l.contact_name} · {l.stage}</div>
            </div>
            <Sparkles className="w-4 h-4 text-white/30" style={selectedLead?.id === l.id ? { color: workflowColor } : {}} />
          </button>
        ))}
        {leads.length === 0 && <div className="text-xs text-white/40 text-center py-4">No leads need follow-up</div>}
      </div>

      {generating && <div className="flex items-center gap-2 py-3 text-white/40 text-xs"><Loader2 className="w-3 h-3 animate-spin" /> Generating follow-up...</div>}

      {message && (
        <div className="space-y-3">
          <Textarea value={message} onChange={e => setMessage(e.target.value)} rows={6} className="bg-white/[0.04] border-white/[0.1] text-white resize-none" />
          <Button onClick={sendFollowUp} className="gap-2 w-full">
            <Send className="w-4 h-4" /> Send Follow-Up
          </Button>
        </div>
      )}
    </div>
  );
}