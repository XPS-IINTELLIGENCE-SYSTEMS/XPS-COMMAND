import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { markdownContent, reportTitle } = await req.json();

    // Get Google Docs connection
    const googleConnection = await base44.asServiceRole.connectors.getCurrentAppUserConnection('69ddcb7e5d965b5605cd24b4');
    const accessToken = googleConnection.accessToken;

    // Create a new Google Doc
    const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `${reportTitle || 'XPS System Report'} - ${new Date().toLocaleDateString()}`,
        mimeType: 'application/vnd.google-apps.document',
        parents: ['root']
      })
    });

    const docData = await createResponse.json();
    
    if (!docData.id) {
      return Response.json({ error: 'Failed to create Google Doc' }, { status: 500 });
    }

    // Convert markdown to Google Docs format
    const docContent = markdownToGoogleDocs(markdownContent);

    // Update the document with content
    await updateGoogleDoc(docData.id, docContent, accessToken);

    return Response.json({
      success: true,
      docId: docData.id,
      docUrl: `https://docs.google.com/document/d/${docData.id}/edit`,
      docName: docData.name
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function updateGoogleDoc(docId, content, accessToken) {
  const requests = [];
  
  content.forEach((item, index) => {
    if (item.type === 'heading1') {
      requests.push({
        updateTextStyle: {
          range: { startIndex: 1, endIndex: 2 },
          textStyle: { bold: true, fontSize: { magnitude: 28, unit: 'PT' } },
          fields: 'bold,fontSize'
        }
      });
      requests.push({
        insertText: { text: item.text + '\n\n', insertionIndex: 0 }
      });
    } else if (item.type === 'heading2') {
      requests.push({
        insertText: { text: item.text + '\n', insertionIndex: 0 }
      });
      requests.push({
        updateTextStyle: {
          range: { startIndex: 0, endIndex: item.text.length },
          textStyle: { bold: true, fontSize: { magnitude: 22, unit: 'PT' } },
          fields: 'bold,fontSize'
        }
      });
    } else if (item.type === 'paragraph') {
      requests.push({
        insertText: { text: item.text + '\n', insertionIndex: 0 }
      });
    } else if (item.type === 'bulletPoint') {
      requests.push({
        insertText: { text: item.text + '\n', insertionIndex: 0 }
      });
    } else if (item.type === 'table') {
      requests.push({
        insertTable: {
          rows: item.rows,
          columns: item.columns,
          location: { index: 0 }
        }
      });
    }
  });

  const updateResponse = await fetch(`https://docs.googleapis.com/v1/documents/${docId}:batchUpdate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requests })
  });

  return updateResponse.json();
}

function markdownToGoogleDocs(markdown) {
  const lines = markdown.split('\n');
  const content = [];
  let inTable = false;
  let tableRows = [];

  lines.forEach(line => {
    if (line.startsWith('# ')) {
      content.push({ type: 'heading1', text: line.replace(/^# /, '') });
    } else if (line.startsWith('## ')) {
      content.push({ type: 'heading2', text: line.replace(/^## /, '') });
    } else if (line.startsWith('### ')) {
      content.push({ type: 'heading2', text: line.replace(/^### /, '') });
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      content.push({ type: 'bulletPoint', text: line.replace(/^[\-\*] /, '') });
    } else if (line.startsWith('1. ') || /^\d+\. /.test(line)) {
      const match = line.match(/^\d+\. (.+)/);
      if (match) {
        content.push({ type: 'bulletPoint', text: match[1] });
      }
    } else if (line.includes('|')) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      const cells = line.split('|').map(c => c.trim()).filter(c => c && c !== '---');
      if (cells.length > 0) {
        tableRows.push(cells);
      }
    } else if (inTable && line.trim() === '') {
      if (tableRows.length > 0) {
        const columns = tableRows[0].length;
        const rows = tableRows.length;
        content.push({ type: 'table', rows, columns });
      }
      inTable = false;
      tableRows = [];
    } else if (line.trim() !== '') {
      content.push({ type: 'paragraph', text: line });
    }
  });

  return content;
}