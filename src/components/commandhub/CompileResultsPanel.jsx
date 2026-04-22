import { Database, Users, Mail, Phone, CheckCircle2, Layers } from "lucide-react";

export default function CompileResultsPanel({ data }) {
  const s = data?.summary;
  if (!s) return null;

  const sources = s.sources || {};
  const sourceList = [
    { label: "Leads", count: sources.leads || 0, color: "#d4af37" },
    { label: "Prospects", count: sources.prospects || 0, color: "#22c55e" },
    { label: "Contractors", count: sources.contractors || 0, color: "#6366f1" },
    { label: "GC Companies", count: sources.gc_companies || 0, color: "#ef4444" },
    { label: "Jobs", count: sources.jobs || 0, color: "#3b82f6" },
    { label: "Outreach", count: sources.outreach || 0, color: "#ec4899" },
    { label: "Registry", count: sources.registry_alerts || 0, color: "#f59e0b" },
    { label: "Bids", count: sources.bids || 0, color: "#14b8a6" },
    { label: "Proposals", count: sources.proposals || 0, color: "#8b5cf6" },
  ];

  return (
    <div className="glass-card rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-green-400" />
        <h3 className="text-xs font-black text-green-400">Data Compiled Successfully</h3>
      </div>

      {/* Source Breakdown */}
      <div className="grid grid-cols-3 gap-2">
        {sourceList.filter(sl => sl.count > 0).map(sl => (
          <div key={sl.label} className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: `${sl.color}10` }}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sl.color }} />
            <span className="text-[10px] text-muted-foreground">{sl.label}</span>
            <span className="text-[10px] font-bold text-foreground ml-auto">{sl.count.toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-2">
        <div className="text-center p-2 rounded-lg bg-secondary/30">
          <div className="text-lg font-black text-foreground">{(s.total_before_dedup || 0).toLocaleString()}</div>
          <div className="text-[8px] text-muted-foreground">TOTAL RAW</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-primary/10">
          <div className="text-lg font-black text-primary">{(s.total_after_dedup || 0).toLocaleString()}</div>
          <div className="text-[8px] text-muted-foreground">AFTER DEDUP</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-destructive/10">
          <div className="text-lg font-black text-destructive">{(s.duplicates_merged || 0).toLocaleString()}</div>
          <div className="text-[8px] text-muted-foreground">DUPES MERGED</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-green-500/10">
          <div className="text-lg font-black text-green-400">{(s.with_both || 0).toLocaleString()}</div>
          <div className="text-[8px] text-muted-foreground">READY (EMAIL+PHONE)</div>
        </div>
      </div>

      {/* Contact Quality */}
      <div className="flex gap-3 text-[10px]">
        <div className="flex items-center gap-1"><Mail className="w-3 h-3 text-blue-400" /> <span className="text-muted-foreground">With Email:</span> <span className="font-bold">{s.with_email?.toLocaleString()}</span></div>
        <div className="flex items-center gap-1"><Phone className="w-3 h-3 text-green-400" /> <span className="text-muted-foreground">With Phone:</span> <span className="font-bold">{s.with_phone?.toLocaleString()}</span></div>
      </div>

      {/* Dupe Log Sample */}
      {data.dupe_log?.length > 0 && (
        <details className="text-[9px]">
          <summary className="text-muted-foreground cursor-pointer hover:text-foreground">Show {data.dupe_log.length} merged duplicates</summary>
          <div className="mt-1 max-h-32 overflow-y-auto space-y-0.5">
            {data.dupe_log.map((d, i) => (
              <div key={i} className="text-muted-foreground">
                <Layers className="w-2.5 h-2.5 inline mr-1 text-primary" />
                <span className="text-foreground/80">{d.company}</span> — {d.from} → {d.into}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}