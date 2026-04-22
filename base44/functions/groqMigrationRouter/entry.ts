import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const groqApiKey = Deno.env.get('GROQ_API_KEY');
  if (!groqApiKey) {
    return Response.json({ error: 'GROQ_API_KEY not set' }, { status: 500 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { function_name, payload } = body;

    // GROQ MIGRATION LAYER — routes Base44 functions to Groq equivalents
    const GROQ_ROUTING = {
      // LEAD GENERATION
      leadScraper: 'groqLeadFinder',
      contactEnricher: 'groqContactEnricher',
      deepResearch: 'groqDeepResearch',
      territoryAnalyzer: 'groqTerritoryAnalyzer',
      bulkLeadPipeline: 'groqBulkLeadPipeline',

      // RESEARCH
      webResearch: 'groqWebResearch',
      seoAnalyze: 'groqSeoAnalyzer',
      webBrowse: 'groqWebBrowser',
      knowledgeScraper: 'groqKnowledgeScraper',
      manufacturerProfiler: 'groqManufacturerProfiler',

      // CONTENT & COMMUNICATION
      generateProposal: 'groqProposalGenerator',
      sendOutreachEmail: 'groqEmailHumanizer',
      makeAiCall: 'groqCallScriptGenerator',
      aiVideoScript: 'groqVideoScriptWriter',
      socialMediaAgent: 'groqSocialMediaAgent',
      sentimentAnalyst: 'groqSentimentAnalyzer',

      // SYSTEM
      swarmOrchestrator: 'groqSwarmRouter',
      buildCustomLLM: 'groqKnowledgeCompiler',
      groqSmartRouter: 'groqDirect', // Skip Base44 entirely
      agentExecute: 'groqAgentExecutor',
    };

    const targetFunction = GROQ_ROUTING[function_name];

    if (!targetFunction) {
      // Function doesn't need migration (doesn't use Base44 credits)
      return Response.json({
        status: 'PASSTHROUGH',
        function: function_name,
        uses_groq: false,
        message: 'Function does not use Base44 LLM credits',
      });
    }

    // Route to Groq equivalent function
    const result = await base44.functions.invoke(targetFunction, payload);

    return Response.json({
      status: 'MIGRATED_TO_GROQ',
      original_function: function_name,
      groq_function: targetFunction,
      result: result.data,
      cost_saved: '1-2 Base44 credits',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});