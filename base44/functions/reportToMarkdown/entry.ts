import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { report } = await req.json();

    const markdown = generateMarkdownReport(report);

    return Response.json({ markdown });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function generateMarkdownReport(report) {
  const sections = [];

  // Title and metadata
  sections.push(`# XPS Intelligence System Analysis Report`);
  sections.push(`**Generated:** ${new Date(report.timestamp).toLocaleString()}`);
  sections.push(`**User:** ${report.userId}`);
  sections.push('');

  // Executive Summary
  sections.push('## Executive Summary');
  sections.push(`- **System Health Score:** ${report.executiveSummary.systemHealthScore}%`);
  sections.push(`- **Total Entities:** ${report.executiveSummary.totalEntities}`);
  sections.push(`- **Total Functions:** ${report.executiveSummary.totalFunctions}`);
  sections.push(`- **Total Automations:** ${report.executiveSummary.totalAutomations}`);
  sections.push(`- **Critical Issues:** ${report.executiveSummary.criticalIssuesCount}`);
  sections.push('');

  if (report.executiveSummary.priorityActions.length > 0) {
    sections.push('### Priority Actions');
    report.executiveSummary.priorityActions.forEach(action => {
      sections.push(`- ${action}`);
    });
    sections.push('');
  }

  // System Inventory
  sections.push('## System Inventory');

  sections.push('### Entities');
  sections.push(`**Total:** ${report.systemInventory.entities.total}`);
  if (report.systemInventory.entities.list.length > 0) {
    sections.push('**Current Entities:**');
    report.systemInventory.entities.list.forEach(e => {
      sections.push(`- ${e.name} (${e.status})`);
    });
  }
  if (report.systemInventory.entities.missing.length > 0) {
    sections.push('');
    sections.push('**Missing Entities:**');
    report.systemInventory.entities.missing.forEach(e => {
      sections.push(`- ${e}`);
    });
  }
  if (report.systemInventory.entities.recommendations.length > 0) {
    sections.push('');
    sections.push('**Recommendations:**');
    report.systemInventory.entities.recommendations.forEach(r => {
      sections.push(`- ${r}`);
    });
  }
  sections.push('');

  sections.push('### Functions');
  sections.push(`**Total:** ${report.systemInventory.functions.total}`);
  if (Object.keys(report.systemInventory.functions.byType).length > 0) {
    sections.push('**By Type:**');
    Object.entries(report.systemInventory.functions.byType).forEach(([type, count]) => {
      sections.push(`- ${type}: ${count}`);
    });
  }
  if (report.systemInventory.functions.missing.length > 0) {
    sections.push('');
    sections.push('**Missing Functions:**');
    report.systemInventory.functions.missing.forEach(f => {
      sections.push(`- ${f}`);
    });
  }
  if (report.systemInventory.functions.recommendations.length > 0) {
    sections.push('');
    sections.push('**Recommendations:**');
    report.systemInventory.functions.recommendations.forEach(r => {
      sections.push(`- ${r}`);
    });
  }
  sections.push('');

  sections.push('### Automations');
  sections.push(`**Total:** ${report.systemInventory.automations.total}`);
  sections.push(`**Active:** ${report.systemInventory.automations.active}`);
  sections.push(`**Inactive:** ${report.systemInventory.automations.inactive}`);
  if (Object.keys(report.systemInventory.automations.byType).length > 0) {
    sections.push('**By Type:**');
    Object.entries(report.systemInventory.automations.byType).forEach(([type, count]) => {
      sections.push(`- ${type}: ${count}`);
    });
  }
  if (report.systemInventory.automations.missing.length > 0) {
    sections.push('');
    sections.push('**Missing Automations:**');
    report.systemInventory.automations.missing.forEach(a => {
      sections.push(`- ${a}`);
    });
  }
  sections.push('');

  sections.push('### Integrations');
  sections.push(`**Total:** ${report.systemInventory.integrations.total}`);
  sections.push(`**Active:** ${report.systemInventory.integrations.active}`);
  if (Object.keys(report.systemInventory.integrations.byProvider).length > 0) {
    sections.push('**By Provider:**');
    Object.entries(report.systemInventory.integrations.byProvider).forEach(([provider, count]) => {
      sections.push(`- ${provider}: ${count}`);
    });
  }
  if (report.systemInventory.integrations.missing.length > 0) {
    sections.push('');
    sections.push('**Missing Integrations:**');
    report.systemInventory.integrations.missing.forEach(i => {
      sections.push(`- ${i}`);
    });
  }
  sections.push('');

  // Data Quality
  sections.push('## Data Quality');
  sections.push(`- **Integrity Score:** ${report.dataQuality.integrity}%`);
  sections.push(`- **Consistency Score:** ${report.dataQuality.consistency}%`);
  sections.push(`- **Completeness Score:** ${report.dataQuality.completeness}%`);
  if (report.dataQuality.issues.length > 0) {
    sections.push('');
    sections.push('**Issues Found:**');
    report.dataQuality.issues.forEach(issue => {
      sections.push(`- ${issue.description || issue} (Severity: ${issue.severity || 'medium'})`);
    });
  }
  if (report.dataQuality.riskFactors.length > 0) {
    sections.push('');
    sections.push('**Risk Factors:**');
    report.dataQuality.riskFactors.forEach(rf => {
      sections.push(`- ${rf.factor}: ${rf.level}/100`);
    });
  }
  sections.push('');

  // Security Posture
  sections.push('## Security Posture');
  sections.push(`**Overall Score:** ${report.securityPosture.overallScore}%`);
  if (report.securityPosture.vulnerabilities.length > 0) {
    sections.push('');
    sections.push('**Vulnerabilities:**');
    report.securityPosture.vulnerabilities.forEach(v => {
      sections.push(`- ${v}`);
    });
  }
  if (report.securityPosture.actionItems.length > 0) {
    sections.push('');
    sections.push('**Security Action Items:**');
    report.securityPosture.actionItems.forEach(item => {
      sections.push(`- ${item.action} (Priority: ${item.priority}, ~${item.estimatedTime})`);
    });
  }
  sections.push('');

  // Performance Metrics
  sections.push('## Performance Metrics');
  sections.push(`- **API Quota Usage:** ${report.performanceMetrics.apiQuotaUsage}%`);
  sections.push(`- **Average Response Time:** ${report.performanceMetrics.averageResponseTime}ms`);
  sections.push(`- **Error Rate:** ${report.performanceMetrics.errorRate}%`);
  sections.push(`- **Uptime:** ${report.performanceMetrics.uptime}%`);
  if (report.performanceMetrics.bottlenecks.length > 0) {
    sections.push('');
    sections.push('**Bottlenecks:**');
    report.performanceMetrics.bottlenecks.forEach(b => {
      sections.push(`- ${b.name} (Impact: ${b.impact})`);
    });
  }
  sections.push('');

  // Gap Analysis
  sections.push('## Gap Analysis');

  if (report.gapAnalysis.criticalGaps.length > 0) {
    sections.push('### Critical Gaps');
    report.gapAnalysis.criticalGaps.forEach(gap => {
      sections.push(`- **${gap.gap}** (Effort: ${gap.effort})`);
    });
    sections.push('');
  }

  if (report.gapAnalysis.highPriorityGaps.length > 0) {
    sections.push('### High Priority Gaps');
    report.gapAnalysis.highPriorityGaps.forEach(gap => {
      sections.push(`- **${gap.gap}** (Effort: ${gap.effort})`);
    });
    sections.push('');
  }

  if (report.gapAnalysis.mediumPriorityGaps.length > 0) {
    sections.push('### Medium Priority Gaps');
    report.gapAnalysis.mediumPriorityGaps.forEach(gap => {
      sections.push(`- **${gap.gap}** (Effort: ${gap.effort})`);
    });
    sections.push('');
  }

  sections.push(`**Estimated Total Effort:** ${report.gapAnalysis.estimatedEffort}`);
  sections.push('');

  // Implementation Plan
  sections.push('## Implementation Roadmap');

  const phases = ['phase1_Foundation', 'phase2_DataSync', 'phase3_Orchestration', 'phase4_Hardening'];
  phases.forEach(phaseKey => {
    const phase = report.implementationPlan[phaseKey];
    if (phase) {
      const phaseName = phaseKey.replace('phase', 'Phase ').replace('_', ' ');
      sections.push(`### ${phaseName}`);
      sections.push(`**Duration:** ${phase.duration}`);
      if (phase.tasks && phase.tasks.length > 0) {
        sections.push('**Tasks:**');
        phase.tasks.forEach(task => {
          sections.push(`- ${task.task} (Owner: ${task.owner}, Deadline: ${task.deadline})`);
        });
      }
      if (phase.prompts && phase.prompts.length > 0) {
        sections.push('');
        sections.push('**Implementation Prompts:**');
        phase.prompts.forEach(prompt => {
          sections.push(`- ${prompt}`);
        });
      }
      sections.push('');
    }
  });

  // Success Metrics
  sections.push('## Success Metrics & KPIs');
  if (report.successMetrics.kpis.length > 0) {
    sections.push('### Key Performance Indicators');
    sections.push('| KPI | Target | Current |');
    sections.push('|-----|--------|---------|');
    report.successMetrics.kpis.forEach(kpi => {
      sections.push(`| ${kpi.kpi} | ${kpi.target} | ${kpi.current} |`);
    });
    sections.push('');
  }

  if (report.successMetrics.milestones.length > 0) {
    sections.push('### Milestones');
    report.successMetrics.milestones.forEach(m => {
      sections.push(`- **${m.milestone}** (${m.date}): ${m.deliverables.join(', ')}`);
    });
    sections.push('');
  }

  if (report.successMetrics.successCriteria.length > 0) {
    sections.push('### Success Criteria');
    report.successMetrics.successCriteria.forEach(criteria => {
      sections.push(`- ✓ ${criteria}`);
    });
    sections.push('');
  }

  // Next Steps
  sections.push('## Next Steps');

  if (report.nextSteps.immediate.length > 0) {
    sections.push('### Immediate (This Week)');
    report.nextSteps.immediate.forEach(action => {
      sections.push(`1. ${action}`);
    });
    sections.push('');
  }

  if (report.nextSteps.shortTerm.length > 0) {
    sections.push('### Short Term (1-2 Weeks)');
    report.nextSteps.shortTerm.forEach(action => {
      sections.push(`1. ${action}`);
    });
    sections.push('');
  }

  if (report.nextSteps.mediumTerm.length > 0) {
    sections.push('### Medium Term (1 Month)');
    report.nextSteps.mediumTerm.forEach(action => {
      sections.push(`1. ${action}`);
    });
    sections.push('');
  }

  if (report.nextSteps.longTerm.length > 0) {
    sections.push('### Long Term Vision');
    report.nextSteps.longTerm.forEach(action => {
      sections.push(`- ${action}`);
    });
    sections.push('');
  }

  // Footer
  sections.push('---');
  sections.push(`*Report generated on ${new Date(report.timestamp).toLocaleString()}`);
  sections.push(`For questions or updates, please contact your system administrator.*`);

  return sections.join('\n');
}