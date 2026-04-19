import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Share2, Loader2, Calendar, MessageCircle, PenTool, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const PLATFORMS = ["Instagram", "Facebook", "LinkedIn", "TikTok", "YouTube", "X/Twitter", "Google Business"];
const ACTIONS = [
  { id: "create_post", label: "Create Post", icon: PenTool },
  { id: "respond_comments", label: "Respond to Comments", icon: MessageCircle },
  { id: "content_calendar", label: "Content Calendar", icon: Calendar },
  { id: "video_post", label: "Video Post Concept", icon: Sparkles },
];

export default function SocialMediaModule() {
  const [action, setAction] = useState("create_post");
  const [platform, setPlatform] = useState("Instagram");
  const [content, setContent] = useState("");
  const [tone, setTone] = useState("Professional");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const execute = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setResult(null);
    const res = await base44.functions.invoke("socialMediaAgent", { action, platform, content, tone });
    setResult(res.data);
    setLoading(false);
    toast({ title: "Social media content generated!" });
  };

  return (
    <div>
      <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
        <Share2 className="w-4 h-4 text-primary" /> Social Media Manager
      </h3>

      <div className="glass-card rounded-xl p-4 mb-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          {ACTIONS.map(a => {
            const Icon = a.icon;
            return (
              <button key={a.id} onClick={() => setAction(a.id)}
                className={`p-2.5 rounded-lg border text-center transition-colors ${action === a.id ? "bg-primary/10 border-primary" : "border-border"}`}>
                <Icon className={`w-4 h-4 mx-auto mb-1 ${action === a.id ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-[9px] font-medium text-foreground">{a.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mb-3">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Platform</label>
          <div className="flex gap-1.5 flex-wrap">
            {PLATFORMS.map(p => (
              <button key={p} onClick={() => setPlatform(p)}
                className={`px-2.5 py-1 rounded-full text-[10px] border ${platform === p ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border"}`}>{p}</button>
            ))}
          </div>
        </div>

        <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={3}
          placeholder={action === "respond_comments" ? "Paste comments to respond to..." : action === "content_calendar" ? "Content focus... e.g. 'Q2 push for warehouse flooring leads'" : "Post topic or content..."}
          className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground mb-3 resize-none focus:outline-none focus:border-primary" />

        <Button onClick={execute} disabled={loading || !content.trim()} className="w-full gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
          {loading ? "Generating..." : "Generate Content"}
        </Button>
      </div>

      {result && (
        <div className="glass-card rounded-xl p-4 space-y-3">
          {result.strategy_notes && <p className="text-xs text-muted-foreground">{result.strategy_notes}</p>}

          {result.posts?.length > 0 && (
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase">Posts</label>
              <div className="space-y-2 mt-1">
                {result.posts.map((p, i) => (
                  <div key={i} className="p-3 rounded-lg bg-card/50 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold text-primary">{p.platform}</span>
                      <span className="text-[10px] text-muted-foreground">{p.post_type} · {p.best_time}</span>
                    </div>
                    <p className="text-xs text-foreground whitespace-pre-wrap">{p.content}</p>
                    <p className="text-[10px] text-primary mt-1">{p.hashtags}</p>
                    {p.engagement_hook && <p className="text-[10px] text-muted-foreground mt-1 italic">{p.engagement_hook}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.responses?.length > 0 && (
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase">AI Responses</label>
              <div className="space-y-2 mt-1">
                {result.responses.map((r, i) => (
                  <div key={i} className="p-3 rounded-lg bg-card/50 border border-border">
                    <p className="text-[10px] text-muted-foreground mb-1">{r.original}</p>
                    <p className="text-xs text-foreground font-medium">→ {r.response}</p>
                    <span className="text-[9px] text-muted-foreground">{r.tone}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.calendar?.length > 0 && (
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase">7-Day Calendar</label>
              <div className="space-y-1.5 mt-1">
                {result.calendar.map((c, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-card/50 border border-border flex items-start gap-3">
                    <div className="text-center w-12 flex-shrink-0">
                      <div className="text-[10px] font-bold text-primary">{c.day}</div>
                      <div className="text-[9px] text-muted-foreground">{c.best_time}</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] font-semibold text-foreground">{c.topic}</div>
                      <div className="text-[10px] text-muted-foreground">{c.platform} · {c.post_type}</div>
                      <p className="text-[10px] text-foreground mt-0.5 line-clamp-2">{c.caption}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}