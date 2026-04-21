import { useState, useEffect } from "react";
import { Play, Loader2, Download, Copy, RefreshCw, Film, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";

export default function VideoGenerator({ selectedAvatar, voices }) {
  const [script, setScript] = useState("");
  const [voiceId, setVoiceId] = useState("");
  const [ratio, setRatio] = useState("16:9");
  const [bgColor, setBgColor] = useState("#0a0f1e");
  const [generating, setGenerating] = useState(false);
  const [videoId, setVideoId] = useState(null);
  const [videoStatus, setVideoStatus] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [useAgent, setUseAgent] = useState(false);

  const voiceList = voices?.data?.voices || voices?.data || [];
  const englishVoices = voiceList.filter(v => (v.language || "").toLowerCase().includes("en") || (v.locale || "").startsWith("en"));
  const displayVoices = englishVoices.length > 0 ? englishVoices : voiceList.slice(0, 50);

  const generate = async () => {
    if (!script.trim()) return;
    setGenerating(true);
    setVideoUrl(null);
    setVideoStatus("submitting");

    const avatarId = useAgent ? "agent" : (selectedAvatar?.avatar_id || selectedAvatar?.id || "agent");

    const res = await base44.functions.invoke("heygenAvatar", {
      action: "generate_video",
      avatar_id: avatarId,
      voice_id: voiceId || undefined,
      script: script.trim(),
      background_color: bgColor,
      ratio,
    });

    const data = res.data;
    const vid = data?.data?.video_id || data?.data?.session_id || null;
    if (vid) {
      setVideoId(vid);
      setVideoStatus("processing");
      pollStatus(vid);
    } else {
      setVideoStatus("failed");
      setGenerating(false);
    }
  };

  const pollStatus = async (vid) => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      const res = await base44.functions.invoke("heygenAvatar", { action: "check_video", video_id: vid });
      const data = res.data?.data || res.data;
      const status = data?.status;

      if (status === "completed" || status === "done") {
        clearInterval(interval);
        setVideoUrl(data.video_url || data.download_url);
        setVideoStatus("completed");
        setGenerating(false);
        // Update avatar entity
        if (selectedAvatar?.id) {
          await base44.entities.HeyGenAvatar.update(selectedAvatar.id, {
            videos_created: (selectedAvatar.videos_created || 0) + 1,
            last_video_url: data.video_url || data.download_url,
          }).catch(() => {});
        }
      } else if (status === "failed" || status === "error" || attempts > 60) {
        clearInterval(interval);
        setVideoStatus("failed");
        setGenerating(false);
      } else {
        setVideoStatus(status || "processing");
      }
    }, 10000);
  };

  return (
    <div className="glass-card rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Generate Video</h3>
        </div>
        <label className="flex items-center gap-1.5 text-[9px] text-muted-foreground cursor-pointer">
          <input type="checkbox" checked={useAgent} onChange={e => setUseAgent(e.target.checked)} className="rounded" />
          <span>AI Agent Mode (auto-picks avatar)</span>
        </label>
      </div>

      {/* Selected avatar preview */}
      {!useAgent && selectedAvatar && (
        <div className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50 border border-border/30">
          {(selectedAvatar.preview_image_url || selectedAvatar.preview_url) ? (
            <img src={selectedAvatar.preview_image_url || selectedAvatar.preview_url} className="w-10 h-10 rounded-lg object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center"><Film className="w-5 h-5 text-muted-foreground" /></div>
          )}
          <div>
            <p className="text-xs font-medium text-foreground">{selectedAvatar.avatar_name || selectedAvatar.avatar_id}</p>
            <p className="text-[9px] text-muted-foreground">{selectedAvatar.avatar_type || "Avatar"} • {selectedAvatar.gender || "—"}</p>
          </div>
        </div>
      )}

      {/* Script */}
      <Textarea value={script} onChange={e => setScript(e.target.value)} placeholder="Enter script for the avatar to speak..." rows={4} className="text-xs resize-none" />

      <div className="grid grid-cols-3 gap-2">
        {/* Voice picker */}
        <div>
          <label className="text-[9px] text-muted-foreground mb-1 block">Voice</label>
          <Select value={voiceId} onValueChange={setVoiceId}>
            <SelectTrigger className="h-8 text-[10px]"><SelectValue placeholder="Auto" /></SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="auto">Auto</SelectItem>
              {displayVoices.map(v => (
                <SelectItem key={v.voice_id} value={v.voice_id}>
                  <span className="flex items-center gap-1.5">
                    <Volume2 className="w-2.5 h-2.5" />
                    {v.display_name || v.name || v.voice_id}
                    {v.gender && <Badge className="text-[7px] px-1 py-0 ml-1">{v.gender}</Badge>}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Aspect ratio */}
        <div>
          <label className="text-[9px] text-muted-foreground mb-1 block">Ratio</label>
          <Select value={ratio} onValueChange={setRatio}>
            <SelectTrigger className="h-8 text-[10px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="16:9">16:9 Landscape</SelectItem>
              <SelectItem value="9:16">9:16 Portrait</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Background */}
        <div>
          <label className="text-[9px] text-muted-foreground mb-1 block">Background</label>
          <div className="flex items-center gap-1.5">
            <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-border/50" />
            <span className="text-[9px] text-muted-foreground">{bgColor}</span>
          </div>
        </div>
      </div>

      <Button onClick={generate} disabled={generating || !script.trim()} className="w-full metallic-gold-bg text-background font-bold">
        {generating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
        {generating ? `${videoStatus || "Processing"}...` : "Generate Video"}
      </Button>

      {/* Video result */}
      {videoUrl && (
        <div className="rounded-xl overflow-hidden border border-primary/30 bg-black">
          <video src={videoUrl} controls className="w-full max-h-[300px]" />
          <div className="flex items-center gap-2 p-2 bg-secondary/50">
            <a href={videoUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="h-7 text-[10px]"><Download className="w-3 h-3 mr-1" /> Download</Button>
            </a>
            <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => navigator.clipboard.writeText(videoUrl)}>
              <Copy className="w-3 h-3 mr-1" /> Copy URL
            </Button>
            <Badge className="ml-auto text-[8px] bg-green-500/10 text-green-400">Completed</Badge>
          </div>
        </div>
      )}
      {videoStatus === "failed" && !generating && (
        <div className="text-center py-4">
          <p className="text-xs text-destructive">Video generation failed. Try again.</p>
          <Button size="sm" variant="outline" className="mt-2 text-[10px]" onClick={() => { setVideoStatus(null); setVideoId(null); }}>
            <RefreshCw className="w-3 h-3 mr-1" /> Retry
          </Button>
        </div>
      )}
    </div>
  );
}