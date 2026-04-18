import { CheckCircle2, ExternalLink, Star } from "lucide-react";

export default function LeadEngineResults({ results, mode }) {
  if (!results) return null;

  // Company/Job scrape results
  if (results.leads && Array.isArray(results.leads)) {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-foreground">{results.leads_created || results.leads.length} Results Found</span>
            {results.total_pipeline_value > 0 && (
              <span className="ml-3 text-xs text-primary font-semibold">${(results.total_pipeline_value / 1000).toFixed(0)}k pipeline value</span>
            )}
          </div>
          {results.market_summary && <span className="text-[10px] text-muted-foreground max-w-xs truncate">{results.market_summary}</span>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-[10px] text-muted-foreground uppercase tracking-wider">
                <th className="text-left px-4 py-3">Company</th>
                <th className="text-left px-4 py-3">Score</th>
                <th className="text-left px-4 py-3">Value</th>
                <th className="text-left px-4 py-3">Signal</th>
              </tr>
            </thead>
            <tbody>
              {results.leads.map((lead, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-foreground">{lead.company}</div>
                  </td>
                  <td className="px-4 py-3">
                    <ScoreBadge score={lead.score} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {lead.value ? `$${(lead.value / 1000).toFixed(0)}k` : '—'}
                  </td>
                  <td className="px-4 py-3 text-[11px] text-muted-foreground">
                    {lead.signal || lead.source || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Web research / oracle results
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle2 className="w-5 h-5 text-green-500" />
        <span className="text-sm font-bold text-foreground">{results.title || 'Research Complete'}</span>
      </div>
      {results.summary && (
        <div className="mb-4">
          <div className="text-[10px] uppercase text-muted-foreground tracking-wider mb-1">Summary</div>
          <p className="text-sm text-foreground/80 leading-relaxed">{results.summary}</p>
        </div>
      )}
      {results.insights && (
        <div className="mb-4">
          <div className="text-[10px] uppercase text-muted-foreground tracking-wider mb-1">Insights</div>
          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{results.insights}</p>
        </div>
      )}
      {results.tags && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {results.tags.split(',').map((tag, i) => (
            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{tag.trim()}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function ScoreBadge({ score }) {
  const s = score || 0;
  const color = s >= 80 ? 'text-green-400 bg-green-400/10' : s >= 60 ? 'text-yellow-400 bg-yellow-400/10' : s >= 40 ? 'text-orange-400 bg-orange-400/10' : 'text-red-400 bg-red-400/10';
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>{s}</span>;
}