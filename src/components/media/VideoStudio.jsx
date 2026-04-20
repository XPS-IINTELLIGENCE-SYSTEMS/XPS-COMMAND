import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Video, Loader2, Film, Play, Clock, Sparkles, Copy, Download, Save, Pencil, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import VideoSceneVisualizer from "./VideoSceneVisualizer";

const VIDEO_TYPES = ["Promotional", "Tutorial", "Before/After", "Product Demo", "Testimonial", "Ad Spot", "Social Reel", "Training", "YouTube Long-Form"];
const PLATFORMS = ["YouTube", "Instagram Reels", "TikTok", "Facebook", "LinkedIn", "YouTube Shorts"];
const TONES = ["Professional", "Energetic", "Educational", "Inspirational", "Casual", "Authoritative", "Viral/Trendy"];

export default function VideoStudio() {
  const [topic, setTopic] = useState("");
  const [videoType, setVideoType] = useState("Promotional");
  const [platform, setPlatform] = useState("YouTube");
  const [tone, setTone] = useState("Professional");
  const [duration, setDuration] = useState(60);
  const [loading, setLoading] = useState(false);
  const [scripts, setScripts] = useState([]);
  const [selectedScript, setSelectedScript] = useState(null);
  const [thumbnails, setThumbnails] = useState([]);
  const [thumbLoading, setThumbLoading] = useState(false);
  const [editPrompt, setEditPrompt] = useState("");

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setScripts([]);
    setThumbnails([]);

    // Generate 3 script variants
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an elite video content creator for Xtreme Polishing Systems (XPS), a premium commercial flooring company.

TOPIC: ${topic}
TYPE: ${videoType} | PLATFORM: ${platform} | TONE: ${tone} | DURATION: ${duration}s

Create 3 COMPLETELY DIFFERENT video script variants. Each should be unique in approach:
Variant 1: Direct/informational approach
Variant 2: Storytelling/emotional approach  
Variant 3: Viral/creative/unexpected approach

For EACH variant include:
- Catchy title optimized for ${platform}
- Hook (first 3 seconds)
- Full script with scene directions
- Scene-by-scene breakdown (visual + narration + text overlays)
- Thumbnail concept description
- Caption & hashtags
- CTA
- Estimated production difficulty (easy/medium/hard)
- Trending elements to include
- SEO tags for discoverability`,
      response_json_schema: {
        type: "object",
        properties: {
          variants: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                hook: { type: "string" },
                script: { type: "string" },
                scenes: { type: "array", items: { type: "object", properties: { scene_number: { type: "number" }, duration: { type: "string" }, visual: { type: "string" }, narration: { type: "string" }, text_overlay: { type: "string" }, transition: { type: "string" } } } },
                thumbnail_concept: { type: "string" },
                caption: { type: "string" },
                hashtags: { type: "string" },
                cta: { type: "string" },
                difficulty: { type: "string" },
                trending_elements: { type: "array", items: { type: "string" } },
                seo_tags: { type: "array", items: { type: "string" } },
                approach: { type: "string" }
              }
            }
          },
          ai_recommendations: { type: "string" }
        }
      }
    });
    setScripts(res.variants || []);
    setLoading(false);
    toast({ title: "3 video concepts generated!" });
  };

  const generateThumbnails = async (concept) => {
    setThumbLoading(true);
    const promises = [1, 2, 3].map(async (v) => {
      const res = await base44.integrations.Core.GenerateImage({
        prompt: `YouTube thumbnail design variant ${v}. ${concept}. For: Xtreme Polishing Systems. ${v === 1 ? "Bold text, face forward, bright" : v === 2 ? "Dramatic before/after split" : "Clean professional with gold accents"}. High contrast, click-worthy, 16:9 ratio.`
      });
      return { url: res.url, variant: v };
    });
    setThumbnails(await Promise.all(promises));
    setThumbLoading(false);
    toast({ title: "3 thumbnails generated!" });
  };

  const editScript = async (script) => {
    if (!editPrompt.trim()) return;
    setLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Edit this video script based on the user's request.
CURRENT SCRIPT: ${JSON.stringify(script)}
USER REQUEST: ${editPrompt}
Return the full updated script in the same format.`,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" }, hook: { type: "string" }, script: { type: "string" },
          scenes: { type: "array", items: { type: "object", properties: { scene_number: { type: "number" }, duration: { type: "string" }, visual: { type: "string" }, narration: { type: "string" }, text_overlay: { type: "string" } } } },
          thumbnail_concept: { type: "string" }, caption: { type: "string" }, hashtags: { type: "string" }, cta: { type: "string" }
        }
      }
    });
    const updated = scripts.map((s, i) => i === selectedScript ? { ...s, ...res } : s);
    setScripts(updated);
    setEditPrompt("");
    setLoading(false);
    toast({ title: "Script updated!" });
  };

  const saveScript = async (script) => {
    await base44.entities.MediaProject.create({
      name: `Video: ${script.title}`,
      project_type: "Video Project",
      client_name: "XPS",
      assets: JSON.stringify([
        { type: "video_script", name: script.title, category: "Video", metadata: JSON.stringify(script) },
        ...thumbnails.map(t => ({ type: "thumbnail", url: t.url, name: `Thumbnail ${t.variant}`, category: "Video" }))
      ]),
      status: "Draft"
    });
    toast({ title: "Video project saved!" });
  };

  const copyScript = (text) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Video className="w-5 h-5 text-primary" />
        <h2 className="text-base font-bold text-foreground">AI Video Studio</h2>
      </div>

      {/* Config */}
      <div className="glass-card rounded-xl p-4 space-y-3">
        <Input value={topic} onChange={e => setTopic(e.target.value)}
          placeholder="Video topic... e.g. '5 Reasons Metallic Epoxy Beats Tile in Restaurant Flooring'" className="text-sm" />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Type</label>
            <div className="flex gap-1 flex-wrap">
              {VIDEO_TYPES.map(t => (
                <button key={t} onClick={() => setVideoType(t)}
                  className={`px-2 py-0.5 rounded text-[10px] border ${videoType === t ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border"}`}>{t}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Platform</label>
            <div className="flex gap-1 flex-wrap">
              {PLATFORMS.map(p => (
                <button key={p} onClick={() => setPlatform(p)}
                  className={`px-2 py-0.5 rounded text-[10px] border ${platform === p ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border"}`}>{p}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Tone</label>
            <div className="flex gap-1 flex-wrap">
              {TONES.map(t => (
                <button key={t} onClick={() => setTone(t)}
                  className={`px-2 py-0.5 rounded text-[10px] border ${tone === t ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border"}`}>{t}</button>
              ))}
            </div>
          </div>
          <div className="flex-shrink-0">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Duration</label>
            <div className="flex items-center gap-2">
              <input type="range" min={15} max={600} value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-20" />
              <span className="text-xs text-foreground font-medium w-8">{duration}s</span>
            </div>
          </div>
        </div>

        <Button onClick={generate} disabled={loading} className="w-full gap-2 h-11">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Film className="w-4 h-4" />}
          {loading ? "Creating 3 video concepts..." : "Generate 3 Video Concepts"}
        </Button>
      </div>

      {/* 3 Script variants */}
      {scripts.length > 0 && (
        <div className="space-y-3">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase">Choose Your Concept (3 variants)</label>
          {scripts.map((s, i) => (
            <div key={i} className={`glass-card rounded-xl p-4 space-y-3 cursor-pointer transition-all ${selectedScript === i ? "ring-2 ring-primary" : ""}`}
              onClick={() => setSelectedScript(i)}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-bold">V{i + 1}</span>
                    <h4 className="text-sm font-bold text-foreground">{s.title}</h4>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{s.approach}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={(e) => { e.stopPropagation(); copyScript(s.script); }} className="p-1.5 rounded hover:bg-white/10"><Copy className="w-3 h-3 text-muted-foreground" /></button>
                  <button onClick={(e) => { e.stopPropagation(); saveScript(s); }} className="p-1.5 rounded hover:bg-white/10"><Save className="w-3 h-3 text-muted-foreground" /></button>
                </div>
              </div>

              {s.hook && <p className="text-xs text-primary italic">Hook: "{s.hook}"</p>}

              {selectedScript === i && (
                <>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Full Script</label>
                    <div className="p-3 rounded-lg bg-card border border-border text-xs text-foreground whitespace-pre-wrap mt-1 max-h-40 overflow-y-auto">{s.script}</div>
                  </div>

                  {s.scenes?.length > 0 && (
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase">Scenes</label>
                      <div className="space-y-1 mt-1 max-h-48 overflow-y-auto">
                        {s.scenes.map((sc, j) => (
                          <div key={j} className="p-2 rounded-lg bg-card/50 border border-border">
                            <div className="flex items-center gap-2 mb-0.5">
                              <Play className="w-3 h-3 text-primary" />
                              <span className="text-[10px] font-bold text-foreground">Scene {sc.scene_number}</span>
                              <span className="text-[9px] text-muted-foreground">{sc.duration}</span>
                            </div>
                            <p className="text-[10px] text-foreground">{sc.visual}</p>
                            {sc.narration && <p className="text-[10px] text-muted-foreground italic mt-0.5">"{sc.narration}"</p>}
                            {sc.text_overlay && <p className="text-[9px] text-primary mt-0.5">📝 {sc.text_overlay}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-muted-foreground text-[10px]">CTA:</span> <span className="text-foreground">{s.cta}</span></div>
                    <div><span className="text-muted-foreground text-[10px]">Difficulty:</span> <span className="text-foreground">{s.difficulty}</span></div>
                  </div>

                  {s.trending_elements?.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {s.trending_elements.map((t, j) => (
                        <span key={j} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px]">{t}</span>
                      ))}
                    </div>
                  )}

                  <p className="text-[10px] text-primary">{s.hashtags}</p>

                  {/* Scene visualizer */}
                  {s.scenes?.length > 0 && (
                    <VideoSceneVisualizer scenes={s.scenes} title={s.title} />
                  )}

                  {/* Thumbnail generator */}
                  <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); generateThumbnails(s.thumbnail_concept); }}
                    disabled={thumbLoading} className="gap-1">
                    {thumbLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Image className="w-3 h-3" />}
                    Generate 3 Thumbnails
                  </Button>
                </>
              )}
            </div>
          ))}

          {/* Thumbnails */}
          {thumbnails.length > 0 && (
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-2 block">Thumbnails</label>
              <div className="grid grid-cols-3 gap-2">
                {thumbnails.map((t, i) => (
                  <div key={i} className="rounded-xl overflow-hidden border border-border group relative">
                    <img src={t.url} alt={`Thumb ${i + 1}`} className="w-full aspect-video object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                      <a href={t.url} download target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/20"><Download className="w-4 h-4 text-white" /></a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NL script editor */}
          {selectedScript !== null && (
            <div className="flex gap-2">
              <Input value={editPrompt} onChange={e => setEditPrompt(e.target.value)}
                placeholder="Edit script with AI... e.g. 'Make it more energetic, add humor, shorten to 30s'"
                className="text-xs" onKeyDown={e => e.key === 'Enter' && editScript(scripts[selectedScript])} />
              <Button size="sm" onClick={() => editScript(scripts[selectedScript])} disabled={loading || !editPrompt.trim()} className="gap-1 flex-shrink-0">
                <Pencil className="w-3 h-3" /> Edit
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}