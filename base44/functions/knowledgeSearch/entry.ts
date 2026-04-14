import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action, query, category, limit, entry_id, tags } = body;

    // Semantic search — uses LLM to find best matches
    if (action === 'search') {
      if (!query) return Response.json({ error: 'Query required' }, { status: 400 });

      const maxResults = limit || 10;

      // Fetch entries to search through
      const filterOpts = {};
      if (category) filterOpts.category = category;

      const entries = category
        ? await base44.asServiceRole.entities.KnowledgeEntry.filter(filterOpts, '-quality_score', 200)
        : await base44.asServiceRole.entities.KnowledgeEntry.list('-quality_score', 200);

      if (entries.length === 0) {
        return Response.json({ results: [], total: 0, query, message: 'No knowledge entries found. Run the scraper to populate.' });
      }

      // Build context for LLM to rank
      const entrySummaries = entries.map((e, i) => 
        `[${i}] "${e.title}" (${e.category}) — ${(e.summary || e.content || '').substring(0, 200)}`
      ).join('\n');

      const rankResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Given this search query: "${query}"

Rank these knowledge entries by relevance. Return the indices of the top ${maxResults} most relevant entries, along with a relevance score (0-100) and a brief explanation of why each is relevant.

Available entries:
${entrySummaries}`,
        response_json_schema: {
          type: "object",
          properties: {
            ranked_results: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  index: { type: "number" },
                  relevance_score: { type: "number" },
                  reason: { type: "string" }
                }
              }
            },
            answer_summary: { type: "string" },
            knowledge_gaps: { type: "array", items: { type: "string" } },
            confidence: { type: "number" }
          }
        }
      });

      const results = (rankResult.ranked_results || [])
        .filter(r => r.index >= 0 && r.index < entries.length)
        .slice(0, maxResults)
        .map(r => ({
          ...entries[r.index],
          relevance_score: r.relevance_score,
          match_reason: r.reason
        }));

      // Increment view counts
      for (const r of results) {
        try {
          await base44.asServiceRole.entities.KnowledgeEntry.update(r.id, {
            view_count: (r.view_count || 0) + 1
          });
        } catch {}
      }

      return Response.json({
        results,
        total: results.length,
        query,
        answer_summary: rankResult.answer_summary || '',
        confidence: rankResult.confidence || 50,
        knowledge_gaps: rankResult.knowledge_gaps || []
      });
    }

    // Quick keyword search
    if (action === 'keyword_search') {
      if (!query) return Response.json({ error: 'Query required' }, { status: 400 });

      const entries = await base44.asServiceRole.entities.KnowledgeEntry.list('-quality_score', 500);
      const q = query.toLowerCase();
      const matched = entries.filter(e =>
        (e.title || '').toLowerCase().includes(q) ||
        (e.tags || '').toLowerCase().includes(q) ||
        (e.summary || '').toLowerCase().includes(q) ||
        (e.content || '').toLowerCase().includes(q)
      ).slice(0, limit || 20);

      return Response.json({ results: matched, total: matched.length, query });
    }

    // Get a single entry
    if (action === 'get') {
      if (!entry_id) return Response.json({ error: 'entry_id required' }, { status: 400 });
      const entry = await base44.asServiceRole.entities.KnowledgeEntry.get(entry_id);
      await base44.asServiceRole.entities.KnowledgeEntry.update(entry_id, {
        view_count: (entry.view_count || 0) + 1
      });
      return Response.json(entry);
    }

    // Get product recommendation for a project type
    if (action === 'recommend') {
      const recs = await base44.asServiceRole.entities.ProductRecommendation.list('-created_date', 100);
      if (query) {
        const q = query.toLowerCase();
        const matched = recs.filter(r =>
          r.project_type.includes(q) || (r.recommended_xps_product || '').toLowerCase().includes(q)
        );
        return Response.json({ recommendations: matched });
      }
      return Response.json({ recommendations: recs });
    }

    // Agent context injection — returns knowledge context for a given task
    if (action === 'agent_context') {
      if (!query) return Response.json({ error: 'Query/task required' }, { status: 400 });

      const entries = await base44.asServiceRole.entities.KnowledgeEntry.list('-quality_score', 200);
      const recs = await base44.asServiceRole.entities.ProductRecommendation.list('-created_date', 50);
      const manufacturers = await base44.asServiceRole.entities.ManufacturerProfile.list('-data_completeness_score', 30);

      const entrySummaries = entries.slice(0, 100).map((e, i) =>
        `[${i}] "${e.title}" (${e.category}) — ${(e.summary || '').substring(0, 150)}`
      ).join('\n');

      const contextResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `An XPS AI agent is about to execute this task: "${query}"

Before executing, select the most relevant knowledge entries, product recommendations, and manufacturer profiles that would help the agent do a better job.

Available knowledge:
${entrySummaries}

Available recommendations: ${recs.map(r => `${r.project_type}: ${r.recommended_xps_product}`).join(', ')}

Available manufacturer profiles: ${manufacturers.map(m => m.company_name).join(', ')}

Select the top 5 most relevant pieces of knowledge and explain how each helps with the task.`,
        response_json_schema: {
          type: "object",
          properties: {
            relevant_entry_indices: { type: "array", items: { type: "number" } },
            relevant_recommendations: { type: "array", items: { type: "string" } },
            relevant_manufacturers: { type: "array", items: { type: "string" } },
            context_brief: { type: "string" },
            suggested_approach: { type: "string" }
          }
        }
      });

      const relevantEntries = (contextResult.relevant_entry_indices || [])
        .filter(i => i >= 0 && i < entries.length)
        .map(i => ({ title: entries[i].title, summary: entries[i].summary, source: entries[i].source_url }));

      return Response.json({
        context_brief: contextResult.context_brief || '',
        suggested_approach: contextResult.suggested_approach || '',
        knowledge_entries: relevantEntries,
        recommendations: contextResult.relevant_recommendations || [],
        manufacturers: contextResult.relevant_manufacturers || []
      });
    }

    // Stats
    if (action === 'stats') {
      const entries = await base44.asServiceRole.entities.KnowledgeEntry.list('-created_date', 500);
      const categoryBreakdown = {};
      let totalWords = 0;
      const domains = new Set();

      entries.forEach(e => {
        categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + 1;
        totalWords += (e.content || '').split(/\s+/).length;
        if (e.source_domain) domains.add(e.source_domain);
      });

      const highPriority = entries.filter(e => e.is_high_priority);

      return Response.json({
        total_entries: entries.length,
        total_words: totalWords,
        unique_sources: domains.size,
        categories: categoryBreakdown,
        high_priority_count: highPriority.length,
        pricing_entries: entries.filter(e => e.is_pricing_data).length,
        tech_spec_entries: entries.filter(e => e.is_technical_spec).length,
        competitor_entries: entries.filter(e => e.is_competitor_intel).length
      });
    }

    return Response.json({ error: 'Invalid action. Use: search, keyword_search, get, recommend, agent_context, stats' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});