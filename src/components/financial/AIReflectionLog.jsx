import { Brain, MessageSquare } from "lucide-react";

const BUCKET_LABELS = { low_risk: 'Low Risk', mid_risk: 'Mid Risk', high_risk: 'High Risk', day_trading: 'Day Trading', business_venture: 'Ventures' };
const BUCKET_COLORS = { low_risk: '#22c55e', mid_risk: '#f59e0b', high_risk: '#ef4444', day_trading: '#8b5cf6', business_venture: '#d4af37' };

export default function AIReflectionLog({ portfolios, intelRecords, selectedBucket }) {
  const reports = intelRecords
    .filter(r => (r.tags || '').includes('financial-sandbox') && (r.tags || '').includes('report'))
    .sort((a, b) => new Date(b.scraped_at || b.created_date) - new Date(a.scraped_at || a.created_date));

  const bucketReflections = portfolios
    .filter(p => !selectedBucket || p.bucket === selectedBucket)
    .filter(p => p.ai_reflection);

  return (
    <div className="glass-card rounded-xl p-4">
      <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
        <Brain className="w-4 h-4 metallic-gold-icon" /> Agent Reasoning Log
      </h3>
      <div className="space-y-3 max-h-[450px] overflow-y-auto">
        {reports.slice(0, 10).map((report) => (
          <div key={report.id} className="border border-border/50 rounded-lg p-3">
            <div className="text-[11px] font-bold text-foreground mb-1">{report.title}</div>
            <p className="text-[10px] text-muted-foreground leading-relaxed whitespace-pre-wrap">{report.content}</p>
            {report.summary && (
              <div className="mt-2 pt-2 border-t border-border/30 text-[9px] text-primary font-semibold">{report.summary}</div>
            )}
            <div className="text-[8px] text-muted-foreground/50 mt-1">
              {report.scraped_at ? new Date(report.scraped_at).toLocaleString() : ''}
            </div>
          </div>
        ))}
        {bucketReflections.map((p) => (
          <div key={p.id} className="border border-border/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-3 h-3" style={{ color: BUCKET_COLORS[p.bucket] }} />
              <span className="text-[10px] font-bold text-foreground">{BUCKET_LABELS[p.bucket]} Reflection</span>
            </div>
            <p className="text-[10px] text-muted-foreground italic leading-relaxed">"{p.ai_reflection}"</p>
            {p.strategy && (
              <div className="text-[9px] text-muted-foreground mt-1.5">
                <span className="text-foreground/60 font-semibold">Strategy: </span>{p.strategy}
              </div>
            )}
          </div>
        ))}
        {reports.length === 0 && bucketReflections.length === 0 && (
          <div className="text-center text-xs text-muted-foreground py-8">No logs yet. Run a cycle to generate.</div>
        )}
      </div>
    </div>
  );
}