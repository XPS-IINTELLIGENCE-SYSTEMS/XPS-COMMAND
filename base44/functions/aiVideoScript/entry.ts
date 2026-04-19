import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { video_type, topic, duration_seconds, tone, platform, include_voiceover } = await req.json();

  const prompt = `You are a professional video content strategist for Xtreme Polishing Systems (XPS).

Create a complete video production package for:
TYPE: ${video_type || "promotional"}
TOPIC: ${topic}
DURATION: ${duration_seconds || 60} seconds
TONE: ${tone || "professional, authoritative, engaging"}
PLATFORM: ${platform || "YouTube"}

Generate:
1. VIDEO SCRIPT — Word-for-word narration script timed to duration
2. SCENE BREAKDOWN — Shot-by-shot description (visual, camera angle, text overlays)
3. B-ROLL SUGGESTIONS — Stock footage or on-site shots needed
4. MUSIC/SOUND — Mood, tempo, genre suggestions
5. TEXT OVERLAYS — Key text that appears on screen with timing
6. CALL TO ACTION — End-screen CTA
7. THUMBNAIL CONCEPT — Description for thumbnail image
8. HASHTAGS & CAPTION — Platform-specific caption and tags
${include_voiceover ? "9. VOICEOVER DIRECTIONS — Pace, emphasis, pauses, emotion cues" : ""}

Make it compelling, professional, and optimized for ${platform}.`;

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    model: "claude_sonnet_4_6",
    response_json_schema: {
      type: "object",
      properties: {
        title: { type: "string" },
        script: { type: "string" },
        scenes: { type: "array", items: { type: "object", properties: { scene_number: { type: "number" }, duration: { type: "string" }, visual: { type: "string" }, narration: { type: "string" }, text_overlay: { type: "string" } } } },
        broll_suggestions: { type: "array", items: { type: "string" } },
        music_direction: { type: "string" },
        cta: { type: "string" },
        thumbnail_concept: { type: "string" },
        caption: { type: "string" },
        hashtags: { type: "string" },
        voiceover_directions: { type: "string" },
        estimated_production_time: { type: "string" }
      }
    }
  });

  return Response.json({ success: true, video: result });
});