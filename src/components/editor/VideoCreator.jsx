import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Video, Wand2, Play, Clock, Sparkles } from "lucide-react";

export default function VideoCreator() {
  const [prompt, setPrompt] = useState("");

  const templates = [
    { name: "Product Demo", desc: "Showcase epoxy flooring products", duration: "30s" },
    { name: "Before/After", desc: "Floor transformation comparison", duration: "15s" },
    { name: "Client Testimonial", desc: "Customer success story format", duration: "60s" },
    { name: "Sales Pitch", desc: "Elevator pitch for cold outreach", duration: "45s" },
  ];

  return (
    <div className="space-y-4 h-full">
      <div className="flex gap-2">
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the video you want to create..."
          className="text-xs h-9 bg-secondary/50"
        />
        <Button className="h-9 text-xs gap-1.5 bg-primary text-primary-foreground whitespace-nowrap">
          <Wand2 className="w-3.5 h-3.5" /> Create Video
        </Button>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-foreground mb-2">Video Templates</h3>
        <div className="grid grid-cols-2 gap-3">
          {templates.map((t) => (
            <div key={t.name} className="bg-card rounded-lg border border-border p-4 hover:border-primary/20 transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Play className="w-4 h-4 text-primary" />
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="w-2.5 h-2.5" /> {t.duration}
                </div>
              </div>
              <div className="text-xs font-semibold text-foreground">{t.name}</div>
              <p className="text-[10px] text-muted-foreground mt-0.5">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-3">
          <Sparkles className="w-8 h-8 text-primary/30" />
        </div>
        <p className="text-xs text-muted-foreground">AI Video generation powered by the agent</p>
        <p className="text-[10px] text-muted-foreground mt-1">Ask the AI agent in the chat to create videos from templates or custom prompts</p>
      </div>
    </div>
  );
}