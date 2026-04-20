import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Image, Loader2, Download, Sparkles, RotateCcw, Save, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

const PRESETS = [
  { id: "custom", label: "Custom Prompt" },
  { id: "floor_project", label: "Floor Project Shot" },
  { id: "before_after", label: "Before / After" },
  { id: "product", label: "Product Photography" },
  { id: "team_portrait", label: "Team / Portrait" },
  { id: "social_graphic", label: "Social Graphic" },
  { id: "ad_creative", label: "Ad Creative" },
  { id: "logo", label: "Logo Design" },
  { id: "thumbnail", label: "Video Thumbnail" },
  { id: "mockup", label: "Website Mockup" },
];

const STYLES = [
  "Photorealistic", "Premium Industrial", "Clean Minimalist", "Bold & Vibrant",
  "Luxury Gold & Black", "Technical Blueprint", "Cinematic", "Abstract Art",
  "Flat Design", "3D Render"
];

const RATIOS = [
  { id: "square", label: "1:1 Square" },
  { id: "landscape", label: "16:9 Wide" },
  { id: "portrait", label: "9:16 Tall" },
  { id: "banner", label: "3:1 Banner" },
];

const PRESET_PROMPTS = {
  floor_project: "Stunning commercial epoxy floor installation, professional photography, dramatic lighting showing metallic epoxy reflections",
  before_after: "Split-screen before and after comparison of a concrete floor transformation, left side damaged concrete, right side beautiful polished epoxy, dramatic improvement",
  product: "Professional product photography of industrial epoxy flooring supplies and equipment, studio lighting, clean white background, commercial catalog quality",
  team_portrait: "Professional team photo of construction/flooring crew at a commercial job site, wearing branded gear, confident poses, modern construction site background",
  social_graphic: "Eye-catching social media graphic for commercial flooring company, bold text overlay space, gold and black color scheme, modern design",
  ad_creative: "High-converting digital advertisement for epoxy flooring services, before/after imagery, call-to-action button space, premium look",
  logo: "Professional logo design, clean vector style, iconic mark, scalable, white background, premium quality",
  thumbnail: "YouTube video thumbnail, bold large text, high contrast, face-forward presenter with dramatic epoxy floor behind, bright engaging colors",
  mockup: "Modern website homepage design mockup for a premium flooring contractor, dark theme with gold accents, hero section with project gallery",
};

