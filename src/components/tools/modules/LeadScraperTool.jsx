import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";

export default function LeadScraperTool({ onChatCommand, workflowColor }) {
  const [location, setLocation] = useState("");
  const [industry, setIndustry] = useState("Retail");
  const [count, setCount] = useState("10");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const scrape = async () => {
    setLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Find ${count} real commercial businesses in ${location || "Phoenix, AZ"} in the ${industry} industry that could use epoxy flooring or concrete polishing. For each, provide company name, contact name, city, state, and estimated square footage. Be realistic.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          leads: { type: "array", items: { type: "object", properties: {
            company: { type: "string" }, contact_name: { type: "string" }, city: { type: "string" },
            state: { type: "string" }, vertical: { type: "string" }, square_footage: { type: "number" }
          }}}
        }
      },
      model: "gemini_3_flash"
    });
    const leads = result?.leads || [];
    setResults(leads);
    // Save to Lead entity
    if (leads.length > 0) {
      await base44.entities.Lead.bulkCreate(leads.map(l => ({
        ...l, stage: "Incoming", pipeline_status: "Incoming", lead_type: "XPress", ingestion_source: "ChatGPT"
      })));
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs text-white/40 font-medium">LOCATION</label>
          <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Phoenix, AZ" className="bg-white/[0.04] border-white/[0.1] text-white" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-white/40 font-medium">INDUSTRY</label>
          <Input value={industry} onChange={e => setIndustry(e.target.value)} placeholder="Retail" className="bg-white/[0.04] border-white/[0.1] text-white" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-white/40 font-medium">COUNT</label>
          <Input value={count} onChange={e => setCount(e.target.value)} placeholder="10" className="bg-white/[0.04] border-white/[0.1] text-white" />
        </div>
      </div>

      <Button onClick={scrape} disabled={loading} className="gap-2 w-full" style={{ backgroundColor: workflowColor }}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        {loading ? "Scraping..." : "Find Leads"}
      </Button>

      {results.length > 0 && (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          <div className="text-xs text-white font-semibold">{results.length} leads found & saved</div>
          {results.map((r, i) => (
            <div key={i} className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08]">
              <div className="text-sm text-white font-medium">{r.company}</div>
              <div className="text-xs text-white/40">{r.contact_name} · {r.city}, {r.state} · {r.vertical}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}