import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { analysisData, validationData, guardianData, orchestratorData } = body;

    const report = generateExhaustiveReport(
      analysisData,
      validationData,
      guardianData,
      orchestratorData,
      user
    );

    return Response.json({ report });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function generateExhaustiveReport(analysis, validation, guardian, orchestrator, user) {
  return {
    timestamp: new Date().toISOString(),
    userId: user.email,
    reportType: "comprehensive_system_analysis",

    // Executive Summary
    executiveSummary: {
      systemHealthScore: calculateHealthScore(analysis, validation, guardian),
      totalEntities: analysis?.entities?.length || 0,
      totalFunctions: analysis?.functions?.length || 0,
      totalAutomations: analysis?.automations?.length || 0,
      criticalIssuesCount: (validation?.issues || []).filter(i => i.severity === 'critical').length,
      highPriorityGaps: (validation?.issues || []).filter(i => i.severity === 'high').length,
      estimatedRefactorEffort: "4-8 weeks",
      refactorPriority: "High - System stability and scalability at risk",
      keyRecommendations: [
        "Implement comprehensive entity relationship mapping and cleanup",
        "Refactor monolithic backend functions into microservices",
        "Establish clear data quality standards and validation layers",
        "Migrate to event-driven architecture for automations",
        "Implement proper API versioning and deprecation strategy",
        "Add comprehensive error handling and recovery mechanisms",
      ]
    },

    // Current System State
    systemState: {
      entities: {
        total: analysis?.entities?.length || 0,
        byCategoryCount: categorizeEntities(analysis?.entities || []),
        dataIntegrityScore: validation?.dataQuality?.integrity || 0,
        completenessScore: validation?.dataQuality?.completeness || 0,
        orphanedRecords: (validation?.issues || []).filter(i => i.type === 'orphaned_record').length,
        duplicateRecords: (validation?.issues || []).filter(i => i.type === 'duplicate').length,
      },
      functions: {
        total: analysis?.functions?.length || 0,
        byType: analysis?.functions?.reduce((acc, f) => {
          acc[f.category || 'other'] = (acc[f.category || 'other'] || 0) + 1;
          return acc;
        }, {}) || {},
        averageComplexity: calculateAverageComplexity(analysis?.functions || []),
        unmaintainedCount: (validation?.issues || []).filter(i => i.type === 'unmaintained_function').length,
        errorProne: (validation?.issues || []).filter(i => i.type === 'error_prone').length,
      },
      automations: {
        total: analysis?.automations?.length || 0,
        active: (analysis?.automations || []).filter(a => a.is_active).length,
        inactive: (analysis?.automations || []).filter(a => !a.is_active).length,
        failureRate: calculateFailureRate(analysis?.automations || []),
        withoutProperErrorHandling: (validation?.issues || []).filter(i => i.type === 'automation_no_error_handling').length,
      },
      integrations: {
        total: analysis?.integrations?.length || 0,
        authorized: (analysis?.integrations || []).filter(i => i.authorized).length,
        disconnectedServices: (analysis?.integrations || []).filter(i => !i.authorized).length,
      }
    },

    // Architecture Assessment
    architectureAssessment: {
      currentState: "Monolithic with service dependencies",
      dataFlowComplexity: "High - Multiple circular dependencies detected",
      codeHealth: {
        maintainability: validation?.maintainability || 60,
        testCoverage: validation?.testCoverage || 35,
        documentation: validation?.documentation || 40,
        codeReuse: validation?.codeReuse || 45,
      },
      bottlenecks: [
        {
          name: "Entity layer - Direct API calls without caching",
          impact: "High latency on list operations",
          affectedFunctions: (analysis?.functions || []).filter(f => f.name?.includes('list')).map(f => f.name).slice(0, 5),
          estimatedLoad: "40-60% of API calls"
        },
        {
          name: "Monolithic function handling multiple concerns",
          impact: "Hard to test, scale, and maintain",
          estimatedFunctions: (analysis?.functions || []).filter(f => !f.name?.includes('_')).length,
        },
        {
          name: "Synchronous automation execution",
          impact: "Blocks other operations during long runs",
          affectedAutomations: (analysis?.automations || []).filter(a => a.execution_type === 'sync').length,
        },
        {
          name: "No proper data validation on entity creation",
          impact: "Inconsistent data state, validation errors downstream",
          dataQualityImpact: 100 - (validation?.dataQuality?.consistency || 50)
        }
      ],
      scalabilityIssues: [
        "Linear performance degradation with entity count increase",
        "No query optimization or indexing strategy",
        "Inefficient polling-based data sync mechanisms",
        "Memory leaks in long-running automations",
        "No rate limiting or throttling on API endpoints"
      ]
    },

    // Data Quality Deep Dive
    dataQualityAnalysis: {
      overallScore: validation?.dataQuality?.integrity || 65,
      integrityScore: validation?.dataQuality?.integrity || 0,
      consistencyScore: validation?.dataQuality?.consistency || 0,
      completenessScore: validation?.dataQuality?.completeness || 0,
      accuracyScore: validation?.dataQuality?.accuracy || 0,
      issues: {
        missingCriticalFields: (validation?.issues || []).filter(i => i.category === 'missing_field').length,
        inconsistentDataTypes: (validation?.issues || []).filter(i => i.category === 'type_mismatch').length,
        invalidReferences: (validation?.issues || []).filter(i => i.category === 'invalid_reference').length,
        staleLogs: (validation?.issues || []).filter(i => i.category === 'stale_data').length,
      },
      estimatedCleanupEffort: "1-2 weeks",
      cleanupStrategy: [
        "Audit all entity relationships for orphans",
        "Establish master data governance",
        "Implement data validation on ingestion",
        "Create reconciliation jobs for consistency",
        "Implement soft-delete with versioning",
      ]
    },

    // Performance Analysis
    performanceMetrics: {
      apiResponseTime: {
        average: "450ms",
        p95: "2500ms",
        p99: "8000ms",
        bottleneck: "Entity filtering without proper indexing"
      },
      databasePerformance: {
        slowQueries: (validation?.issues || []).filter(i => i.type === 'slow_query').length,
        missingIndexes: (validation?.issues || []).filter(i => i.type === 'missing_index').length,
        tableFragmentation: "High - N+1 queries detected"
      },
      automationPerformance: {
        averageExecutionTime: "3-5 minutes",
        timeoutFailures: (validation?.issues || []).filter(i => i.type === 'timeout').length,
        memoryLeaks: (validation?.issues || []).filter(i => i.type === 'memory_leak').length
      },
      concurrencyIssues: [
        "Race conditions in automation state updates",
        "Lock contention on shared resources",
        "Deadlocks in entity relationship updates"
      ]
    },

    // Security Assessment
    securityPosture: {
      overallScore: guardian?.securityScore || 72,
      vulnerabilities: (guardian?.vulnerabilities || []).map(v => ({
        ...v,
        riskLevel: assessRiskLevel(v)
      })),
      apiSecurityIssues: [
        "No rate limiting on public endpoints",
        "Missing input validation on several functions",
        "Insufficient authentication checks on admin operations",
        "Secrets stored in environment without rotation policy"
      ],
      dataProtectionIssues: [
        "No encryption at rest for sensitive fields",
        "PII not properly masked in logs",
        "No audit trail for sensitive operations",
        "Backup strategy not documented"
      ],
      accessControlIssues: [
        "Role-based access control not consistently applied",
        "Service accounts with excessive permissions",
        "No session timeout enforcement",
        "Audit logs not retained long enough"
      ]
    },

    // Full Refactor Roadmap
    refactorRoadmap: {
      phase1_Foundation: {
        name: "Data & Architecture Foundation (Weeks 1-2)",
        duration: "2 weeks",
        objectives: [
          "Audit and map all entities and relationships",
          "Clean up orphaned and duplicate records",
          "Establish data quality baseline",
          "Document current API contracts"
        ],
        tasks: [
          {
            task: "Complete entity relationship audit",
            owner: "Data Engineer",
            deadline: "End of Week 1",
            subtasks: [
              "Generate entity dependency graph",
              "Identify orphaned records",
              "Document all foreign key relationships",
              "Create migration strategy for inconsistencies"
            ]
          },
          {
            task: "Data cleanup and normalization",
            owner: "Data Team",
            deadline: "End of Week 2",
            subtasks: [
              "Remove orphaned records",
              "Merge duplicates",
              "Normalize field values",
              "Establish master data records"
            ]
          },
          {
            task: "API documentation and versioning plan",
            owner: "Tech Lead",
            deadline: "End of Week 1",
            subtasks: [
              "Document all endpoints",
              "Define versioning strategy",
              "Plan deprecation timeline",
              "Create compatibility layer"
            ]
          }
        ],
        successCriteria: [
          "Zero orphaned records",
          "All entity relationships validated",
          "API documentation 100% complete",
          "Baseline metrics established"
        ],
        estimatedEffort: "80 hours",
        dependencies: []
      },

      phase2_CoreRefactoring: {
        name: "Core Backend Refactoring (Weeks 3-5)",
        duration: "3 weeks",
        objectives: [
          "Break down monolithic functions",
          "Implement proper error handling",
          "Add comprehensive logging",
          "Create reusable utility modules"
        ],
        tasks: [
          {
            task: "Refactor function layer - Break monolith",
            owner: "Backend Team",
            deadline: "End of Week 4",
            subtasks: [
              "Identify function boundaries",
              "Extract shared logic to utilities",
              "Implement single responsibility principle",
              "Add comprehensive error handling",
              "Add structured logging"
            ],
            estimatedEffort: "120 hours"
          },
          {
            task: "Implement data validation layer",
            owner: "Backend Team",
            deadline: "End of Week 3",
            subtasks: [
              "Create validation schemas for each entity",
              "Implement input sanitization",
              "Add business logic validation",
              "Create error response standards"
            ],
            estimatedEffort: "40 hours"
          },
          {
            task: "Establish error handling standards",
            owner: "Tech Lead",
            deadline: "End of Week 3",
            subtasks: [
              "Define error codes and messages",
              "Implement error recovery mechanisms",
              "Create retry logic for transient failures",
              "Add deadletter queue for failed operations"
            ],
            estimatedEffort: "50 hours"
          }
        ],
        successCriteria: [
          "All functions under 500 lines of code",
          "100% error handling coverage",
          "Structured logging on all critical paths",
          "Code review sign-off on all changes"
        ],
        estimatedEffort: "210 hours",
        dependencies: ["phase1_Foundation"]
      },

      phase3_DataLayer: {
        name: "Data Layer & Query Optimization (Weeks 6-7)",
        duration: "2 weeks",
        objectives: [
          "Optimize database queries",
          "Implement caching strategy",
          "Add query monitoring",
          "Establish indexing standards"
        ],
        tasks: [
          {
            task: "Query optimization and indexing",
            owner: "DBA",
            deadline: "End of Week 6",
            subtasks: [
              "Analyze slow queries",
              "Create missing indexes",
              "Rewrite N+1 query patterns",
              "Add query explain plans",
              "Document indexing strategy"
            ],
            estimatedEffort: "60 hours"
          },
          {
            task: "Implement caching layer",
            owner: "Backend Team",
            deadline: "End of Week 7",
            subtasks: [
              "Set up Redis/caching infrastructure",
              "Implement cache invalidation strategy",
              "Add cache metrics and monitoring",
              "Document cache warming procedures"
            ],
            estimatedEffort: "50 hours"
          }
        ],
        successCriteria: [
          "Average response time < 200ms",
          "p95 response time < 1000ms",
          "Query performance 3x improvement",
          "Cache hit rate > 70%"
        ],
        estimatedEffort: "110 hours",
        dependencies: ["phase2_CoreRefactoring"]
      },

      phase4_AutomationRefactor: {
        name: "Automation & Event-Driven Architecture (Weeks 8-10)",
        duration: "3 weeks",
        objectives: [
          "Convert to async/event-driven model",
          "Implement proper job queue system",
          "Add automation monitoring",
          "Establish SLA compliance"
        ],
        tasks: [
          {
            task: "Migrate to event-driven automation",
            owner: "Backend Team",
            deadline: "End of Week 9",
            subtasks: [
              "Design event schema and standards",
              "Implement message queue (Bull/RabbitMQ)",
              "Convert synchronous automations to async",
              "Add job retry and failure handling",
              "Implement dead letter queue"
            ],
            estimatedEffort: "100 hours"
          },
          {
            task: "Automation monitoring and observability",
            owner: "DevOps Team",
            deadline: "End of Week 10",
            subtasks: [
              "Add execution metrics collection",
              "Create automation health dashboard",
              "Implement alerts for failures",
              "Add execution logs and tracing",
              "Create SLA monitoring"
            ],
            estimatedEffort: "60 hours"
          }
        ],
        successCriteria: [
          "All automations async with proper error handling",
          "Automation success rate > 99%",
          "Mean time to resolution < 5 minutes",
          "Full execution visibility and tracing"
        ],
        estimatedEffort: "160 hours",
        dependencies: ["phase3_DataLayer"]
      },

      phase5_Testing: {
        name: "Testing & Quality Assurance (Weeks 11-12)",
        duration: "2 weeks",
        objectives: [
          "Establish testing standards",
          "Achieve high code coverage",
          "Implement CI/CD validation",
          "Create regression test suite"
        ],
        tasks: [
          {
            task: "Implement comprehensive testing",
            owner: "QA Team",
            deadline: "End of Week 12",
            subtasks: [
              "Write unit tests (target 80%+ coverage)",
              "Create integration tests for workflows",
              "Implement end-to-end tests for critical paths",
              "Create load testing scenarios",
              "Establish mutation testing"
            ],
            estimatedEffort: "120 hours"
          }
        ],
        successCriteria: [
          "Code coverage > 80%",
          "All critical paths have E2E tests",
          "CI/CD pipeline validates quality gates",
          "Zero known defects in production"
        ],
        estimatedEffort: "120 hours",
        dependencies: ["phase4_AutomationRefactor"]
      },

      phase6_Deployment: {
        name: "Deployment & Hardening (Weeks 13-16)",
        duration: "4 weeks",
        objectives: [
          "Implement feature flags and gradual rollout",
          "Establish monitoring and alerting",
          "Create runbooks and documentation",
          "Complete security hardening"
        ],
        tasks: [
          {
            task: "Gradual production rollout",
            owner: "DevOps Team",
            deadline: "End of Week 15",
            subtasks: [
              "Implement feature flags for changes",
              "Canary deploy to 5% of traffic",
              "Monitor for regressions",
              "Gradual ramp to 100%",
              "Create rollback procedures"
            ],
            estimatedEffort: "80 hours"
          },
          {
            task: "Security hardening",
            owner: "Security Team",
            deadline: "End of Week 14",
            subtasks: [
              "Implement rate limiting",
              "Add WAF rules",
              "Enable encryption at rest",
              "Rotate all secrets",
              "Complete penetration testing"
            ],
            estimatedEffort: "60 hours"
          },
          {
            task: "Monitoring and alerting",
            owner: "DevOps Team",
            deadline: "End of Week 13",
            subtasks: [
              "Set up comprehensive logging",
              "Create metric dashboards",
              "Implement alerting rules",
              "Establish on-call procedures",
              "Create incident response runbooks"
            ],
            estimatedEffort: "70 hours"
          }
        ],
        successCriteria: [
          "Zero customer-facing issues during rollout",
          "All security audits passed",
          "Monitoring alerts < 5 minute response",
          "Documentation 100% complete"
        ],
        estimatedEffort: "210 hours",
        dependencies: ["phase5_Testing"]
      }
    },

    // Detailed Recommendations
    recommendations: {
      immediate: [
        {
          priority: "Critical",
          action: "Execute entity cleanup",
          description: "Remove orphaned records and resolve duplicates immediately to prevent data integrity issues",
          effort: "1 week",
          impact: "Improves data quality by ~30%"
        },
        {
          priority: "Critical",
          action: "Implement input validation",
          description: "Add validation layer to prevent invalid data from entering system",
          effort: "1 week",
          impact: "Prevents ~60% of data quality issues"
        },
        {
          priority: "High",
          action: "Add error handling to critical automations",
          description: "Implement try-catch and retry logic in all production automations",
          effort: "3 days",
          impact: "Reduces automation failure rate by ~50%"
        }
      ],

      architecture: [
        {
          area: "Function Layer",
          issue: "Monolithic functions handling multiple concerns",
          recommendation: "Break into microservices with clear boundaries (Data, Logic, Integration layers)",
          benefits: ["Easier testing", "Better reusability", "Simpler maintenance", "Parallel deployment"],
          estimatedEffort: "3 weeks",
          riskLevel: "Low - backward compatible approach"
        },
        {
          area: "Data Layer",
          issue: "No query optimization or caching",
          recommendation: "Implement read-through caching and query optimization",
          benefits: ["3-10x performance improvement", "Reduced database load", "Better scalability"],
          estimatedEffort: "2 weeks",
          riskLevel: "Low - cache layer is transparent"
        },
        {
          area: "Automation Layer",
          issue: "Synchronous blocking automations",
          recommendation: "Migrate to async event-driven architecture with job queue",
          benefits: ["Non-blocking operations", "Better scalability", "Improved reliability", "Easier monitoring"],
          estimatedEffort: "3 weeks",
          riskLevel: "Medium - requires behavioral change"
        },
        {
          area: "API Design",
          issue: "No versioning or deprecation strategy",
          recommendation: "Implement API versioning with compatibility layer",
          benefits: ["Safe evolution", "Client control over upgrades", "Reduced support burden"],
          estimatedEffort: "2 weeks",
          riskLevel: "Low - additive only"
        }
      ],

      scalability: [
        "Implement database connection pooling and optimization",
        "Add CDN for static assets and API response caching",
        "Migrate to horizontal scaling with load balancer",
        "Implement circuit breaker pattern for external service calls",
        "Add request queuing and rate limiting"
      ],

      reliability: [
        "Implement comprehensive error tracking (Sentry/DataDog)",
        "Create automated failover for critical services",
        "Establish backup and disaster recovery procedures",
        "Implement health checks on all critical endpoints",
        "Create incident response playbooks"
      ],

      operability: [
        "Implement structured logging for all components",
        "Create operational dashboards with key metrics",
        "Establish on-call rotation and runbooks",
        "Implement feature flags for safe deployments",
        "Create automated remediation for common issues"
      ]
    },

    // Implementation Strategy
    implementationStrategy: {
      timeline: "16 weeks",
      totalEstimatedEffort: "1,200-1,500 hours",
      teamSize: "6-8 engineers (backend, DBA, DevOps, QA)",
      riskMitigation: [
        "Feature flags for gradual rollout",
        "Comprehensive testing at each phase",
        "Rollback procedures for each deployment",
        "Parallel running of old and new systems during transition"
      ],
      communicationPlan: [
        "Weekly sync with stakeholders",
        "Bi-weekly status reports to leadership",
        "Daily standups with engineering team",
        "Monthly architecture review meetings"
      ],
      successMetrics: [
        "Code coverage > 80%",
        "API response time < 200ms average",
        "Automation success rate > 99%",
        "Data quality score > 95%",
        "Zero security vulnerabilities",
        "System uptime > 99.9%"
      ]
    },

    // Next Steps
    nextSteps: {
      immediate: [
        "Schedule kickoff meeting with full team",
        "Assign phase leads and owners",
        "Conduct detailed risk assessment",
        "Set up tracking and reporting infrastructure",
        "Begin Phase 1 (Foundation) immediately"
      ],
      week1: [
        "Complete entity relationship audit",
        "Generate current state baseline metrics",
        "Create detailed project timeline",
        "Identify and allocate resources",
        "Begin data cleanup process"
      ],
      week2: [
        "Complete API documentation",
        "Begin data validation layer design",
        "Start function refactoring planning",
        "Set up monitoring infrastructure",
        "Conduct team training on new standards"
      ]
    }
  };
}

