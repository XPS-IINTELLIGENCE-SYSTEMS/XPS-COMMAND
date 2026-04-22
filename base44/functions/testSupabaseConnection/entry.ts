import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if secrets are loaded
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_KEY');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    const secretsLoaded = {
      SUPABASE_URL: supabaseUrl ? '✅ LOADED' : '❌ MISSING',
      SUPABASE_SERVICE_KEY: supabaseServiceKey ? '✅ LOADED' : '❌ MISSING',
      SUPABASE_ANON_KEY: supabaseAnonKey ? '✅ LOADED' : '❌ MISSING',
    };

    // Test DNS resolution
    let dnsTest = { status: 'NOT_TESTED' };
    if (supabaseUrl) {
      try {
        const url = new URL(supabaseUrl);
        const hostname = url.hostname;
        
        // Try to resolve DNS
        const response = await fetch(`https://${hostname}/rest/v1/`, {
          method: 'HEAD',
          headers: {
            'Authorization': `Bearer ${supabaseAnonKey || 'test'}`,
          },
        });
        
        dnsTest = {
          status: 'RESOLVED',
          hostname,
          http_status: response.status,
        };
      } catch (dnsError) {
        dnsTest = {
          status: 'FAILED',
          error: dnsError.message,
          hostname: new URL(supabaseUrl).hostname,
        };
      }
    }

    // Test actual connection with service key
    let connectionTest = { status: 'NOT_TESTED' };
    if (supabaseUrl && supabaseServiceKey) {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey,
          },
        });
        
        connectionTest = {
          status: response.ok ? 'CONNECTED' : 'FAILED',
          http_status: response.status,
          response_text: await response.text().catch(() => 'Could not read response'),
        };
      } catch (connError) {
        connectionTest = {
          status: 'CONNECTION_ERROR',
          error: connError.message,
        };
      }
    }

    return Response.json({
      user_email: user.email,
      timestamp: new Date().toISOString(),
      secrets_status: secretsLoaded,
      dns_test: dnsTest,
      connection_test: connectionTest,
      supabase_url: supabaseUrl ? `${supabaseUrl.split('.')[0]}...` : 'NOT_SET',
      recommendation: !secretsLoaded.SUPABASE_URL.includes('✅') 
        ? 'ADD SUPABASE_URL, SUPABASE_SERVICE_KEY, SUPABASE_ANON_KEY to secrets'
        : dnsTest.status === 'FAILED'
        ? 'DNS resolution failed - check network or Supabase URL'
        : connectionTest.status === 'CONNECTED'
        ? '✅ SUPABASE CONNECTED AND READY'
        : 'Connection test shows: ' + connectionTest.status,
    });
  } catch (error) {
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});