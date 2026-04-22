import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { Groq } from 'npm:groq-sdk';

/**
 * GROQ LEAD ENRICHMENT
 * Replaces Base44 InvokeLLM enrichment with Groq API
 * No integration credits, pure Groq API calls
 */

const groq = new Groq({
  apiKey: Deno.env.get('GROQ_API_KEY'),
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { lead_id, company, contact_name, location, vertical, specialty, existing_material } = await req.json();

    if (!company) {
      return Response.json({ error: 'company required' }, { status: 400 });
    }

    // Build enrichment prompt
    const prompt = `Research and provide intelligence on this flooring/concrete company for XPS sales team:

Company: ${company}
Contact: ${contact_name || 'Unknown'}
Location: ${location || 'Unknown'}
Industry: ${vertical || 'Unknown'}
Specialty: ${specialty || 'Unknown'}
Current materials: ${existing_material || 'Unknown'}

Provide in JSON format:
1. ai_insight: 2-3 sentence business summary
2. ai_recommendation: Recommended XPS products for this company
3. score: Lead quality score 0-100
4. estimated_value: Estimated deal value in dollars
5. priority: Priority ranking 1-10`;

    // Call Groq (way cheaper than Anthropic)
    const completion = await groq.chat.completions.create({
      model: 'mixtral-8x7b-32768', // Fast, good quality, ultra cheap
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content || '';

    // Parse JSON response
    let enrichment = {
      ai_insight: '',
      ai_recommendation: '',
      score: 50,
      estimated_value: 0,
      priority: 5,
    };

    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        enrichment = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: parse as plain text
        enrichment.ai_insight = response.split('\n')[0] || '';
        enrichment.ai_recommendation = response.split('\n')[1] || '';
      }
    } catch (e) {
      enrichment.ai_insight = response.substring(0, 200);
    }

    // If lead_id provided, update in Base44 (will be replaced with Supabase)
    if (lead_id) {
      try {
        await base44.asServiceRole.entities.Lead.update(lead_id, {
          ai_insight: enrichment.ai_insight || '',
          ai_recommendation: enrichment.ai_recommendation || '',
          score: enrichment.score || 50,
          estimated_value: enrichment.estimated_value || 0,
          priority: enrichment.priority || 5,
        });
      } catch (e) {
        // Silently fail—enrichment still returned
        console.error('Lead update failed:', e.message);
      }
    }

    return Response.json({
      success: true,
      lead_id,
      enrichment,
      model: 'groq/mixtral-8x7b-32768',
      cost_estimate: '$0.0001', // Groq is insanely cheap
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});