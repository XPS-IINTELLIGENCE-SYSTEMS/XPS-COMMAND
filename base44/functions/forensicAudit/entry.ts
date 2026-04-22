import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    // FUNCTIONS THAT USE Base44 InvokeLLM (COST CREDITS)
    const BASE44_DEPENDENT_FUNCTIONS = [
      {
        name: 'leadScraper',
        calls_per_execution: 1,
        description: 'AI web search for businesses',
        current_cost: '1 credit',
        groq_alternative: 'groqLeadFinder',
        savings: '100%',
      },
      {
        name: 'contactEnricher',
        calls_per_execution: 1,
        description: 'Enriches leads with decision-maker data',
        current_cost: '1 credit per lead',
        groq_alternative: 'groqContactEnricher',
        savings: '100%',
      },
      {
        name: 'deepResearch',
        calls_per_execution: 2,
        description: 'Deep company intelligence',
        current_cost: '2 credits',
        groq_alternative: 'groqDeepResearch',
        savings: '100%',
      },
      {
        name: 'territoryAnalyzer',
        calls_per_execution: 1,
        description: 'Market/territory analysis',
        current_cost: '1 credit',
        groq_alternative: 'groqTerritoryAnalyzer',
        savings: '100%',
      },
      {
        name: 'webResearch',
        calls_per_execution: 2,
        description: 'General web research',
        current_cost: '2 credits',
        groq_alternative: 'groqWebResearch',
        savings: '100%',
      },
      {
        name: 'seoAnalyze',
        calls_per_execution: 1,
        description: 'SEO analysis/content generation',
        current_cost: '1 credit',
        groq_alternative: 'groqSeoAnalyzer',
        savings: '100%',
      },
      {
        name: 'bulkLeadPipeline',
        calls_per_execution: '3-6 (varies)',
        description: 'Full pipeline orchestrator (chains multiple LLM calls)',
        current_cost: '3-6 credits',
        groq_alternative: 'groqBulkLeadPipeline',
        savings: '100%',
      },
      {
        name: 'generateProposal',
        calls_per_execution: 1,
        description: 'Creates proposals with AI',
        current_cost: '1 credit',
        groq_alternative: 'groqProposalGenerator',
        savings: '100%',
      },
      {
        name: 'generateBrandAsset',
        calls_per_execution: 1,
        description: 'AI image/logo/branding (text prompt)',
        current_cost: '1 credit (image generation is separate)',
        groq_alternative: 'groqBrandAnalyzer + stable diffusion',
        savings: '100%',
      },
      {
        name: 'sentimentAnalyst',
        calls_per_execution: 1,
        description: 'AI sentiment scoring from emails/calls',
        current_cost: '1 credit',
        groq_alternative: 'groqSentimentAnalyzer',
        savings: '100%',
      },
      {
        name: 'webBrowse',
        calls_per_execution: '1-2',
        description: 'Web search/URL fetch with LLM analysis',
        current_cost: '1-2 credits',
        groq_alternative: 'groqWebBrowser',
        savings: '100%',
      },
      {
        name: 'projectStatusReport',
        calls_per_execution: 1,
        description: 'Auto-generate project status reports',
        current_cost: '1 credit',
        groq_alternative: 'groqReportGenerator',
        savings: '100%',
      },
      {
        name: 'sendOutreachEmail',
        calls_per_execution: '0-1',
        description: 'AI-humanized email generation (optional)',
        current_cost: '0-1 credit',
        groq_alternative: 'groqEmailHumanizer',
        savings: '100%',
      },
      {
        name: 'makeAiCall',
        calls_per_execution: 1,
        description: 'AI phone call script generation',
        current_cost: '1 credit + Twilio',
        groq_alternative: 'groqCallScriptGenerator',
        savings: '100% LLM cost',
      },
      {
        name: 'aiVideoScript',
        calls_per_execution: 2,
        description: 'Video production packages',
        current_cost: '2 credits',
        groq_alternative: 'groqVideoScriptWriter',
        savings: '100%',
      },
      {
        name: 'socialMediaAgent',
        calls_per_execution: 1,
        description: 'Social media content & engagement',
        current_cost: '1 credit',
        groq_alternative: 'groqSocialMediaAgent',
        savings: '100%',
      },
      {
        name: 'swarmOrchestrator',
        calls_per_execution: '1-2',
        description: 'Multi-agent routing',
        current_cost: '1-2 credits',
        groq_alternative: 'groqSwarmRouter',
        savings: '100%',
      },
      {
        name: 'buildCustomLLM',
        calls_per_execution: 2,
        description: 'Compiles knowledge into agent prompts',
        current_cost: '2 credits',
        groq_alternative: 'groqKnowledgeCompiler',
        savings: '100%',
      },
      {
        name: 'knowledgeScraper',
        calls_per_execution: 1,
        description: 'Scrapes knowledge sources (LLM analysis)',
        current_cost: '1 credit',
        groq_alternative: 'groqKnowledgeScraper',
        savings: '100%',
      },
      {
        name: 'manufacturerProfiler',
        calls_per_execution: 1,
        description: 'Profiles manufacturers with LLM',
        current_cost: '1 credit',
        groq_alternative: 'groqManufacturerProfiler',
        savings: '100%',
      },
      {
        name: 'groqSmartRouter',
        calls_per_execution: '1-2',
        description: 'Routes to Groq OR Anthropic Claude (HYBRID)',
        current_cost: 'If using Anthropic: credits',
        groq_alternative: 'Pure Groq (skip Base44 entirely)',
        savings: '100% of Anthropic fallback',
      },
      {
        name: 'agentExecute',
        calls_per_execution: 'Varies',
        description: 'Universal API proxy (includes LLM actions)',
        current_cost: 'Varies by action',
        groq_alternative: 'groqAgentExecutor',
        savings: '100% if using LLM action',
      },
    ];

    if (action === 'list_all') {
      const totalCreditsPerMonth = BASE44_DEPENDENT_FUNCTIONS.reduce((sum, f) => {
        const calls = typeof f.calls_per_execution === 'number' ? f.calls_per_execution : 2;
        return sum + calls;
      }, 0);

      return Response.json({
        audit_timestamp: new Date().toISOString(),
        total_base44_dependent_functions: BASE44_DEPENDENT_FUNCTIONS.length,
        estimated_credits_per_execution_batch: totalCreditsPerMonth,
        functions: BASE44_DEPENDENT_FUNCTIONS,
        migration_status: 'READY FOR GROQ MIGRATION',
        estimated_savings: '100% of LLM credits (use own GROQ_API_KEY)',
      });
    }

    if (action === 'summary') {
      return Response.json({
        total_functions_in_system: 90,
        functions_using_base44_credits: BASE44_DEPENDENT_FUNCTIONS.length,
        percentage_impacted: Math.round((BASE44_DEPENDENT_FUNCTIONS.length / 90) * 100),
        annual_credit_estimate: 'Depends on usage — could be $500-$5000/month',
        groq_alternative_cost: 'FREE (uses your own GROQ_API_KEY)',
        migration_complexity: 'LOW — all replacements are 1-to-1',
        recommendation: 'IMMEDIATE MIGRATION TO GROQ',
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});