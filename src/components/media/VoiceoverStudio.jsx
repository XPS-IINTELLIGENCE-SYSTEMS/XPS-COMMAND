import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Mic, Loader2, Volume2, Copy, Sparkles, FileText, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

const VOICE_STYLES = ["Professional Narrator", "Energetic Host", "Calm Explainer", "Authoritative Expert", "Friendly Advisor", "Dramatic Announcer"];
const ACCENTS = ["Neutral American", "Southern", "New York", "British", "Australian"];
const SCRIPT_TYPES = ["Video Narration", "Radio/Podcast Ad", "Phone IVR", "Sales Pitch", "Training Explainer", "Social Media"];

export default function VoiceoverStudio() {
  const [mode, setMode] = useState("script"); // script or voiceover
  const [scriptTopic, setScriptTopic] = useState("");
  const [scriptType, setScriptType] = useState("Video Narration");
  const [script, setScript] = useState("");
  const [voiceStyle, setVoiceStyle] = useState("Professional Narrator");
  const [accent, setAccent] = useState("Neutral American");
  const [pace, setPace] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [scriptResults, setScriptResults] = useState([]);
  const [voResult, setVoResult] = useState(null);

  const generateScripts = async () => {
    if (!scriptTopic.trim()) return;
    setLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Create 3 different ${scriptType} scripts for Xtreme Polishing Systems (XPS).
Topic: ${scriptTopic}
Company: Premium commercial & industrial flooring — epoxy, polished concrete, metallic epoxy, polyaspartic.

Variant 1: Informational/educational
Variant 2: Emotional/storytelling  
Variant 3: High-energy/bold

Each script should be ready to read aloud, with natural speech patterns.`,
      response_json_schema: {
        type: "object",
        properties: {
          scripts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                approach: { type: "string" },
                script_text: { type: "string" },
                word_count: { type: "number" },
                estimated_seconds: { type: "number" },
                best_for: { type: "string" }
              }
            }
          }
        }
      }
    });
    setScriptResults(res.scripts || []);
    setLoading(false);
    toast({ title: "3 script variants generated!" });
  };

  const generateVoiceover = async () => {
    if (!script.trim()) return;
    setLoading(true);
    setVoResult(null);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an AI voiceover director for Xtreme Polishing Systems.
SCRIPT: "${script}"
VOICE STYLE: ${voiceStyle} | ACCENT: ${accent} | PACE: ${pace}

Create a complete voiceover direction package:
1. ANNOTATED SCRIPT — Mark emphasis (CAPS), pauses (...), speed changes [slow]/[fast]
2. PRONUNCIATION GUIDE for industry terms
3. EMOTIONAL ARC
4. TIMING estimate
5. MUSIC CUES
6. SFX SUGGESTIONS
7. 2 ALTERNATIVE TAKES with different interpretations
8. TELEPROMPTER VERSION`,
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
    setVoResult(res);
    setLoading(false);
    toast({ title: "Voiceover direction complete!" });
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Mic className="w-5 h-5 text-primary" />
        <h2 className="text-base font-bold text-foreground">Voice & Script Studio</h2>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2">
        <button onClick={() => setMode("script")}
          className={`flex-1 p-3 rounded-xl border text-center transition-all ${mode === "script" ? "border-primary bg-primary/10" : "border-border"}`}>
          <FileText className={`w-4 h-4 mx-auto mb-1 ${mode === "script" ? "text-primary" : "text-muted-foreground"}`} />
          <span className="text-xs font-medium text-foreground">Script Writer</span>
          <p className="text-[9px] text-muted-foreground">AI writes 3 scripts</p>
        </button>
        <button onClick={() => setMode("voiceover")}
          className={`flex-1 p-3 rounded-xl border text-center transition-all ${mode === "voiceover" ? "border-primary bg-primary/10" : "border-border"}`}>
          <Volume2 className={`w-4 h-4 mx-auto mb-1 ${mode === "voiceover" ? "text-primary" : "text-muted-foreground"}`} />
          <span className="text-xs font-medium text-foreground">Voiceover Director</span>
          <p className="text-[9px] text-muted-foreground">Direction & annotation</p>
        </button>
      </div>

      {mode === "script" ? (
        <div className="glass-card rounded-xl p-4 space-y-3">
          <Input value={scriptTopic} onChange={e => setScriptTopic(e.target.value)}
            placeholder="Script topic... e.g. 'Why epoxy flooring lasts 20+ years'" className="text-sm" />
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Script Type</label>
            <div className="flex gap-1 flex-wrap">
              {SCRIPT_TYPES.map(t => (
                <button key={t} onClick={() => setScriptType(t)}
                  className={`px-2 py-0.5 rounded text-[10px] border ${scriptType === t ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border"}`}>{t}</button>
              ))}
            </div>
          </div>
          <Button onClick={generateScripts} disabled={loading || !scriptTopic.trim()} className="w-full gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PenTool className="w-4 h-4" />}
            Generate 3 Scripts
          </Button>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-4 space-y-3">
          <textarea value={script} onChange={e => setScript(e.target.value)} rows={4}
            placeholder="Paste or write your script..."
            className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground resize-none focus:outline-none focus:border-primary" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Voice</label>
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
          <div className="flex gap-2">
            {["slow", "medium", "fast"].map(p => (
              <button key={p} onClick={() => setPace(p)}
                className={`px-3 py-1 rounded text-[10px] border ${pace === p ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border"}`}>{p}</button>
            ))}
          </div>
          <Button onClick={generateVoiceover} disabled={loading || !script.trim()} className="w-full gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
            Generate Voiceover Direction
          </Button>
        </div>
      )}

      {/* Script results */}
      {scriptResults.length > 0 && (
        <div className="space-y-2">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase">3 Script Variants</label>
          {scriptResults.map((s, i) => (
            <div key={i} className="glass-card rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-bold mr-2">V{i + 1}</span>
                  <span className="text-sm font-bold text-foreground">{s.title}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => copyText(s.script_text)} className="p-1.5 rounded hover:bg-white/10"><Copy className="w-3 h-3 text-muted-foreground" /></button>
                  <button onClick={() => { setScript(s.script_text); setMode("voiceover"); }} className="p-1.5 rounded hover:bg-white/10"><Mic className="w-3 h-3 text-muted-foreground" /></button>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">{s.approach} · ~{s.estimated_seconds}s · {s.best_for}</p>
              <div className="p-2.5 rounded-lg bg-card/50 border border-border text-xs text-foreground whitespace-pre-wrap max-h-32 overflow-y-auto">{s.script_text}</div>
            </div>
          ))}
        </div>
      )}

      {/* Voiceover result */}
      {voResult && (
        <div className="glass-card rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">Voiceover Package</span>
            <span className="text-[10px] text-muted-foreground">~{voResult.estimated_time_seconds}s</span>
          </div>
          {[
            { label: "Annotated Script", text: voResult.annotated_script },
            { label: "Teleprompter", text: voResult.teleprompter_version },
            { label: "Emotional Arc", text: voResult.emotional_arc },
            { label: "Music Cues", text: voResult.music_cues },
            { label: "Alt Take 1", text: voResult.alternative_take_1 },
            { label: "Alt Take 2", text: voResult.alternative_take_2 },
            { label: "Director Notes", text: voResult.director_notes },
          ].filter(s => s.text).map((s, i) => (
            <div key={i}>
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase">{s.label}</label>
                <button onClick={() => copyText(s.text)} className="text-[10px] text-primary hover:underline flex items-center gap-0.5"><Copy className="w-3 h-3" /> Copy</button>
              </div>
              <div className="p-2.5 rounded-lg bg-card/50 border border-border text-xs text-foreground whitespace-pre-wrap mt-1 max-h-28 overflow-y-auto">{s.text}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}