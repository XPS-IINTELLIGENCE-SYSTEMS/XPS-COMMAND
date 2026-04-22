import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { projectId } = await req.json();
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_KEY');

    const response = await fetch(`${supabaseUrl}/rest/v1/projects?id=eq.${projectId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return Response.json({ error: 'Delete failed' }, { status: 400 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});