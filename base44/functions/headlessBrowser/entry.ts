import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Fetch a page via plain HTTP
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

// Extract structured data from HTML
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
    // Resolve relative URLs
    if (href.startsWith('/')) {
      try { href = new URL(href, pageUrl).href; } catch { continue; }
    }
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
    if (src.startsWith('/')) {
      try { src = new URL(src, pageUrl).href; } catch { continue; }
    }
    const alt = (im[0].match(/alt=["']([^"']*)/i) || [])[1] || '';
    images.push({ src, alt });
  }

  // Clean text content
  const textContent = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 4000);

  // Resolve favicon
  let faviconUrl = favicon;
  if (faviconUrl && !faviconUrl.startsWith('http')) {
    try { faviconUrl = new URL(faviconUrl, pageUrl).href; } catch { faviconUrl = ''; }
  }

  return { title, description: desc, ogImage, favicon: faviconUrl, headings, links, images, text: textContent };
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

    // DDG Lite result links
    const linkRegex = /<a[^>]+class="result-link"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    let m;
    while ((m = linkRegex.exec(html)) !== null && results.length < 15) {
      const href = m[1].trim();
      const title = m[2].replace(/<[^>]+>/g, '').trim();
      if (href.startsWith('http') && title) results.push({ href, title, snippet: '' });
    }

    // Fallback: plain nofollow links
    if (results.length === 0) {
      const altRegex = /<a[^>]+rel="nofollow"[^>]+href="(https?:\/\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
      while ((m = altRegex.exec(html)) !== null && results.length < 15) {
        const href = m[1].trim();
        const title = m[2].replace(/<[^>]+>/g, '').trim();
        if (title && title.length > 3 && !href.includes('duckduckgo.com')) results.push({ href, title, snippet: '' });
      }
    }

    // Extract snippets
    const snippetRegex = /<td[^>]*class="result-snippet"[^>]*>([\s\S]*?)<\/td>/gi;
    let si = 0;
    while ((m = snippetRegex.exec(html)) !== null && si < results.length) {
      results[si].snippet = m[1].replace(/<[^>]+>/g, '').trim();
      si++;
    }
  } catch { /* search failed silently */ }
  return results;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try { body = await req.json(); } catch { body = {}; }
  const { action, url, query } = body;

  try {
    // Navigate to a URL and extract structured content
    if (action === 'navigate') {
      const targetUrl = url || 'https://www.google.com';
      const { html, status, finalUrl } = await fetchPage(targetUrl);
      const data = extractPageData(html, finalUrl);
      return Response.json({ success: true, url: finalUrl, status, ...data });
    }

    // Web search
    if (action === 'search') {
      const q = query || body.text || '';
      if (!q) return Response.json({ success: false, error: 'No query provided' });
      const results = await webSearch(q);
      return Response.json({ success: true, results, query: q });
    }

    return Response.json({ error: 'Invalid action. Use: navigate, search' }, { status: 400 });
  } catch (err) {
    return Response.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
});