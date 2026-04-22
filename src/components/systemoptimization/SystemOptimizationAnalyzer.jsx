import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, BarChart3, AlertCircle, CheckCircle2, Zap, Shield, Workflow, Download, RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function SystemOptimizationAnalyzer() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [guardianRecommendations, setGuardianRecommendations] = useState(null);
  const [orchestratorPlan, setOrchestratorPlan] = useState(null);
  const [selectedPhase, setSelectedPhase] = useState(1);

  const runFullAnalysis = async () => {
    setLoading(true);
    try {
      // Invoke system analysis function
      const analysisRes = await base44.functions.invoke("systemFullAnalysis", {});
      setAnalysis(analysisRes?.data?.analysis || {});

      // Invoke validation agent
      const validationRes = await base44.functions.invoke("validationAgentAudit", {
        analysisData: analysisRes?.data?.analysis
      });
      setValidationResult(validationRes?.data?.validation || {});

      // Invoke guardian agent
      const guardianRes = await base44.functions.invoke("guardianSystemCheck", {
        analysisData: analysisRes?.data?.analysis
      });
      setGuardianRecommendations(guardianRes?.data?.recommendations || {});

      // Invoke orchestrator
      const orchestratorRes = await base44.functions.invoke("orchestratorOptimizationPlan", {
        analysisData: analysisRes?.data?.analysis,
        validationData: validationRes?.data?.validation,
        guardianData: guardianRes?.data?.recommendations
      });
      setOrchestratorPlan(orchestratorRes?.data?.plan || {});

      toast({ title: "Analysis complete—all agents processed." });
    } catch (error) {
      toast({ title: `Analysis failed: ${error.message}`, variant: "destructive" });
    }
    setLoading(false);
  };

  const exportReport = () => {
    const report = {
      analysis,
      validation: validationResult,
      guardian: guardianRecommendations,
      orchestrator: orchestratorPlan,
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `system-optimization-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-card to-background rounded-2xl border border-border overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/20 to-accent/20 border-b border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-primary" />
              System Optimization & Analysis
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Full audit with agent validation, guardian checks, and orchestrator recommendations</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={runFullAnalysis}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all font-medium"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Run Analysis
            </button>
            {analysis && (
              <button
                onClick={exportReport}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-white/10 transition-all font-medium"
              >
                <Download className="w-4 h-4" /> Export
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      {analysis && (
        <div className="flex gap-1 border-b border-border px-6 py-3 overflow-x-auto">
          {[
            { id: 1, label: "System Audit", icon: BarChart3 },
            { id: 2, label: "Validation", icon: CheckCircle2 },
            { id: 3, label: "Guardian", icon: Shield },
            { id: 4, label: "Orchestrator Plan", icon: Workflow }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedPhase(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium whitespace-nowrap ${
                  selectedPhase === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/10"
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {!analysis && !loading && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BarChart3 className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">Click "Run Analysis" to audit the entire system</p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Running full system analysis with all agents...</p>
          </div>
        )}

        {analysis && selectedPhase === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-foreground mb-4">Entities & Relationships</h2>
              <pre className="bg-black/30 rounded-lg p-4 text-xs text-foreground overflow-x-auto max-h-64 border border-border">
                {JSON.stringify(analysis.entities, null, 2)}
              </pre>
            </div>

            <div>
              <h2 className="text-lg font-bold text-foreground mb-4">Backend Functions</h2>
              <pre className="bg-black/30 rounded-lg p-4 text-xs text-foreground overflow-x-auto max-h-64 border border-border">
                {JSON.stringify(analysis.functions, null, 2)}
              </pre>
            </div>

            <div>
              <h2 className="text-lg font-bold text-foreground mb-4">Agents & Capabilities</h2>
              <pre className="bg-black/30 rounded-lg p-4 text-xs text-foreground overflow-x-auto max-h-64 border border-border">
                {JSON.stringify(analysis.agents, null, 2)}
              </pre>
            </div>

            <div>
              <h2 className="text-lg font-bold text-foreground mb-4">Automations</h2>
              <pre className="bg-black/30 rounded-lg p-4 text-xs text-foreground overflow-x-auto max-h-64 border border-border">
                {JSON.stringify(analysis.automations, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {validationResult && selectedPhase === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="font-bold text-foreground">Valid Components</span>
                </div>
                <p className="text-sm text-muted-foreground">{validationResult.validCount || 0} components passed validation</p>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="font-bold text-foreground">Issues Found</span>
                </div>
                <p className="text-sm text-muted-foreground">{validationResult.issueCount || 0} issues requiring attention</p>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-foreground mb-3">Validation Details</h3>
              <pre className="bg-black/30 rounded-lg p-4 text-xs text-foreground overflow-auto max-h-96 border border-border">
                {JSON.stringify(validationResult, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {guardianRecommendations && selectedPhase === 3 && (
          <div className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-blue-500" />
                <span className="font-bold text-foreground">Guardian Security Check</span>
              </div>
              <p className="text-sm text-muted-foreground">{guardianRecommendations.securityScore || 0}/100 Security Score</p>
            </div>

            <div>
              <h3 className="font-bold text-foreground mb-3">Recommendations</h3>
              <pre className="bg-black/30 rounded-lg p-4 text-xs text-foreground overflow-auto max-h-96 border border-border">
                {JSON.stringify(guardianRecommendations, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {orchestratorPlan && selectedPhase === 4 && (
          <div className="space-y-4">
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Workflow className="w-5 h-5 text-purple-500" />
                <span className="font-bold text-foreground">Orchestrator Optimization Plan</span>
              </div>
              <p className="text-sm text-muted-foreground">Priority: {orchestratorPlan.priority || "Normal"}</p>
            </div>

            <div>
              <h3 className="font-bold text-foreground mb-3">Implementation Steps</h3>
              <pre className="bg-black/30 rounded-lg p-4 text-xs text-foreground overflow-auto max-h-96 border border-border">
                {JSON.stringify(orchestratorPlan, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}