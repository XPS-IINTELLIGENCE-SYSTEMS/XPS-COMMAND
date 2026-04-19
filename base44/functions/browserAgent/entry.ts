import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { task_type, instructions, target_url, form_data, message_content, recipient } = await req.json();

  let actionPrompt = "";

  switch (task_type) {
    case "form_fill":
      actionPrompt = `Plan step-by-step browser automation to fill out a form at: ${target_url}
Form data to enter: ${JSON.stringify(form_data)}
Instructions: ${instructions}
Generate the exact sequence of: navigate, wait, find element, click, type, scroll, submit actions.`;
      break;
    case "web_research":
      actionPrompt = `Plan step-by-step browser automation to research: ${instructions}
Starting URL: ${target_url || "google.com"}
Generate: navigation steps, search queries, data extraction points, screenshots to take.`;
      break;
    case "social_post":
      actionPrompt = `Plan step-by-step browser automation to post on social media.
Platform URL: ${target_url}
Content to post: ${message_content}
Instructions: ${instructions}
Generate: login check, navigate to post creator, type content, attach media, publish steps.`;
      break;
    case "email_send":
      actionPrompt = `Plan step-by-step automation to send an email.
Recipient: ${recipient}
Subject and body: ${message_content}
Instructions: ${instructions}
Generate: compose email, fill fields, attach files if needed, send.`;
      break;
    case "sms_send":
      actionPrompt = `Plan SMS sending automation.
Recipient: ${recipient}
Message: ${message_content}
Instructions: ${instructions}`;
      break;
    case "social_engage":
      actionPrompt = `Plan step-by-step social media engagement automation.
Platform: ${target_url}
Task: ${instructions}
This includes: reading posts, liking, commenting with human-like responses, following relevant accounts, responding to DMs.
Generate natural, conversational responses that sound human.`;
      break;
    default:
      actionPrompt = `Plan step-by-step browser automation for: ${instructions}
Target: ${target_url || "N/A"}
Generate detailed action sequence.`;
  }

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are an autonomous browser automation agent for Xtreme Polishing Systems.

${actionPrompt}

Create a detailed execution plan with:
1. Step-by-step actions (navigate, click, type, scroll, wait, screenshot, extract)
2. Element selectors or descriptions for each interaction
3. Error handling / fallback for each step
4. Expected outcomes
5. Human-like timing delays between actions
6. If social media engagement: write responses that sound natural, friendly, knowledgeable about flooring/epoxy

Also generate any SMS or email content needed using XPS brand voice.`,
    response_json_schema: {
      type: "object",
      properties: {
        task_summary: { type: "string" },
        steps: { type: "array", items: { type: "object", properties: { step: { type: "number" }, action: { type: "string" }, target: { type: "string" }, value: { type: "string" }, wait_ms: { type: "number" }, fallback: { type: "string" } } } },
        generated_content: { type: "string" },
        sms_message: { type: "string" },
        email_subject: { type: "string" },
        email_body: { type: "string" },
        social_responses: { type: "array", items: { type: "object", properties: { context: { type: "string" }, response: { type: "string" } } } },
        estimated_duration: { type: "string" },
        risk_level: { type: "string" }
      }
    }
  });

  // If SMS requested, actually send it
  if (task_type === "sms_send" && recipient && (result.sms_message || message_content)) {
    const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuth = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioFrom = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (twilioSid && twilioAuth && twilioFrom) {
      const smsBody = new URLSearchParams({
        To: recipient,
        From: twilioFrom,
        Body: result.sms_message || message_content
      });
      await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: "POST",
        headers: {
          "Authorization": "Basic " + btoa(`${twilioSid}:${twilioAuth}`),
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: smsBody.toString()
      });
      result.sms_sent = true;
    }
  }

  // If email requested, send it
  if (task_type === "email_send" && recipient && (result.email_body || message_content)) {
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: recipient,
      subject: result.email_subject || "Message from XPS",
      body: result.email_body || message_content,
      from_name: "XPS Automation"
    });
    result.email_sent = true;
  }

  // Log the agent job
  await base44.asServiceRole.entities.AgentJob.create({
    agent_type: "Shadow Browser",
    job_description: `${task_type}: ${instructions?.substring(0, 200) || "Browser automation task"}`,
    status: "complete",
    result: JSON.stringify(result),
    trigger_source: "manual",
    completed_at: new Date().toISOString()
  });

  return Response.json({ success: true, ...result });
});