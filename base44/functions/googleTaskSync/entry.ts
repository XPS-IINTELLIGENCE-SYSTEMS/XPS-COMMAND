import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // This function is a stub - Google Tasks operations should use the Google Tasks connector
    console.log('googleTaskSync called - using Google Tasks connector instead');
    
    return Response.json({
      success: false,
      message: 'Please use the Google Tasks connector for task operations',
      connectorAvailable: true,
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});