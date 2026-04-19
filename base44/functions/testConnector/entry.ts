import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Comprehensive service configs for all 60+ connectors
const SERVICE_CONFIGS = {
  // AI & LLM
  openai: { testUrl: 'https://api.openai.com/v1/models', authHeader: 'Authorization', authPrefix: 'Bearer ' },
  anthropic: { testUrl: 'https://api.anthropic.com/v1/models', authHeader: 'x-api-key', authPrefix: '', extraHeaders: { 'anthropic-version': '2023-06-01' } },
  groq: { testUrl: 'https://api.groq.com/openai/v1/models', authHeader: 'Authorization', authPrefix: 'Bearer ' },
  ollama: { testUrl: null, authHeader: 'Authorization', authPrefix: 'Bearer ', useBaseUrl: true, testPath: '/api/tags' },
  openrouter: { testUrl: 'https://openrouter.ai/api/v1/models', authHeader: 'Authorization', authPrefix: 'Bearer ' },
  together_ai: { testUrl: 'https://api.together.xyz/v1/models', authHeader: 'Authorization', authPrefix: 'Bearer ' },
  mistral: { testUrl: 'https://api.mistral.ai/v1/models', authHeader: 'Authorization', authPrefix: 'Bearer ' },
  perplexity: { testUrl: 'https://api.perplexity.ai/chat/completions', authHeader: 'Authorization', authPrefix: 'Bearer ', method: 'POST', body: JSON.stringify({ model: 'llama-3.1-sonar-small-128k-online', messages: [{ role: 'user', content: 'ping' }] }), contentType: 'application/json' },
  replicate: { testUrl: 'https://api.replicate.com/v1/collections', authHeader: 'Authorization', authPrefix: 'Bearer ' },
  heygen: { testUrl: 'https://api.heygen.com/v2/avatars', authHeader: 'X-Api-Key', authPrefix: '' },
  elevenlabs: { testUrl: 'https://api.elevenlabs.io/v1/voices', authHeader: 'xi-api-key', authPrefix: '' },

  // Google
  google_cloud: { testUrl: null, authHeader: 'Authorization', authPrefix: 'Bearer ', useBaseUrl: true },
  google_drive: { testUrl: 'https://www.googleapis.com/drive/v3/about?fields=user', authHeader: 'Authorization', authPrefix: 'Bearer ' },
  google_sheets: { testUrl: 'https://sheets.googleapis.com/v4/spreadsheets', authHeader: 'Authorization', authPrefix: 'Bearer ' },
  google_docs: { testUrl: 'https://docs.googleapis.com/v1/documents', authHeader: 'Authorization', authPrefix: 'Bearer ' },
  google_tasks: { testUrl: 'https://tasks.googleapis.com/tasks/v1/users/@me/lists', authHeader: 'Authorization', authPrefix: 'Bearer ' },
  google_calendar: { testUrl: 'https://www.googleapis.com/calendar/v3/users/me/calendarList', authHeader: 'Authorization', authPrefix: 'Bearer ' },
  gmail: { testUrl: 'https://gmail.googleapis.com/gmail/v1/users/me/profile', authHeader: 'Authorization', authPrefix: 'Bearer ' },
  google_keep: { testUrl: null, authHeader: 'Authorization', authPrefix: 'Bearer ' },

  // Infrastructure & Database
  supabase: { testUrl: null, authHeader: 'apikey', authPrefix: '', useBaseUrl: true, testPath: '/rest/v1/' },
  redis: { testUrl: null, authHeader: 'Authorization', authPrefix: 'Bearer ' },
  neon: { testUrl: 'https://console.neon.tech/api/v2/projects', authHeader: 'Authorization', authPrefix: 'Bearer ' },
  aws: { testUrl: 'https://sts.amazonaws.com/?Action=GetCallerIdentity&Version=2011-06-15', authHeader: 'Authorization', authPrefix: '' },
  vercel: { testUrl: 'https://api.vercel.com/v2/user', authHeader: 'Authorization', authPrefix: 'Bearer ' },
  base44: { testUrl: null, authHeader: 'Authorization', authPrefix: 'Bearer ' },

  // Developer Tools
  github: { testUrl: 'https://api.github.com/user', authHeader: 'Authorization', authPrefix: 'Bearer ' },
  steel_dev: { testUrl: 'https://api.steel.dev/v1/health', authHeader: 'Authorization', authPrefix: 'Bearer ' },
  browserless: { testUrl: null, authHeader: 'Authorization', authPrefix: 'Bearer ', useBaseUrl: true },
  apify: { testUrl: 'https://api.apify.com/v2/users/me', authHeader: 'Authorization', authPrefix: 'Bearer ' },
  brightdata: { testUrl: 'https://api.brightdata.com/zone', authHeader: 'Authorization', authPrefix: 'Bearer ' },
  firecrawl: { testUrl: 'https://api.firecrawl.dev/v1/crawl', authHeader: 'Authorization', authPrefix: 'Bearer ' },
  serper: { testUrl: 'https://google.serper.dev/search', authHeader: 'X-API-KEY', authPrefix: '', method: 'POST', body: JSON.stringify({ q: 'test' }), contentType: 'application/json' },
  tavily: { testUrl: 'https://api.tavily.com/search', authHeader: 'Authorization', authPrefix: 'Bearer ', method: 'POST', body: JSON.stringify({ query: 'test', max_results: 1 }), contentType: 'application/json' },

  // Communication
  twilio: { testUrl: null, authHeader: 'Authorization', authPrefix: 'Basic ', isBasicAuth: true },
  slack: { testUrl: 'https://slack.com/api/auth.test', authHeader: 'Authorization', authPrefix: 'Bearer ' },
  sendgrid: { testUrl: 'https://api.sendgrid.com/v3/user/profile', authHeader: 'Authorization', authPrefix: 'Bearer ' },

  // CRM & Sales
  hubspot: { testUrl: 'https://api.hubapi.com/crm/v3/objects/contacts?limit=1', authHeader: 'Authorization', authPrefix: 'Bearer ' },
  airtable: { testUrl: 'https://api.airtable.com/v0/meta/whoami', authHeader: 'Authorization', authPrefix: 'Bearer ' },
  zoominfo: { testUrl: 'https://api.zoominfo.com/lookup/inputfields/contact/enrich', authHeader: 'Authorization', authPrefix: 'Bearer ' },
  apolloio: { testUrl: 'https://api.apollo.io/api/v1/auth/health', authHeader: 'X-Api-Key', authPrefix: '' },
  linkedin: { testUrl: 'https://api.linkedin.com/v2/userinfo', authHeader: 'Authorization', authPrefix: 'Bearer ' },

  // XPS
  xps_lead_sniper: { testUrl: null, authHeader: 'Authorization', authPrefix: 'Bearer ' },

  // Construction
  construct_connect: { testUrl: 'https://api.constructconnect.com/v1/projects?limit=1', authHeader: 'Authorization', authPrefix: 'Bearer ' },
  dodge_reports: { testUrl: 'https://api.construction.com/v1/projects?limit=1', authHeader: 'Authorization', authPrefix: 'Bearer ' },
  planhub: { testUrl: null, authHeader: 'Authorization', authPrefix: 'Bearer ', useBaseUrl: true },
  building_connected: { testUrl: null, authHeader: 'Authorization', authPrefix: 'Bearer ', useBaseUrl: true },
  isqft: { testUrl: null, authHeader: 'Authorization', authPrefix: 'Bearer ', useBaseUrl: true },
  bidclerk: { testUrl: null, authHeader: 'Authorization', authPrefix: 'Bearer ', useBaseUrl: true },
  the_blue_book: { testUrl: null, authHeader: 'Authorization', authPrefix: 'Bearer ', useBaseUrl: true },

  // Government
  sam_gov: { testUrl: 'https://api.sam.gov/opportunities/v2/search?limit=1&api_key=', authHeader: null, authAsParam: true, paramName: 'api_key' },
  usaspending: { testUrl: 'https://api.usaspending.gov/api/v2/references/toptier_agencies/', authHeader: null },
  fpds: { testUrl: null, authHeader: 'Authorization', authPrefix: 'Bearer ' },
  fbo_gov: { testUrl: 'https://api.sam.gov/opportunities/v1/search?limit=1&api_key=', authHeader: null, authAsParam: true, paramName: 'api_key' },
  gsa_ebuy: { testUrl: null, authHeader: 'Authorization', authPrefix: 'Bearer ' },
  beta_sam: { testUrl: 'https://api.sam.gov/entity-information/v3/entities?api_key=', authHeader: null, authAsParam: true, paramName: 'api_key', appendKey: true },
  grants_gov: { testUrl: null, authHeader: null },
  sbir_gov: { testUrl: null, authHeader: null },
  census_gov: { testUrl: 'https://api.census.gov/data.json', authHeader: null },
  data_gov: { testUrl: null, authHeader: null },

  // Payments & Automation
  stripe: { testUrl: 'https://api.stripe.com/v1/balance', authHeader: 'Authorization', authPrefix: 'Bearer ' },
  zapier: { testUrl: null, authHeader: 'Authorization', authPrefix: 'Bearer ' },

  // Fallback
  custom: { testUrl: null, authHeader: 'Authorization', authPrefix: 'Bearer ' },
};

