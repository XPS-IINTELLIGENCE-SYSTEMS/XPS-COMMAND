import { useState } from "react";
import { Shield, Loader2, CheckCircle2, AlertTriangle, XCircle, Wrench, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

export default function CRMValidationPanel({ contact, onClose }) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const validate = async () => {
    setLoading(true);
    const res = await base44.functions.invoke("crmAutoPopulate", { action: "validate", contact_id: contact.id });
    setReport(res.data);
    setLoading(false);
  };

  const scoreColor = (s) => s >= 80 ? "#22c55e" : s >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="glass-card rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" /> AI Validation
        </h4>
        <div className="flex items-center gap-2">
          {!report && (
            <Button size="sm" variant="outline" onClick={validate} disabled={loading} className="text-[10px] h-7 gap-1">
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              {loading ? "Analyzing..." : "Run Validation"}
            </Button>
          )}
          <button onClick={onClose} className="text-[10px] text-muted-foreground hover:text-foreground">✕</button>
        </div>
      </div>

      {report && (
        <div className="space-y-3">
          {/* Score */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black" style={{ backgroundColor: `${scoreColor(report.data_quality_score)}15`, color: scoreColor(report.data_quality_score) }}>
              {report.data_quality_score}
            </div>
            <div>
              <div className="text-xs font-bold text-foreground">Data Quality Score</div>
              <div className="text-[10px] text-muted-foreground">{report.data_quality_score >= 80 ? "Excellent" : report.data_quality_score >= 50 ? "Needs Improvement" : "Poor — Action Required"}</div>
            </div>
          </div>

          {/* Missing fields */}
          {report.missing_fields?.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-yellow-400 flex items-center gap-1 mb-1"><AlertTriangle className="w-3 h-3" /> Missing Fields</div>
              <div className="flex flex-wrap gap-1">
                {report.missing_fields.map(f => (
                  <span key={f} className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 text-[9px] font-bold">{f}</span>
                ))}
              </div>
            </div>
          )}

          {/* Issues */}
          {report.issues?.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-red-400 flex items-center gap-1 mb-1"><XCircle className="w-3 h-3" /> Issues Found</div>
              {report.issues.map((issue, i) => (
                <div key={i} className="bg-red-500/5 border border-red-500/10 rounded-lg p-2 mb-1">
                  <div className="text-[10px] font-bold text-red-400">{issue.field}: {issue.issue}</div>
                  <div className="text-[10px] text-foreground/70 flex items-center gap-1"><Wrench className="w-2.5 h-2.5" /> Fix: {issue.fix}</div>
                </div>
              ))}
            </div>
          )}

          {/* Recommended actions */}
          {report.recommended_actions?.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-green-400 flex items-center gap-1 mb-1"><CheckCircle2 className="w-3 h-3" /> Recommended Actions</div>
              {report.recommended_actions.map((a, i) => (
                <div key={i} className="text-[10px] text-foreground/80 ml-2">• {a}</div>
              ))}
            </div>
          )}

          {/* AI Recommendation */}
          {report.ai_recommendation && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-2">
              <div className="text-[10px] font-bold text-primary flex items-center gap-1 mb-0.5"><Sparkles className="w-3 h-3" /> Strategy</div>
              <div className="text-[10px] text-foreground/80">{report.ai_recommendation}</div>
            </div>
          )}

          <Button size="sm" variant="outline" onClick={validate} disabled={loading} className="text-[10px] h-7 w-full gap-1">
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Shield className="w-3 h-3" />}
            Re-Validate
          </Button>
        </div>
      )}
    </div>
  );
}