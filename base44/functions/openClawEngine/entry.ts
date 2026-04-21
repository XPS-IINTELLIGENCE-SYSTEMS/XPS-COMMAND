import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const BROWSERLESS_API_KEY = Deno.env.get("BROWSERLESS_API_KEY");
const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_KEY");

// ── Browserless: fetch raw HTML (with fallback to direct fetch) ──
async function browserlessFetch(url, opts = {}) {
  // Try Browserless first
  if (BROWSERLESS_API_KEY) {
    try {
      const res = await fetch(`https://chrome.browserless.io/content?token=${BROWSERLESS_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          waitFor: opts.waitFor || 4000,
          gotoOptions: { waitUntil: opts.waitUntil || "networkidle2", timeout: opts.timeout || 20000 }
        })
      });
      if (res.ok) return await res.text();
      console.log("Browserless failed, falling back to direct fetch");
    } catch (e) {
      console.log("Browserless error:", e.message);
    }
  }
  // Fallback: direct fetch
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" }
    });
    if (res.ok) return await res.text();
  } catch (e) {
    console.log("Direct fetch failed:", e.message);
  }
  return null;
}

// ── Browserless: full screenshot ──
async function browserlessScreenshot(url) {
  const res = await fetch(`https://chrome.browserless.io/screenshot?token=${BROWSERLESS_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url,
      options: { fullPage: true, type: "png" },
      gotoOptions: { waitUntil: "networkidle2", timeout: 20000 }
    })
  });
  if (!res.ok) return null;
  const buf = await res.arrayBuffer();
  const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
  return `data:image/png;base64,${b64.substring(0, 200)}...`; // truncate for storage
}