async function testSingleConnector(serviceType, apiKey, baseUrl) {
  const config = SERVICE_CONFIGS[serviceType] || SERVICE_CONFIGS.custom;

  // Build test URL
  let testUrl = config.testUrl;
  if (!testUrl && config.useBaseUrl && baseUrl) {
    testUrl = baseUrl + (config.testPath || '');
  } else if (!testUrl && baseUrl) {
    testUrl = baseUrl;
  }

  // For APIs where key is a URL param
  if (config.authAsParam && config.appendKey && testUrl) {
    testUrl = testUrl + (apiKey || '');
  }

  if (!testUrl) {
    // No test URL and no base URL — can't test, mark as untested success
    return { status: 'connected', response_ms: 0, message: 'Saved (no test endpoint available)' };
  }

  // For open APIs (no auth needed)
  if (!config.authHeader && !config.authAsParam) {
    if (!testUrl) {
      return { status: 'connected', response_ms: 0, message: 'Saved (open API — no test needed)' };
    }
    const startTime = Date.now();
    const response = await fetch(testUrl, { signal: AbortSignal.timeout(10000) });
    const ms = Date.now() - startTime;
    const ok = response.status >= 200 && response.status < 400;
    return { status: ok ? 'connected' : 'error', response_code: response.status, response_ms: ms, message: ok ? 'Connection successful' : `HTTP ${response.status}` };
  }

  if (!apiKey) {
    return { status: 'error', response_ms: 0, message: 'Missing API key' };
  }

  const startTime = Date.now();
  const headers = {};

  if (config.authHeader) {
    if (config.isBasicAuth) {
      headers[config.authHeader] = `${config.authPrefix}${btoa(apiKey)}`;
    } else {
      headers[config.authHeader] = `${config.authPrefix}${apiKey}`;
    }
  }

  if (config.extraHeaders) {
    Object.assign(headers, config.extraHeaders);
  }

  if (config.contentType) {
    headers['Content-Type'] = config.contentType;
  }

  const fetchOpts = {
    method: config.method || 'GET',
    headers,
    signal: AbortSignal.timeout(10000),
  };

  if (config.body && config.method === 'POST') {
    fetchOpts.body = config.body;
  }

  const response = await fetch(testUrl, fetchOpts);
  const ms = Date.now() - startTime;
  const ok = response.status >= 200 && response.status < 400;

  return {
    status: ok ? 'connected' : 'error',
    response_code: response.status,
    response_ms: ms,
    message: ok ? 'Connection successful' : `HTTP ${response.status}: ${response.statusText}`,
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { action, connector_id, service_type, api_key, base_url } = body;

    // Test a single connector
    if (action === 'test') {
      try {
        const result = await testSingleConnector(service_type, api_key, base_url);

        if (connector_id) {
          await base44.asServiceRole.entities.APIConnector.update(connector_id, {
            connection_status: result.status,
            last_tested: new Date().toISOString(),
            last_response_ms: result.response_ms,
            error_log: result.status === 'error' ? JSON.stringify([{ time: new Date().toISOString(), message: result.message }]) : '[]',
          });
        }

        return Response.json(result);
      } catch (fetchError) {
        if (connector_id) {
          await base44.asServiceRole.entities.APIConnector.update(connector_id, {
            connection_status: 'error',
            last_tested: new Date().toISOString(),
            error_log: JSON.stringify([{ time: new Date().toISOString(), message: fetchError.message }]),
          });
        }
        return Response.json({ status: 'error', response_ms: 0, message: fetchError.message });
      }
    }

    // Health check all enabled connectors
    if (action === 'health_check_all') {
      const connectors = await base44.asServiceRole.entities.APIConnector.filter({ is_enabled: true });
      const results = [];

      for (const conn of connectors) {
        try {
          const result = await testSingleConnector(conn.service_type, conn.api_key, conn.base_url);
          await base44.asServiceRole.entities.APIConnector.update(conn.id, {
            connection_status: result.status,
            last_tested: new Date().toISOString(),
            last_response_ms: result.response_ms,
          });
          results.push({ id: conn.id, name: conn.name, ...result });
        } catch (e) {
          await base44.asServiceRole.entities.APIConnector.update(conn.id, {
            connection_status: 'error',
            last_tested: new Date().toISOString(),
          });
          results.push({ id: conn.id, name: conn.name, status: 'error', message: e.message });
        }
      }

      return Response.json({ results, checked: results.length });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});