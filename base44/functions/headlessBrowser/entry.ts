import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try { body = await req.json(); } catch { body = {}; }
  const { action, url, selector, text, scrollY, script, screenshotFull } = body;
  const BROWSERLESS_KEY = Deno.env.get("BROWSERLESS_API_KEY");

  if (!BROWSERLESS_KEY) {
    return Response.json({ error: "BROWSERLESS_API_KEY not configured" }, { status: 500 });
  }

  try {

  const baseUrl = `https://production-sfo.browserless.io`;

  // ── Screenshot: navigate to URL and take a screenshot ──
  if (action === "screenshot" || action === "navigate") {
    const body = {
      url: url || "https://www.google.com",
      options: {
        fullPage: screenshotFull || false,
        type: "png"
      },
      gotoOptions: {
        waitUntil: "networkidle2",
        timeout: 15000
      }
    };

    // Try multiple Browserless endpoints
    let res;
    const endpoints = [
      `https://production-sfo.browserless.io/screenshot?token=${BROWSERLESS_KEY}`,
      `https://chrome.browserless.io/screenshot?token=${BROWSERLESS_KEY}`,
    ];
    
    for (const endpoint of endpoints) {
      res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (res.ok) break;
    }

    if (!res || !res.ok) {
      // Fallback: try to fetch the page directly and return content
      try {
        const pageRes = await fetch(url || "https://www.google.com", {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        const html = await pageRes.text();
        const title = (html.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1] || url;
        const textOnly = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 3000);
        return Response.json({ 
          success: true, 
          url, 
          fallback: true,
          title,
          pageDescription: textOnly,
          screenshot: null 
        });
      } catch (fetchErr) {
        return Response.json({ error: `Browser service unavailable. Direct fetch also failed: ${fetchErr.message}` }, { status: 200 });
      }
    }

    const buffer = await res.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    return Response.json({ success: true, screenshot: `data:image/png;base64,${base64}`, url });
  }

  // ── Content: get page HTML/text ──
  if (action === "content") {
    // Try Browserless first, fallback to direct fetch
    let html;
    const contentBody = { url: url || "https://www.google.com", gotoOptions: { waitUntil: "networkidle2", timeout: 15000 } };
    const contentRes = await fetch(`${baseUrl}/content?token=${BROWSERLESS_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contentBody)
    });
    if (contentRes.ok) {
      html = await contentRes.text();
    } else {
      const directRes = await fetch(url || "https://www.google.com", {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      html = await directRes.text();
    }
    const textOnly = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 5000);
    return Response.json({ success: true, text: textOnly, url });
  }

  // ── Function: run custom JS on the page (click, type, scroll, fill forms) ──
  if (action === "function" || action === "interact") {
    // Build a puppeteer-like function script
    let code = '';

    if (script) {
      // User/agent provided raw script
      code = script;
    } else {
      // Build from params
      const steps = [];
      steps.push(`await page.goto('${url || "https://www.google.com"}', { waitUntil: 'networkidle2', timeout: 15000 });`);

      if (scrollY) {
        steps.push(`await page.evaluate(() => window.scrollBy(0, ${scrollY}));`);
        steps.push(`await new Promise(r => setTimeout(r, 500));`);
      }
      if (selector && text) {
        // Type into a field
        steps.push(`await page.waitForSelector('${selector}', { timeout: 5000 });`);
        steps.push(`await page.click('${selector}');`);
        steps.push(`await page.type('${selector}', '${text.replace(/'/g, "\\'")}', { delay: 50 });`);
      } else if (selector) {
        // Just click
        steps.push(`await page.waitForSelector('${selector}', { timeout: 5000 });`);
        steps.push(`await page.click('${selector}');`);
        steps.push(`await new Promise(r => setTimeout(r, 1000));`);
      }

      // Always take a screenshot at the end
      steps.push(`const screenshot = await page.screenshot({ type: 'png', fullPage: false });`);
      steps.push(`const title = await page.title();`);
      steps.push(`const pageUrl = page.url();`);
      steps.push(`return { screenshot: screenshot.toString('base64'), title, url: pageUrl };`);

      code = `module.exports = async ({ page }) => {\n${steps.join('\n')}\n};`;
    }

    const res = await fetch(`${baseUrl}/function?token=${BROWSERLESS_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });

    if (!res.ok) {
      const errText = await res.text();
      return Response.json({ error: `Function failed: ${errText}` }, { status: 500 });
    }

    const result = await res.json();

    // If we got a screenshot back as base64
    if (result.screenshot) {
      result.screenshot = `data:image/png;base64,${result.screenshot}`;
    }

    return Response.json({ success: true, ...result });
  }

  // ── Agent auto-pilot: AI plans and executes a multi-step browser task ──
  if (action === "agent_browse") {
    const { task, startUrl } = { task: text, startUrl: url };

    // Step 1: AI plans the steps
    const plan = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a headless browser automation agent. Plan exact Puppeteer steps for this task:

Task: ${task}
Starting URL: ${startUrl || 'https://www.google.com'}

Generate a Puppeteer function that:
1. Navigates to the URL
2. Performs the task (search, fill form, click, scroll, extract data)
3. Takes a screenshot at the end
4. Returns { screenshot (base64), title, url, extractedData (string) }

IMPORTANT: 
- Use page.goto, page.click, page.type, page.waitForSelector, page.evaluate, page.screenshot
- Add delays between actions: await new Promise(r => setTimeout(r, 500))
- Handle errors gracefully
- The function signature must be: module.exports = async ({ page }) => { ... }
- screenshot must use: const s = await page.screenshot({type:'png'}); then s.toString('base64')
- Return extracted text data in extractedData field`,
      response_json_schema: {
        type: "object",
        properties: {
          plan_summary: { type: "string" },
          code: { type: "string" },
          estimated_steps: { type: "number" }
        }
      }
    });

    // Step 2: Execute the code
    const execRes = await fetch(`${baseUrl}/function?token=${BROWSERLESS_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: plan.code })
    });

    if (!execRes.ok) {
      const errText = await execRes.text();
      return Response.json({ 
        success: false, 
        error: `Execution failed: ${errText}`,
        plan: plan.plan_summary,
        code: plan.code 
      }, { status: 200 }); // 200 so frontend can show the error
    }

    const execResult = await execRes.json();
    if (execResult.screenshot && !execResult.screenshot.startsWith('data:')) {
      execResult.screenshot = `data:image/png;base64,${execResult.screenshot}`;
    }

    // Log it
    await base44.asServiceRole.entities.AgentJob.create({
      agent_type: "Browser",
      job_description: `Agent browse: ${task?.substring(0, 200)}`,
      status: "complete",
      result: JSON.stringify({ plan: plan.plan_summary, url: execResult.url, title: execResult.title, dataLength: execResult.extractedData?.length }),
      trigger_source: "manual",
      completed_at: new Date().toISOString()
    });

    return Response.json({ 
      success: true, 
      plan: plan.plan_summary,
      ...execResult 
    });
  }

  return Response.json({ error: "Invalid action. Use: screenshot, navigate, content, function, interact, agent_browse" }, { status: 400 });

  } catch (err) {
    return Response.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
});