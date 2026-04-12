import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { url, search } = body;

    // Web search mode
    if (search) {
      const searchResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Search the web for: "${search}". Return the top 5 most relevant results with title, url, and description.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            results: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  url: { type: "string" },
                  description: { type: "string" },
                },
              },
            },
          },
        },
        model: "gemini_3_flash",
      });
      return Response.json({ results: searchResult?.results || [] });
    }

    // URL fetch mode
    if (url) {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
      const html = await response.text();

      // Extract title and text content using LLM
      const extracted = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Extract the main content from this HTML page. Return the page title and the main text content (not navigation, ads, or footers). HTML (truncated): ${html.slice(0, 15000)}`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            text: { type: "string" },
            links: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  text: { type: "string" },
                  href: { type: "string" },
                },
              },
            },
          },
        },
      });

      return Response.json(extracted);
    }

    return Response.json({ error: 'Provide url or search parameter' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});