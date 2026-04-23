import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, Lightbulb, Zap, TrendingUp } from "lucide-react";

export default function AuditReportViewer() {
  const [loading, setLoading] = useState(false);
  const [audit, setAudit] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const handleRunAudit = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('systemForensicAudit', {});
      if (res.data) {
        setAudit(res.data.analysis);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high": return "text-red-400";
      case "medium": return "text-yellow-400";
      case "low": return "text-blue-400";
      default: return "text-muted-foreground";
    }
  };

  const getEffortBadge = (effort) => {
    if (effort.includes("1-2")) return "bg-green-500/20 text-green-400";
    if (effort.includes("2-3")) return "bg-yellow-500/20 text-yellow-400";
    return "bg-red-500/20 text-red-400";
  };

  if (!audit) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Zap className="w-12 h-12 text-primary" />
        <h2 className="text-2xl font-bold">System Forensic Audit</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Run a comprehensive analysis to identify optimization opportunities and generate a refactor roadmap.
        </p>
        <Button onClick={handleRunAudit} disabled={loading} className="gap-2 bg-primary px-6 py-3">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          {loading ? "Analyzing System..." : "Start Full Audit"}
        </Button>
      </div>
    );
  }

  const issues = audit.code_quality_issues || [];
  const opportunities = audit.optimization_opportunities || [];
  const entityImprovements = audit.entity_improvements || [];
  const functionOpts = audit.function_optimization || [];
  const automationOpps = audit.automation_opportunities || [];
  const roadmap = audit.priority_roadmap || [];

  const criticalIssues = issues.filter(i => i.severity === "high").length;
  const totalEffortHours = roadmap.reduce((sum, r) => {
    const match = r.effort.match(/\d+/);
    return sum + (match ? parseInt(match[0]) : 0);
  }, 0);

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Audit Report & Refactor Plan</h1>
        <Button onClick={handleRunAudit} disabled={loading} variant="outline" className="gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          Re-run Audit
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card border rounded-lg p-3">
          <div className="text-xs text-muted-foreground">Critical Issues</div>
          <div className="text-2xl font-bold text-red-400">{criticalIssues}</div>
        </div>
        <div className="bg-card border rounded-lg p-3">
          <div className="text-xs text-muted-foreground">Total Opportunities</div>
          <div className="text-2xl font-bold text-yellow-400">{opportunities.length}</div>
        </div>
        <div className="bg-card border rounded-lg p-3">
          <div className="text-xs text-muted-foreground">Priority Roadmap</div>
          <div className="text-2xl font-bold text-primary">{roadmap.length} tasks</div>
        </div>
        <div className="bg-card border rounded-lg p-3">
          <div className="text-xs text-muted-foreground">Est. Effort</div>
          <div className="text-2xl font-bold text-blue-400">{totalEffortHours}h</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {[
          { id: "overview", label: "Priority Roadmap" },
          { id: "issues", label: "Code Quality" },
          { id: "optimization", label: "Optimizations" },
          { id: "entities", label: "Entity Design" },
          { id: "functions", label: "Functions" },
          { id: "automation", label: "Automation" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === "overview" && (
          <div className="space-y-3">
            {roadmap.map((task, i) => (
              <div key={i} className="bg-card border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-bold text-foreground">#{task.rank} {task.task}</div>
                    <div className="text-sm text-muted-foreground mt-1">{task.impact}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${getEffortBadge(task.effort)}`}>
                    {task.effort}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "issues" && (
          <div className="space-y-3">
            {issues.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No critical issues found</div>
            ) : (
              issues.map((issue, i) => (
                <div key={i} className="bg-card border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`w-5 h-5 mt-0.5 ${getSeverityColor(issue.severity)}`} />
                    <div className="flex-1">
                      <div className="font-bold text-foreground">{issue.issue}</div>
                      <div className="text-xs text-muted-foreground mt-1">Location: {issue.location}</div>
                      <div className="text-sm text-muted-foreground mt-2">Impact: {issue.impact}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "optimization" && (
          <div className="space-y-3">
            {opportunities.map((opp, i) => (
              <div key={i} className="bg-card border rounded-lg p-4">
                <div className="flex items-start gap-3 mb-2">
                  <Lightbulb className="w-5 h-5 mt-0.5 text-primary" />
                  <div className="flex-1">
                    <div className="font-bold text-foreground">{opp.description}</div>
                    <div className="text-xs text-muted-foreground mt-1">Type: {opp.type}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${getEffortBadge(opp.effort)}`}>
                    {opp.effort}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">Files: {opp.files_affected.join(", ")}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "entities" && (
          <div className="space-y-3">
            {entityImprovements.map((ent, i) => (
              <div key={i} className="bg-card border rounded-lg p-4">
                <div className="font-bold text-foreground mb-2">{ent.entity}</div>
                <div className="text-sm text-muted-foreground mb-2">{ent.improvement}</div>
                <div className="text-xs text-muted-foreground">Reason: {ent.reason}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "functions" && (
          <div className="space-y-3">
            {functionOpts.map((func, i) => (
              <div key={i} className="bg-card border rounded-lg p-4">
                <div className="font-bold text-primary mb-2">{func.function}</div>
                <div className="text-sm text-red-400 mb-2">Issue: {func.issue}</div>
                <div className="text-sm text-green-400">Recommendation: {func.recommendation}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "automation" && (
          <div className="space-y-3">
            {automationOpps.map((auto, i) => (
              <div key={i} className="bg-card border rounded-lg p-4">
                <div className="font-bold text-foreground mb-2">{auto.process}</div>
                <div className="text-sm text-muted-foreground mb-2">How: {auto.how}</div>
                <div className="text-sm text-green-400">Benefit: {auto.benefit}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}