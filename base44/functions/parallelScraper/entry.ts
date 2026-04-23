/**
 * parallelScraper — Zero-integration parallel web scraper
 * Uses native fetch + DuckDuckGo + Groq for AI extraction
 * No Base44 integrations consumed
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// ── Fetch a single page with timeout ──────────────────────────────────────────
async function fetchPage(url, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': UA,
        'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      redirect: 'follow',
      signal: controller.signal,
    });
    const html = await res.text();
    clearTimeout(timer);
    return { url: res.url, html, ok: res.ok, status: res.status };
  } catch (e) {
    clearTimeout(timer);
    return { url, html: '', ok: false, status: 0, error: e.message };
  }
}

// ── Strip HTML to clean text ──────────────────────────────────────────────────
function htmlToText(html, maxLen = 6000) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

// ── Extract emails & phones inline (no LLM) ────────────────────────────────
function extractContacts(html) {
  const clean = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
  const emails = [...new Set((clean.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [])
    .filter(e => !e.includes('example') && !e.includes('wixpress') && !e.includes('sentry'))
    .slice(0, 10))];
  const phones = [...new Set((clean.match(/(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}/g) || [])
    .filter(p => p.replace(/\D/g, '').length >= 10)
    .slice(0, 5))];
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]?.trim() || '';
  return { emails, phones, title };
}

// ── DuckDuckGo search — returns array of {href, title, snippet} ───────────
async function ddgSearch(query, maxResults = 10) {
  const results = [];
  try {
    const res = await fetch(`https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}`, {
      method: 'POST',
      headers: { 'User-Agent': UA, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `q=${encodeURIComponent(query)}`,
      redirect: 'follow',
    });
    const html = await res.text();
    // Extract result links
    const linkRe = /<a[^>]+href="(https?:\/\/[^"]+)"[^>]*class="result-link"[^>]*>([\s\S]*?)<\/a>/gi;
    const altRe  = /<a[^>]+rel="nofollow"[^>]+href="(https?:\/\/(?!duckduckgo)[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    let m;
    for (const re of [linkRe, altRe]) {
      while ((m = re.exec(html)) && results.length < maxResults) {
        const href = m[1].trim();
        const title = m[2].replace(/<[^>]+>/g, '').trim();
        if (title.length > 3 && !results.find(r => r.href === href)) {
          results.push({ href, title, snippet: '' });
        }
      }
    }
    // Snippets
    const snippetRe = /<td[^>]*class="result-snippet"[^>]*>([\s\S]*?)<\/td>/gi;
    let si = 0;
    while ((m = snippetRe.exec(html)) && si < results.length) {
      results[si].snippet = m[1].replace(/<[^>]+>/g, '').trim();
      si++;
    }
  } catch (e) {
    console.error('DDG search error:', e.message);
  }
  return results.slice(0, maxResults);
}

// ── Groq LLM call — zero Base44 integrations ─────────────────────────────
async function groqExtract(systemPrompt, userContent, maxTokens = 3000) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ],
      temperature: 0.1,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
    }),
  });
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || '{}';
  try { return JSON.parse(raw); } catch { return { raw }; }
}

// ── Parallel fetch all URLs ────────────────────────────────────────────────
async function parallelFetch(urls, concurrency = 5) {
  const results = [];
  const batches = [];
  for (let i = 0; i < urls.length; i += concurrency) {
    batches.push(urls.slice(i, i + concurrency));
  }
  for (const batch of batches) {
    const settled = await Promise.allSettled(batch.map(u => fetchPage(u)));
    for (const r of settled) {
      results.push(r.status === 'fulfilled' ? r.value : { url: '', html: '', ok: false, error: r.reason?.message });
    }
  }
  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { action } = body;

  // ── ACTION: search_and_scrape ───────────────────────────────────────────
  // Query DDG, parallel-fetch all result pages, AI-extract structured data
  if (action === 'search_and_scrape') {
    const { query, extract_schema, project_id, max_pages = 8, save_to_project = true } = body;
    if (!query) return Response.json({ error: 'query required' }, { status: 400 });

    // 1. Search
    const searchResults = await ddgSearch(query, max_pages + 2);
    if (!searchResults.length) return Response.json({ success: false, error: 'No search results found', query });

    const urls = searchResults.map(r => r.href).slice(0, max_pages);
    console.log(`Parallel fetching ${urls.length} pages…`);

    // 2. Parallel fetch
    const pages = await parallelFetch(urls, 6);
    const goodPages = pages.filter(p => p.ok && p.html.length > 500);
    console.log(`Got ${goodPages.length}/${pages.length} good pages`);

    // 3. Extract contacts inline from each page
    const pageData = goodPages.map(p => ({
      url: p.url,
      ...extractContacts(p.html),
      text: htmlToText(p.html, 3000),
    }));

    // 4. Groq AI extraction — batch all page texts together
    const combinedText = pageData.map(p =>
      `=== ${p.url} ===\nTitle: ${p.title}\nEmails: ${p.emails.join(', ') || 'none'}\nPhones: ${p.phones.join(', ') || 'none'}\nText: ${p.text.slice(0, 1200)}`
    ).join('\n\n');

    const schemaDesc = extract_schema
      ? `Extract objects matching this schema: ${JSON.stringify(extract_schema)}`
      : `Extract any useful structured data: businesses, contacts, emails, phones, addresses, products, prices — whatever is relevant.`;

    const extracted = await groqExtract(
      `You are a data extraction specialist. ${schemaDesc} Return JSON with key "items" as an array of extracted objects and "summary" as a string.`,
      `Query: "${query}"\n\n${combinedText}`
    );

    // 5. Save to project folder if requested
    let savedAsset = null;
    if (save_to_project && project_id) {
      const assetContent = JSON.stringify({
        query,
        scraped_at: new Date().toISOString(),
        pages_scraped: goodPages.length,
        items: extracted.items || [],
        page_contacts: pageData.map(p => ({ url: p.url, title: p.title, emails: p.emails, phones: p.phones })),
      }, null, 2);

      savedAsset = await base44.asServiceRole.entities.GeneratedAsset.create({
        title: `Scrape: ${query.slice(0, 60)}`,
        asset_type: 'scrape_result',
        content: assetContent,
        project_id: project_id || '',
        created_by: user.email,
        metadata: JSON.stringify({ query, pages: goodPages.length, items: (extracted.items || []).length }),
      }).catch(e => ({ error: e.message }));
    }

    return Response.json({
      success: true,
      query,
      pages_fetched: goodPages.length,
      items: extracted.items || [],
      summary: extracted.summary || '',
      page_contacts: pageData.map(p => ({ url: p.url, title: p.title, emails: p.emails, phones: p.phones })),
      saved_asset: savedAsset,
    });
  }

  // ── ACTION: scrape_urls ─────────────────────────────────────────────────
  // Parallel-fetch explicit URLs and extract data
  if (action === 'scrape_urls') {
    const { urls, extract_schema, project_id, save_to_project = true } = body;
    if (!urls?.length) return Response.json({ error: 'urls[] required' }, { status: 400 });

    const pages = await parallelFetch(urls.slice(0, 15), 6);
    const goodPages = pages.filter(p => p.ok && p.html.length > 200);

    const pageData = goodPages.map(p => ({
      url: p.url,
      ...extractContacts(p.html),
      text: htmlToText(p.html, 3000),
    }));

    const combinedText = pageData.map(p =>
      `=== ${p.url} ===\nTitle: ${p.title}\nEmails: ${p.emails.join(', ')}\nPhones: ${p.phones.join(', ')}\nText: ${p.text.slice(0, 1500)}`
    ).join('\n\n');

    const schemaDesc = extract_schema
      ? `Extract objects matching: ${JSON.stringify(extract_schema)}`
      : 'Extract key data: businesses, contacts, prices, emails, phones, any structured info.';

    const extracted = await groqExtract(
      `You are a data extraction specialist. ${schemaDesc} Return JSON with "items" array and "summary".`,
      combinedText
    );

    let savedAsset = null;
    if (save_to_project && project_id) {
      savedAsset = await base44.asServiceRole.entities.GeneratedAsset.create({
        title: `URL Scrape — ${urls.length} pages`,
        asset_type: 'scrape_result',
        content: JSON.stringify({ urls, scraped_at: new Date().toISOString(), items: extracted.items || [], page_contacts: pageData }, null, 2),
        project_id,
        created_by: user.email,
        metadata: JSON.stringify({ url_count: urls.length, items: (extracted.items || []).length }),
      }).catch(() => null);
    }

    return Response.json({
      success: true,
      pages_fetched: goodPages.length,
      items: extracted.items || [],
      summary: extracted.summary || '',
      page_contacts: pageData.map(p => ({ url: p.url, title: p.title, emails: p.emails, phones: p.phones })),
      saved_asset: savedAsset,
    });
  }

  // ── ACTION: deep_crawl ──────────────────────────────────────────────────
  // Start from a URL, extract all links, parallel-fetch linked pages
  if (action === 'deep_crawl') {
    const { start_url, link_filter, max_depth = 2, max_pages = 12, project_id } = body;
    if (!start_url) return Response.json({ error: 'start_url required' }, { status: 400 });

    const visited = new Set();
    const queue = [start_url];
    const allPageData = [];

    let depth = 0;
    while (queue.length > 0 && visited.size < max_pages && depth < max_depth) {
      const batch = queue.splice(0, 5).filter(u => !visited.has(u));
      batch.forEach(u => visited.add(u));

      const pages = await parallelFetch(batch, 5);
      for (const page of pages) {
        if (!page.ok || page.html.length < 200) continue;
        const contacts = extractContacts(page.html);
        const text = htmlToText(page.html, 2000);

        // Extract links for next depth
        const linkRe = /href=["'](https?:\/\/[^"'#?]+)["']/g;
        let lm;
        const base = new URL(page.url).hostname;
        while ((lm = linkRe.exec(page.html)) !== null) {
          const href = lm[1];
          if (!visited.has(href)) {
            const sameHost = new URL(href).hostname === base;
            const passFilter = !link_filter || href.includes(link_filter);
            if ((sameHost || passFilter) && queue.length < 30) queue.push(href);
          }
        }

        allPageData.push({ url: page.url, ...contacts, text });
      }
      depth++;
    }

    // AI summary
    const summaryText = allPageData.slice(0, 8).map(p =>
      `${p.url}\n${p.title}\nEmails: ${p.emails.join(', ')}\nPhones: ${p.phones.join(', ')}\n${p.text.slice(0, 800)}`
    ).join('\n---\n');

    const extracted = await groqExtract(
      'You are a data extraction specialist. Extract all useful structured data from the crawled pages. Return JSON with "items" array and "summary" string.',
      summaryText
    );

    let savedAsset = null;
    if (project_id) {
      savedAsset = await base44.asServiceRole.entities.GeneratedAsset.create({
        title: `Deep Crawl: ${start_url.slice(0, 60)}`,
        asset_type: 'scrape_result',
        content: JSON.stringify({ start_url, pages_crawled: allPageData.length, items: extracted.items || [], pages: allPageData }, null, 2),
        project_id,
        created_by: user.email,
        metadata: JSON.stringify({ start_url, depth: max_depth, pages: allPageData.length }),
      }).catch(() => null);
    }

    return Response.json({
      success: true,
      pages_crawled: allPageData.length,
      items: extracted.items || [],
      summary: extracted.summary || '',
      page_contacts: allPageData.map(p => ({ url: p.url, title: p.title, emails: p.emails, phones: p.phones })),
      saved_asset: savedAsset,
    });
  }

  // ── ACTION: workflow ────────────────────────────────────────────────────
  // Multi-step automation: search → scrape → extract → save
  if (action === 'workflow') {
    const { steps, project_id } = body;
    if (!steps?.length) return Response.json({ error: 'steps[] required' }, { status: 400 });

    const log = [];
    let lastResult = null;

    for (const step of steps) {
      const stepResult = { step: step.action, status: 'running', ts: new Date().toISOString() };
      try {
        if (step.action === 'search') {
          stepResult.results = await ddgSearch(step.query, step.max_results || 10);
          stepResult.status = 'done';
          lastResult = stepResult.results;
        } else if (step.action === 'fetch_urls') {
          const urls = step.urls || (lastResult?.map?.(r => r.href) || []);
          const pages = await parallelFetch(urls.slice(0, 10), 5);
          stepResult.pages = pages.filter(p => p.ok).map(p => ({
            url: p.url, ...extractContacts(p.html), text: htmlToText(p.html, 2000)
          }));
          stepResult.status = 'done';
          lastResult = stepResult.pages;
        } else if (step.action === 'extract') {
          const pages = lastResult || [];
          const combined = pages.slice(0, 8).map(p =>
            `${p.url || ''}\n${p.title || ''}\nEmails:${(p.emails||[]).join(',')}\nPhones:${(p.phones||[]).join(',')}\n${(p.text||'').slice(0,1000)}`
          ).join('\n---\n');
          const result = await groqExtract(
            `Extract data matching: ${JSON.stringify(step.schema || {})}. Return JSON with "items" array and "summary".`,
            combined
          );
          stepResult.items = result.items || [];
          stepResult.summary = result.summary || '';
          stepResult.status = 'done';
          lastResult = stepResult.items;
        } else if (step.action === 'save') {
          const content = JSON.stringify({ workflow_step: step.label || 'save', data: lastResult, saved_at: new Date().toISOString() }, null, 2);
          const asset = await base44.asServiceRole.entities.GeneratedAsset.create({
            title: step.title || `Workflow Save — ${new Date().toLocaleString()}`,
            asset_type: 'scrape_result',
            content,
            project_id: step.project_id || project_id || '',
            created_by: user.email,
            metadata: JSON.stringify({ items: Array.isArray(lastResult) ? lastResult.length : 1 }),
          }).catch(e => ({ error: e.message }));
          stepResult.saved_asset = asset;
          stepResult.status = 'done';
        }
      } catch (e) {
        stepResult.status = 'error';
        stepResult.error = e.message;
      }
      log.push(stepResult);
    }

    return Response.json({ success: true, workflow_log: log, final_result: lastResult });
  }

  return Response.json({ error: 'Unknown action. Use: search_and_scrape | scrape_urls | deep_crawl | workflow' }, { status: 400 });
});