import { useState, useEffect } from "react";
import { Users, Loader2, Sparkles, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

export default function ContactEnricherTool({ workflowColor }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enriching, setEnriching] = useState(false);
  const [enriched, setEnriched] = useState([]);

  useEffect(() => {
    base44.entities.Lead.list("-score", 20).then(l => {
      setLeads((l || []).filter(lead => !lead.email || !lead.phone));
      setLoading(false);
    });
  }, []);

  const enrichAll = async () => {
    setEnriching(true);
    const done = [];
    for (const lead of leads.slice(0, 5)) {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Find contact information for ${lead.contact_name || "the owner"} at ${lead.company} in ${lead.city || ""}, ${lead.state || ""}. Provide realistic email and phone. Return JSON.`,
        add_context_from_internet: true,
        response_json_schema: { type: "object", properties: { email: { type: "string" }, phone: { type: "string" } } },
        model: "gemini_3_flash"
      });
      if (result.email || result.phone) {
        await base44.entities.Lead.update(lead.id, { email: result.email || lead.email, phone: result.phone || lead.phone });
        done.push({ ...lead, email: result.email, phone: result.phone });
      }
    }
    setEnriched(done);
    setEnriching(false);
  };

  if (loading) return <div className="flex items-center gap-2 py-8 justify-center text-white/40"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="text-sm text-white font-semibold">{leads.length} leads missing contact info</div>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {leads.slice(0, 10).map(l => (
          <div key={l.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            <div>
              <div className="text-sm text-white font-medium">{l.company}</div>
              <div className="text-xs text-white/40">{l.contact_name} · Missing: {!l.email ? "email" : ""} {!l.phone ? "phone" : ""}</div>
            </div>
            {enriched.find(e => e.id === l.id) && <CheckCircle className="w-4 h-4 text-green-400" />}
          </div>
        ))}
      </div>
      <Button onClick={enrichAll} disabled={enriching || leads.length === 0} className="gap-2 w-full" style={{ backgroundColor: enriched.length > 0 ? "#10b981" : workflowColor }}>
        {enriching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {enriched.length > 0 ? `${enriched.length} Enriched ✓` : enriching ? "Enriching..." : `Enrich Top ${Math.min(5, leads.length)}`}
      </Button>
    </div>
  );
}