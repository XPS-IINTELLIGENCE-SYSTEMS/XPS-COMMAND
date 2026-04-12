import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, existing_image_urls } = await req.json();

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const result = await base44.asServiceRole.integrations.Core.GenerateImage({
      prompt,
      existing_image_urls: existing_image_urls || undefined,
    });

    return Response.json({
      success: true,
      url: result.url,
      message: `Image generated successfully. View it here: ${result.url}`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});