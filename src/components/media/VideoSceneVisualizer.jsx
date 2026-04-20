import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Film, Loader2, Image, Download, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export default function VideoSceneVisualizer({ scenes, title }) {
  const [sceneImages, setSceneImages] = useState({});
  const [loading, setLoading] = useState({});
  const [allLoading, setAllLoading] = useState(false);

  const generateSceneImage = async (scene, idx) => {
    setLoading(prev => ({ ...prev, [idx]: true }));
    const res = await base44.integrations.Core.GenerateImage({
      prompt: `Cinematic video frame: ${scene.visual}. ${scene.text_overlay ? `Text overlay: "${scene.text_overlay}"` : ""}. For: ${title || "XPS Xtreme Polishing Systems"}. Professional video production quality, 16:9 cinematic frame, dramatic lighting, branded commercial flooring content.`
    });
    setSceneImages(prev => ({ ...prev, [idx]: res.url }));
    setLoading(prev => ({ ...prev, [idx]: false }));
  };

  const generateAllScenes = async () => {
    if (!scenes?.length) return;
    setAllLoading(true);
    const promises = scenes.map((scene, idx) =>
      base44.integrations.Core.GenerateImage({
        prompt: `Cinematic video frame for Scene ${scene.scene_number || idx + 1}: ${scene.visual}. ${scene.text_overlay ? `Text overlay: "${scene.text_overlay}"` : ""}. For: ${title || "XPS"}. Professional 16:9 cinematic quality, dramatic lighting.`
      }).then(res => ({ idx, url: res.url }))
    );
    const results = await Promise.all(promises);
    const map = {};
    results.forEach(r => { map[r.idx] = r.url; });
    setSceneImages(map);
    setAllLoading(false);
    toast({ title: `${scenes.length} scene visuals generated!` });
  };

  if (!scenes?.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
          <Film className="w-3 h-3" /> Visual Storyboard
        </label>
        <Button size="sm" variant="outline" onClick={generateAllScenes} disabled={allLoading} className="text-[10px] h-7 gap-1">
          {allLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Image className="w-3 h-3" />}
          Generate All Scene Images
        </Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {scenes.map((scene, idx) => (
          <div key={idx} className="rounded-xl overflow-hidden border border-border bg-card/50">
            {sceneImages[idx] ? (
              <div className="relative group">
                <img src={sceneImages[idx]} alt={`Scene ${scene.scene_number || idx + 1}`} className="w-full aspect-video object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                  <a href={sceneImages[idx]} download target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/20">
                    <Download className="w-4 h-4 text-white" />
                  </a>
                </div>
              </div>
            ) : (
              <button onClick={() => generateSceneImage(scene, idx)} disabled={loading[idx]}
                className="w-full aspect-video flex flex-col items-center justify-center gap-1 hover:bg-primary/5 transition-colors">
                {loading[idx] ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <Image className="w-5 h-5 text-muted-foreground/40" />}
                <span className="text-[9px] text-muted-foreground">{loading[idx] ? "Generating..." : "Click to visualize"}</span>
              </button>
            )}
            <div className="p-2">
              <div className="flex items-center gap-1.5">
                <Play className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-bold text-foreground">Scene {scene.scene_number || idx + 1}</span>
                <span className="text-[9px] text-muted-foreground">{scene.duration}</span>
              </div>
              <p className="text-[9px] text-muted-foreground line-clamp-2 mt-0.5">{scene.visual}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}