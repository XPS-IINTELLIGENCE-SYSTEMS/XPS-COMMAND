import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Palette, Loader2, Sparkles, Download, Save, Image, Square, CircleDot, FileText, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

const ASSET_MODES = [
  { id: "logo", label: "Logo", icon: CircleDot, desc: "Company logos & marks" },
  { id: "favicon", label: "Favicon & Icon", icon: Square, desc: "App icons & favicons" },
  { id: "social_post", label: "Social Graphics", icon: Image, desc: "Posts & banners" },
  { id: "brand_package", label: "Full Brand Kit", icon: Palette, desc: "Complete identity system" },
  { id: "product_shot", label: "Product Shots", icon: Image, desc: "Professional product photos" },
  { id: "website_mockup", label: "Website Mockup", icon: Globe, desc: "Site design concepts" },
];

const STYLES = ["Premium Industrial", "Clean & Modern", "Bold & Aggressive", "Elegant Gold", "Technical Blueprint", "Luxury Minimalist", "Concrete Texture", "Neon Future"];

export default function BrandingStudio() {
  const [mode, setMode] = useState("logo");
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Premium Industrial");
  const [companyName, setCompanyName] = useState("Xtreme Polishing Systems");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [nlEdit, setNlEdit] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);

  const generate = async () => {
    if (!prompt.trim() && mode !== "brand_package") return;
    setLoading(true);

    if (mode === "brand_package") {
      // Generate full brand kit with recommendations
      const brandRes = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a comprehensive brand identity package for: ${companyName}
Context: ${prompt || "Commercial & industrial flooring company specializing in epoxy, polished concrete, and decorative coatings."}
Style direction: ${style}

Generate:
1. Brand color palette (5 colors with hex codes and usage rules)
2. Typography recommendations (primary + secondary fonts)
3. Brand voice & tone guidelines
4. Logo usage rules
5. Recommended brand assets list
6. Marketing package recommendations (add-ons a client should consider)
7. Social media profile setup guidelines
8. Website design direction
9. Print material specifications`,
        response_json_schema: {
          type: "object",
          properties: {
            colors: { type: "array", items: { type: "object", properties: { hex: { type: "string" }, name: { type: "string" }, usage: { type: "string" } } } },
            fonts: { type: "object", properties: { primary: { type: "string" }, secondary: { type: "string" }, accent: { type: "string" } } },
            voice_guidelines: { type: "string" },
            logo_rules: { type: "string" },
            recommended_assets: { type: "array", items: { type: "string" } },
            marketing_addons: { type: "array", items: { type: "object", properties: { name: { type: "string" }, description: { type: "string" }, priority: { type: "string" } } } },
            social_guidelines: { type: "string" },
            website_direction: { type: "string" },
            print_specs: { type: "string" }
          }
        }
      });
      setRecommendations(brandRes);

      // Also generate 3 logo variants
      const logoPromises = [1, 2, 3].map(async (v) => {
        const res = await base44.integrations.Core.GenerateImage({
          prompt: `Professional logo design variant ${v} for "${companyName}". ${prompt || "Commercial flooring company."}  Style: ${style}. ${v === 1 ? "Icon-based minimal mark" : v === 2 ? "Full wordmark with icon" : "Abstract geometric mark"}. Clean vector look, white background, premium quality.`
        });
        return { url: res.url, name: `Logo Variant ${v}`, type: "logo" };
      });
      const logos = await Promise.all(logoPromises);
      setResults(logos);
    } else {
      // Generate 3 variants of the requested asset
      const modeLabel = ASSET_MODES.find(m => m.id === mode)?.label || mode;
      const promises = [1, 2, 3].map(async (v) => {
        let assetPrompt = "";
        if (mode === "favicon") {
          assetPrompt = `App icon / favicon design variant ${v} for "${companyName}". ${prompt}. Style: ${style}. ${v === 1 ? "Simple lettermark" : v === 2 ? "Minimal icon symbol" : "Geometric abstract mark"}. Square format, works at 16x16 and 512x512. Clean, recognizable at small sizes.`;
        } else if (mode === "website_mockup") {
          assetPrompt = `Website mockup design variant ${v} for "${companyName}". ${prompt}. Style: ${style}. ${v === 1 ? "Hero section with full-width image" : v === 2 ? "Split layout with services grid" : "Dark premium landing page"}. Desktop browser mockup, modern UI, professional web design.`;
        } else {
          assetPrompt = `${modeLabel} design variant ${v}. ${prompt}. Company: ${companyName}. Style: ${style}. ${v === 1 ? "Option A - bold & impactful" : v === 2 ? "Option B - clean & refined" : "Option C - creative & unique"}. Professional quality, high resolution.`;
        }
        const res = await base44.integrations.Core.GenerateImage({ prompt: assetPrompt });
        return { url: res.url, name: `${modeLabel} ${v}`, type: mode };
      });
      setResults(await Promise.all(promises));
    }
    setLoading(false);
    toast({ title: `3 ${mode} designs generated!` });
  };

  const naturalLanguageEdit = async (imageUrl) => {
    if (!nlEdit.trim()) return;
    setEditLoading(true);
    const res = await base44.integrations.Core.GenerateImage({
      prompt: `Edit this ${mode} design: ${nlEdit}. Keep the same brand identity for ${companyName}. Style: ${style}. High quality, professional.`,
      existing_image_urls: [imageUrl]
    });
    setResults(prev => [...prev, { url: res.url, name: `Edited - ${nlEdit.substring(0, 30)}`, type: mode }]);
    setNlEdit("");
    setEditLoading(false);
    toast({ title: "Edit applied!" });
  };

  const saveAsset = async (asset) => {
    await base44.entities.MediaProject.create({
      name: `${asset.name} - ${companyName}`,
      project_type: mode === "logo" ? "Logo & Icons" : "Branding Package",
      client_name: companyName,
      assets: JSON.stringify([{ ...asset, category: mode }]),
      brand_colors: recommendations?.colors ? JSON.stringify(recommendations.colors.map(c => c.hex)) : "[]",
      status: "Complete"
    });
    toast({ title: "Saved to Projects!" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Palette className="w-5 h-5 text-primary" />
        <h2 className="text-base font-bold text-foreground">Branding Studio</h2>
      </div>

      {/* Mode selector */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {ASSET_MODES.map(m => {
          const Icon = m.icon;
          return (
            <button key={m.id} onClick={() => setMode(m.id)}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                mode === m.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/30"
              }`}>
              <Icon className={`w-4 h-4 mx-auto mb-1 ${mode === m.id ? "text-primary" : "text-muted-foreground"}`} />
              <span className="text-[9px] font-medium text-foreground block">{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Config */}
      <div className="glass-card rounded-xl p-4 space-y-3">
        <Input value={companyName} onChange={e => setCompanyName(e.target.value)}
          placeholder="Company name" className="text-sm" />
        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={2}
          placeholder={mode === "brand_package" ? "Describe your brand vision... (optional)" : "Describe what you want..."}
          className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground resize-none focus:outline-none focus:border-primary" />
        <div>
          <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Style</label>
          <div className="flex gap-1.5 flex-wrap">
            {STYLES.map(s => (
              <button key={s} onClick={() => setStyle(s)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-colors ${
                  style === s ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border"
                }`}>{s}</button>
            ))}
          </div>
        </div>
        <Button onClick={generate} disabled={loading} className="w-full gap-2 h-11">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? "Generating 3 options..." : `Generate 3 ${ASSET_MODES.find(m => m.id === mode)?.label} Designs`}
        </Button>
      </div>

      {/* Brand package recommendations */}
      {recommendations && (
        <div className="glass-card rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-bold text-foreground">Brand Identity Package</h3>
          {/* Colors */}
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Brand Colors</label>
            <div className="flex gap-2 mt-1">
              {recommendations.colors?.map((c, i) => (
                <div key={i} className="text-center">
                  <div className="w-10 h-10 rounded-lg border border-white/20" style={{ backgroundColor: c.hex }} />
                  <p className="text-[8px] text-muted-foreground mt-0.5">{c.name}</p>
                  <p className="text-[8px] text-foreground font-mono">{c.hex}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Fonts */}
          {recommendations.fonts && (
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase">Typography</label>
              <div className="flex gap-4 mt-1 text-xs text-foreground">
                <span>Primary: <strong>{recommendations.fonts.primary}</strong></span>
                <span>Secondary: <strong>{recommendations.fonts.secondary}</strong></span>
              </div>
            </div>
          )}
          {/* Marketing add-ons */}
          {recommendations.marketing_addons?.length > 0 && (
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase">Recommended Add-Ons</label>
              <div className="grid grid-cols-2 gap-1.5 mt-1">
                {recommendations.marketing_addons.map((a, i) => (
                  <div key={i} className={`p-2 rounded-lg border text-xs ${a.priority === "high" ? "border-primary/30 bg-primary/5" : "border-border"}`}>
                    <span className="font-semibold text-foreground">{a.name}</span>
                    <p className="text-[10px] text-muted-foreground">{a.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Guidelines */}
          {recommendations.voice_guidelines && (
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase">Brand Voice</label>
              <p className="text-xs text-foreground mt-1">{recommendations.voice_guidelines}</p>
            </div>
          )}
          {recommendations.website_direction && (
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase">Website Direction</label>
              <p className="text-xs text-foreground mt-1">{recommendations.website_direction}</p>
            </div>
          )}
        </div>
      )}

      {/* Results with NL editing */}
      {results.length > 0 && (
        <div className="space-y-3">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase">Generated Designs ({results.length})</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {results.map((asset, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-border group relative">
                <img src={asset.url} alt={asset.name} className="w-full aspect-square object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                  <a href={asset.url} download target="_blank" rel="noopener noreferrer"
                    className="p-2.5 rounded-lg bg-white/20 hover:bg-white/30"><Download className="w-4 h-4 text-white" /></a>
                  <button onClick={() => saveAsset(asset)}
                    className="p-2.5 rounded-lg bg-primary/30 hover:bg-primary/50"><Save className="w-4 h-4 text-white" /></button>
                </div>
                <div className="p-2 bg-card">
                  <p className="text-[10px] font-semibold text-foreground">{asset.name}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Natural language edit */}
          <div className="flex gap-2">
            <Input value={nlEdit} onChange={e => setNlEdit(e.target.value)}
              placeholder="Describe changes... e.g. 'Make the gold brighter, add a concrete texture background'"
              className="text-xs" onKeyDown={e => e.key === 'Enter' && results.length > 0 && naturalLanguageEdit(results[results.length - 1].url)} />
            <Button size="sm" onClick={() => results.length > 0 && naturalLanguageEdit(results[results.length - 1].url)}
              disabled={editLoading || !nlEdit.trim()} className="gap-1 flex-shrink-0">
              {editLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} Edit
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}