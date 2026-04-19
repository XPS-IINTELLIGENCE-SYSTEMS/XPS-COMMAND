import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { asset_type, prompt, style, brand_colors, dimensions } = await req.json();

  const styleGuide = `
BRAND: Xtreme Polishing Systems (XPS) / National Concrete Polishing (NCP)
COLORS: ${brand_colors || "Gold (#D4AF37), Black (#0A0A0F), Silver (#C0C0C0), White"}
STYLE: ${style || "Premium industrial, clean, modern, professional"}
DIMENSIONS: ${dimensions || "1080x1080"}`;

  let imagePrompt = "";

  switch (asset_type) {
    case "logo":
      imagePrompt = `Professional logo design. ${prompt}. ${styleGuide}. Clean vector-style, scalable, iconic mark. White background.`;
      break;
    case "social_post":
      imagePrompt = `Social media graphic post. ${prompt}. ${styleGuide}. Eye-catching, bold typography overlay space, modern layout.`;
      break;
    case "banner":
      imagePrompt = `Professional web banner or cover image. ${prompt}. ${styleGuide}. Wide format, impactful imagery.`;
      break;
    case "product_shot":
      imagePrompt = `Professional product photography style. ${prompt}. ${styleGuide}. Studio lighting, clean background, commercial quality.`;
      break;
    case "before_after":
      imagePrompt = `Before and after comparison image for flooring project. ${prompt}. ${styleGuide}. Split view, dramatic transformation.`;
      break;
    case "ad_creative":
      imagePrompt = `Digital advertisement creative. ${prompt}. ${styleGuide}. Call-to-action space, conversion-optimized layout.`;
      break;
    case "thumbnail":
      imagePrompt = `YouTube/video thumbnail. ${prompt}. ${styleGuide}. Bold, high contrast, face-forward if applicable, large text overlay space.`;
      break;
    default:
      imagePrompt = `${prompt}. ${styleGuide}. High quality, professional.`;
  }

  const result = await base44.asServiceRole.integrations.Core.GenerateImage({ prompt: imagePrompt });

  return Response.json({
    success: true,
    image_url: result.url,
    asset_type,
    prompt: imagePrompt
  });
});