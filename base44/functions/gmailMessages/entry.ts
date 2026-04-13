import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CONNECTOR_ID = "69db200274332486fd28dd7e";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'list';

    if (action === 'list') {
      // List recent messages
      const listRes = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20&labelIds=INBOX',
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      );
      if (!listRes.ok) return Response.json({ error: await listRes.text() }, { status: listRes.status });
      const listData = await listRes.json();
      const messages = listData.messages || [];

      // Fetch headers for each message
      const detailed = await Promise.all(
        messages.slice(0, 15).map(async (m) => {
          const mRes = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
          );
          if (!mRes.ok) return null;
          const mData = await mRes.json();
          const headers = mData.payload?.headers || [];
          return {
            id: m.id,
            from: headers.find(h => h.name === 'From')?.value || '',
            subject: headers.find(h => h.name === 'Subject')?.value || '(no subject)',
            date: headers.find(h => h.name === 'Date')?.value || '',
            snippet: mData.snippet || '',
            labelIds: mData.labelIds || [],
          };
        })
      );

      return Response.json({ messages: detailed.filter(Boolean) });
    }

    if (action === 'send') {
      // Send an email
      const { to, subject, bodyText } = body;
      if (!to || !subject) return Response.json({ error: 'Missing to or subject' }, { status: 400 });

      const rawEmail = btoa(
        `To: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n${bodyText || ''}`
      ).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      const sendRes = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ raw: rawEmail }),
        }
      );

      if (!sendRes.ok) return Response.json({ error: await sendRes.text() }, { status: sendRes.status });
      const sendData = await sendRes.json();
      return Response.json({ success: true, messageId: sendData.id });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});