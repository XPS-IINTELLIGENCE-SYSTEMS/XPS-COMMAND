import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { action, platform, content, tone, media_urls, hashtags, target_audience, engagement_style } = await req.json();

  let prompt = "";

  switch (action) {
    case "create_post":
      prompt = `Create a social media post for Xtreme Polishing Systems (XPS).
PLATFORM: ${platform}
TOPIC/CONTENT: ${content}
TONE: ${tone || "professional yet approachable, industry expert"}
TARGET AUDIENCE: ${target_audience || "contractors, facility managers, property owners"}
${hashtags ? `INCLUDE HASHTAGS: ${hashtags}` : "Generate relevant hashtags"}

Create platform-optimized content with:
- Caption text (platform character limits)
- Hashtags (relevant, trending)
- Best posting time recommendation
- Engagement hook / question
- Call to action
- Image/video description if needed`;
      break;

    case "respond_comments":
      prompt = `Generate human-like social media responses for XPS.
PLATFORM: ${platform}
ENGAGEMENT STYLE: ${engagement_style || "friendly, knowledgeable, helpful"}
COMMENTS/MESSAGES TO RESPOND TO: ${content}

For each comment/message, create a natural, conversational response that:
- Sounds like a real person (not corporate/robotic)
- Shows flooring industry expertise
- Is warm and helpful
- Includes relevant advice or product mentions naturally
- Uses appropriate emojis sparingly
- Matches the tone of the original message`;
      break;

    case "content_calendar":
      prompt = `Create a 7-day social media content calendar for XPS.
PLATFORM: ${platform || "All platforms"}
FOCUS: ${content || "Brand awareness, lead generation, industry authority"}
TONE: ${tone || "Mix of educational, entertaining, and promotional"}

For each day create:
- Post type (image, video, carousel, story, reel)
- Topic and angle
- Caption with hashtags
- Best time to post
- Engagement strategy`;
      break;

    case "video_post":
      prompt = `Create a video post concept for XPS social media.
PLATFORM: ${platform}
TOPIC: ${content}
Create: script outline, visual description, text overlays, caption, hashtags, thumbnail description.`;
      break;

    default:
      prompt = `Social media task for XPS on ${platform}: ${content}`;
  }

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    add_context_from_internet: true,
    model: "gemini_3_flash",
    response_json_schema: {
      type: "object",
      properties: {
        posts: { type: "array", items: { type: "object", properties: {
          platform: { type: "string" },
          content: { type: "string" },
          hashtags: { type: "string" },
          post_type: { type: "string" },
          best_time: { type: "string" },
          cta: { type: "string" },
          image_description: { type: "string" },
          engagement_hook: { type: "string" }
        } } },
        responses: { type: "array", items: { type: "object", properties: {
          original: { type: "string" },
          response: { type: "string" },
          tone: { type: "string" }
        } } },
        calendar: { type: "array", items: { type: "object", properties: {
          day: { type: "string" },
          platform: { type: "string" },
          post_type: { type: "string" },
          topic: { type: "string" },
          caption: { type: "string" },
          hashtags: { type: "string" },
          best_time: { type: "string" }
        } } },
        strategy_notes: { type: "string" }
      }
    }
  });

  // Save to SocialPost entity if creating posts
  if (action === "create_post" && result.posts?.length > 0) {
    for (const post of result.posts) {
      await base44.asServiceRole.entities.SocialPost.create({
        platform: post.platform || platform,
        content: post.content || "",
        hashtags: post.hashtags || "",
        status: "draft",
        content_type: "industry_tip",
        scheduled_time: null
      });
    }
  }

  return Response.json({ success: true, ...result });
});