import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function fetchPage(targetUrl) {
  const res = await fetch(targetUrl, {
    headers: {
      'User-Agent': UA,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    redirect: 'follow',
  });
  const html = await res.text();
  return { html, status: res.status, finalUrl: res.url };
}

function extractPageData(html, pageUrl) {
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]?.trim() || '';
  const desc = (html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)/i) || [])[1] || '';
  const ogImage = (html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/i) || [])[1] || '';
  const favicon = (html.match(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)/i) || [])[1] || '';

  // Headings
  const headings = [];
  const hRegex = /<h([1-3])[^>]*>([\s\S]*?)<\/h\1>/gi;
  let hm;
  while ((hm = hRegex.exec(html)) !== null && headings.length < 30) {
    const text = hm[2].replace(/<[^>]+>/g, '').trim();
    if (text) headings.push({ level: parseInt(hm[1]), text });
  }

  // Links
  const links = [];
  const seen = new Set();
  const linkRegex = /<a[^>]+href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let lm;
  while ((lm = linkRegex.exec(html)) !== null && links.length < 40) {
    let href = lm[1].trim();
    const label = lm[2].replace(/<[^>]+>/g, '').trim();
    if (!label || label.length < 2) continue;
    if (href.startsWith('/')) { try { href = new URL(href, pageUrl).href; } catch { continue; } }
    if (!href.startsWith('http')) continue;
    if (seen.has(href)) continue;
    seen.add(href);
    links.push({ href, label: label.substring(0, 120) });
  }

  // Images
  const images = [];
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let im;
  while ((im = imgRegex.exec(html)) !== null && images.length < 15) {
    let src = im[1].trim();
    if (src.startsWith('data:') || src.length < 10) continue;
    if (src.startsWith('/')) { try { src = new URL(src, pageUrl).href; } catch { continue; } }
    const alt = (im[0].match(/alt=["']([^"']*)/i) || [])[1] || '';
    images.push({ src, alt });
  }

  // Forms & inputs
  const forms = [];
  const formRegex = /<form[^>]*>([\s\S]*?)<\/form>/gi;
  let fm;
  while ((fm = formRegex.exec(html)) !== null && forms.length < 10) {
    const formHtml = fm[0];
    const action = (formHtml.match(/action=["']([^"']*)/i) || [])[1] || '';
    const method = (formHtml.match(/method=["']([^"']*)/i) || [])[1] || 'GET';
    const fields = [];
    const inputRegex = /<(?:input|textarea|select)[^>]*>/gi;
    let inp;
    while ((inp = inputRegex.exec(fm[1])) !== null && fields.length < 20) {
      const tag = inp[0];
      const name = (tag.match(/name=["']([^"']*)/i) || [])[1] || '';
      const type = (tag.match(/type=["']([^"']*)/i) || [])[1] || 'text';
      const placeholder = (tag.match(/placeholder=["']([^"']*)/i) || [])[1] || '';
      const id = (tag.match(/id=["']([^"']*)/i) || [])[1] || '';
      const value = (tag.match(/value=["']([^"']*)/i) || [])[1] || '';
      if (type === 'hidden' && !name) continue;
      fields.push({ name, type, placeholder, id, value });
    }
    let resolvedAction = action;
    if (action && !action.startsWith('http')) {
      try { resolvedAction = new URL(action, pageUrl).href; } catch {}
    }
    forms.push({ action: resolvedAction, method: method.toUpperCase(), fields });
  }

  // Emails
  const emails = [];
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const cleanHtml = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
  let em;
  const seenEmails = new Set();
  while ((em = emailRegex.exec(cleanHtml)) !== null && emails.length < 30) {
    const email = em[0].toLowerCase();
    if (!seenEmails.has(email) && !email.includes('example') && !email.includes('wixpress')) {
      seenEmails.add(email);
      emails.push(email);
    }
  }

  // Phone numbers
  const phones = [];
  const phoneRegex = /(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g;
  let pm;
  const seenPhones = new Set();
  while ((pm = phoneRegex.exec(cleanHtml)) !== null && phones.length < 15) {
    const phone = pm[0].trim();
    if (phone.length >= 10 && !seenPhones.has(phone)) {
      seenPhones.add(phone);
      phones.push(phone);
    }
  }

  // Clean text
  const textContent = cleanHtml
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 4000);

  let faviconUrl = favicon;
  if (faviconUrl && !faviconUrl.startsWith('http')) {
    try { faviconUrl = new URL(faviconUrl, pageUrl).href; } catch { faviconUrl = ''; }
  }

  return { title, description: desc, ogImage, favicon: faviconUrl, headings, links, images, forms, emails, phones, text: textContent };
}

// Search via DuckDuckGo Lite
async function webSearch(query) {
  const results = [];
  try {
    const ddgUrl = `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}`;
    const res = await fetch(ddgUrl, {
      method: 'POST',
      headers: { 'User-Agent': UA, 'Accept': 'text/html', 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `q=${encodeURIComponent(query)}`,
      redirect: 'follow',
    });
    const html = await res.text();
    const linkRegex = /<a[^>]+class="result-link"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    let m;
    while ((m = linkRegex.exec(html)) !== null && results.length < 15) {
      const href = m[1].trim();
      const title = m[2].replace(/<[^>]+>/g, '').trim();
      if (href.startsWith('http') && title) results.push({ href, title, snippet: '' });
    }
    if (results.length === 0) {
      const altRegex = /<a[^>]+rel="nofollow"[^>]+href="(https?:\/\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
      while ((m = altRegex.exec(html)) !== null && results.length < 15) {
        const href = m[1].trim();
        const title = m[2].replace(/<[^>]+>/g, '').trim();
        if (title && title.length > 3 && !href.includes('duckduckgo.com')) results.push({ href, title, snippet: '' });
      }
    }
    const snippetRegex = /<td[^>]*class="result-snippet"[^>]*>([\s\S]*?)<\/td>/gi;
    let si = 0;
    while ((m = snippetRegex.exec(html)) !== null && si < results.length) {
      results[si].snippet = m[1].replace(/<[^>]+>/g, '').trim();
      si++;
    }
  } catch {}
  return results;
}

// Submit a form via HTTP POST/GET
async function submitForm(formAction, method, formData) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(formData)) {
    params.append(k, v);
  }
  let res;
  if (method === 'GET') {
    const sep = formAction.includes('?') ? '&' : '?';
    res = await fetch(`${formAction}${sep}${params.toString()}`, {
      headers: { 'User-Agent': UA, 'Accept': 'text/html' },
      redirect: 'follow',
    });
  } else {
    res = await fetch(formAction, {
      method: 'POST',
      headers: { 'User-Agent': UA, 'Accept': 'text/html', 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
      redirect: 'follow',
    });
  }
  const html = await res.text();
  return { html, finalUrl: res.url, status: res.status };
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try { body = await req.json(); } catch { body = {}; }
  const { action } = body;

  try {
    // Navigate
    if (action === 'navigate') {
      const targetUrl = body.url || 'https://www.google.com';
      const { html, status, finalUrl } = await fetchPage(targetUrl);
      const data = extractPageData(html, finalUrl);
      return Response.json({ success: true, url: finalUrl, status, ...data });
    }

    // Search
    if (action === 'search') {
      const q = body.query || body.text || '';
      if (!q) return Response.json({ success: false, error: 'No query provided' });
      const results = await webSearch(q);
      return Response.json({ success: true, results, query: q });
    }

    // Submit form
    if (action === 'submit_form') {
      const { form_action, form_method, form_data } = body;
      if (!form_action) return Response.json({ success: false, error: 'No form_action provided' });
      const { html, finalUrl, status } = await submitForm(form_action, form_method || 'POST', form_data || {});
      const data = extractPageData(html, finalUrl);
      return Response.json({ success: true, url: finalUrl, status, submitted: true, ...data });
    }

    // AI Agent — autonomous multi-step task
    if (action === 'agent_task') {
      const { task, start_url } = body;
      if (!task) return Response.json({ success: false, error: 'No task provided' });

      const startUrl = start_url || 'https://www.google.com';
      // Step 1: Fetch starting page
      const { html: startHtml, finalUrl: startFinal } = await fetchPage(startUrl);
      const startData = extractPageData(startHtml, startFinal);

      // Step 2: Ask LLM to plan and execute steps
      const plan = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are an AI browser agent. You have access to a page's extracted data and must plan steps to complete a task.

CURRENT PAGE:
- URL: ${startFinal}
- Title: ${startData.title}
- Description: ${startData.description}
- Headings: ${startData.headings.map(h => h.text).join(', ')}
- Links (first 20): ${startData.links.slice(0, 20).map(l => `[${l.label}](${l.href})`).join(' | ')}
- Forms: ${startData.forms.length} form(s) found
${startData.forms.map((f, i) => `  Form ${i}: action=${f.action}, method=${f.method}, fields: ${f.fields.map(fi => `${fi.name}(${fi.type})`).join(', ')}`).join('\n')}
- Emails found: ${startData.emails.join(', ') || 'none'}
- Phones found: ${startData.phones.join(', ') || 'none'}
- Text preview: ${startData.text.substring(0, 500)}

TASK: ${task}

Plan a sequence of actions. For each step output ONE action object.
Available actions:
- {"action": "search", "query": "..."} — web search
- {"action": "navigate", "url": "..."} — go to a URL (pick from the links above or construct one)
- {"action": "submit_form", "form_index": 0, "form_data": {"field_name": "value"}} — fill & submit a form
- {"action": "extract", "what": "..."} — extract specific data from current page
- {"action": "done", "result": "..."} — task complete, return final answer

Output a JSON array of up to 5 action steps. Be specific. Use real URLs from the links.`,
        response_json_schema: {
          type: "object",
          properties: {
            reasoning: { type: "string" },
            steps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  query: { type: "string" },
                  url: { type: "string" },
                  form_index: { type: "number" },
                  form_data: { type: "object" },
                  what: { type: "string" },
                  result: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Step 3: Execute steps sequentially
      const log = [];
      let currentData = startData;
      let currentUrl = startFinal;
      let finalResult = null;

      for (const step of (plan.steps || []).slice(0, 5)) {
        const entry = { action: step.action, status: 'running' };
        try {
          if (step.action === 'search') {
            const results = await webSearch(step.query);
            entry.query = step.query;
            entry.results_count = results.length;
            entry.results = results.slice(0, 5);
            entry.status = 'done';
          } else if (step.action === 'navigate') {
            const { html, finalUrl } = await fetchPage(step.url);
            currentData = extractPageData(html, finalUrl);
            currentUrl = finalUrl;
            entry.url = finalUrl;
            entry.title = currentData.title;
            entry.links_count = currentData.links.length;
            entry.forms_count = currentData.forms.length;
            entry.emails = currentData.emails;
            entry.phones = currentData.phones;
            entry.status = 'done';
          } else if (step.action === 'submit_form') {
            const form = currentData.forms[step.form_index || 0];
            if (form) {
              const { html, finalUrl } = await submitForm(form.action, form.method, step.form_data || {});
              currentData = extractPageData(html, finalUrl);
              currentUrl = finalUrl;
              entry.submitted_to = form.action;
              entry.title = currentData.title;
              entry.status = 'done';
            } else {
              entry.status = 'error';
              entry.error = 'Form not found';
            }
          } else if (step.action === 'extract') {
            // Use LLM to extract structured data from current page
            const extraction = await base44.asServiceRole.integrations.Core.InvokeLLM({
              prompt: `Extract the following from this page content:\nWANT: ${step.what}\n\nPAGE TITLE: ${currentData.title}\nURL: ${currentUrl}\nEMAILS: ${currentData.emails.join(', ')}\nPHONES: ${currentData.phones.join(', ')}\nHEADINGS: ${currentData.headings.map(h => h.text).join(', ')}\nTEXT: ${currentData.text.substring(0, 2000)}\n\nReturn the extracted data as JSON.`,
              response_json_schema: {
                type: "object",
                properties: {
                  extracted_data: { type: "string" },
                  items: { type: "array", items: { type: "object" } },
                  confidence: { type: "number" }
                }
              }
            });
            entry.extracted = extraction;
            entry.status = 'done';
          } else if (step.action === 'done') {
            finalResult = step.result;
            entry.result = step.result;
            entry.status = 'done';
            log.push(entry);
            break;
          }
        } catch (err) {
          entry.status = 'error';
          entry.error = err.message;
        }
        log.push(entry);
      }

      // Log the agent job
      await base44.asServiceRole.entities.AgentJob.create({
        agent_type: "Browser",
        job_description: `Browser agent: ${task.substring(0, 200)}`,
        status: "complete",
        result: JSON.stringify({ final_result: finalResult, steps: log.length, current_url: currentUrl }),
        trigger_source: "manual",
        completed_at: new Date().toISOString()
      });

      return Response.json({
        success: true,
        reasoning: plan.reasoning,
        steps: log,
        final_result: finalResult,
        current_page: { url: currentUrl, title: currentData.title, emails: currentData.emails, phones: currentData.phones },
      });
    }

    return Response.json({ error: 'Invalid action. Use: navigate, search, submit_form, agent_task' }, { status: 400 });
  } catch (err) {
    return Response.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
});