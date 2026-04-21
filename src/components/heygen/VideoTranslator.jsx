import { useState } from "react";
import { Globe, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";

const LANGUAGES = [
  { code: "es", label: "Spanish" }, { code: "fr", label: "French" }, { code: "de", label: "German" },
  { code: "pt", label: "Portuguese" }, { code: "it", label: "Italian" }, { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" }, { code: "zh", label: "Chinese" }, { code: "ar", label: "Arabic" },
  { code: "hi", label: "Hindi" }, { code: "ru", label: "Russian" }, { code: "nl", label: "Dutch" },
  { code: "pl", label: "Polish" }, { code: "tr", label: "Turkish" }, { code: "vi", label: "Vietnamese" },
];

export default function VideoTranslator() {
  const [videoUrl, setVideoUrl] = useState("");
  const [lang, setLang] = useState("es");
  const [translating, setTranslating] = useState(false);
  const [result, setResult] = useState(null);

  const translate = async () => {
    if (!videoUrl.trim()) return;
    setTranslating(true);
    const res = await base44.functions.invoke("heygenAvatar", {
      action: "translate_video",
      video_url: videoUrl.trim(),
      target_language: lang,
    });
    setResult(res.data);
    setTranslating(false);
  };

  return (
    <div className="glass-card rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">Video Translation & Lip-Sync</h3>
      </div>
      <p className="text-[10px] text-muted-foreground">Translate any video into 30+ languages with natural voice cloning and perfect lip-sync</p>
      <Input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="Paste video URL..." className="h-8 text-xs" />
      <div className="flex gap-2">
        <Select value={lang} onValueChange={setLang}>
          <SelectTrigger className="h-8 text-[10px] flex-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            {LANGUAGES.map(l => <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={translate} disabled={translating || !videoUrl.trim()} className="metallic-gold-bg text-background h-8 text-[10px]">
          {translating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 mr-1" />}
          Translate
        </Button>
      </div>
      {result && (
        <div className="text-[10px] text-muted-foreground bg-secondary/50 rounded-lg p-2">
          <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}