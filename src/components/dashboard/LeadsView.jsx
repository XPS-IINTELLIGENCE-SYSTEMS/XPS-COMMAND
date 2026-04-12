import { Search, Filter, Plus, Phone, Mail, Sparkles, ArrowUpRight, MapPin, Building2, MessageSquare, Loader2, RefreshCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import QuickSmsModal from "../outreach/QuickSmsModal";
import QuickCallModal from "../outreach/QuickCallModal";

function ScoreBadge({ score }) {
  const tier = score >= 85 ? "text-primary bg-primary/10" : score >= 70 ? "text-foreground/70 bg-secondary" : "text-muted-foreground bg-secondary/50";
  return <span className={`text-sm font-bold px-2 py-0.5 rounded-lg ${tier}`}>{score || 0}</span>;
}

function StageBadge({ stage }) {
  return <span className="text-sm font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-lg">{stage}</span>;
}

export default function LeadsView() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [smsTarget, setSmsTarget] = useState(null);
  const [callTarget, setCallTarget] = useState(null);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    const data = await base44.entities.Lead.list("-score", 100);
    setLeads(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadLeads(); }, [loadLeads]);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsub = base44.entities.Lead.subscribe((event) => {
      if (event.type === "create") {
        setLeads(prev => [event.data, ...prev]);
      } else if (event.type === "update") {
        setLeads(prev => prev.map(l => l.id === event.id ? event.data : l));
      } else if (event.type === "delete") {
        setLeads(prev => prev.filter(l => l.id !== event.id));
      }
    });
    return unsub;
  }, []);

  const filtered = leads.filter(l =>
    (l.company || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.contact_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-3 md:p-6 space-y-3 md:space-y-4 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-foreground">Leads</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">{filtered.length} prospects · Sorted by AI score</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5 rounded-xl" onClick={loadLeads}>
            <RefreshCcw className="w-3.5 h-3.5" /> <span className="hidden md:inline">Refresh</span>
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search leads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-10 text-sm bg-card border-border rounded-xl"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-2">No leads yet</p>
          <p className="text-sm text-muted-foreground/70">Use the chat to run: "Find me 25 leads in Tampa, FL"</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((lead) => (
            <div key={lead.id} className="bg-card rounded-2xl border border-border p-3 md:p-4 hover:border-primary/20 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground">{lead.company}</span>
                    <ScoreBadge score={lead.score} />
                    <StageBadge stage={lead.stage} />
                  </div>
                  <div className="text-sm text-muted-foreground mt-0.5">
                    {lead.contact_name} · {lead.location} {lead.square_footage ? `· ${lead.square_footage.toLocaleString()} sq ft` : ""}
                  </div>
                </div>
                <span className="text-base font-bold text-foreground flex-shrink-0 ml-3">
                  ${(lead.estimated_value || 0).toLocaleString()}
                </span>
              </div>

              {lead.ai_insight && (
                <div className="flex items-start gap-2 mb-3 bg-primary/5 rounded-xl px-3 py-2">
                  <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-foreground/80 leading-relaxed line-clamp-2">{lead.ai_insight}</span>
                </div>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                {lead.phone && (
                  <button onClick={() => setCallTarget(lead)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold active:scale-[0.97] transition-transform">
                    <Phone className="w-3.5 h-3.5" /> Call
                  </button>
                )}
                {lead.phone && (
                  <button onClick={() => setSmsTarget(lead)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary text-foreground text-xs font-medium border border-border active:scale-[0.97] transition-transform">
                    <MessageSquare className="w-3.5 h-3.5" /> SMS
                  </button>
                )}
                {lead.email && (
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary text-foreground text-xs font-medium border border-border active:scale-[0.97] transition-transform">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </button>
                )}
                <div className="ml-auto text-xs text-muted-foreground">
                  {lead.vertical}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {smsTarget && <QuickSmsModal onClose={() => setSmsTarget(null)} prefillName={smsTarget.contact_name} prefillPhone={smsTarget.phone} leadId={smsTarget.id} />}
      {callTarget && <QuickCallModal onClose={() => setCallTarget(null)} prefillName={callTarget.contact_name} prefillPhone={callTarget.phone} leadId={callTarget.id} />}
    </div>
  );
}