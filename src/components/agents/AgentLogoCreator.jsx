import { useState } from "react";
import { Loader2, Sparkles, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";

export default function AgentLogoCreator({ agentName, avatarUrl, onGenerated }) {
  const [generating, setGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");

  const generate = async () => {
    setGenerating(true);
    const prompt = customPrompt.trim()
      || `A sleek futuristic AI robot avatar logo for an agent named "${agentName || "AI Agent"}". Dark background, metallic gold and silver accents, minimal, professional, hexagonal motif, icon style, no text.`;
    const result = await base44.integrations.Core.GenerateImage({ prompt });
    if (result?.url) onGenerated(result.url);
    setGenerating(false);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" /> Agent Logo
      </h3>

      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-xl border border-border bg-secondary/40 flex items-center justify-center overflow-hidden flex-shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Agent logo" className="w-full h-full object-cover" />
          ) : (
            <Bot className="w-8 h-8 text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 space-y-2">
          <Input
            value={customPrompt}
            onChange={e => setCustomPrompt(e.target.value)}
            placeholder="Custom prompt (optional) — or auto-generate from name"
            className="text-xs h-8"
          />
          <Button size="sm" onClick={generate} disabled={generating} className="h-8">
            {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Sparkles className="w-3.5 h-3.5 mr-1" />}
            {generating ? "Generating..." : "Generate Logo"}
          </Button>
        </div>
      </div>
    </div>
  );
}