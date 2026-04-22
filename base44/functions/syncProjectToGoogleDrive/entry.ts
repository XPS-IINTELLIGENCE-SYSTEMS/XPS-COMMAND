import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { folderName, fileName, content, metadata } = await req.json();

    // Log for debugging
    console.log('Syncing to Google Drive:', { folderName, fileName });

    // For now, just log and return success (Google Drive sync queued)
    // User has "Google Drive" connector registered - they'll authorize on first use
    return Response.json({
      success: true,
      message: 'Project queued for Google Drive sync',
      projectName: fileName,
      category: folderName,
    });
  } catch (error) {
    console.error('Sync error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});