import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Brain, RefreshCcw, Loader2, TrendingUp, Flame, Thermometer, Snowflake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const SENTIMENT_CONFIG = {
  "On Fire": { color: "text-red-400", bg: "bg-red-500/10", icon: Flame },
  "Hot": { color: "text-orange-400", bg: "bg-orange-500/10", icon: TrendingUp },
  "Warm": { color: "text-yellow-400", bg: "bg-yellow-500/10", icon: Thermometer },
  "Lukewarm": { color: "text-blue-300", bg: "bg-blue-500/10", icon: Thermometer },
  "Cold": { color: "text-blue-500", bg: "bg-blue-600/10", icon: Snowflake },
};

function SentimentBadge({ label, score }) {
  const config = SENTIMENT_CONFIG[label] || SENTIMENT_CONFIG["Cold"];
  const Icon = config.icon;
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.color}`}>
      <Icon className="w-3 h-3" />
      {label} · {score}
    </div>
  );
}

function LeadSentimentCard({ lead, onAnalyze, analyzing }) {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-foreground text-sm">{lead.company}</span>
            {lead.sentiment_label && <SentimentBadge label={lead.sentiment_label} score={lead.sentiment_score || 0} />}
            <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded-full bg-secondary">P{lead.priority || '—'}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {lead.contact_name} · {lead.stage} · {lead.vertical || "—"}
          </div>
          {lead.sentiment_notes && (
            <p className="text-[11px] text-muted-foreground/70 mt-2 line-clamp-2">{lead.sentiment_notes}</p>
          )}
        </div>
        <Button size="sm" variant="outline" className="gap-1 text-xs flex-shrink-0"
          onClick={() => onAnalyze(lead.id)} disabled={analyzing}>
          {analyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Brain className="w-3 h-3" />}
          Analyze
        </Button>
      </div>
    </div>
  );
}

export default function SentimentAnalystView() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState({});
  const [batchRunning, setBatchRunning] = useState(false);
  const [sortBy, setSortBy] = useState("sentiment"); // sentiment | priority | recent

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Lead.list("-created_date", 200);
    setLeads(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const analyzeOne = async (leadId) => {
    setAnalyzing(p => ({ ...p, [leadId]: true }));
    await base44.functions.invoke("sentimentAnalyst", { action: "analyze_one", lead_id: leadId });
    toast({ title: "Sentiment Updated" });
    setAnalyzing(p => ({ ...p, [leadId]: false }));
    load();
  };

  const analyzeAll = async () => {
    setBatchRunning(true);
    const res = await base44.functions.invoke("sentimentAnalyst", { action: "analyze_all" });
    toast({
      title: "Batch Analysis Complete",
      description: `Analyzed ${res.data?.analyzed || 0} of ${res.data?.total_eligible || 0} eligible leads`
    });
    setBatchRunning(false);
    load();
  };

  const sorted = [...leads].sort((a, b) => {
    if (sortBy === "sentiment") return (b.sentiment_score || 0) - (a.sentiment_score || 0);
    if (sortBy === "priority") return (b.priority || 0) - (a.priority || 0);
    return 0;
  });

  const withSentiment = leads.filter(l => l.sentiment_score != null);
  const avgSentiment = withSentiment.length > 0
    ? Math.round(withSentiment.reduce((s, l) => s + l.sentiment_score, 0) / withSentiment.length)
    : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/15 flex items-center justify-center">
            <Brain className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Sentiment Analyst</h2>
            <p className="text-xs text-muted-foreground">AI-driven lead intent scoring from email & meeting history</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}><RefreshCcw className="w-3.5 h-3.5" /></Button>
          <Button size="sm" onClick={analyzeAll} disabled={batchRunning} className="gap-1.5">
            {batchRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Brain className="w-3.5 h-3.5" />}
            Analyze All
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl glass-card text-center">
          <p className="text-xl font-bold text-foreground">{withSentiment.length}</p>
          <p className="text-[10px] text-muted-foreground">Scored</p>
        </div>
        <div className="p-3 rounded-xl glass-card text-center">
          <p className="text-xl font-bold text-foreground">{avgSentiment}</p>
          <p className="text-[10px] text-muted-foreground">Avg Score</p>
        </div>
        <div className="p-3 rounded-xl glass-card text-center">
          <p className="text-xl font-bold text-red-400">{leads.filter(l => l.sentiment_label === "On Fire" || l.sentiment_label === "Hot").length}</p>
          <p className="text-[10px] text-muted-foreground">Hot+</p>
        </div>
        <div className="p-3 rounded-xl glass-card text-center">
          <p className="text-xl font-bold text-blue-400">{leads.filter(l => l.sentiment_label === "Cold" || !l.sentiment_label).length}</p>
          <p className="text-[10px] text-muted-foreground">Cold / Unscored</p>
        </div>
      </div>

      {/* Sort pills */}
      <div className="flex gap-1.5">
        {[
          { id: "sentiment", label: "By Sentiment" },
          { id: "priority", label: "By Priority" },
          { id: "recent", label: "Most Recent" },
        ].map(s => (
          <button key={s.id} onClick={() => setSortBy(s.id)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-colors ${
              sortBy === s.id ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border hover:text-foreground"
            }`}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Lead list */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Loading...</div>
      ) : (
        <div className="space-y-2">
          {sorted.map(lead => (
            <LeadSentimentCard key={lead.id} lead={lead} onAnalyze={analyzeOne} analyzing={!!analyzing[lead.id]} />
          ))}
        </div>
      )}
    </div>
  );
}