import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Globe, Sparkles, Users, DollarSign, Newspaper, Target, Loader2, Copy, ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";
import moment from "moment";
import { toast } from "sonner";

export default function ResearchDetail({ id, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    const result = await base44.entities.ResearchResult.get(id);
    setData(result);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-muted-foreground">Research not found</p>
        <button onClick={onBack} className="text-sm text-primary mt-2">Go back</button>
      </div>
    );
  }

  let keyData = {};
  try { keyData = JSON.parse(data.key_data_points || "{}"); } catch {}

  const copyAll = () => {
    const text = `${data.title}\n\n${data.ai_summary}\n\n${data.ai_insights}`;
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border px-3 md:px-6 py-3 flex items-center gap-3 z-10">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-secondary transition-colors">
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground truncate">{data.title || data.query}</div>
          <div className="text-[11px] text-muted-foreground">{data.category} · {moment(data.created_date).fromNow()}</div>
        </div>
        <button onClick={copyAll} className="p-2 rounded-xl hover:bg-secondary transition-colors" title="Copy all">
          <Copy className="w-4 h-4 text-muted-foreground" />
        </button>
        {data.source_url && (
          <a href={data.source_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl hover:bg-secondary transition-colors">
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </a>
        )}
      </div>

      <div className="p-3 md:p-6 space-y-4">
        {/* Summary */}
        {data.ai_summary && (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">AI Summary</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">{data.ai_summary}</p>
          </div>
        )}

        {/* Key Facts */}
        {keyData.key_facts?.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground">Key Facts</span>
            </div>
            <div className="space-y-2">
              {keyData.key_facts.map((fact, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                  <span className="text-primary mt-0.5 flex-shrink-0">•</span>
                  <span>{fact}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contacts Found */}
        {keyData.contacts_found?.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground">Contacts Found</span>
            </div>
            <div className="space-y-2">
              {keyData.contacts_found.map((c, i) => (
                <div key={i} className="bg-secondary/50 rounded-xl p-3">
                  <div className="text-sm font-medium text-foreground">{c.name}</div>
                  {c.title && <div className="text-[11px] text-muted-foreground">{c.title}</div>}
                  {c.email && <div className="text-[11px] text-primary">{c.email}</div>}
                  {c.phone && <div className="text-[11px] text-muted-foreground">{c.phone}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing Intel */}
        {keyData.pricing_data && (
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground">Pricing Intelligence</span>
            </div>
            <p className="text-sm text-foreground/80">{keyData.pricing_data}</p>
          </div>
        )}

        {/* Opportunities */}
        {keyData.opportunities?.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">Opportunities</span>
            </div>
            <div className="space-y-2">
              {keyData.opportunities.map((opp, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                  <span className="text-primary mt-0.5 flex-shrink-0">→</span>
                  <span>{opp}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent News */}
        {keyData.recent_news?.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Newspaper className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground">Recent News</span>
            </div>
            <div className="space-y-2">
              {keyData.recent_news.map((news, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                  <span className="text-muted-foreground mt-0.5 flex-shrink-0">•</span>
                  <span>{news}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deep Insights */}
        {data.ai_insights && (
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">Deep AI Insights</span>
            </div>
            <ReactMarkdown className="text-sm text-foreground/80 leading-relaxed prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_li]:my-0.5 [&_p]:my-1.5">
              {data.ai_insights}
            </ReactMarkdown>
          </div>
        )}

        {/* Tags */}
        {data.tags && (
          <div className="flex items-center gap-2 flex-wrap">
            {data.tags.split(", ").filter(Boolean).map((tag) => (
              <span key={tag} className="text-[10px] bg-secondary px-2 py-0.5 rounded-lg text-muted-foreground">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}