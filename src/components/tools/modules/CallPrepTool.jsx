import { useState, useEffect } from "react";
import { Phone, Loader2, Sparkles, User, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";

export default function CallPrepTool({ onChatCommand, workflowColor }) {
  const [contactName, setContactName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [script, setScript] = useState("");
  const [talkingPoints, setTalkingPoints] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    base44.entities.Lead.list("-score", 10).then(l => setLeads(l || []));
  }, []);

  const selectLead = (lead) => {
    setContactName(lead.contact_name || lead.company);
    setPhoneNumber(lead.phone || "");
  };

  const generateScript = async () => {
    setGenerating(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a professional call script for XPS (Xtreme Polishing Systems). 
Contact: ${contactName || "prospect"}. Company: XPS sells premium epoxy floor coatings, concrete polishing equipment, and training.
Include: greeting, value prop, qualifying questions, objection handling, and close.
Return JSON with script and talking_points fields.`,
      response_json_schema: {
        type: "object",
        properties: {
          script: { type: "string" },
          talking_points: { type: "string" }
        }
      }
    });
    setScript(result.script || "");
    setTalkingPoints(result.talking_points || "");
    setGenerating(false);
  };

  const copyScript = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const makeCall = () => {
    if (phoneNumber) window.open(`tel:${phoneNumber}`, "_self");
  };

  return (
    <div className="space-y-4">
      {leads.length > 0 && (
        <div className="space-y-1.5">
          <label className="text-xs text-white/40 font-medium">QUICK SELECT LEAD</label>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {leads.slice(0, 5).map(l => (
              <button key={l.id} onClick={() => selectLead(l)}
                className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.06] border border-white/[0.1] hover:border-white/[0.2] text-white/70 hover:text-white transition-all">
                <User className="w-3 h-3 inline mr-1" style={{ color: workflowColor }} />{l.company}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs text-white/40 font-medium">CONTACT NAME</label>
          <Input value={contactName} onChange={e => setContactName(e.target.value)} placeholder="John Smith" className="bg-white/[0.04] border-white/[0.1] text-white" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-white/40 font-medium">PHONE NUMBER</label>
          <Input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="+1 (555) 123-4567" className="bg-white/[0.04] border-white/[0.1] text-white" />
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={generateScript} disabled={generating} variant="outline" className="gap-2 border-white/[0.15] text-white/80">
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" style={{ color: workflowColor }} />}
          {generating ? "Generating..." : "Generate Script"}
        </Button>
        {phoneNumber && (
          <Button onClick={makeCall} className="gap-2" style={{ backgroundColor: workflowColor }}>
            <Phone className="w-4 h-4" /> Call Now
          </Button>
        )}
      </div>

      {script && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs text-white font-semibold">CALL SCRIPT</label>
              <button onClick={copyScript} className="text-xs text-white/40 hover:text-white flex items-center gap-1">
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="rounded-xl p-4 bg-white/[0.04] border border-white/[0.1] text-sm text-white/80 whitespace-pre-wrap max-h-60 overflow-y-auto">{script}</div>
          </div>
          {talkingPoints && (
            <div className="space-y-1.5">
              <label className="text-xs text-white font-semibold">TALKING POINTS</label>
              <div className="rounded-xl p-4 bg-white/[0.04] border border-white/[0.1] text-sm text-white/80 whitespace-pre-wrap">{talkingPoints}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}