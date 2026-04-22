import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { folderName, fileName, content, metadata } = await req.json();

    // Get Google Drive connector
    const driveConnector = await base44.asServiceRole.connectors.getConnection('googledrive');
    if (!driveConnector?.accessToken) {
      return Response.json({ error: 'Google Drive not connected' }, { status: 400 });
    }

    // Ensure project folder structure exists
    const projectFolderId = await ensureFolder(driveConnector.accessToken, 'XPS Projects');
    const categoryFolderId = await ensureFolder(driveConnector.accessToken, folderName.split('/')[1], projectFolderId);

    // Create or update file
    const fileResult = await createOrUpdateFile(
      driveConnector.accessToken,
      fileName,
      content,
      categoryFolderId,
      metadata
    );

    return Response.json({
      success: true,
      fileId: fileResult.id,
      fileName: fileResult.name,
      link: `https://drive.google.com/file/d/${fileResult.id}/view`,
    });
  } catch (error) {
    console.error('Sync error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function ensureFolder(accessToken, folderName, parentId = null) {
  const query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false${
    parentId ? ` and '${parentId}' in parents` : " and 'root' in parents"
  }`;

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&spaces=drive&pageSize=1`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  const data = await response.json();
  if (data.files?.length > 0) {
    return data.files[0].id;
  }

  // Create folder if not found
  const createResponse = await fetch('https://www.googleapis.com/drive/v3/files?supportsAllDrives=true', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : [],
    }),
  });

  const newFolder = await createResponse.json();
  return newFolder.id;
}

async function createOrUpdateFile(accessToken, fileName, content, folderId, metadata) {
  const query = `name='${fileName}' and '${folderId}' in parents and trashed=false`;
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&spaces=drive&pageSize=1`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  const data = await response.json();
  const fileContent = JSON.stringify({ content, metadata }, null, 2);
  const blob = new TextEncoder().encode(fileContent);

  if (data.files?.length > 0) {
    // Update existing file
    const fileId = data.files[0].id;
    const updateResponse = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: blob,
      }
    );
    return await updateResponse.json();
  }

  // Create new file
  const createResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: createMultipartBody(fileName, folderId, blob),
  });

  return await createResponse.json();
}

function createMultipartBody(fileName, folderId, fileContent) {
  const boundary = '===============7330845974216740156==';
  const metadata = JSON.stringify({
    name: fileName,
    mimeType: 'application/json',
    parents: [folderId],
  });

  const body = 
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${metadata}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: application/json\r\n\r\n` +
    new TextDecoder().decode(fileContent) +
    `\r\n--${boundary}--`;

  return new TextEncoder().encode(body);
}