import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user?.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

  try {
    const { prompts } = await req.json().catch(() => ({}));
    if (!Array.isArray(prompts)) return Response.json({ error: 'prompts array required' }, { status: 400 });

    // Bulk insert prompts
    const results = await base44.asServiceRole.entities.PromptLibrary.bulkCreate(
      prompts.map(p => ({
        title: p.title,
        category: p.category,
        library_type: p.library_type || 'xps_operations',
        subcategory: p.subcategory || 'general',
        prompt_text: p.prompt_text,
        use_case: p.use_case || '',
        tags: p.tags || '',
        version: 1,
        usage_count: 0,
        success_score: 0,
        feedback_count: 0,
        positive_feedback: 0,
        negative_feedback: 0,
      }))
    ).catch(e => ({
      success: false,
      error: e.message,
      created: 0,
    }));

    return Response.json({
      success: true,
      created: prompts.length,
      message: `Successfully populated ${prompts.length} prompts`,
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});