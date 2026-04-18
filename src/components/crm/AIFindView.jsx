import { useState } from "react";
import { Search, Loader2, Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

export default function AIFindView({ onRefreshLeads }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [saving, setSaving] = useState({});

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResults(null);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a B2B lead researcher for an epoxy flooring / concrete polishing company called Xtreme Polishing Systems (XPS).

Find 10 real businesses matching this query: "${query}"

For each business provide: company name, contact person name, email (if findable), phone, website, industry/vertical, city, state, and a one-line summary of why they'd be a good lead.

Return JSON.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          leads: {
            type: "array",
            items: {
              type: "object",
              properties: {
                company: { type: "string" },
                contact_name: { type: "string" },
                email: { type: "string" },
                phone: { type: "string" },
                website: { type: "string" },
                vertical: { type: "string" },
                city: { type: "string" },
                state: { type: "string" },
                summary: { type: "string" },
              },
            },
          },
        },
      },
      model: "gemini_3_flash",
    });
    setResults(res.leads || []);
    setLoading(false);
  };

  const saveLead = async (lead) => {
    setSaving(prev => ({ ...prev, [lead.company]: true }));
    await base44.entities.Lead.create({
      company: lead.company,
      contact_name: lead.contact_name || "",
      email: lead.email || "",
      phone: lead.phone || "",
      website: lead.website || "",
      vertical: lead.vertical || "Other",
      city: lead.city || "",
      state: lead.state || "",
      stage: "Incoming",
      ingestion_source: "ChatGPT",
      ai_insight: lead.summary || "",
    });
    setSaving(prev => ({ ...prev, [lead.company]: "saved" }));
    onRefreshLeads?.();
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground mb-1">AI Find</h2>
        <p className="text-sm text-muted-foreground">Use AI to discover and research potential leads</p>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder="e.g. Warehouse companies in Tampa, FL that need flooring..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
          />
        </div>
        <Button onClick={handleSearch} disabled={loading || !query.trim()} className="px-6 metallic-gold-bg text-background hover:brightness-110 gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? "Searching..." : "Find Leads"}
        </Button>
      </div>

      {/* Results */}
      {results && (
        <div>
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">{results.length} Results Found</h3>
          <div className="space-y-3">
            {results.map((lead, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4 flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="text-base font-bold text-foreground">{lead.company}</div>
                  <div className="text-sm text-muted-foreground mt-0.5">{lead.contact_name}{lead.email ? ` · ${lead.email}` : ""}</div>
                  {lead.phone && <div className="text-xs text-muted-foreground">{lead.phone}</div>}
                  <div className="text-xs text-muted-foreground mt-1">{[lead.city, lead.state].filter(Boolean).join(", ")}{lead.vertical ? ` · ${lead.vertical}` : ""}</div>
                  {lead.summary && <p className="text-xs text-foreground/70 mt-2">{lead.summary}</p>}
                </div>
                <Button
                  size="sm"
                  variant={saving[lead.company] === "saved" ? "secondary" : "outline"}
                  onClick={() => saveLead(lead)}
                  disabled={!!saving[lead.company]}
                  className="flex-shrink-0 gap-1"
                >
                  {saving[lead.company] === "saved" ? "Saved ✓" : saving[lead.company] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Plus className="w-3.5 h-3.5" /> Save</>}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!results && !loading && (
        <div className="text-center py-16 text-muted-foreground">
          <Sparkles className="w-10 h-10 mx-auto mb-3 text-primary/40" />
          <p className="text-sm">Enter a search query to find leads with AI</p>
        </div>
      )}
    </div>
  );
}