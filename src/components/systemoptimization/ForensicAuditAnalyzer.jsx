import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, BarChart3, AlertCircle, CheckCircle2, Zap, Shield, Clock, TrendingDown, FileText, Download } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import ForensicReportViewer from "./ForensicReportViewer";
import RefactorRoadmapViewer from "./RefactorRoadmapViewer";
import AIRecommendationsPanel from "./AIRecommendationsPanel";

export default function ForensicAuditAnalyzer() {
  const [loading, setLoading] = useState(false);
  const [audit, setAudit] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [exporting, setExporting] = useState(false);

  const runForensicAudit = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("forensicSystemAudit", {});
      setAudit(res?.data?.audit);
      setActiveTab("overview");
      toast({ title: "Forensic audit complete", description: "Full system analysis ready" });
    } catch (error) {
      toast({
        title: "Audit failed",
        description: error.message,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const exportReport = async (format = "markdown") => {
    if (!audit) return;
    setExporting(true);
    try {
      const content = format === "json" 
        ? JSON.stringify(audit, null, 2)
        : generateMarkdownReport(audit);
      
      const blob = new Blob([content], { type: format === "json" ? "application/json" : "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `forensic-audit-${Date.now()}.${format === "json" ? "json" : "md"}`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: `Exported as ${format.toUpperCase()}` });
    } catch (error) {
      toast({ title: "Export failed", variant: "destructive" });
    }
    setExporting(false);
  };

  if (!audit) {
    return (
      <div className="w-full h-full flex flex-col bg-gradient-to-br from-card to-background rounded-2xl border border-border p-8">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="mb-6 p-4 bg-primary/10 rounded-full">
            <BarChart3 className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Forensic System Audit</h1>
          <p className="text-muted-foreground text-center mb-8 max-w-md">
            Advanced end-to-end system analysis with AI recommendations and comprehensive refactor roadmap
          </p>
          <button
            onClick={runForensicAudit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 font-medium"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
            {loading ? "Running Audit..." : "Start Forensic Audit"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-card to-background rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/20 via-accent/10 to-background border-b border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-primary" />
              Forensic System Audit Report
            </h1>
            <p className="text-xs text-muted-foreground mt-2">
              Executed at {new Date(audit.executedAt).toLocaleString()} ({audit.executionTime})
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={runForensicAudit}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-border hover:bg-white/10 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Re-run Audit
            </button>
            <button
              onClick={() => exportReport("markdown")}
              disabled={exporting}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-border hover:bg-white/10 disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> Markdown
            </button>
            <button
              onClick={() => exportReport("json")}
              disabled={exporting}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-border hover:bg-white/10 disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> JSON
            </button>
          </div>
        </div>

        {/* Health Score Banner */}
        <div className="mt-4 grid grid-cols-4 gap-3">
          <div className="bg-black/20 border border-border rounded-lg p-3">
            <div className="text-2xl font-bold text-primary">{audit.summary.systemHealthScore}%</div>
            <div className="text-xs text-muted-foreground">System Health</div>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <div className="text-2xl font-bold text-red-500">{audit.summary.criticalIssues}</div>
            <div className="text-xs text-muted-foreground">Critical Issues</div>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
            <div className="text-2xl font-bold text-orange-500">{audit.summary.highPriorityIssues}</div>
            <div className="text-xs text-muted-foreground">High Priority</div>
          </div>
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-3">
            <div className="text-2xl font-bold text-primary">{audit.summary.timelineToProduction}</div>
            <div className="text-xs text-muted-foreground">Refactor Timeline</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border px-6 py-3 overflow-x-auto bg-black/20">
        {[
          { id: "overview", label: "Overview", icon: BarChart3 },
          { id: "findings", label: "Forensic Findings", icon: AlertCircle },
          { id: "recommendations", label: "AI Recommendations", icon: Zap },
          { id: "roadmap", label: "Refactor Roadmap", icon: Clock },
          { id: "full-report", label: "Full Report", icon: FileText },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === "overview" && <OverviewTab audit={audit} />}
        {activeTab === "findings" && <FindingsTab audit={audit} />}
        {activeTab === "recommendations" && <AIRecommendationsPanel recommendations={audit.recommendations} />}
        {activeTab === "roadmap" && <RefactorRoadmapViewer roadmap={audit.refactorPlan} />}
        {activeTab === "full-report" && <ForensicReportViewer audit={audit} />}
      </div>
    </div>
  );
}

function OverviewTab({ audit }) {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Executive Summary */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">Executive Summary</h2>
        <div className="bg-black/20 border border-border rounded-lg p-6 space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong>Status:</strong> {audit.summary.status}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong>Technical Debt:</strong> {audit.summary.technicalDebt} - Estimated $500K-$1M in lost productivity
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong>Investment Required:</strong> {audit.summary.estimatedRefactorInvestment} ({audit.summary.timelineToProduction})
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong>Expected ROI:</strong> {audit.summary.estimatedROI} through improved scalability, reliability, and developer productivity
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">Key Metrics</h2>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(audit.summary.keyMetrics).map(([key, value]) => {
            const isCurrent = key.startsWith("current");
            const targetKey = key.replace("current", "target");
            const target = audit.summary.keyMetrics[targetKey];
            
            return (
              <div key={key} className="bg-black/20 border border-border rounded-lg p-4">
                <div className="text-xs text-muted-foreground uppercase">{key.replace(/([A-Z])/g, " $1").trim()}</div>
                <div className="text-lg font-bold text-foreground mt-2">{value}</div>
                {target && <div className="text-xs text-primary mt-1">Target: {target}</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Priorities */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">Top 3 Priorities</h2>
        <div className="space-y-3">
          {audit.summary.topThreePriorities.map((priority, i) => (
            <div key={priority.id} className="bg-primary/10 border border-primary/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-foreground">{priority.title}</div>
                  <p className="text-sm text-muted-foreground mt-1">{priority.description}</p>
                  <div className="mt-2 flex items-center gap-4 text-xs">
                    <span className="text-primary">Effort: {priority.estimatedEffort}</span>
                    <span className="text-green-400">ROI: {priority.estimatedROI}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FindingsTab({ audit }) {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Critical Findings */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <h2 className="text-xl font-bold text-foreground">Critical Findings</h2>
        </div>
        <div className="space-y-3">
          {audit.findings.criticalFindings.map((finding, i) => (
            <div key={i} className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 p-1.5 bg-red-500/20 rounded">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-foreground">{finding.finding}</div>
                  <div className="text-xs text-muted-foreground mt-1">Category: {finding.category}</div>
                  <p className="text-sm text-muted-foreground mt-2"><strong>Impact:</strong> {finding.impact}</p>
                  <p className="text-sm text-red-400 mt-2"><strong>Action:</strong> {finding.recommendation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* High Priority Findings */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-orange-500" />
          <h2 className="text-xl font-bold text-foreground">High Priority Findings</h2>
        </div>
        <div className="space-y-3">
          {audit.findings.highPriorityFindings.map((finding, i) => (
            <div key={i} className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 p-1.5 bg-orange-500/20 rounded">
                  <TrendingDown className="w-4 h-4 text-orange-500" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-foreground">{finding.finding}</div>
                  <div className="text-xs text-muted-foreground mt-1">Category: {finding.category}</div>
                  <p className="text-sm text-muted-foreground mt-2"><strong>Impact:</strong> {finding.impact}</p>
                  <p className="text-sm text-orange-400 mt-2"><strong>Action:</strong> {finding.recommendation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function generateMarkdownReport(audit) {
  let md = "# Forensic System Audit Report\n\n";
  md += `**Generated:** ${new Date(audit.executedAt).toLocaleString()}\n\n`;
  md += `## Executive Summary\n\n`;
  md += `- **Status:** ${audit.summary.status}\n`;
  md += `- **System Health:** ${audit.summary.systemHealthScore}%\n`;
  md += `- **Critical Issues:** ${audit.summary.criticalIssues}\n`;
  md += `- **Refactor Timeline:** ${audit.summary.timelineToProduction}\n`;
  md += `- **Investment Required:** ${audit.summary.estimatedRefactorInvestment}\n\n`;

  md += `## Critical Findings\n\n`;
  audit.findings.criticalFindings.forEach(f => {
    md += `### ${f.finding}\n- **Impact:** ${f.impact}\n- **Action:** ${f.recommendation}\n\n`;
  });

  md += `## Recommendations\n\n`;
  audit.recommendations.critical.forEach(r => {
    md += `### ${r.title}\n${r.description}\n\n`;
  });

  return md;
}