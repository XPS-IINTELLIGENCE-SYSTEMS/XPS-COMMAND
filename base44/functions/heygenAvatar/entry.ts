import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const API_KEY = Deno.env.get("HEYGEN_API_KEY");
const BASE_V2 = "https://api.heygen.com/v2";
const BASE_V3 = "https://api.heygen.com/v3";

async function heygenFetch(url, method = "GET", body = null) {
  const opts = {
    method,
    headers: {
      "accept": "application/json",
      "x-api-key": API_KEY,
      "content-type": "application/json",
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  return res.json();
}

async function heygenUpload(url, formData) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "x-api-key": API_KEY },
    body: formData,
  });
  return res.json();
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { action, ...params } = await req.json();

  // ── List stock avatars ──
  if (action === "list_avatars") {
    const data = await heygenFetch(`${BASE_V2}/avatars`);
    return Response.json(data);
  }

  // ── List voices ──
  if (action === "list_voices") {
    const data = await heygenFetch(`${BASE_V2}/voices`);
    return Response.json(data);
  }

  // ── Create photo avatar from uploaded image URL ──
  if (action === "create_photo_avatar") {
    const { image_url, avatar_name } = params;
    // Fetch image and upload to HeyGen
    const imgRes = await fetch(image_url);
    const imgBlob = await imgRes.blob();
    const formData = new FormData();
    formData.append("file", imgBlob, "avatar.jpg");
    
    // Upload photo for avatar generation via v2
    const uploadRes = await fetch("https://api.heygen.com/v2/photo_avatar", {
      method: "POST",
      headers: { "x-api-key": API_KEY },
      body: formData,
    });
    const uploadData = await uploadRes.json();
    
    // If v2 photo_avatar doesn't work, try v1 endpoint
    if (uploadData.error) {
      const v1Res = await fetch("https://api.heygen.com/v1/photo_avatar.generate", {
        method: "POST",
        headers: { "x-api-key": API_KEY, "content-type": "application/json" },
        body: JSON.stringify({ name: avatar_name || "Custom Avatar", image_url }),
      });
      const v1Data = await v1Res.json();
      return Response.json(v1Data);
    }
    return Response.json(uploadData);
  }

  // ── Generate video with avatar ──
  if (action === "generate_video") {
    const { avatar_id, voice_id, script, background_color, ratio, test } = params;
    
    // Try v3 Video Agent first for best quality
    if (!avatar_id || avatar_id === "agent") {
      const agentRes = await heygenFetch(`${BASE_V3}/video-agents`, "POST", {
        prompt: script,
      });
      return Response.json(agentRes);
    }

    // v2 structured video generation
    const payload = {
      test: test || false,
      video_inputs: [{
        character: {
          type: "avatar",
          avatar_id: avatar_id,
          avatar_style: "normal",
        },
        voice: {
          type: "text",
          input_text: script,
          voice_id: voice_id || "en-US-ChristopherNeural",
          speed: 1.0,
        },
        background: {
          type: "color",
          value: background_color || "#ffffff",
        },
      }],
      dimension: ratio === "9:16" ? { width: 1080, height: 1920 } : { width: 1920, height: 1080 },
    };
    const data = await heygenFetch(`${BASE_V2}/video/generate`, "POST", payload);
    return Response.json(data);
  }

  // ── Check video status ──
  if (action === "check_video") {
    const { video_id } = params;
    // Try v3 first
    const v3Res = await heygenFetch(`${BASE_V3}/videos/${video_id}`);
    if (v3Res.data) return Response.json(v3Res);
    // Fallback to v1
    const v1Res = await heygenFetch(`https://api.heygen.com/v1/video_status.get?video_id=${video_id}`);
    return Response.json(v1Res);
  }

  // ── Video translate (lip-sync) ──
  if (action === "translate_video") {
    const { video_url, target_language } = params;
    const data = await heygenFetch(`${BASE_V3}/video-translates`, "POST", {
      video_url,
      target_language: target_language || "es",
    });
    return Response.json(data);
  }

  // ── List templates ──
  if (action === "list_templates") {
    const data = await heygenFetch(`${BASE_V2}/templates`);
    return Response.json(data);
  }

  // ── Generate from template ──
  if (action === "generate_from_template") {
    const { template_id, variables } = params;
    const data = await heygenFetch(`${BASE_V2}/template/${template_id}/generate`, "POST", {
      test: false,
      ...variables,
    });
    return Response.json(data);
  }

  return Response.json({ error: "Unknown action" }, { status: 400 });
});