// ── Browserless: intercept network requests ──
async function browserlessNetworkIntercept(url) {
  const res = await fetch(`https://chrome.browserless.io/function?token=${BROWSERLESS_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code: `module.exports = async ({ page }) => {
        const requests = [];
        page.on('request', req => {
          requests.push({ url: req.url(), method: req.method(), type: req.resourceType(), headers: Object.fromEntries(Object.entries(req.headers()).filter(([k]) => ['authorization','x-api-key','cookie','content-type'].includes(k.toLowerCase()))) });
        });
        await page.goto('${url}', { waitUntil: 'networkidle2', timeout: 20000 });
        await new Promise(r => setTimeout(r, 3000));
        return { requests: requests.filter(r => ['xhr','fetch','websocket'].includes(r.type)).slice(0, 100) };
      }`,
      context: {}
    })
  });
  if (!res.ok) return { requests: [] };
  return await res.json();
}

// ── Strip HTML to text ──
function htmlToText(html) {
  return html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ── Groq LLM call ──
async function groqCall(prompt, jsonSchema = null, model = "llama-3.3-70b-versatile") {
  const messages = [{ role: "user", content: prompt }];
  if (jsonSchema) {
    messages[0].content += "\n\nReturn ONLY valid JSON matching this schema. No markdown wrapping.\nSchema: " + JSON.stringify(jsonSchema);
  }
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, temperature: 0.1, max_tokens: 8000 })
  });
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || "";
  if (!jsonSchema) return raw;
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}

// ── Save to IntelRecord ──
async function saveIntel(base44, title, category, data, sourceUrl) {
  return await base44.asServiceRole.entities.IntelRecord.create({
    title, category, source_company: "Custom", source_url: sourceUrl || "",
    source_type: "scraper", summary: typeof data === "string" ? data.substring(0, 500) : JSON.stringify(data).substring(0, 500),
    content: typeof data === "string" ? data.substring(0, 4000) : JSON.stringify(data).substring(0, 4000),
    metadata: JSON.stringify(data).substring(0, 4000),
    confidence_score: 80, is_indexed: true, scraped_at: new Date().toISOString()
  });
}

// ── Log agent activity ──
async function logActivity(base44, action, details, status = "success") {
  return await base44.asServiceRole.entities.AgentActivity.create({
    agent_name: "Open Claw Engine",
    action: `${action}: ${details}`,
    status,
    category: "scraping",
    details: JSON.stringify({ action, details, timestamp: new Date().toISOString() })
  });
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { action } = body;

  // ═══════════════════════════════════════════
  // ACTION: site_clone — Full fidelity site clone
  // ═══════════════════════════════════════════
  if (action === "site_clone") {
    const { url, depth = 2, include_assets = true } = body;
    if (!url) return Response.json({ error: "url required" }, { status: 400 });

    const pages = [];
    const visited = new Set();
    const queue = [{ url, level: 0 }];

    while (queue.length > 0 && pages.length < 30) {
      const { url: pageUrl, level } = queue.shift();
      if (visited.has(pageUrl) || level > depth) continue;
      visited.add(pageUrl);

      const html = await browserlessFetch(pageUrl);
      if (!html) continue;

      // Extract internal links
      const linkRegex = /href=["']([^"'#]+)["']/gi;
      let match;
      const links = [];
      while ((match = linkRegex.exec(html)) !== null) {
        let link = match[1];
        if (link.startsWith("/")) link = new URL(link, pageUrl).href;
        if (link.startsWith(new URL(url).origin) && !visited.has(link)) {
          links.push(link);
          if (level + 1 <= depth) queue.push({ url: link, level: level + 1 });
        }
      }

      // Extract CSS variables, font faces, meta tags
      const cssVarRegex = /--[\w-]+:\s*[^;]+/g;
      const cssVars = html.match(cssVarRegex) || [];
      const fontRegex = /@font-face\s*\{[^}]+\}/gi;
      const fonts = html.match(fontRegex) || [];
      const metaRegex = /<meta[^>]+>/gi;
      const metas = html.match(metaRegex) || [];

      pages.push({
        url: pageUrl, level,
        html_length: html.length,
        text: htmlToText(html).substring(0, 3000),
        internal_links: links.slice(0, 50),
        css_variables: cssVars.slice(0, 50),
        fonts: fonts.slice(0, 10),
        meta_tags: metas.slice(0, 20),
        title: (html.match(/<title[^>]*>([^<]+)<\/title>/i) || [])[1] || "",
      });
    }

    // AI analysis of site structure
    const analysis = await groqCall(
      `Analyze this cloned website structure. Pages: ${pages.map(p => `${p.url} (${p.html_length} chars, ${p.internal_links.length} links)`).join("; ")}
      CSS variables found: ${pages[0]?.css_variables?.slice(0, 20).join("; ")}
      Fonts: ${pages[0]?.fonts?.length || 0}
      First page text: ${pages[0]?.text?.substring(0, 2000)}
      
      Provide: site_architecture, design_system_tokens, navigation_structure, technology_stack, content_strategy, seo_analysis, component_inventory`,
      {
        type: "object",
        properties: {
          site_architecture: { type: "string" },
          design_system: { type: "object", properties: { colors: { type: "array", items: { type: "string" } }, fonts: { type: "array", items: { type: "string" } }, spacing: { type: "string" }, border_radius: { type: "string" } } },
          navigation: { type: "array", items: { type: "object", properties: { label: { type: "string" }, url: { type: "string" } } } },
          tech_stack: { type: "array", items: { type: "string" } },
          components: { type: "array", items: { type: "string" } },
          seo: { type: "object", properties: { title: { type: "string" }, description: { type: "string" }, keywords: { type: "array", items: { type: "string" } } } },
          content_strategy: { type: "string" },
          link_graph: { type: "object", properties: { total_pages: { type: "number" }, avg_links_per_page: { type: "number" } } }
        }
      }
    );

    await saveIntel(base44, `Site Clone: ${url}`, "website", { pages_count: pages.length, analysis, pages: pages.map(p => ({ url: p.url, title: p.title, links: p.internal_links.length })) }, url);
    await logActivity(base44, "site_clone", `Cloned ${url} — ${pages.length} pages at depth ${depth}`);

    return Response.json({ success: true, pages_cloned: pages.length, pages: pages.map(p => ({ url: p.url, title: p.title, level: p.level, html_length: p.html_length, links: p.internal_links.length, css_vars: p.css_variables.length })), analysis });
  }

  // ═══════════════════════════════════════════
  // ACTION: key_harvest — Extract secrets, API keys, endpoints, patterns
  // ═══════════════════════════════════════════
  if (action === "key_harvest") {
    const { url } = body;
    if (!url) return Response.json({ error: "url required" }, { status: 400 });

    let html;
    try { html = await browserlessFetch(url); } catch(e) { console.error("Fetch error:", e.message); }
    if (!html) return Response.json({ error: "Failed to fetch page", url }, { status: 500 });

    // Pattern-based extraction
    const patterns = [
      { type: "api_key", regex: /(?:api[_-]?key|apikey|api_token)['":\s=]+['"]([a-zA-Z0-9_\-]{20,})['"]/gi, severity: "CRITICAL" },
      { type: "aws_key", regex: /AKIA[A-Z0-9]{16}/g, severity: "CRITICAL" },
      { type: "stripe_key", regex: /(?:sk|pk)_(?:test|live)_[a-zA-Z0-9]{24,}/g, severity: "CRITICAL" },
      { type: "google_api", regex: /AIza[a-zA-Z0-9_\-]{35}/g, severity: "HIGH" },
      { type: "jwt_token", regex: /eyJ[a-zA-Z0-9_\-]+\.eyJ[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+/g, severity: "HIGH" },
      { type: "api_endpoint", regex: /https?:\/\/(?:api\.|[^"'\s]*\/api\/)[^"'\s<>]{5,}/gi, severity: "MEDIUM" },
      { type: "webhook_url", regex: /https?:\/\/[^"'\s]*(?:webhook|hook|callback|notify)[^"'\s<>]*/gi, severity: "MEDIUM" },
      { type: "env_variable", regex: /(?:process\.env\.|import\.meta\.env\.)[A-Z_]{3,}/g, severity: "MEDIUM" },
      { type: "internal_url", regex: /https?:\/\/(?:localhost|127\.0\.0\.1|192\.168|10\.|172\.(?:1[6-9]|2|3[01]))[^"'\s<>]*/gi, severity: "HIGH" },
      { type: "email", regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, severity: "LOW" },
      { type: "s3_bucket", regex: /[a-z0-9.-]+\.s3[.-](?:amazonaws\.com|[a-z0-9-]+\.amazonaws\.com)/gi, severity: "HIGH" },
      { type: "firebase", regex: /[a-z0-9-]+\.firebaseio\.com/gi, severity: "HIGH" },
      { type: "supabase_url", regex: /[a-z0-9]+\.supabase\.co/gi, severity: "MEDIUM" },
      { type: "graphql_endpoint", regex: /https?:\/\/[^"'\s]*\/graphql[^"'\s<>]*/gi, severity: "MEDIUM" },
      { type: "private_key", regex: /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/g, severity: "CRITICAL" },
      { type: "oauth_secret", regex: /(?:client_secret|oauth_secret|app_secret)['":\s=]+['"]([a-zA-Z0-9_\-]{10,})['"]/gi, severity: "CRITICAL" },
      { type: "database_url", regex: /(?:postgres|mysql|mongodb|redis):\/\/[^"'\s<>]{10,}/gi, severity: "CRITICAL" },
    ];

    const findings = [];
    const seen = new Set();
    for (const p of patterns) {
      let m;
      while ((m = p.regex.exec(html)) !== null) {
        const val = m[1] || m[0];
        const key = `${p.type}:${val}`;
        if (seen.has(key)) continue;
        seen.add(key);
        // Find context
        const idx = m.index;
        const lineStart = html.lastIndexOf("\n", idx);
        const lineEnd = html.indexOf("\n", idx + val.length);
        const context = html.substring(Math.max(0, lineStart), Math.min(html.length, lineEnd)).trim().substring(0, 200);
        findings.push({ type: p.type, value: val.substring(0, 100), severity: p.severity, context: context.substring(0, 150) });
      }
    }

    // Also use AI to find non-pattern-based intelligence
    const text = htmlToText(html).substring(0, 6000);
    const aiFindings = await groqCall(
      `Analyze this webpage content for intelligence value. URL: ${url}
Content: ${text}

Extract: technology_stack, frameworks, CDNs, analytics tools, payment providers, auth providers, third_party_services, hidden_endpoints, form_actions, interesting_metadata`,
      {
        type: "object",
        properties: {
          tech_stack: { type: "array", items: { type: "string" } },
          third_party: { type: "array", items: { type: "object", properties: { service: { type: "string" }, purpose: { type: "string" }, url: { type: "string" } } } },
          hidden_endpoints: { type: "array", items: { type: "string" } },
          form_actions: { type: "array", items: { type: "string" } },
          analytics: { type: "array", items: { type: "string" } },
          auth_provider: { type: "string" },
          payment_provider: { type: "string" },
          summary: { type: "string" }
        }
      }
    );

    await saveIntel(base44, `Key Harvest: ${url}`, "technology", { findings, ai_analysis: aiFindings }, url);
    await logActivity(base44, "key_harvest", `Harvested ${url} — ${findings.length} findings (${findings.filter(f => f.severity === "CRITICAL").length} critical)`);

    return Response.json({
      success: true, url,
      findings_count: findings.length,
      critical: findings.filter(f => f.severity === "CRITICAL").length,
      high: findings.filter(f => f.severity === "HIGH").length,
      findings: findings.slice(0, 50),
      ai_analysis: aiFindings
    });
  }

  // ═══════════════════════════════════════════
  // ACTION: shadow_scrape — Full Browserless + network intercept + screenshot
  // ═══════════════════════════════════════════
  if (action === "shadow_scrape") {
    const { url, intercept_network = true } = body;
    if (!url) return Response.json({ error: "url required" }, { status: 400 });

    let html;
    try { html = await browserlessFetch(url, { waitFor: 5000 }); } catch(e) { console.error("Fetch error:", e.message); }
    if (!html) return Response.json({ error: "Failed to fetch", url }, { status: 500 });
    const text = htmlToText(html).substring(0, 8000);

    // Network intercept
    let networkData = { requests: [] };
    if (intercept_network) {
      networkData = await browserlessNetworkIntercept(url);
    }

    // AI deep analysis
    const analysis = await groqCall(
      `Deep analysis of: ${url}
Page content: ${text.substring(0, 5000)}
Network requests captured: ${JSON.stringify(networkData.requests?.slice(0, 20))}

Extract everything: company info, pricing, products, contacts, API endpoints discovered, authentication methods, technology stack, content structure, competitive intelligence`,
      {
        type: "object",
        properties: {
          company: { type: "object", properties: { name: { type: "string" }, industry: { type: "string" }, size: { type: "string" }, location: { type: "string" } } },
          products_services: { type: "array", items: { type: "string" } },
          pricing: { type: "object", properties: { found: { type: "boolean" }, details: { type: "string" }, ranges: { type: "string" } } },
          contacts: { type: "array", items: { type: "object", properties: { name: { type: "string" }, role: { type: "string" }, email: { type: "string" }, phone: { type: "string" } } } },
          api_endpoints: { type: "array", items: { type: "string" } },
          tech_stack: { type: "array", items: { type: "string" } },
          auth_method: { type: "string" },
          key_insights: { type: "array", items: { type: "string" } },
          competitive_intel: { type: "string" }
        }
      }
    );

    await saveIntel(base44, `Shadow Scrape: ${url}`, "website", { analysis, network_requests: networkData.requests?.length || 0 }, url);
    await logActivity(base44, "shadow_scrape", `Shadow scraped ${url} — ${networkData.requests?.length || 0} network calls intercepted`);

    return Response.json({
      success: true, url,
      page_size: html.length,
      network_requests: networkData.requests?.slice(0, 30),
      network_count: networkData.requests?.length || 0,
      analysis
    });
  }

  // ═══════════════════════════════════════════
  // ACTION: algorithm_extract — Reverse-engineer JS architecture
  // ═══════════════════════════════════════════
  if (action === "algorithm_extract") {
    const { url } = body;
    if (!url) return Response.json({ error: "url required" }, { status: 400 });

    const html = await browserlessFetch(url);
    if (!html) return Response.json({ error: "Failed to fetch" }, { status: 500 });

    // Extract script sources
    const scriptRegex = /<script[^>]*src=["']([^"']+)["'][^>]*>/gi;
    let m;
    const scripts = [];
    while ((m = scriptRegex.exec(html)) !== null) {
      let src = m[1];
      if (src.startsWith("/")) src = new URL(src, url).href;
      if (src.startsWith("http")) scripts.push(src);
    }

    // Extract inline scripts
    const inlineRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
    const inlineScripts = [];
    while ((m = inlineRegex.exec(html)) !== null) {
      if (m[1].trim().length > 50) inlineScripts.push(m[1].trim().substring(0, 2000));
    }

    // Fetch external scripts (first 5)
    const externalCode = [];
    for (const src of scripts.slice(0, 5)) {
      const res = await fetch(src).catch(() => null);
      if (res?.ok) {
        const code = await res.text();
        externalCode.push({ src, code: code.substring(0, 3000) });
      }
    }

    const analysis = await groqCall(
      `Reverse-engineer the JavaScript architecture of: ${url}
External scripts: ${scripts.join(", ")}
Inline code samples: ${inlineScripts.slice(0, 3).join("\n---\n")}
External code samples: ${externalCode.map(e => `// ${e.src}\n${e.code}`).join("\n---\n")}

Analyze: framework, state management, routing, API patterns, auth flow, data schemas, component tree, design tokens, build system`,
      {
        type: "object",
        properties: {
          framework: { type: "string" },
          state_management: { type: "string" },
          routing: { type: "string" },
          api_patterns: { type: "array", items: { type: "object", properties: { endpoint: { type: "string" }, method: { type: "string" }, purpose: { type: "string" } } } },
          auth_flow: { type: "string" },
          data_schemas: { type: "array", items: { type: "object", properties: { name: { type: "string" }, fields: { type: "array", items: { type: "string" } } } } },
          components: { type: "array", items: { type: "string" } },
          design_tokens: { type: "object", properties: { colors: { type: "array", items: { type: "string" } }, fonts: { type: "array", items: { type: "string" } } } },
          build_system: { type: "string" },
          third_party_libs: { type: "array", items: { type: "string" } }
        }
      }
    );

    await saveIntel(base44, `Algorithm Extract: ${url}`, "technology", { analysis, scripts_count: scripts.length }, url);
    await logActivity(base44, "algorithm_extract", `Reverse-engineered ${url} — ${scripts.length} scripts, framework: ${analysis.framework}`);

    return Response.json({ success: true, url, external_scripts: scripts.length, inline_scripts: inlineScripts.length, analysis });
  }

  // ═══════════════════════════════════════════
  // ACTION: generate_ui — AI generates React component code from natural language
  // ═══════════════════════════════════════════
  if (action === "generate_ui") {
    const { description, reference_url, component_type = "page" } = body;
    if (!description) return Response.json({ error: "description required" }, { status: 400 });

    let referenceContext = "";
    if (reference_url) {
      const html = await browserlessFetch(reference_url);
      if (html) {
        referenceContext = `\n\nREFERENCE SITE (clone this style): ${reference_url}\nContent: ${htmlToText(html).substring(0, 3000)}`;
      }
    }

    const code = await groqCall(
      `Generate a production-ready React component for a Base44 app.

DESCRIPTION: ${description}
TYPE: ${component_type}
${referenceContext}

RULES:
- Use React with hooks (useState, useEffect, useCallback)
- Use Tailwind CSS for all styling
- Import from "@/components/ui/button", "@/components/ui/input", "@/components/ui/badge", "@/components/ui/card"
- Import icons from "lucide-react" ONLY — use icons you are certain exist
- Import { base44 } from "@/api/base44Client" for data operations
- Use base44.entities.EntityName.list(), .create(), .update(), .delete(), .filter()
- Use base44.integrations.Core.InvokeLLM({ prompt, response_json_schema }) for AI calls
- Use base44.functions.invoke('functionName', params) for backend calls
- Export default the component
- Make it fully responsive and production-quality
- Dark theme friendly (use bg-card, text-foreground, border-border, etc.)
- Include loading states, empty states, and error handling

Return ONLY the React component code. No markdown wrapping. No explanation.`
    );

    const cleanCode = code.replace(/```(?:jsx?|tsx?|react)?\n?/g, '').replace(/```\n?$/g, '').trim();

    await logActivity(base44, "generate_ui", `Generated ${component_type}: ${description.substring(0, 100)}`);

    return Response.json({ success: true, code: cleanCode, component_type, description });
  }

  // ═══════════════════════════════════════════
  // ACTION: multi_scrape — Run multiple engines on one target
  // ═══════════════════════════════════════════
  if (action === "multi_scrape") {
    const { url, engines = ["shadow_scrape", "key_harvest"] } = body;
    if (!url) return Response.json({ error: "url required" }, { status: 400 });

    const results = {};
    for (const engine of engines) {
      const engineReq = new Request(req.url, {
        method: "POST",
        headers: req.headers,
        body: JSON.stringify({ action: engine, url })
      });
      // Inline execution
      if (engine === "key_harvest") {
        const html = await browserlessFetch(url);
        if (html) {
          const patterns = [
            { type: "api_key", regex: /(?:api[_-]?key|apikey)['":\s=]+['"]([a-zA-Z0-9_\-]{20,})['"]/gi, severity: "CRITICAL" },
            { type: "api_endpoint", regex: /https?:\/\/(?:api\.|[^"'\s]*\/api\/)[^"'\s<>]{5,}/gi, severity: "MEDIUM" },
            { type: "email", regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, severity: "LOW" },
          ];
          const findings = [];
          for (const p of patterns) {
            let m;
            while ((m = p.regex.exec(html)) !== null) {
              findings.push({ type: p.type, value: (m[1] || m[0]).substring(0, 80), severity: p.severity });
            }
          }
          results.key_harvest = { findings_count: findings.length, findings: findings.slice(0, 20) };
        }
      } else {
        results[engine] = { status: "use_individual_action" };
      }
    }

    await logActivity(base44, "multi_scrape", `Multi-engine scrape on ${url}: ${engines.join(", ")}`);
    return Response.json({ success: true, url, engines, results });
  }

  return Response.json({
    error: "Invalid action",
    available: ["site_clone", "key_harvest", "shadow_scrape", "algorithm_extract", "generate_ui", "multi_scrape"]
  }, { status: 400 });
});