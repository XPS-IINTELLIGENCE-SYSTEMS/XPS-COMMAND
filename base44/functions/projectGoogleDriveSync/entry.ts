import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { projectId, itemId, itemType, itemData } = payload;

    // Get project
    const project = await base44.asServiceRole.entities.Project.read(projectId);
    if (!project) {
      return Response.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get Google Drive connection
    const driveConnection = await base44.asServiceRole.connectors.getCurrentAppUserConnection('69db1e5e75a5f8c15c80cf34');
    if (!driveConnection) {
      return Response.json({ error: 'Google Drive not connected' }, { status: 400 });
    }

    const { accessToken, connectionConfig } = driveConnection;

    // Create or get project folder
    let folderId = project.google_drive_folder_id;
    if (!folderId) {
      const folderRes = await createGoogleDriveFolder(
        accessToken,
        `XPS Project: ${project.name}`
      );
      folderId = folderRes.id;
      await base44.asServiceRole.entities.Project.update(projectId, {
        google_drive_folder_id: folderId,
      });
    }

    // Create item file in Drive
    const fileName = `${itemType}_${itemId}_${Date.now()}.json`;
    const fileContent = JSON.stringify(itemData, null, 2);
    
    const fileRes = await createGoogleDriveFile(
      accessToken,
      fileName,
      fileContent,
      folderId
    );

    // Update project last_synced
    await base44.asServiceRole.entities.Project.update(projectId, {
      last_synced: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      projectId,
      itemId,
      googleDriveFileId: fileRes.id,
      googleDriveFileUrl: `https://drive.google.com/file/d/${fileRes.id}/view`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function createGoogleDriveFolder(accessToken, folderName) {
  const res = await fetch('https://www.googleapis.com/drive/v3/files?supportsAllDrives=true', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });
  return res.json();
}

async function createGoogleDriveFile(accessToken, fileName, content, parentFolderId) {
  const res = await fetch('https://www.googleapis.com/drive/v3/files?supportsAllDrives=true', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: fileName,
      mimeType: 'application/json',
      parents: [parentFolderId],
    }),
  });
  return res.json();
}