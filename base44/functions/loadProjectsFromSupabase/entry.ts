import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_KEY');

    const response = await fetch(`${supabaseUrl}/rest/v1/projects?created_by=eq.${user.email}`, {
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
    });

    const projects = await response.json();
    return Response.json({
      success: true,
      projects: projects || [],
      count: projects?.length || 0,
    });
  } catch (error) {
    console.error('Load error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});