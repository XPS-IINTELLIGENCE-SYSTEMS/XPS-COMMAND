import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Anthropic from 'npm:@anthropic-ai/sdk@0.24.0';
import Groq from 'npm:groq-sdk@0.4.0';

const anthropic = new Anthropic({
  apiKey: Deno.env.get('ANTHROPIC_API_KEY'),
});

const groq = new Groq({
  apiKey: Deno.env.get('GROQ_API_KEY'),
});

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { specialty = 'epoxy contractors', state = 'Texas', count = 20 } = await req.json().catch(() => ({}));

    // Use Anthropic browser to search for companies
    const searchQueries = [
      `${specialty} ${state}`,
      `${specialty} near me ${state}`,
      `${specialty} companies ${state}`,
    ];

    const allResults = [];

    for (const query of searchQueries) {
      try {
        const response = await anthropic.beta.messages.create({
          model: 'claude-opus-4-1-20250805',
          max_tokens: 2000,
          thinking: {
            type: 'enabled',
            budget_tokens: 1024,
          },
          messages: [
            {
              role: 'user',
              content: `Search the web for "${query}". Extract company listings and provide ALL results found with: company name, phone number, email address, website. Return as JSON array.`,
            },
          ],
          betas: ['interleaved-thinking-2025-05-14'],
        });

        const content = response.content.find(c => c.type === 'text')?.text || '';
        
        // Parse JSON from response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            allResults.push(...parsed);
          } catch (e) {
            console.error('JSON parse error:', e.message);
          }
        }
      } catch (e) {
        console.error(`Search error for "${query}":`, e.message);
      }
    }

    // Use Groq to deduplicate and structure results
    const analysisPrompt = `Analyze these company results and deduplicate (remove exact duplicates by company name). 
Return ONLY a valid JSON array with: name, phone, email, website, city, state. 
Remove entries with missing phone or email.
Results: ${JSON.stringify(allResults)}`;

    const groqResponse = await groq.chat.completions.create({
      messages: [{ role: 'user', content: analysisPrompt }],
      model: 'mixtral-8x7b-32768',
      max_tokens: 2000,
    });

    const groqContent = groqResponse.choices[0]?.message?.content || '[]';
    const jsonMatch = groqContent.match(/\[[\s\S]*\]/);
    const companies = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    // Save to database
    for (const company of companies.slice(0, count)) {
      await base44.asServiceRole.entities.ProspectCompany.create({
        company_name: company.name || 'Unknown',
        specialty: specialty.split(' ')[0],
        state: state,
        phone: company.phone || '',
        email: company.email || '',
        website: company.website || '',
        city: company.city || '',
        source: 'Web Search - Anthropic Browser',
        enriched: false,
        cold_call_status: 'Not Contacted',
      }).catch(e => console.error('DB error:', e.message));
    }

    return Response.json({
      success: true,
      specialty,
      state,
      found: companies.length,
      companies: companies.slice(0, count),
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});