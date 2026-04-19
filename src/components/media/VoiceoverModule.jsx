import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Mic, Loader2, Volume2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const VOICE_STYLES = ["Professional Narrator", "Energetic Host", "Calm Explainer", "Authoritative Expert", "Friendly Advisor", "Dramatic Announcer"];
const ACCENTS = ["Neutral American", "Southern", "New York", "British", "Australian"];

export default function VoiceoverModule() {
  const [script, setScript] = useState("");
  const [voiceStyle, setVoiceStyle] = useState("Professional Narrator");
  const [accent, setAccent] = useState("Neutral American");
  const [pace, setPace] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const generate = async () => {
    if (!script.trim()) return;
    setLoading(true);
    setResult(null);

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an AI voiceover director for Xtreme Polishing Systems.

SCRIPT TO DIRECT:
"${script}"

VOICE STYLE: ${voiceStyle}
ACCENT: ${accent}
PACE: ${pace}

Create a complete voiceover direction package:
1. ANNOTATED SCRIPT — Mark emphasis (CAPS), pauses (...), speed changes [slow]/[fast], emotional shifts
2. PRONUNCIATION GUIDE — Any industry terms that need specific pronunciation
3. BREATHING MARKS — Where to take natural breaths
4. EMOTIONAL ARC — How the energy/emotion should flow through the script
5. TIMING — Estimated read time at the specified pace
6. MUSIC CUES — Where background music should swell, fade, or change
7. SFX SUGGESTIONS — Sound effects that would enhance the narration
8. ALTERNATIVE TAKES — 2 alternative readings with different interpretations
9. TELEPROMPTER VERSION — Clean version for reading aloud`,
      response_json_schema: {
        type: "object",
        properties: {
          annotated_script: { type: "string" },
          pronunciation_guide: { type: "array", items: { type: "object", properties: { word: { type: "string" }, pronunciation: { type: "string" } } } },
          emotional_arc: { type: "string" },
          estimated_time_seconds: { type: "number" },
          music_cues: { type: "string" },
          sfx_suggestions: { type: "array", items: { type: "string" } },
          alternative_take_1: { type: "string" },
          alternative_take_2: { type: "string" },
          teleprompter_version: { type: "string" },
          director_notes: { type: "string" }
        }
      }
    });
    setResult(res);
    setLoading(false);
    toast({ title: "Voiceover direction generated!" });
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  return (
    <div>
      <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
        <Mic className="w-4 h-4 text-primary" /> AI Voiceover Creator
      </h3>

      <div className="glass-card rounded-xl p-4 mb-4">
        <textarea value={script} onChange={(e) => setScript(e.target.value)} rows={4}
          placeholder="Paste or write your script here..."
          className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground mb-3 resize-none focus:outline-none focus:border-primary" />

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Voice Style</label>
            <div className="flex gap-1 flex-wrap">
              {VOICE_STYLES.map(v => (
                <button key={v} onClick={() => setVoiceStyle(v)}
                  className={`px-2 py-0.5 rounded text-[10px] border ${voiceStyle === v ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border"}`}>{v}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Accent</label>
            <div className="flex gap-1 flex-wrap">
              {ACCENTS.map(a => (
                <button key={a} onClick={() => setAccent(a)}
                  className={`px-2 py-0.5 rounded text-[10px] border ${accent === a ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border"}`}>{a}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-3">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Pace</label>
          <div className="flex gap-2">
            {["slow", "medium", "fast"].map(p => (
              <button key={p} onClick={() => setPace(p)}
                className={`px-3 py-1 rounded text-[10px] border ${pace === p ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border"}`}>{p}</button>
            ))}
          </div>
        </div>

        <Button onClick={generate} disabled={loading || !script.trim()} className="w-full gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
          {loading ? "Directing voiceover..." : "Generate Voiceover Direction"}
        </Button>
      </div>

      {result && (
        <div className="glass-card rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">Voiceover Package</span>
            <span className="text-[10px] text-muted-foreground">~{result.estimated_time_seconds}s read time</span>
          </div>

          <Section label="Annotated Script" text={result.annotated_script} onCopy={copyText} />
          <Section label="Teleprompter Version" text={result.teleprompter_version} onCopy={copyText} />
          <Section label="Emotional Arc" text={result.emotional_arc} />
          <Section label="Music Cues" text={result.music_cues} />

          {result.pronunciation_guide?.length > 0 && (
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase">Pronunciation Guide</label>
              <div className="flex gap-2 flex-wrap mt-1">
                {result.pronunciation_guide.map((p, i) => (
                  <span key={i} className="px-2 py-1 rounded bg-card border border-border text-[10px]">
                    <span className="text-foreground font-bold">{p.word}</span> → <span className="text-primary">{p.pronunciation}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          <Section label="Alt Take 1" text={result.alternative_take_1} onCopy={copyText} />
          <Section label="Alt Take 2" text={result.alternative_take_2} onCopy={copyText} />
          {result.director_notes && <Section label="Director Notes" text={result.director_notes} />}
        </div>
      )}
    </div>
  );
}

function Section({ label, text, onCopy }) {
  if (!text) return null;
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase">{label}</label>
        {onCopy && (
          <button onClick={() => onCopy(text)} className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
            <Copy className="w-3 h-3" /> Copy
          </button>
        )}
      </div>
      <div className="p-2.5 rounded-lg bg-card/50 border border-border text-xs text-foreground whitespace-pre-wrap mt-1 max-h-32 overflow-y-auto">{text}</div>
    </div>
  );
}