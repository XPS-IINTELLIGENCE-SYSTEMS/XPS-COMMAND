import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_KEY');

// Execute SQL via the Supabase SQL endpoint (requires service role)
async function executeSql(sql) {
  // Use the pg REST RPC or the management API
  // For service-role, we use the /rest/v1/rpc approach if available
  // Otherwise we create tables by inserting and checking
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });
  return { status: res.status, data: await res.json().catch(() => null) };
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (user?.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { action } = body;

  // ═══════════════════════════════════════════
  // ACTION: CHECK CONNECTION
  // ═══════════════════════════════════════════
  if (action === 'check_connection') {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      });
      const spec = await res.json();
      const tables = spec.definitions ? Object.keys(spec.definitions) : [];
      
      // Check storage
      const storageRes = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      });
      const buckets = await storageRes.json().catch(() => []);

      return Response.json({
        connected: true,
        url: SUPABASE_URL,
        tables,
        table_count: tables.length,
        buckets: Array.isArray(buckets) ? buckets.map(b => b.name) : [],
        storage_accessible: Array.isArray(buckets),
      });
    } catch (e) {
      return Response.json({ connected: false, error: e.message });
    }
  }

  // ═══════════════════════════════════════════
  // ACTION: FULL SYSTEM HEALTH REPORT
  // ═══════════════════════════════════════════
  if (action === 'health') {
    const results = { connection: false, tables: [], row_counts: {}, storage: false, rpc: false };

    // Test connection
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      });
      const spec = await res.json();
      results.tables = spec.definitions ? Object.keys(spec.definitions) : [];
      results.connection = true;
    } catch {}

    // Test row counts for each table
    for (const table of results.tables.slice(0, 20)) {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=id&limit=1`, {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Range': '0-0',
            'Prefer': 'count=exact',
          }
        });
        const range = res.headers.get('content-range') || '';
        const match = range.match(/\/(\d+)/);
        results.row_counts[table] = match ? parseInt(match[1]) : 0;
      } catch {
        results.row_counts[table] = -1;
      }
    }

    // Test storage
    try {
      const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      });
      const data = await res.json();
      results.storage = Array.isArray(data);
      results.bucket_count = Array.isArray(data) ? data.length : 0;
    } catch {}

    return Response.json(results);
  }

  // ═══════════════════════════════════════════
  // ACTION: BULK EXPORT ALL ENTITIES TO SUPABASE
  // ═══════════════════════════════════════════
  if (action === 'bulk_export') {
    const entities = ['Lead', 'CommercialJob', 'ContractorCompany', 'IntelRecord', 'Proposal', 'Invoice', 'OutreachEmail', 'ScheduledCall', 'AgentTask', 'CalendarEvent'];
    const report = {};

    for (const entityName of entities) {
      try {
        const records = await base44.asServiceRole.entities[entityName].filter({});
        if (!records || records.length === 0) {
          report[entityName] = { status: 'empty', count: 0 };
          continue;
        }

        const tableName = entityName.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
        // Upsert to Supabase
        const batch = records.map(r => {
          const row = { base44_id: r.id, synced_at: new Date().toISOString() };
          for (const [k, v] of Object.entries(r)) {
            if (k === 'id') continue;
            if (typeof v === 'object' && v !== null) row[k] = JSON.stringify(v);
            else row[k] = v;
          }
          return row;
        });

        const res = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates,return=representation',
          },
          body: JSON.stringify(batch),
        });
        const data = await res.json().catch(() => null);
        report[entityName] = {
          status: res.ok ? 'synced' : 'error',
          count: records.length,
          target_table: tableName,
          response_status: res.status,
          error: !res.ok ? data : undefined,
        };
      } catch (e) {
        report[entityName] = { status: 'error', error: e.message };
      }
    }

    return Response.json({ report });
  }

  return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
});