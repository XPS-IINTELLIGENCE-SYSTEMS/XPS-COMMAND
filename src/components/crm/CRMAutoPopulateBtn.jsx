import { useState } from "react";
import { Loader2, Database, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

export default function CRMAutoPopulateBtn({ onComplete }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  const run = async () => {
    setRunning(true);
    setResult(null);
    const res = await base44.functions.invoke("crmAutoPopulate", { action: "populate" });
    setResult(res.data);
    setRunning(false);
    onComplete?.();
  };

  return (
    <div className="space-y-2">
      <Button onClick={run} disabled={running} size="sm" className="metallic-gold-bg text-background font-black text-xs gap-2">
        {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
        {running ? "Scanning All Databases..." : "Auto-Populate CRM"}
      </Button>

      {result?.success && (
        <div className="glass-card rounded-xl p-3 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-green-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> CRM Auto-Populated
          </div>
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            {[
              { label: "Contractors", value: result.stats.contractors_scanned },
              { label: "GC Companies", value: result.stats.gc_companies_scanned },
              { label: "Jobs", value: result.stats.jobs_scanned },
              { label: "Prospects", value: result.stats.prospects_scanned },
              { label: "New Created", value: result.stats.new_contacts_created, color: "#22c55e" },
              { label: "Dupes Skipped", value: result.stats.duplicates_skipped, color: "#f59e0b" },
            ].map(s => (
              <div key={s.label} className="bg-secondary/50 rounded-lg p-1.5 text-center">
                <div className="font-black" style={{ color: s.color || "#fff" }}>{s.value}</div>
                <div className="text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">
            Total CRM Contacts: <span className="font-bold text-primary">{result.stats.total_crm_contacts}</span>
          </div>
        </div>
      )}
    </div>
  );
}