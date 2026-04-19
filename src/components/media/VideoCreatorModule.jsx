import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Video, Loader2, Film, Mic, Clock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const VIDEO_TYPES = ["Promotional", "Tutorial", "Before/After", "Product Demo", "Testimonial", "Ad Spot", "Social Reel", "Training"];
const PLATFORMS = ["YouTube", "Instagram Reels", "TikTok", "Facebook", "LinkedIn"];
const TONES = ["Professional", "Energetic", "Educational", "Inspirational", "Casual", "Authoritative"];

export default function VideoCreatorModule() {
  const [topic, setTopic] = useState("");
  const [videoType, setVideoType] = useState("Promotional");
  const [platform, setPlatform] = useState("YouTube");
  const [tone, setTone] = useState("Professional");
  const [duration, setDuration] = useState(60);
  const [includeVO, setIncludeVO] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setResult(null);
    const res = await base44.functions.invoke("aiVideoScript", {
      video_type: videoType.toLowerCase(), topic, duration_seconds: duration, tone, platform, include_voiceover: includeVO
    });
    setResult(res.data?.video);
    setLoading(false);
    toast({ title: "Video script generated!" });
  };

  return (
    <div>
      <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
        <Video className="w-4 h-4 text-primary" /> AI Video Creator
      </h3>

      <div className="glass-card rounded-xl p-4 mb-4">
        <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Video topic... e.g. '5 Reasons to Choose Metallic Epoxy for Your Showroom'"
          className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground mb-3 focus:outline-none focus:border-primary" />

        <div className="grid grid-cols-2 gap-3 mb-3">
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

        <div className="flex gap-3 mb-3 items-end">
          <div>
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
              <input type="range" min={15} max={300} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-24" />
              <span className="text-xs text-foreground font-medium">{duration}s</span>
            </div>
          </div>
        </div>

        <label className="flex items-center gap-2 mb-3 cursor-pointer">
          <input type="checkbox" checked={includeVO} onChange={(e) => setIncludeVO(e.target.checked)} className="rounded" />
          <span className="text-xs text-foreground"><Mic className="w-3 h-3 inline mr-1" />Include AI Voiceover Directions</span>
        </label>

        <Button onClick={generate} disabled={loading || !topic.trim()} className="w-full gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Film className="w-4 h-4" />}
          {loading ? "Creating video package..." : "Generate Video Script"}
        </Button>
      </div>

      {result && (
        <div className="glass-card rounded-xl p-4 space-y-4">
          <div>
            <h4 className="text-sm font-bold text-foreground mb-1">{result.title}</h4>
            <div className="flex gap-3 text-[10px] text-muted-foreground">
              <span><Clock className="w-3 h-3 inline" /> {duration}s</span>
              <span>{platform}</span>
              <span>{result.estimated_production_time}</span>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Script</label>
            <div className="p-3 rounded-lg bg-card border border-border text-xs text-foreground whitespace-pre-wrap mt-1 max-h-40 overflow-y-auto">{result.script}</div>
          </div>

          {result.scenes?.length > 0 && (
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase">Scene Breakdown</label>
              <div className="space-y-1.5 mt-1">
                {result.scenes.map((s, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-card/50 border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Play className="w-3 h-3 text-primary" />
                      <span className="text-[10px] font-bold text-foreground">Scene {s.scene_number}</span>
                      <span className="text-[10px] text-muted-foreground">{s.duration}</span>
                    </div>
                    <p className="text-[11px] text-foreground">{s.visual}</p>
                    {s.narration && <p className="text-[10px] text-muted-foreground mt-1 italic">"{s.narration}"</p>}
                    {s.text_overlay && <p className="text-[10px] text-primary mt-0.5">📝 {s.text_overlay}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.voiceover_directions && (
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase">🎙️ Voiceover Directions</label>
              <p className="text-xs text-foreground mt-1">{result.voiceover_directions}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase">Thumbnail Concept</label>
              <p className="text-xs text-foreground mt-1">{result.thumbnail_concept}</p>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase">CTA</label>
              <p className="text-xs text-foreground mt-1">{result.cta}</p>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Caption & Hashtags</label>
            <p className="text-xs text-foreground mt-1">{result.caption}</p>
            <p className="text-xs text-primary mt-1">{result.hashtags}</p>
          </div>
        </div>
      )}
    </div>
  );
}