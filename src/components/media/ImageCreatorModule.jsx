import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Image, Loader2, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const ASSET_TYPES = [
  { id: "social_post", label: "Social Post" },
  { id: "logo", label: "Logo" },
  { id: "banner", label: "Banner" },
  { id: "product_shot", label: "Product Shot" },
  { id: "before_after", label: "Before/After" },
  { id: "ad_creative", label: "Ad Creative" },
  { id: "thumbnail", label: "Video Thumbnail" },
  { id: "custom", label: "Custom" },
];

const STYLES = ["Premium Industrial", "Clean & Modern", "Bold & Aggressive", "Elegant Gold", "Technical/Blueprint", "Rustic Concrete"];

export default function ImageCreatorModule() {
  const [prompt, setPrompt] = useState("");
  const [assetType, setAssetType] = useState("social_post");
  const [style, setStyle] = useState("Premium Industrial");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    const res = await base44.functions.invoke("generateBrandAsset", {
      asset_type: assetType, prompt, style
    });
    if (res.data?.image_url) {
      setImages(prev => [{ url: res.data.image_url, type: assetType, prompt }, ...prev]);
    }
    setLoading(false);
    toast({ title: "Image generated!" });
  };

  return (
    <div>
      <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
        <Image className="w-4 h-4 text-primary" /> Image & Brand Asset Creator
      </h3>

      <div className="glass-card rounded-xl p-4 mb-4">
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3}
          placeholder="Describe your image... e.g. 'Stunning metallic epoxy floor in a luxury car showroom with XPS branding'"
          className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground mb-3 resize-none focus:outline-none focus:border-primary" />

        <div className="mb-3">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Asset Type</label>
          <div className="flex gap-1.5 flex-wrap">
            {ASSET_TYPES.map(t => (
              <button key={t.id} onClick={() => setAssetType(t.id)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium border ${assetType === t.id ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border"}`}>{t.label}</button>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Style</label>
          <div className="flex gap-1.5 flex-wrap">
            {STYLES.map(s => (
              <button key={s} onClick={() => setStyle(s)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium border ${style === s ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border"}`}>{s}</button>
            ))}
          </div>
        </div>

        <Button onClick={generate} disabled={loading || !prompt.trim()} className="w-full gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? "Generating..." : "Generate Image"}
        </Button>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {images.map((img, i) => (
            <div key={i} className="rounded-xl overflow-hidden border border-border group relative">
              <img src={img.url} alt={img.prompt} className="w-full aspect-square object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <div className="flex-1">
                  <span className="text-[10px] text-white/70 uppercase">{img.type}</span>
                  <p className="text-xs text-white line-clamp-2">{img.prompt}</p>
                </div>
                <a href={img.url} download target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/20 hover:bg-white/30">
                  <Download className="w-4 h-4 text-white" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}