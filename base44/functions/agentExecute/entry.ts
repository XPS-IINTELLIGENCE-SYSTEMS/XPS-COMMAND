import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, params } = body;

    switch (action) {
      case "search_web": {
        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Search the web for: "${params.query}". Return comprehensive structured results.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              summary: { type: "string" },
              results: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    url: { type: "string" },
                    snippet: { type: "string" },
                  },
                },
              },
            },
          },
          model: "gemini_3_flash",
        });
        return Response.json(result);
      }

      case "generate_image": {
        const result = await base44.asServiceRole.integrations.Core.GenerateImage({ prompt: params.prompt });
        return Response.json(result);
      }

      case "analyze_data": {
        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: params.prompt,
          response_json_schema: params.schema || undefined,
        });
        return Response.json({ result });
      }

      case "generate_ui": {
        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `You are a UI generator. Generate UI components based on: "${params.prompt}".
Return JSON array of components with type (heading/text/button/image/card/grid), content, and tailwind style classes. Use dark theme.`,
          response_json_schema: {
            type: "object",
            properties: {
              components: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string" },
                    content: { type: "string" },
                    style: { type: "string" },
                  },
                },
              },
            },
          },
        });
        return Response.json(result);
      }

      case "groq_inference": {
        const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
        if (!GROQ_API_KEY) return Response.json({ error: "GROQ_API_KEY not set" }, { status: 500 });
        
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: params.model || "llama-3.3-70b-versatile",
            messages: params.messages || [{ role: "user", content: params.prompt }],
            temperature: params.temperature || 0.7,
            max_tokens: params.max_tokens || 2048,
          }),
        });
        const data = await groqRes.json();
        return Response.json(data);
      }

      case "openai_inference": {
        const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
        if (!OPENAI_API_KEY) return Response.json({ error: "OPENAI_API_KEY not set" }, { status: 500 });

        const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: params.model || "gpt-4o-mini",
            messages: params.messages || [{ role: "user", content: params.prompt }],
            temperature: params.temperature || 0.7,
          }),
        });
        const data = await openaiRes.json();
        return Response.json(data);
      }

      case "github_api": {
        const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN");
        if (!GITHUB_TOKEN) return Response.json({ error: "GITHUB_TOKEN not set" }, { status: 500 });

        const ghRes = await fetch(`https://api.github.com${params.endpoint}`, {
          method: params.method || "GET",
          headers: {
            "Authorization": `Bearer ${GITHUB_TOKEN}`,
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
          },
          body: params.body ? JSON.stringify(params.body) : undefined,
        });
        const data = await ghRes.json();
        return Response.json(data);
      }

      case "vercel_api": {
        const VERCEL_TOKEN = Deno.env.get("VERCEL_TOKEN");
        if (!VERCEL_TOKEN) return Response.json({ error: "VERCEL_TOKEN not set" }, { status: 500 });

        const vRes = await fetch(`https://api.vercel.com${params.endpoint}`, {
          method: params.method || "GET",
          headers: {
            "Authorization": `Bearer ${VERCEL_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: params.body ? JSON.stringify(params.body) : undefined,
        });
        const data = await vRes.json();
        return Response.json(data);
      }

      case "supabase_query": {
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
        const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
        if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return Response.json({ error: "Supabase not configured" }, { status: 500 });

        const sbRes = await fetch(`${SUPABASE_URL}/rest/v1/${params.table}?${params.query || ""}`, {
          method: params.method || "GET",
          headers: {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
            "Prefer": params.prefer || "return=representation",
          },
          body: params.body ? JSON.stringify(params.body) : undefined,
        });
        const data = await sbRes.json();
        return Response.json(data);
      }

      case "redis_command": {
        const REDIS_URL = Deno.env.get("REDIS_URL");
        if (!REDIS_URL) return Response.json({ error: "REDIS_URL not set" }, { status: 500 });

        const { connect } = await import("https://deno.land/x/redis@v0.32.4/mod.ts");
        const url = new URL(REDIS_URL);
        const redis = await connect({
          hostname: url.hostname,
          port: parseInt(url.port) || 6379,
          password: url.password || undefined,
          tls: url.protocol === "rediss:",
        });

        let result;
        const cmd = params.command?.toUpperCase();
        switch (cmd) {
          case "GET": result = await redis.get(params.key); break;
          case "SET": result = await redis.set(params.key, params.value); break;
          case "DEL": result = await redis.del(params.key); break;
          case "KEYS": result = await redis.keys(params.pattern || "*"); break;
          case "HGETALL": result = await redis.hgetall(params.key); break;
          case "HSET": result = await redis.hset(params.key, params.field, params.value); break;
          case "INFO": result = await redis.info(); break;
          case "PING": result = await redis.ping(); break;
          default: result = "Unsupported command: " + cmd;
        }
        redis.close();
        return Response.json({ result });
      }

      default:
        return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});