import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, agent_type, conversation_id, message, context, audit_entry } = body;

    // STORE conversation history in AgentConversation entity
    if (action === 'save_message') {
      const conv = await base44.entities.AgentConversation.filter({ id: conversation_id }).then(r => r[0]);
      
      let messages = conv?.messages ? JSON.parse(conv.messages) : [];
      messages.push({
        role: message.role,
        content: message.content,
        timestamp: new Date().toISOString(),
      });

      await base44.entities.AgentConversation.update(conversation_id, {
        messages: JSON.stringify(messages),
        last_action: message.content.substring(0, 100),
      });

      return Response.json({ success: true, messages_stored: messages.length });
    }

    // UPDATE persistent context (agent memory)
    if (action === 'update_context') {
      await base44.entities.AgentConversation.update(conversation_id, {
        context: context,
      });

      return Response.json({ success: true, context_updated: true });
    }

    // LOG audit trail (what agent did, what changed)
    if (action === 'log_audit') {
      const conv = await base44.entities.AgentConversation.filter({ id: conversation_id }).then(r => r[0]);
      
      let auditLog = conv?.audit_log ? JSON.parse(conv.audit_log) : [];
      auditLog.push({
        action: audit_entry.action,
        entity: audit_entry.entity,
        change: audit_entry.change,
        timestamp: new Date().toISOString(),
        user: user.email,
      });

      await base44.entities.AgentConversation.update(conversation_id, {
        audit_log: JSON.stringify(auditLog),
      });

      return Response.json({ success: true, audit_entries: auditLog.length });
    }

    // RETRIEVE full conversation history for context injection
    if (action === 'get_conversation') {
      const conv = await base44.entities.AgentConversation.filter({ id: conversation_id }).then(r => r[0]);
      
      return Response.json({
        conversation_id: conv?.id,
        messages: conv?.messages ? JSON.parse(conv.messages) : [],
        context: conv?.context,
        audit_log: conv?.audit_log ? JSON.parse(conv.audit_log) : [],
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});