export default function AIImageStudio() {
  const [prompt, setPrompt] = useState("");
  const [preset, setPreset] = useState("custom");
  const [style, setStyle] = useState("Photorealistic");
  const [ratio, setRatio] = useState("square");
  const [count, setCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [editPrompt, setEditPrompt] = useState("");
  const [editingIdx, setEditingIdx] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const getFullPrompt = (variant) => {
    const base = preset !== "custom" && PRESET_PROMPTS[preset]
      ? `${PRESET_PROMPTS[preset]}. ${prompt}`
      : prompt;
    const ratioHint = ratio === "landscape" ? "Wide 16:9 format." : ratio === "portrait" ? "Tall 9:16 portrait format." : ratio === "banner" ? "Ultra-wide 3:1 banner format." : "";
    return `${base}. Style: ${style}. Variant ${variant} — ${variant === 1 ? "Primary composition" : variant === 2 ? "Alternative angle/approach" : "Creative interpretation"}. ${ratioHint} XPS / Xtreme Polishing Systems branding. Professional quality, high resolution.`;
  };

  const generate = async () => {
    if (!prompt.trim() && preset === "custom") return;
    setLoading(true);
    const promises = Array.from({ length: count }, (_, i) =>
      base44.integrations.Core.GenerateImage({ prompt: getFullPrompt(i + 1) })
        .then(res => ({ url: res.url, prompt: getFullPrompt(i + 1), preset, style, variant: i + 1, created: new Date().toISOString() }))
    );
    const results = await Promise.all(promises);
    setImages(prev => [...results, ...prev]);
    setLoading(false);
    toast({ title: `${count} images generated!` });
  };

  const editImage = async (img, idx) => {
    if (!editPrompt.trim()) return;
    setEditLoading(true);
    const res = await base44.integrations.Core.GenerateImage({
      prompt: `${editPrompt}. Based on: ${img.prompt}. Style: ${img.style}. Professional quality.`,
      existing_image_urls: [img.url]
    });
    const edited = { url: res.url, prompt: `Edit: ${editPrompt}`, preset: img.preset, style: img.style, variant: "edited", created: new Date().toISOString() };
    setImages(prev => [edited, ...prev]);
    setEditPrompt("");
    setEditingIdx(null);
    setEditLoading(false);
    toast({ title: "Image edited!" });
  };

  const saveToProject = async (img) => {
    await base44.entities.MediaProject.create({
      name: `AI Image — ${img.preset || "Custom"}`,
      project_type: "Branding Package",
      client_name: "XPS",
      assets: JSON.stringify([{ type: "ai_image", url: img.url, name: img.preset, category: "AI Generated" }]),
      status: "Complete"
    });
    toast({ title: "Saved to Projects!" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Image className="w-5 h-5 text-primary" />
        <h2 className="text-base font-bold text-foreground">AI Image Studio</h2>
        <Badge variant="secondary" className="text-[9px]">Real AI Generation</Badge>
      </div>

      {/* Presets */}
      <div className="flex gap-1.5 flex-wrap">
        {PRESETS.map(p => (
          <button key={p.id} onClick={() => setPreset(p.id)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-colors ${preset === p.id ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border hover:border-primary/40"}`}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Main form */}
      <div className="glass-card rounded-xl p-4 space-y-3">
        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={3}
          placeholder={preset !== "custom" ? `Describe additional details for your ${PRESETS.find(p => p.id === preset)?.label}...` : "Describe the image you want to create..."}
          className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground resize-none focus:outline-none focus:border-primary" />

        {/* Style */}
        <div>
          <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Style</label>
          <div className="flex gap-1.5 flex-wrap">
            {STYLES.map(s => (
              <button key={s} onClick={() => setStyle(s)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium border ${style === s ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border"}`}>{s}</button>
            ))}
          </div>
        </div>

        {/* Ratio & Count */}
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Format</label>
            <div className="flex gap-1.5">
              {RATIOS.map(r => (
                <button key={r.id} onClick={() => setRatio(r.id)}
                  className={`px-2.5 py-1 rounded text-[10px] border ${ratio === r.id ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border"}`}>{r.label}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Variants</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map(n => (
                <button key={n} onClick={() => setCount(n)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold border ${count === n ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border"}`}>{n}</button>
              ))}
            </div>
          </div>
        </div>

        <Button onClick={generate} disabled={loading || (!prompt.trim() && preset === "custom")} className="w-full gap-2 h-12 metallic-gold-bg text-background font-bold">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? `Generating ${count} images...` : `Generate ${count} AI Image${count > 1 ? "s" : ""}`}
        </Button>
      </div>

      {/* Gallery */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Gallery ({images.length})</label>
            <button onClick={() => setImages([])} className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1">
              <RotateCcw className="w-3 h-3" /> Clear
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((img, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-border group relative">
                <img src={img.url} alt={`Generated ${i}`} className={`w-full object-cover ${ratio === "landscape" ? "aspect-video" : ratio === "portrait" ? "aspect-[9/16]" : ratio === "banner" ? "aspect-[3/1]" : "aspect-square"}`} />
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2 p-3">
                  <div className="flex gap-2">
                    <a href={img.url} download target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg bg-white/20 hover:bg-white/30"><Download className="w-4 h-4 text-white" /></a>
                    <button onClick={() => saveToProject(img)} className="p-2.5 rounded-lg bg-primary/30 hover:bg-primary/50"><Save className="w-4 h-4 text-white" /></button>
                    <button onClick={() => setEditingIdx(editingIdx === i ? null : i)} className="p-2.5 rounded-lg bg-blue-500/30 hover:bg-blue-500/50"><Pencil className="w-4 h-4 text-white" /></button>
                  </div>
                  <p className="text-[9px] text-white/60 text-center line-clamp-2">{img.preset !== "custom" ? PRESETS.find(p => p.id === img.preset)?.label : "Custom"} · {img.style}</p>
                </div>
                {editingIdx === i && (
                  <div className="p-2 bg-card border-t border-border flex gap-1">
                    <Input value={editPrompt} onChange={e => setEditPrompt(e.target.value)} placeholder="Describe edit..."
                      className="text-[10px] h-7" onKeyDown={e => e.key === 'Enter' && editImage(img, i)} />
                    <Button size="sm" onClick={() => editImage(img, i)} disabled={editLoading} className="h-7 text-[10px] px-2">
                      {editLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Edit"}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}