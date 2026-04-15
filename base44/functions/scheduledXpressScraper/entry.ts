import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Support both user-triggered and scheduled automation calls
    let isAuthed = false;
    try { const user = await base44.auth.me(); isAuthed = !!user; } catch {}

    // Run XPress pipeline scraper — finds AZ contractors to sell XPS products to
    const result = await base44.asServiceRole.functions.invoke("xpressLeadScraper", {
      count: 10
    });

    return Response.json({
      success: true,
      pipeline: "XPress",
      ...result.data
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});