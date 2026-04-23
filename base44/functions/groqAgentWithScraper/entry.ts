import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Groq from 'npm:groq-sdk@0.4.0';

const groq = new Groq({
  apiKey: Deno.env.get('GROQ_API_KEY'),
});

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { message, conversation_history = [], enable_scraper = false } = await req.json().catch(() => ({}));
    if (!message) return Response.json({ error: 'message required' }, { status: 400 });

    let scrapeData = null;

    // If scraper enabled, trigger parallel headless scraper
    if (enable_scraper && message.toLowerCase().includes('scrape') || message.toLowerCase().includes('find')) {
      try {
        const scrapeRes = await base44.asServiceRole.functions.invoke('parallelScraper', {
          query: message,
          max_results: 20,
          timeout: 30,
        }).catch(() => null);

        if (scrapeRes?.data) {
          scrapeData = {
            sources: scrapeRes.data.results || [],
            records: scrapeRes.data.results?.length || 0,
          };
        }
      } catch (e) {
        console.error('Scraper error:', e.message);
      }
    }

    // Format conversation for Groq
    const messages = [
      ...conversation_history.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    // Build context if scrape data exists
    let context = '';
    if (scrapeData?.sources?.length > 0) {
      context = `\n\nRELATED DATA FROM WEB SCRAPING:\n${scrapeData.sources.map((s, i) => `${i + 1}. ${s.title || ''}\n${s.description || s.content?.substring(0, 200) || ''}`).join('\n\n')}`;
    }

    // Call Groq with agent personality
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are XPS Intelligence Agent - an expert in lead generation, competitive intelligence, sales automation, and business operations. You have access to web scraping capabilities. Be direct, data-driven, and actionable. Use the context provided to answer questions accurately. If scraping data is provided, reference specific insights from it.${context}`,
        },
        ...messages,
      ],
      model: 'mixtral-8x7b-32768',
      max_tokens: 1024,
      temperature: 0.7,
    });

    const responseText = response.choices[0]?.message?.content || 'No response generated';

    return Response.json({
      response: responseText,
      scrape_data: scrapeData,
      tokens_used: response.usage?.total_tokens || 0,
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});