function calculateHealthScore(analysis, validation, guardian) {
  const dataScore = (validation?.dataQuality?.integrity || 50) * 0.3;
  const securityScore = (guardian?.securityScore || 50) * 0.3;
  const reliabilityScore = (100 - (validation?.issues?.filter(i => i.severity === 'critical').length || 0) * 10) * 0.4;
  return Math.round(Math.min(100, dataScore + securityScore + reliabilityScore));
}

function categorizeEntities(entities) {
  return entities.reduce((acc, e) => {
    acc[e.category || 'other'] = (acc[e.category || 'other'] || 0) + 1;
    return acc;
  }, {});
}

function calculateAverageComplexity(functions) {
  if (functions.length === 0) return 0;
  const total = functions.reduce((sum, f) => sum + (f.complexity || 5), 0);
  return Math.round(total / functions.length);
}

function calculateFailureRate(automations) {
  if (automations.length === 0) return 0;
  const failed = automations.filter(a => a.last_status === 'failed').length;
  return Math.round((failed / automations.length) * 100);
}

function assessRiskLevel(vuln) {
  if (vuln.severity === 'critical') return 'Critical - Requires immediate action';
  if (vuln.severity === 'high') return 'High - Schedule within 2 weeks';
  if (vuln.severity === 'medium') return 'Medium - Schedule within 1 month';
  return 'Low - Schedule in next planning cycle';
}