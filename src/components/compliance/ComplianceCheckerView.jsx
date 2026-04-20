import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Shield, Loader2, AlertTriangle, CheckCircle2, FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function ComplianceCheckerView() {
  const [jobs, setJobs] = useState([]);
  const [bids, setBids] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    const load = async () => {
      const [j, b] = await Promise.all([
        base44.entities.CommercialJob.list("-created_date", 200),
        base44.entities.BidDocument.list("-created_date", 200).catch(() => []),
      ]);
      setJobs(j || []);
      setBids(b || []);
      setLoading(false);
    };
    load();
  }, []);

  const selectedJob = jobs.find(j => j.id === selectedJobId);
  const jobBids = bids.filter(b => b.job_id === selectedJobId);
  const scopes = selectedJob ? [] : [];

  const runCheck = async () => {
    if (!selectedJob) return;
    setChecking(true);

    // Get scope data from FloorScope if linked
    let scopeData = [];
    try {
      scopeData = await base44.entities.FloorScope.filter({ gc_company_name: selectedJob.gc_name });
    } catch {}

    const scopeInfo = scopeData.map(s => ({
      project: s.project_name,
      zones: s.extracted_zones,
      requirements: s.special_requirements,
      specified_system: s.specified_system,
      bid_due: s.bid_due_date,
    }));

    const bidContent = jobBids.map(b => ({
      scope: b.scope_of_work,
      materials: b.materials_spec,
      total: b.total_bid_value,
      content: b.bid_document_content,
    }));

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a commercial flooring bid compliance officer. Analyze the following project requirements and generated proposal/bid documents to identify compliance gaps.

PROJECT:
- Name: ${selectedJob.job_name}
- Type: ${selectedJob.project_type}
- Location: ${selectedJob.city}, ${selectedJob.state}
- Sector: ${selectedJob.sector || "Commercial Private"}
- Total Sqft: ${selectedJob.total_sqft || "Unknown"}
- Flooring Sqft: ${selectedJob.flooring_sqft || "Unknown"}
- Bid Due Date: ${selectedJob.bid_due_date || "Not set"}
${selectedJob.flooring_system_recommendation ? `- Specified System: ${selectedJob.flooring_system_recommendation}` : ""}

SCOPE DOCUMENTS (${scopeInfo.length}):
${JSON.stringify(scopeInfo, null, 2)}

GENERATED BIDS (${bidContent.length}):
${JSON.stringify(bidContent, null, 2)}

Analyze for:
1. Missing required sections (scope of work, pricing, timeline, insurance, bonding)
2. Non-compliant pricing (below cost, missing line items, no mobilization)
3. Mandatory forms (W-9, bid bond, insurance certificate, safety plan)
4. Government-specific requirements if sector is Government
5. Specification compliance (does the proposed system match what was specified?)
6. Timeline feasibility
7. Missing zone coverage (are all areas from scope included in bid?)

For each issue found, assign a severity: critical, warning, or info.`,
      response_json_schema: {
        type: "object",
        properties: {
          overall_score: { type: "number", description: "0-100 compliance score" },
          status: { type: "string", enum: ["pass", "warning", "fail"] },
          issues: {
            type: "array",
            items: {
              type: "object",
              properties: {
                severity: { type: "string", enum: ["critical", "warning", "info"] },
                category: { type: "string" },
                title: { type: "string" },
                description: { type: "string" },
                recommendation: { type: "string" },
              }
            }
          },
          missing_sections: { type: "array", items: { type: "string" } },
          missing_forms: { type: "array", items: { type: "string" } },
          summary: { type: "string" },
        }
      }
    });

    setResults(result);
    setChecking(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  const severityConfig = {
    critical: { color: "text-red-400 bg-red-500/10 border-red-500/30", icon: AlertTriangle },
    warning: { color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30", icon: AlertTriangle },
    info: { color: "text-blue-400 bg-blue-500/10 border-blue-500/30", icon: CheckCircle2 },
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold metallic-gold">Bid Compliance Checker</h1>
          <p className="text-xs text-muted-foreground">Cross-reference bid requirements with proposal content before submission</p>
        </div>
      </div>

      {/* Job Selection */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Select Project to Check</label>
        <Select value={selectedJobId} onValueChange={setSelectedJobId}>
          <SelectTrigger className="bg-card border-border"><SelectValue placeholder="Choose a project..." /></SelectTrigger>
          <SelectContent>
            {jobs.map(j => (
              <SelectItem key={j.id} value={j.id}>
                {j.job_name} — {j.city}, {j.state} {j.bid_due_date ? `(Due: ${j.bid_due_date})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedJob && (
        <div className="p-4 rounded-xl bg-card border border-border grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <div><p className="text-lg font-bold text-foreground">{(selectedJob.flooring_sqft || selectedJob.total_sqft || 0).toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Sqft</p></div>
          <div><p className="text-lg font-bold text-foreground capitalize">{(selectedJob.project_type || "").replace(/_/g, " ")}</p><p className="text-[10px] text-muted-foreground">Type</p></div>
          <div><p className="text-lg font-bold text-foreground">{jobBids.length}</p><p className="text-[10px] text-muted-foreground">Bids Generated</p></div>
          <div><p className="text-lg font-bold text-foreground">{selectedJob.bid_due_date || "—"}</p><p className="text-[10px] text-muted-foreground">Due Date</p></div>
        </div>
      )}

      <Button onClick={runCheck} disabled={!selectedJobId || checking} className="w-full h-12 metallic-gold-bg text-background font-bold">
        {checking ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Running Compliance Check...</> : <><Shield className="w-4 h-4 mr-2" /> Run Compliance Check</>}
      </Button>

      {/* Results */}
      {results && (
        <div className="space-y-4">
          {/* Score */}
          <div className={`p-5 rounded-xl border text-center ${results.status === "pass" ? "bg-green-500/5 border-green-500/30" : results.status === "warning" ? "bg-yellow-500/5 border-yellow-500/30" : "bg-red-500/5 border-red-500/30"}`}>
            <p className={`text-4xl font-black ${results.status === "pass" ? "text-green-400" : results.status === "warning" ? "text-yellow-400" : "text-red-400"}`}>
              {results.overall_score}%
            </p>
            <p className="text-sm text-muted-foreground mt-1">Compliance Score — {results.status?.toUpperCase()}</p>
            <p className="text-xs text-muted-foreground/70 mt-2">{results.summary}</p>
          </div>

          {/* Missing sections & forms */}
          {(results.missing_sections?.length > 0 || results.missing_forms?.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {results.missing_sections?.length > 0 && (
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                  <h3 className="text-xs font-bold text-red-400 mb-2">Missing Sections</h3>
                  {results.missing_sections.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 py-1">
                      <AlertTriangle className="w-3 h-3 text-red-400 flex-shrink-0" />
                      <span className="text-xs text-foreground">{s}</span>
                    </div>
                  ))}
                </div>
              )}
              {results.missing_forms?.length > 0 && (
                <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                  <h3 className="text-xs font-bold text-yellow-400 mb-2">Missing Forms</h3>
                  {results.missing_forms.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 py-1">
                      <FileText className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                      <span className="text-xs text-foreground">{f}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Detailed issues */}
          {results.issues?.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-foreground">Detailed Issues ({results.issues.length})</h3>
              {results.issues.map((issue, i) => {
                const cfg = severityConfig[issue.severity] || severityConfig.info;
                const Icon = cfg.icon;
                return (
                  <div key={i} className={`p-4 rounded-xl border ${cfg.color}`}>
                    <div className="flex items-start gap-3">
                      <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold">{issue.title}</span>
                          <Badge variant="outline" className="text-[9px]">{issue.category}</Badge>
                        </div>
                        <p className="text-xs opacity-80">{issue.description}</p>
                        {issue.recommendation && (
                          <p className="text-[10px] mt-1 opacity-60">→ {issue.recommendation}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}