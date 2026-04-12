import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { Wand2, Download, Loader2, Image, Copy } from "lucide-react";

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState([]);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    try {
      const result = await base44.integrations.Core.GenerateImage({ prompt: prompt.trim() });
      if (result?.url) {
        setImages(prev => [{ url: result.url, prompt: prompt.trim(), time: new Date().toLocaleTimeString() }, ...prev]);
      }
    } catch (err) {
      console.error("Image generation failed:", err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4 h-full">
      <div className="flex gap-2">
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want to generate..."
          className="text-xs h-9 bg-secondary/50"
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
        />
        <Button onClick={handleGenerate} disabled={generating} className="h-9 text-xs gap-1.5 bg-primary text-primary-foreground whitespace-nowrap">
          {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
          Generate
        </Button>
      </div>

      {generating && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Generating image...</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 overflow-y-auto">
        {images.map((img, i) => (
          <div key={i} className="bg-card rounded-lg border border-border overflow-hidden group">
            <img src={img.url} alt={img.prompt} className="w-full aspect-square object-cover" />
            <div className="p-2.5">
              <p className="text-[10px] text-muted-foreground line-clamp-2">{img.prompt}</p>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[9px] text-muted-foreground">{img.time}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => navigator.clipboard.writeText(img.url)}>
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                    <a href={img.url} target="_blank" rel="noopener noreferrer"><Download className="w-3 h-3" /></a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!generating && images.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Image className="w-10 h-10 text-muted-foreground/30 mb-3" />
          <p className="text-xs text-muted-foreground">Enter a prompt to generate AI images</p>
          <p className="text-[10px] text-muted-foreground mt-1">Or ask the AI agent to generate images for you</p>
        </div>
      )}
    </div>
  );
}