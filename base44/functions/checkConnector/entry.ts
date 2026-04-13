import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { connectorId } = await req.json();
    if (!connectorId) {
      return Response.json({ connected: false });
    }

    try {
      const connection = await base44.asServiceRole.connectors.getCurrentAppUserConnection(connectorId);
      return Response.json({ connected: !!connection?.accessToken });
    } catch {
      return Response.json({ connected: false });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});