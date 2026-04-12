import { Globe, Sparkles, Clock, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import moment from "moment";

const statusColors = {
  Complete: "text-green-400",
  Analyzing: "text-primary",
  Scraping: "text-primary",
  Pending: "text-muted-foreground",
  Failed: "text-destructive",
};

export default function ResearchHistory({ results, loading, onSelect, onRefresh }) {
  return (
    <div className="flex-1 overflow-y-auto p-3 md:p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Research History</h3>
        <button onClick={onRefresh} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
          <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-12">
          <Globe className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <div className="text-sm text-muted-foreground">No research yet</div>
          <div className="text-[11px] text-muted-foreground/60">Use the browser above to start researching</div>
        </div>
      ) : (
        <div className="space-y-2">
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => onSelect(r.id)}
              className="w-full bg-card rounded-2xl border border-border p-3 hover:border-primary/20 transition-colors text-left flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                {r.status === "Complete" ? (
                  <Sparkles className="w-4 h-4 text-primary" />
                ) : r.status === "Failed" ? (
                  <Globe className="w-4 h-4 text-destructive" />
                ) : (
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">{r.title || r.query}</div>
                <div className="text-[11px] text-muted-foreground truncate">
                  {r.category || "Research"} · {moment(r.created_date).fromNow()}
                </div>
              </div>
              <span className={cn("text-[10px] font-medium", statusColors[r.status] || "text-muted-foreground")}>
                {r.status}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}