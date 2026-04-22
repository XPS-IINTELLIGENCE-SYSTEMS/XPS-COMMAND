import { FileText, Download } from "lucide-react";

export default function ForensicReportViewer({ audit }) {
  return (
    <div className="space-y-8 max-w-4xl prose prose-invert text-sm">
      {/* Header */}
      <div className="not-prose space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Forensic System Audit Report</h1>
        </div>
        <div className="bg-black/20 border border-border rounded-lg p-4 space-y-2 text-sm">
          <p><strong>Generated:</strong> {new Date(audit.executedAt).toLocaleString()}</p>
          <p><strong>Execution Time:</strong> {audit.executionTime}</p>
          <p><strong>Auditor:</strong> {audit.auditor}</p>
        </div>
      </div>

      {/* Executive Summary */}
      <section className="not-prose space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Executive Summary</h2>
        <div className="bg-black/20 border border-border rounded-lg p-4 space-y-3 text-sm">
          <p className="text-muted-foreground">
            <strong>Status:</strong> {audit.summary.status}
          </p>
          <p className="text-muted-foreground">
            <strong>System Health Score:</strong> <span className="text-primary font-bold">{audit.summary.systemHealthScore}%</span>
          </p>
          <p className="text-muted-foreground">
            <strong>Critical Issues:</strong> <span className="text-red-400 font-bold">{audit.summary.criticalIssues}</span>
          </p>
          <p className="text-muted-foreground">
            <strong>High Priority Issues:</strong> <span className="text-orange-400 font-bold">{audit.summary.highPriorityIssues}</span>
          </p>
          <p className="text-muted-foreground">
            <strong>Technical Debt:</strong> {audit.summary.technicalDebt}
          </p>
          <p className="text-muted-foreground">
            <strong>Estimated Investment:</strong> {audit.summary.estimatedRefactorInvestment}
          </p>
          <p className="text-muted-foreground">
            <strong>Expected ROI:</strong> {audit.summary.estimatedROI}
          </p>
          <p className="text-muted-foreground">
            <strong>Timeline to Production:</strong> {audit.summary.timelineToProduction}
          </p>
          <p className="text-muted-foreground">
            <strong>Team Required:</strong> {audit.summary.teamRequired}
          </p>
        </div>
      </section>

      {/* System Analysis */}
      <section className="not-prose space-y-4">
        <h2 className="text-2xl font-bold text-foreground">System Analysis</h2>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Entities */}
          <div className="bg-black/20 border border-border rounded-lg p-4 space-y-2 text-sm">
            <h3 className="font-bold text-foreground">Entities</h3>
            <p className="text-muted-foreground">Total: {audit.analysis.entities.total}</p>
            <p className="text-muted-foreground">Integrity Score: {audit.analysis.entities.health.orphanedRecords}% (issues detected)</p>
            <p className="text-muted-foreground">Orphaned Records: {audit.analysis.entities.health.orphanedRecords}</p>
            <p className="text-muted-foreground">Duplicates: {audit.analysis.entities.health.duplicates}</p>
          </div>

          {/* Functions */}
          <div className="bg-black/20 border border-border rounded-lg p-4 space-y-2 text-sm">
            <h3 className="font-bold text-foreground">Functions</h3>
            <p className="text-muted-foreground">Total: {audit.analysis.functions.total}</p>
            <p className="text-muted-foreground">Avg Complexity: {audit.analysis.functions.complexity.average}</p>
            <p className="text-muted-foreground">Unmaintained: {audit.analysis.functions.health.unmaintained}</p>
            <p className="text-muted-foreground">Error Prone: {audit.analysis.functions.health.errorProne}</p>
          </div>

          {/* Automations */}
          <div className="bg-black/20 border border-border rounded-lg p-4 space-y-2 text-sm">
            <h3 className="font-bold text-foreground">Automations</h3>
            <p className="text-muted-foreground">Total: {audit.analysis.automations.total}</p>
            <p className="text-muted-foreground">Active: {audit.analysis.automations.active}</p>
            <p className="text-muted-foreground">Failure Rate: {audit.analysis.automations.health.failureRate}%</p>
            <p className="text-muted-foreground">Without Error Handling: {audit.analysis.automations.health.withoutErrorHandling}</p>
          </div>

          {/* Security */}
          <div className="bg-black/20 border border-border rounded-lg p-4 space-y-2 text-sm">
            <h3 className="font-bold text-foreground">Security</h3>
            <p className="text-muted-foreground">Overall Score: {audit.analysis.security.overallScore}%</p>
            <p className="text-muted-foreground">Critical Vulns: {audit.analysis.security.vulnerabilities.critical.length}</p>
            <p className="text-muted-foreground">High Vulns: {audit.analysis.security.vulnerabilities.high.length}</p>
            <p className="text-muted-foreground">Compliance Gaps: {audit.analysis.security.complianceGaps.length}</p>
          </div>
        </div>
      </section>

      {/* Forensic Findings */}
      <section className="not-prose space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Forensic Findings</h2>
        
        <div className="space-y-3">
          <h3 className="font-bold text-red-400">Critical Findings</h3>
          {audit.findings.criticalFindings.map((f, i) => (
            <div key={i} className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm">
              <p className="font-bold text-foreground">{f.finding}</p>
              <p className="text-muted-foreground mt-1">Impact: {f.impact}</p>
              <p className="text-red-400 mt-1">Action: {f.recommendation}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <h3 className="font-bold text-orange-400">High Priority Findings</h3>
          {audit.findings.highPriorityFindings.map((f, i) => (
            <div key={i} className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 text-sm">
              <p className="font-bold text-foreground">{f.finding}</p>
              <p className="text-muted-foreground mt-1">Impact: {f.impact}</p>
              <p className="text-orange-400 mt-1">Action: {f.recommendation}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Performance Metrics */}
      <section className="not-prose space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Performance Metrics</h2>
        <div className="bg-black/20 border border-border rounded-lg p-4 space-y-3 text-sm">
          <div>
            <strong className="text-foreground">API Latency:</strong>
            <ul className="ml-4 mt-2 space-y-1 text-muted-foreground">
              <li>• P50: {audit.analysis.performance.apiLatency.p50}</li>
              <li>• P95: {audit.analysis.performance.apiLatency.p95}</li>
              <li>• P99: {audit.analysis.performance.apiLatency.p99}</li>
            </ul>
          </div>
          <div>
            <strong className="text-foreground">Reliability:</strong>
            <ul className="ml-4 mt-2 space-y-1 text-muted-foreground">
              <li>• Uptime: {audit.analysis.performance.reliability.uptime}%</li>
              <li>• MTBF: {audit.analysis.performance.reliability.mtbf}</li>
              <li>• MTTR: {audit.analysis.performance.reliability.mttr}</li>
            </ul>
          </div>
          <div>
            <strong className="text-foreground">Scalability:</strong>
            <ul className="ml-4 mt-2 space-y-1 text-muted-foreground">
              <li>• Horizontal Readiness: {audit.analysis.performance.scalability.horizontalReadiness}%</li>
              <li>• Vertical Capacity: {audit.analysis.performance.scalability.verticalCapacity}%</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Data Quality */}
      <section className="not-prose space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Data Quality Assessment</h2>
        <div className="bg-black/20 border border-border rounded-lg p-4 space-y-3 text-sm">
          <p className="text-muted-foreground">
            <strong>Overall Score:</strong> <span className="text-primary">{audit.analysis.dataQuality.integrityScore}%</span>
          </p>
          <p className="text-muted-foreground">
            <strong>Integrity:</strong> {audit.analysis.dataQuality.integrityScore}%
          </p>
          <p className="text-muted-foreground">
            <strong>Consistency:</strong> {audit.analysis.dataQuality.consistencyScore}%
          </p>
          <p className="text-muted-foreground">
            <strong>Completeness:</strong> {audit.analysis.dataQuality.completenessScore}%
          </p>
          <p className="text-muted-foreground">
            <strong>Risk Level:</strong> <span className="text-red-400">{audit.analysis.dataQuality.riskLevel}</span>
          </p>
        </div>
      </section>

      {/* Recommendations Summary */}
      <section className="not-prone space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Top Recommendations</h2>
        <div className="space-y-3">
          {audit.recommendations.critical.slice(0, 3).map((rec, i) => (
            <div key={rec.id} className="bg-primary/10 border border-primary/30 rounded-lg p-4">
              <p className="font-bold text-foreground">{i + 1}. {rec.title}</p>
              <p className="text-sm text-muted-foreground mt-2">{rec.description}</p>
              <div className="flex gap-4 mt-3 text-xs">
                <span className="text-primary">Effort: {rec.estimatedEffort}</span>
                <span className="text-green-400">ROI: {rec.estimatedROI}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Conclusion */}
      <section className="not-prose bg-primary/10 border border-primary/30 rounded-lg p-6 space-y-3 text-sm">
        <h2 className="text-xl font-bold text-foreground">Conclusion & Next Steps</h2>
        <p className="text-muted-foreground">
          This forensic audit reveals significant technical debt and architectural challenges that require immediate attention. 
          The recommended 16-week refactor will establish a solid foundation for scalability, reliability, and maintainability.
        </p>
        <p className="text-muted-foreground">
          <strong>Immediate Actions:</strong>
        </p>
        <ul className="space-y-1 ml-4 text-muted-foreground">
          <li>1. Schedule kickoff meeting with full team</li>
          <li>2. Assign phase leads and owners</li>
          <li>3. Set up tracking and reporting infrastructure</li>
          <li>4. Begin Phase 1 (Foundation) immediately</li>
        </ul>
      </section>
    </div>
  );
}