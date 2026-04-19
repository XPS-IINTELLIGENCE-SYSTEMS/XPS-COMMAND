import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Share2, Loader2, Calendar, PenTool, Sparkles, Image, Copy, Save, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

const PLATFORMS = ["Instagram", "Facebook", "LinkedIn", "TikTok", "YouTube", "X/Twitter"];
const CONTENT_TYPES = [
  { id: "post_bundle", label: "Post Bundle", desc: "3 post variants" },
  { id: "calendar", label: "Content Calendar", desc: "7-day plan" },
  { id: "viral_hook", label: "Viral Hooks", desc: "3 viral concepts" },
  { id: "campaign", label: "Full Campaign", desc: "Multi-platform campaign" },
];

export default function SocialFactory() {
  const [contentType, setContentType] = useState("post_bundle");
  const [platform, setPlatform] = useState("Instagram");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [images, setImages] = useState([]);
  const [imgLoading, setImgLoading] = useState(false);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setResult(null);

    let prompt = `You are a top social media strategist for Xtreme Polishing Systems (XPS) — premium commercial flooring.
Platform: ${platform} | Topic: ${topic}\n\n`;

    let schema = {};

    if (contentType === "post_bundle") {
      prompt += "Create 3 completely different social media post variants. Each must be unique in approach: 1) Educational 2) Emotional/storytelling 3) Viral/trendy. Include hashtags, best posting time, engagement hooks, and image directions.";
      schema = { type: "object", properties: {
        posts: { type: "array", items: { type: "object", properties: { title: { type: "string" }, approach: { type: "string" }, content: { type: "string" }, hashtags: { type: "string" }, best_time: { type: "string" }, engagement_hook: { type: "string" }, image_direction: { type: "string" } } } },
        strategy_tip: { type: "string" }
      }};
    } else if (contentType === "calendar") {
      prompt += "Create a 7-day content calendar with daily posts. Include post type, caption, hashtags, best time, and content direction for each day. Make it varied and engaging.";
      schema = { type: "object", properties: {
        calendar: { type: "array", items: { type: "object", properties: { day: { type: "string" }, post_type: { type: "string" }, topic: { type: "string" }, caption: { type: "string" }, hashtags: { type: "string" }, best_time: { type: "string" }, content_direction: { type: "string" } } } },
        weekly_strategy: { type: "string" }
      }};
    } else if (contentType === "viral_hook") {
      prompt += "Create 3 viral hook concepts that could go viral. Include the hook text, visual concept, trending sound/format suggestion, expected reach, and engagement strategy.";
      schema = { type: "object", properties: {
        hooks: { type: "array", items: { type: "object", properties: { hook_text: { type: "string" }, visual_concept: { type: "string" }, trending_reference: { type: "string" }, expected_impact: { type: "string" }, engagement_strategy: { type: "string" } } } }
      }};
    } else {
      prompt += "Create a comprehensive multi-platform campaign with posts optimized for Instagram, Facebook, LinkedIn, and TikTok. Include campaign theme, 3 key messages, post content for each platform, visual direction, and metrics to track.";
      schema = { type: "object", properties: {
        campaign_name: { type: "string" }, theme: { type: "string" },
        key_messages: { type: "array", items: { type: "string" } },
        platform_posts: { type: "array", items: { type: "object", properties: { platform: { type: "string" }, content: { type: "string" }, hashtags: { type: "string" }, visual_direction: { type: "string" }, post_type: { type: "string" } } } },
        metrics_to_track: { type: "array", items: { type: "string" } },
        budget_recommendation: { type: "string" }
      }};
    }

    const res = await base44.integrations.Core.InvokeLLM({ prompt, response_json_schema: schema });
    setResult(res);
    setLoading(false);
    toast({ title: "Content generated!" });
  };

  const generatePostImage = async (direction) => {
    setImgLoading(true);
    const promises = [1, 2, 3].map(async (v) => {
      const res = await base44.integrations.Core.GenerateImage({
        prompt: `Social media post graphic variant ${v} for ${platform}. ${direction}. Brand: XPS (Xtreme Polishing Systems). Colors: gold #D4AF37, black #0A0A0F. ${v === 1 ? "Bold text overlay design" : v === 2 ? "Photo-centric with subtle branding" : "Carousel/infographic style"}. Professional, eye-catching, ${platform}-optimized.`
      });
      return { url: res.url, variant: v };
    });
    setImages(await Promise.all(promises));
    setImgLoading(false);
    toast({ title: "3 post images generated!" });
  };

  const copyText = (text) => { navigator.clipboard.writeText(text); toast({ title: "Copied!" }); };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Share2 className="w-5 h-5 text-primary" />
        <h2 className="text-base font-bold text-foreground">Social Content Factory</h2>
      </div>

      {/* Content type */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {CONTENT_TYPES.map(t => (
          <button key={t.id} onClick={() => setContentType(t.id)}
            className={`p-2.5 rounded-xl border text-center transition-all ${contentType === t.id ? "border-primary bg-primary/10" : "border-border"}`}>
            <span className="text-xs font-medium text-foreground block">{t.label}</span>
            <span className="text-[9px] text-muted-foreground">{t.desc}</span>
          </button>
        ))}
      </div>

      <div className="glass-card rounded-xl p-4 space-y-3">
        <div className="flex gap-1.5 flex-wrap">
          {PLATFORMS.map(p => (
            <button key={p} onClick={() => setPlatform(p)}
              className={`px-2.5 py-1 rounded-full text-[10px] border ${platform === p ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border"}`}>{p}</button>
          ))}
        </div>
        <Input value={topic} onChange={e => setTopic(e.target.value)}
          placeholder="Content topic... e.g. 'Metallic epoxy transformations in luxury car dealerships'" className="text-sm" />
        <Button onClick={generate} disabled={loading || !topic.trim()} className="w-full gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Generate Content
        </Button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-3">
          {/* Post bundle */}
          {result.posts?.map((p, i) => (
            <div key={i} className="glass-card rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-bold">V{i + 1}: {p.approach}</span>
                <div className="flex gap-1">
                  <button onClick={() => copyText(p.content)} className="p-1 rounded hover:bg-white/10"><Copy className="w-3 h-3 text-muted-foreground" /></button>
                  <button onClick={() => generatePostImage(p.image_direction)} className="p-1 rounded hover:bg-white/10"><Image className="w-3 h-3 text-muted-foreground" /></button>
                </div>
              </div>
              <p className="text-xs text-foreground whitespace-pre-wrap">{p.content}</p>
              <p className="text-[10px] text-primary">{p.hashtags}</p>
              <div className="flex gap-3 text-[9px] text-muted-foreground">
                <span>Best: {p.best_time}</span>
                <span>Hook: {p.engagement_hook}</span>
              </div>
            </div>
          ))}

          {/* Calendar */}
          {result.calendar?.map((c, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-xl bg-card/50 border border-border">
              <div className="text-center w-14 flex-shrink-0">
                <div className="text-[10px] font-bold text-primary">{c.day}</div>
                <div className="text-[9px] text-muted-foreground">{c.best_time}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-semibold text-foreground">{c.topic}</div>
                <div className="text-[9px] text-muted-foreground">{c.post_type}</div>
                <p className="text-[10px] text-foreground mt-0.5 line-clamp-2">{c.caption}</p>
              </div>
              <button onClick={() => copyText(c.caption)} className="p-1 self-start"><Copy className="w-3 h-3 text-muted-foreground" /></button>
            </div>
          ))}

          {/* Viral hooks */}
          {result.hooks?.map((h, i) => (
            <div key={i} className="glass-card rounded-xl p-4 space-y-2">
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 font-bold">VIRAL {i + 1}</span>
              <p className="text-sm font-bold text-foreground">{h.hook_text}</p>
              <p className="text-xs text-muted-foreground">{h.visual_concept}</p>
              <p className="text-[10px] text-primary">Trending: {h.trending_reference}</p>
              <p className="text-[10px] text-muted-foreground">{h.engagement_strategy}</p>
            </div>
          ))}

          {/* Campaign */}
          {result.campaign_name && (
            <div className="glass-card rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-foreground">{result.campaign_name}</h3>
              <p className="text-xs text-muted-foreground">{result.theme}</p>
              {result.platform_posts?.map((p, i) => (
                <div key={i} className="p-3 rounded-lg bg-card/50 border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-primary">{p.platform}</span>
                    <span className="text-[9px] text-muted-foreground">{p.post_type}</span>
                  </div>
                  <p className="text-xs text-foreground">{p.content}</p>
                  <p className="text-[10px] text-primary mt-1">{p.hashtags}</p>
                </div>
              ))}
            </div>
          )}

          {result.strategy_tip && <p className="text-xs text-primary/70 italic p-3 rounded-lg bg-primary/5">{result.strategy_tip}</p>}
        </div>
      )}

      {/* Generated images */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, i) => (
            <div key={i} className="rounded-xl overflow-hidden border border-border group relative">
              <img src={img.url} alt={`Post ${i + 1}`} className="w-full aspect-square object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                <a href={img.url} download target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/20"><Image className="w-4 h-4 text-white" /></a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}