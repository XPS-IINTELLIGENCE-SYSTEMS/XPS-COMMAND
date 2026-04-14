import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SERVICE_CONFIGS = {
  construct_connect: {
    testUrl: 'https://api.constructconnect.com/v1/projects?limit=1',
    authHeader: 'Authorization',
    authPrefix: 'Bearer ',
    defaultBase: 'https://api.constructconnect.com/v1',
    docs: 'https://developer.constructconnect.com/'
  },
  dodge_reports: {
    testUrl: 'https://api.construction.com/v1/projects?limit=1',
    authHeader: 'Authorization',
    authPrefix: 'Bearer ',
    defaultBase: 'https://api.construction.com/v1',
    docs: 'https://www.construction.com/products/project-information'
  },
  hubspot: {
    testUrl: 'https://api.hubapi.com/crm/v3/objects/contacts?limit=1',
    authHeader: 'Authorization',
    authPrefix: 'Bearer ',
    defaultBase: 'https://api.hubapi.com',
    docs: 'https://developers.hubspot.com/docs/api/overview'
  },
  airtable: {
    testUrl: 'https://api.airtable.com/v0/meta/whoami',
    authHeader: 'Authorization',
    authPrefix: 'Bearer ',
    defaultBase: 'https://api.airtable.com/v0',
    docs: 'https://airtable.com/developers/web/api/introduction'
  },
  openai: {
    testUrl: 'https://api.openai.com/v1/models',
    authHeader: 'Authorization',
    authPrefix: 'Bearer ',
    defaultBase: 'https://api.openai.com/v1',
    docs: 'https://platform.openai.com/docs/api-reference'
  },
  anthropic: {
    testUrl: 'https://api.anthropic.com/v1/messages',
    authHeader: 'x-api-key',
    authPrefix: '',
    defaultBase: 'https://api.anthropic.com/v1',
    docs: 'https://docs.anthropic.com/'
  },
  groq: {
    testUrl: 'https://api.groq.com/openai/v1/models',
    authHeader: 'Authorization',
    authPrefix: 'Bearer ',
    defaultBase: 'https://api.groq.com/openai/v1',
    docs: 'https://console.groq.com/docs'
  },
  stripe: {
    testUrl: 'https://api.stripe.com/v1/balance',
    authHeader: 'Authorization',
    authPrefix: 'Bearer ',
    defaultBase: 'https://api.stripe.com/v1',
    docs: 'https://stripe.com/docs/api'
  },
  sendgrid: {
    testUrl: 'https://api.sendgrid.com/v3/user/profile',
    authHeader: 'Authorization',
    authPrefix: 'Bearer ',
    defaultBase: 'https://api.sendgrid.com/v3',
    docs: 'https://docs.sendgrid.com/api-reference'
  },
  slack: {
    testUrl: 'https://slack.com/api/auth.test',
    authHeader: 'Authorization',
    authPrefix: 'Bearer ',
    defaultBase: 'https://slack.com/api',
    docs: 'https://api.slack.com/methods'
  },
  zoominfo: {
    testUrl: 'https://api.zoominfo.com/lookup/inputfields/contact/enrich',
    authHeader: 'Authorization',
    authPrefix: 'Bearer ',
    defaultBase: 'https://api.zoominfo.com',
    docs: 'https://api-docs.zoominfo.com/'
  },
  apolloio: {
    testUrl: 'https://api.apollo.io/api/v1/auth/health',
    authHeader: 'X-Api-Key',
    authPrefix: '',
    defaultBase: 'https://api.apollo.io/api/v1',
    docs: 'https://apolloio.github.io/apollo-api-docs/'
  },
  apify: {
    testUrl: 'https://api.apify.com/v2/users/me',
    authHeader: 'Authorization',
    authPrefix: 'Bearer ',
    defaultBase: 'https://api.apify.com/v2',
    docs: 'https://docs.apify.com/api/v2'
  },
  github: {
    testUrl: 'https://api.github.com/user',
    authHeader: 'Authorization',
    authPrefix: 'Bearer ',
    defaultBase: 'https://api.github.com',
    docs: 'https://docs.github.com/en/rest'
  },
  vercel: {
    testUrl: 'https://api.vercel.com/v2/user',
    authHeader: 'Authorization',
    authPrefix: 'Bearer ',
    defaultBase: 'https://api.vercel.com',
    docs: 'https://vercel.com/docs/rest-api'
  },
  custom: {
    testUrl: null,
    authHeader: 'Authorization',
    authPrefix: 'Bearer ',
    defaultBase: '',
    docs: ''
  }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { action, connector_id, service_type, api_key, base_url } = body;

    // Test a connector
    if (action === 'test') {
      const config = SERVICE_CONFIGS[service_type] || SERVICE_CONFIGS.custom;
      const testUrl = base_url || config.testUrl || config.defaultBase;

      if (!testUrl || !api_key) {
        return Response.json({ status: 'error', message: 'Missing API key or test URL' });
      }

      const startTime = Date.now();
      try {
        const headers = {};
        headers[config.authHeader] = `${config.authPrefix}${api_key}`;
        if (service_type === 'anthropic') {
          headers['anthropic-version'] = '2023-06-01';
        }

        const response = await fetch(testUrl, {
          method: 'GET',
          headers,
          signal: AbortSignal.timeout(10000)
        });

        const responseMs = Date.now() - startTime;
        const ok = response.status >= 200 && response.status < 400;

        // Update connector record if ID provided
        if (connector_id) {
          const errorLog = ok ? '[]' : JSON.stringify([{
            time: new Date().toISOString(),
            status: response.status,
            message: response.statusText
          }]);

          await base44.asServiceRole.entities.APIConnector.update(connector_id, {
            connection_status: ok ? 'connected' : 'error',
            last_tested: new Date().toISOString(),
            last_response_ms: responseMs,
            error_log: ok ? '[]' : errorLog
          });
        }

        return Response.json({
          status: ok ? 'connected' : 'error',
          response_code: response.status,
          response_ms: responseMs,
          message: ok ? 'Connection successful' : `HTTP ${response.status}: ${response.statusText}`
        });
      } catch (fetchError) {
        const responseMs = Date.now() - startTime;
        if (connector_id) {
          const existingConnector = await base44.asServiceRole.entities.APIConnector.get(connector_id);
          let errors = [];
          try { errors = JSON.parse(existingConnector.error_log || '[]'); } catch {}
          errors.unshift({ time: new Date().toISOString(), message: fetchError.message });
          errors = errors.slice(0, 5);

          await base44.asServiceRole.entities.APIConnector.update(connector_id, {
            connection_status: 'error',
            last_tested: new Date().toISOString(),
            last_response_ms: responseMs,
            error_log: JSON.stringify(errors)
          });
        }

        return Response.json({
          status: 'error',
          response_ms: Date.now() - startTime,
          message: fetchError.message
        });
      }
    }

    // Get service config (defaults)
    if (action === 'get_config') {
      const config = SERVICE_CONFIGS[service_type];
      if (!config) return Response.json({ error: 'Unknown service type' }, { status: 400 });
      return Response.json({
        defaultBase: config.defaultBase,
        docs: config.docs
      });
    }

    // Health check all enabled connectors
    if (action === 'health_check_all') {
      const connectors = await base44.asServiceRole.entities.APIConnector.filter({ is_enabled: true });
      const results = [];
      for (const conn of connectors) {
        const config = SERVICE_CONFIGS[conn.service_type] || SERVICE_CONFIGS.custom;
        const testUrl = conn.base_url || config.testUrl || config.defaultBase;
        if (!testUrl || !conn.api_key) {
          results.push({ id: conn.id, name: conn.name, status: 'error', message: 'Missing key or URL' });
          continue;
        }
        const startTime = Date.now();
        try {
          const headers = {};
          headers[config.authHeader] = `${config.authPrefix}${conn.api_key}`;
          if (conn.service_type === 'anthropic') headers['anthropic-version'] = '2023-06-01';
          const response = await fetch(testUrl, { method: 'GET', headers, signal: AbortSignal.timeout(8000) });
          const ms = Date.now() - startTime;
          const ok = response.status >= 200 && response.status < 400;
          await base44.asServiceRole.entities.APIConnector.update(conn.id, {
            connection_status: ok ? 'connected' : 'error',
            last_tested: new Date().toISOString(),
            last_response_ms: ms
          });
          results.push({ id: conn.id, name: conn.name, status: ok ? 'connected' : 'error', ms });
        } catch (e) {
          await base44.asServiceRole.entities.APIConnector.update(conn.id, {
            connection_status: 'error',
            last_tested: new Date().toISOString()
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