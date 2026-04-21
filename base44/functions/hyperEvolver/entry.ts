import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * HYPER-EVOLUTION ENGINE
 * Scheduled daily — scrapes top AI, epoxy, concrete, and ML websites
 * then feeds intelligence back into the system to evolve tools, prompts, and capabilities.
 * 
 * Phases:
 * 1. Scrape top industry + AI/ML websites for new techniques
 * 2. Analyze current system capabilities vs cutting edge
 * 3. Generate enhancement recommendations
 * 4. Store as IntelRecords + SiteImprovements for the auto-enhance system
 */

const INTELLIGENCE_TARGETS = [
  // TOP 10 EPOXY / DECORATIVE CONCRETE / POLISHED CONCRETE
  { name: "Xtreme Polishing Systems", url: "xtremepolishingsystems.com", category: "product", focus: "XPS own products, pricing updates, new launches, promotions" },
  { name: "Concrete Network", url: "concretenetwork.com", category: "industry_data", focus: "Epoxy flooring trends, techniques, contractor tips, pricing guides" },
  { name: "Floor Skinz", url: "floorskinz.com", category: "product", focus: "Competitor epoxy products, pricing, metallic systems" },
  { name: "Seal-Krete", url: "seal-krete.com", category: "product", focus: "Garage and industrial coating products, pricing" },
  { name: "Rust-Oleum Pro", url: "rustoleum.com/product-catalog/industrial/concrete-coatings", category: "product", focus: "Industrial concrete coatings, market pricing" },
  { name: "Polyaspartic.com", url: "polyaspartic.com", category: "technology", focus: "Polyaspartic coating technology, application guides" },
  { name: "Concrete Decor Magazine", url: "concretedecor.net", category: "industry_data", focus: "Decorative concrete trends, project showcases, new techniques" },
  { name: "The Concrete Polishing Association", url: "concretepolishingassociation.com", category: "certification", focus: "Industry standards, certifications, training" },
  { name: "Husqvarna Construction", url: "husqvarnacp.com", category: "product", focus: "Diamond tooling, grinders, polishing equipment, pricing" },
  { name: "HTC Floor Systems", url: "htc-flooring.com", category: "product", focus: "Floor grinders, diamond tools, polishing systems" },

  // TOP AI / ML / AUTOMATION WEBSITES
  { name: "Hugging Face", url: "huggingface.co/blog", category: "technology", focus: "Latest open-source AI models, fine-tuning techniques, embeddings" },
  { name: "LangChain Blog", url: "blog.langchain.dev", category: "technology", focus: "Agent architectures, RAG patterns, tool-use, chain-of-thought" },
  { name: "Anthropic Research", url: "anthropic.com/research", category: "technology", focus: "Claude capabilities, Constitutional AI, safety, prompt engineering" },
  { name: "OpenAI Blog", url: "openai.com/blog", category: "technology", focus: "GPT updates, function calling, vision, structured outputs" },
  { name: "Google AI Blog", url: "blog.google/technology/ai", category: "technology", focus: "Gemini updates, multimodal AI, search grounding" },
  { name: "GitHub Trending", url: "github.com/trending", category: "github_repo", focus: "Trending AI repos, agent frameworks, scraping tools, automation" },
  { name: "Papers With Code", url: "paperswithcode.com", category: "technology", focus: "State-of-the-art ML techniques, benchmarks, implementations" },
  { name: "AI News", url: "artificialintelligence-news.com", category: "news", focus: "AI industry news, product launches, enterprise AI adoption" },
];

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  let body = {};
  try { body = await req.json(); } catch {}
  const action = body.action || 'full'; // full | industry | ai | evolve

  const jobId = `hyper_${Date.now()}`;
  const allRecords = [];
  const errors = [];

  const targets = action === 'industry' ? INTELLIGENCE_TARGETS.filter(t => !['technology', 'github_repo'].includes(t.category))
    : action === 'ai' ? INTELLIGENCE_TARGETS.filter(t => ['technology', 'github_repo'].includes(t.category))
    : INTELLIGENCE_TARGETS;

  // Phase 1: Scrape intelligence targets
  for (const target of targets) {
    try {
      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Research ${target.name} (${target.url}).
Focus: ${target.focus}
Return the most valuable, actionable intelligence found. Include: new products, pricing changes, techniques, tools, frameworks, or strategies that could enhance a commercial flooring AI intelligence system.`,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: {
          type: 'object',
          properties: {
            findings: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  content: { type: 'string' },
                  actionable_insight: { type: 'string' },
                  relevance_score: { type: 'number' },
                }
              }
            },
            top_trend: { type: 'string' },
            system_enhancement_idea: { type: 'string' },
          }
        }
      });

      for (const f of (result.findings || []).slice(0, 3)) {
        allRecords.push({
          source_company: 'XPS Intelligence',
          category: target.category,
          title: f.title || `${target.name} Intel`,
          content: (f.content || '').substring(0, 4000),
          summary: f.actionable_insight || '',
          source_url: `https://${target.url}`,
          source_type: 'llm_research',
          tags: `hyper-evolve,${target.name},${target.category}`,
          confidence_score: f.relevance_score || 70,
          scraped_at: new Date().toISOString(),
          is_indexed: true,
          data_freshness: 'live',
          scraper_job_id: jobId,
        });
      }

      // Store enhancement idea as SiteImprovement
      if (result.system_enhancement_idea) {
        await base44.asServiceRole.entities.SiteImprovement.create({
          title: `[HyperEvolve] ${target.name}: ${result.system_enhancement_idea.substring(0, 100)}`,
          description: result.system_enhancement_idea,
          category: 'AI Enhancement',
          priority: 'Medium',
          status: 'Proposed',
          source: `HyperEvolver — ${target.name}`,
        }).catch(() => {});
      }
    } catch (e) {
      errors.push(`${target.name}: ${e.message}`);
    }
  }

  // Phase 2: Self-reflection — analyze system and generate prompt improvements
  if (action === 'full' || action === 'evolve') {
    try {
      const evolution = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are the self-evolution engine for XPS Intelligence, a commercial flooring AI system.

CURRENT CAPABILITIES:
- Lead scraping (Browserless + LLM extraction)
- Auto-profiling (Gemini web research per lead)
- Auto-bid pipeline (takeoff → pricing → proposal → bid)
- Sentiment analysis on email history
- Multi-brand intel core (6 XPS brands, 60+ locations)
- DataRouter (classify → dedup → route)
- Dynamic pricing with 3 tiers

Based on the latest AI research and industry trends, generate:
1. Three prompt improvements for the lead scraping system (more specific, better extraction)
2. Three prompt improvements for the auto-bid pipeline (more accurate takeoffs)
3. Two new scraping targets we should add
4. One architecture improvement for the agent system`,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: {
          type: 'object',
          properties: {
            scraping_prompt_improvements: {
              type: 'array',
              items: { type: 'object', properties: { current_weakness: { type: 'string' }, improved_prompt_fragment: { type: 'string' }, expected_improvement: { type: 'string' } } }
            },
            bidding_prompt_improvements: {
              type: 'array',
              items: { type: 'object', properties: { current_weakness: { type: 'string' }, improved_prompt_fragment: { type: 'string' }, expected_improvement: { type: 'string' } } }
            },
            new_scraping_targets: {
              type: 'array',
              items: { type: 'object', properties: { name: { type: 'string' }, url: { type: 'string' }, value: { type: 'string' } } }
            },
            architecture_improvement: { type: 'string' },
            evolution_summary: { type: 'string' },
          }
        }
      });

      // Store evolution insights
      allRecords.push({
        source_company: 'XPS Intelligence',
        category: 'technology',
        title: `System Self-Evolution Report — ${new Date().toISOString().split('T')[0]}`,
        content: JSON.stringify(evolution, null, 2).substring(0, 8000),
        summary: evolution.evolution_summary || 'Self-evolution analysis complete',
        source_type: 'llm_research',
        tags: 'hyper-evolve,self-reflection,prompt-optimization',
        confidence_score: 85,
        scraped_at: new Date().toISOString(),
        is_indexed: true,
        data_freshness: 'live',
        scraper_job_id: jobId,
      });
    } catch (e) {
      errors.push(`Self-evolution: ${e.message}`);
    }
  }

  // Save all intel records
  let savedCount = 0;
  for (let i = 0; i < allRecords.length; i += 25) {
    const chunk = allRecords.slice(i, i + 25);
    await base44.asServiceRole.entities.IntelRecord.bulkCreate(chunk);
    savedCount += chunk.length;
  }

  // Log activity
  await base44.asServiceRole.entities.AgentActivity.create({
    agent_name: 'Hyper-Evolver',
    action: `${action} scan: ${savedCount} records from ${targets.length} sources`,
    status: errors.length > 0 ? 'pending' : 'success',
    category: 'research',
    details: JSON.stringify({ saved: savedCount, errors: errors.length, job_id: jobId }),
  });

  return Response.json({ success: true, job_id: jobId, saved: savedCount, sources: targets.length, errors });
});