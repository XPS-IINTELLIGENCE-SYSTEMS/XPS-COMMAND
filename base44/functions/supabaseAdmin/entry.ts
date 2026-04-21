import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_KEY');

async function supabaseRequest(path, options = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${path}`;
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': options.prefer || 'return=representation',
    ...options.headers,
  };
  const res = await fetch(url, { ...options, headers, body: options.body ? JSON.stringify(options.body) : undefined });
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('json')) {
    const data = await res.json();
    if (!res.ok) return { error: data, status: res.status };
    return { data, status: res.status, count: res.headers.get('content-range') };
  }
  return { data: await res.text(), status: res.status };
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { action } = body;

  // ═══════════════════════════════════════════
  // ACTION: LIST TABLES
  // ═══════════════════════════════════════════
  if (action === 'list_tables') {
    // Query pg_catalog for all public tables
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    });
    // The root endpoint returns OpenAPI spec with all table paths
    const spec = await res.json();
    const tables = spec.definitions ? Object.keys(spec.definitions) : [];
    return Response.json({ tables, count: tables.length });
  }

  // ═══════════════════════════════════════════
  // ACTION: DESCRIBE TABLE
  // ═══════════════════════════════════════════
  if (action === 'describe_table') {
    const { table } = body;
    if (!table) return Response.json({ error: 'table required' }, { status: 400 });
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    });
    const spec = await res.json();
    const def = spec.definitions?.[table];
    if (!def) return Response.json({ error: `Table '${table}' not found` }, { status: 404 });
    return Response.json({ table, schema: def });
  }

  // ═══════════════════════════════════════════
  // ACTION: QUERY (SELECT)
  // ═══════════════════════════════════════════
  if (action === 'query') {
    const { table, select = '*', filters = {}, order, limit = 50, offset = 0 } = body;
    if (!table) return Response.json({ error: 'table required' }, { status: 400 });

    let queryStr = `${table}?select=${encodeURIComponent(select)}&limit=${limit}&offset=${offset}`;
    for (const [key, val] of Object.entries(filters)) {
      queryStr += `&${key}=${encodeURIComponent(val)}`;
    }
    if (order) queryStr += `&order=${encodeURIComponent(order)}`;

    const result = await supabaseRequest(queryStr, {
      headers: { 'Range': `${offset}-${offset + limit - 1}`, 'Prefer': 'count=exact' }
    });
    return Response.json(result);
  }

  // ═══════════════════════════════════════════
  // ACTION: INSERT
  // ═══════════════════════════════════════════
  if (action === 'insert') {
    const { table, records } = body;
    if (!table || !records) return Response.json({ error: 'table and records required' }, { status: 400 });
    const result = await supabaseRequest(table, { method: 'POST', body: records });
    return Response.json(result);
  }

  // ═══════════════════════════════════════════
  // ACTION: UPDATE
  // ═══════════════════════════════════════════
  if (action === 'update') {
    const { table, match, data } = body;
    if (!table || !match || !data) return Response.json({ error: 'table, match, and data required' }, { status: 400 });
    let queryStr = `${table}?`;
    for (const [key, val] of Object.entries(match)) {
      queryStr += `${key}=eq.${encodeURIComponent(val)}&`;
    }
    const result = await supabaseRequest(queryStr, { method: 'PATCH', body: data });
    return Response.json(result);
  }

  // ═══════════════════════════════════════════
  // ACTION: UPSERT
  // ═══════════════════════════════════════════
  if (action === 'upsert') {
    const { table, records, on_conflict = 'id' } = body;
    if (!table || !records) return Response.json({ error: 'table and records required' }, { status: 400 });
    const result = await supabaseRequest(`${table}?on_conflict=${on_conflict}`, {
      method: 'POST',
      body: records,
      prefer: 'resolution=merge-duplicates,return=representation'
    });
    return Response.json(result);
  }

  // ═══════════════════════════════════════════
  // ACTION: DELETE
  // ═══════════════════════════════════════════
  if (action === 'delete') {
    const { table, match } = body;
    if (!table || !match) return Response.json({ error: 'table and match required' }, { status: 400 });
    let queryStr = `${table}?`;
    for (const [key, val] of Object.entries(match)) {
      queryStr += `${key}=eq.${encodeURIComponent(val)}&`;
    }
    const result = await supabaseRequest(queryStr, { method: 'DELETE' });
    return Response.json(result);
  }

  // ═══════════════════════════════════════════
  // ACTION: RPC (call stored procedures / functions)
  // ═══════════════════════════════════════════
  if (action === 'rpc') {
    const { function_name, params = {} } = body;
    if (!function_name) return Response.json({ error: 'function_name required' }, { status: 400 });
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${function_name}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    const data = await res.json().catch(() => ({}));
    return Response.json({ data, status: res.status });
  }

  // ═══════════════════════════════════════════
  // ACTION: STORAGE LIST BUCKETS
  // ═══════════════════════════════════════════
  if (action === 'storage_list_buckets') {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    });
    return Response.json({ buckets: await res.json() });
  }

  // ═══════════════════════════════════════════
  // ACTION: STORAGE LIST FILES
  // ═══════════════════════════════════════════
  if (action === 'storage_list_files') {
    const { bucket, path = '', limit: fileLimit = 100, offset: fileOffset = 0 } = body;
    if (!bucket) return Response.json({ error: 'bucket required' }, { status: 400 });
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${bucket}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prefix: path, limit: fileLimit, offset: fileOffset }),
    });
    return Response.json({ files: await res.json() });
  }

  // ═══════════════════════════════════════════
  // ACTION: STORAGE UPLOAD
  // ═══════════════════════════════════════════
  if (action === 'storage_get_url') {
    const { bucket, path: filePath } = body;
    if (!bucket || !filePath) return Response.json({ error: 'bucket and path required' }, { status: 400 });
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${filePath}`;
    // Signed URL for private buckets
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/sign/${bucket}/${filePath}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ expiresIn: 3600 }),
    });
    const signedData = await res.json();
    return Response.json({ public_url: publicUrl, signed_url: signedData.signedURL ? `${SUPABASE_URL}/storage/v1${signedData.signedURL}` : null });
  }

  // ═══════════════════════════════════════════
  // ACTION: FULL SYNC (Base44 → Supabase)
  // ═══════════════════════════════════════════
  if (action === 'sync_to_supabase') {
    const { entity_name, target_table, batch_size = 100 } = body;
    if (!entity_name || !target_table) return Response.json({ error: 'entity_name and target_table required' }, { status: 400 });

    const records = await base44.asServiceRole.entities[entity_name].filter({});
    let synced = 0;
    const errors = [];

    for (let i = 0; i < records.length; i += batch_size) {
      const batch = records.slice(i, i + batch_size).map(r => ({
        base44_id: r.id,
        ...r,
        id: undefined, // let Supabase handle its own IDs
      }));
      const result = await supabaseRequest(`${target_table}?on_conflict=base44_id`, {
        method: 'POST',
        body: batch,
        prefer: 'resolution=merge-duplicates,return=representation'
      });
      if (result.error) errors.push({ batch: i, error: result.error });
      else synced += (result.data?.length || batch.length);
    }

    return Response.json({ synced, total: records.length, errors });
  }

  // ═══════════════════════════════════════════
  // ACTION: FULL SYNC (Supabase → Base44)
  // ═══════════════════════════════════════════
  if (action === 'sync_from_supabase') {
    const { source_table, entity_name, limit: syncLimit = 500, field_map = {} } = body;
    if (!source_table || !entity_name) return Response.json({ error: 'source_table and entity_name required' }, { status: 400 });

    const result = await supabaseRequest(`${source_table}?select=*&limit=${syncLimit}&order=created_at.desc.nullslast`);
    if (result.error) return Response.json({ error: result.error }, { status: 500 });

    const records = result.data || [];
    let created = 0;
    const errors = [];

    for (const row of records) {
      const mapped = {};
      for (const [supaCol, base44Field] of Object.entries(field_map)) {
        if (row[supaCol] !== undefined && row[supaCol] !== null) {
          mapped[base44Field] = row[supaCol];
        }
      }
      // If no field map, pass raw (will fail on unknown fields, but that's intentional)
      const data = Object.keys(field_map).length > 0 ? mapped : row;
      try {
        await base44.asServiceRole.entities[entity_name].create(data);
        created++;
      } catch (e) {
        errors.push({ row_id: row.id, error: e.message });
        if (errors.length > 10) break;
      }
    }

    return Response.json({ created, total_fetched: records.length, errors });
  }

  // ═══════════════════════════════════════════
  // ACTION: STATS
  // ═══════════════════════════════════════════
  if (action === 'stats') {
    const { tables = [] } = body;
    const stats = {};
    for (const table of tables) {
      const res = await supabaseRequest(`${table}?select=id&limit=1`, {
        headers: { 'Range': '0-0', 'Prefer': 'count=exact' }
      });
      const range = res.count || '0';
      const match = range?.match?.(/\/(\d+)/);
      stats[table] = { total: match ? parseInt(match[1]) : 0 };
    }
    return Response.json({ stats });
  }

  return Response.json({ error: `Unknown action: ${action}`, available: [
    'list_tables', 'describe_table', 'query', 'insert', 'update', 'upsert', 'delete',
    'rpc', 'storage_list_buckets', 'storage_list_files', 'storage_get_url',
    'sync_to_supabase', 'sync_from_supabase', 'stats'
  ]}, { status: 400 });
});