import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Palette, Loader2, Sparkles, Download, Save, Package, FileText, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

const PACKAGE_TIERS = [
  { id: "starter", label: "Starter", desc: "Logo + Colors + Business Card", assets: 5 },
  { id: "professional", label: "Professional", desc: "Full brand kit + Social templates", assets: 12 },
  { id: "enterprise", label: "Enterprise", desc: "Complete identity system + All assets", assets: 20 },
];

export default function BrandPackageGenerator() {
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("Commercial Flooring");
  const [vibe, setVibe] = useState("");
  const [tier, setTier] = useState("professional");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [brandKit, setBrandKit] = useState(null);
  const [generatedAssets, setGeneratedAssets] = useState([]);

  const generate = async () => {
    if (!companyName.trim()) return;
    setLoading(true);
    setBrandKit(null);
    setGeneratedAssets([]);

    // Step 1: Generate brand strategy
    setProgress("Creating brand strategy...");
    const strategy = await base44.integrations.Core.InvokeLLM({
      prompt: `Create a comprehensive brand identity for "${companyName}" in the ${industry} industry.
Vibe/direction: ${vibe || "Premium, professional, trustworthy"}
Package tier: ${tier}

Generate:
1. Brand color palette (5 colors with hex codes, names, and specific usage rules)
2. Typography system (heading font, body font, accent font — use real Google Fonts)
3. Brand voice & messaging guidelines (tone, vocabulary, do's and don'ts)
4. Logo usage rules (spacing, minimum size, background rules)
5. Tagline options (3 tagline variations)
6. Social media profile bio options (3 versions)
7. Email signature template
8. Marketing copy templates (elevator pitch, value proposition, about us)
9. Brand story outline
10. Print material specifications (business card, letterhead, envelope)`,
      response_json_schema: {
        type: "object",
        properties: {
          colors: { type: "array", items: { type: "object", properties: { hex: { type: "string" }, name: { type: "string" }, usage: { type: "string" }, percentage: { type: "string" } } } },
          fonts: { type: "object", properties: { heading: { type: "string" }, body: { type: "string" }, accent: { type: "string" } } },
          voice: { type: "object", properties: { tone: { type: "string" }, vocabulary: { type: "string" }, dos: { type: "array", items: { type: "string" } }, donts: { type: "array", items: { type: "string" } } } },
          taglines: { type: "array", items: { type: "string" } },
          social_bios: { type: "array", items: { type: "string" } },
          email_signature: { type: "string" },
          elevator_pitch: { type: "string" },
          value_proposition: { type: "string" },
          about_us: { type: "string" },
          brand_story: { type: "string" },
        }
      }
    });
    setBrandKit(strategy);

    // Step 2: Generate visual assets
    const colorStr = strategy.colors?.map(c => c.hex).join(", ") || "#D4AF37, #0A0A0F";
    const assetPromises = [];

    setProgress("Generating logo variants...");
    // Logos
    ["Minimal icon mark", "Full wordmark with symbol", "Horizontal lockup"].forEach((variant, i) => {
      assetPromises.push(
        base44.integrations.Core.GenerateImage({
          prompt: `Professional logo design for "${companyName}". ${industry} company. ${variant}. Colors: ${colorStr}. Clean vector style, white background, premium quality. ${vibe || ""}`
        }).then(res => ({ url: res.url, name: `Logo — ${variant}`, category: "Logo", order: i }))
      );
    });

    setProgress("Creating business cards...");
    // Business cards
    assetPromises.push(
      base44.integrations.Core.GenerateImage({
        prompt: `Premium business card design for "${companyName}". Front side. Colors: ${colorStr}. Professional, ${vibe || "luxury industrial"} style. 3.5x2 inch proportions, photorealistic mockup.`
      }).then(res => ({ url: res.url, name: "Business Card — Front", category: "Print", order: 3 }))
    );
    assetPromises.push(
      base44.integrations.Core.GenerateImage({
        prompt: `Business card back design for "${companyName}". Colors: ${colorStr}. Company logo prominent, ${vibe || "premium"} style. 3.5x2 inch proportions.`
      }).then(res => ({ url: res.url, name: "Business Card — Back", category: "Print", order: 4 }))
    );

    if (tier !== "starter") {
      setProgress("Designing social templates...");
      // Social templates
      ["Instagram post template", "Facebook cover banner", "LinkedIn profile banner"].forEach((asset, i) => {
        assetPromises.push(
          base44.integrations.Core.GenerateImage({
            prompt: `${asset} for "${companyName}". ${industry} company. Colors: ${colorStr}. Professional, modern design. Brand-consistent. ${vibe || ""}`
          }).then(res => ({ url: res.url, name: asset, category: "Social Media", order: 5 + i }))
        );
      });

      // Letterhead
      assetPromises.push(
        base44.integrations.Core.GenerateImage({
          prompt: `Professional letterhead design for "${companyName}". Colors: ${colorStr}. Clean, corporate, A4 format. Logo at top, subtle brand elements.`
        }).then(res => ({ url: res.url, name: "Letterhead", category: "Print", order: 8 }))
      );
    }

    if (tier === "enterprise") {
      setProgress("Building complete asset library...");
      ["Website hero section mockup", "Email newsletter header", "Vehicle wrap concept", "Signage design", "Invoice template mockup"].forEach((asset, i) => {
        assetPromises.push(
          base44.integrations.Core.GenerateImage({
            prompt: `${asset} for "${companyName}". ${industry}. Colors: ${colorStr}. Premium professional design. ${vibe || ""}`
          }).then(res => ({ url: res.url, name: asset, category: "Extended", order: 9 + i }))
        );
      });
    }

    const assets = await Promise.all(assetPromises);
    assets.sort((a, b) => a.order - b.order);
    setGeneratedAssets(assets);

    // Save to project
    await base44.entities.MediaProject.create({
      name: `Brand Package — ${companyName}`,
      project_type: "Branding Package",
      client_name: companyName,
      assets: JSON.stringify(assets),
      brand_colors: JSON.stringify(strategy.colors?.map(c => c.hex) || []),
      brand_fonts: strategy.fonts ? `${strategy.fonts.heading}, ${strategy.fonts.body}` : "",
      brand_guidelines: JSON.stringify(strategy),
      status: "Complete"
    });

    setProgress("");
    setLoading(false);
    toast({ title: `Complete brand package generated with ${assets.length} assets!` });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Package className="w-5 h-5 text-primary" />
        <h2 className="text-base font-bold text-foreground">Brand Package Generator</h2>
        <Badge className="text-[9px] metallic-gold-bg text-background">Full Deliverable</Badge>
      </div>

      {/* Tier selector */}
      <div className="grid grid-cols-3 gap-2">
        {PACKAGE_TIERS.map(t => (
          <button key={t.id} onClick={() => setTier(t.id)}
            className={`p-3 rounded-xl border text-center transition-all ${tier === t.id ? "border-primary bg-primary/10 shadow-lg shadow-primary/10" : "border-border hover:border-primary/30"}`}>
            <span className="text-sm font-bold text-foreground block">{t.label}</span>
            <span className="text-[9px] text-muted-foreground block">{t.desc}</span>
            <Badge variant="secondary" className="text-[8px] mt-1">{t.assets}+ assets</Badge>
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="glass-card rounded-xl p-4 space-y-3">
        <Input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Company name" className="text-sm font-semibold" />
        <div className="grid grid-cols-2 gap-3">
          <Input value={industry} onChange={e => setIndustry(e.target.value)} placeholder="Industry" className="text-sm" />
          <Input value={vibe} onChange={e => setVibe(e.target.value)} placeholder="Style vibe... e.g. luxury, bold, modern" className="text-sm" />
        </div>
        <Button onClick={generate} disabled={loading || !companyName.trim()} className="w-full gap-2 h-12 metallic-gold-bg text-background font-bold">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? progress || "Generating..." : `Generate ${PACKAGE_TIERS.find(t => t.id === tier)?.label} Brand Package`}
        </Button>
      </div>

      {/* Brand Kit */}
      {brandKit && (
        <div className="glass-card rounded-xl p-4 space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" /> Brand Guidelines
          </h3>

          {/* Colors */}
          {brandKit.colors?.length > 0 && (
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-2 block">Color Palette</label>
              <div className="flex gap-3 flex-wrap">
                {brandKit.colors.map((c, i) => (
                  <div key={i} className="text-center">
                    <div className="w-14 h-14 rounded-xl border border-white/20 shadow-lg" style={{ backgroundColor: c.hex }} />
                    <p className="text-[9px] text-foreground font-semibold mt-1">{c.name}</p>
                    <p className="text-[8px] text-muted-foreground font-mono">{c.hex}</p>
                    <p className="text-[8px] text-primary">{c.percentage}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Typography */}
          {brandKit.fonts && (
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Typography</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-card border border-border"><span className="text-muted-foreground text-[9px]">Heading</span><p className="font-bold text-foreground">{brandKit.fonts.heading}</p></div>
                <div className="p-2 rounded-lg bg-card border border-border"><span className="text-muted-foreground text-[9px]">Body</span><p className="font-bold text-foreground">{brandKit.fonts.body}</p></div>
                <div className="p-2 rounded-lg bg-card border border-border"><span className="text-muted-foreground text-[9px]">Accent</span><p className="font-bold text-foreground">{brandKit.fonts.accent}</p></div>
              </div>
            </div>
          )}

          {/* Taglines */}
          {brandKit.taglines?.length > 0 && (
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Tagline Options</label>
              {brandKit.taglines.map((t, i) => (
                <p key={i} className="text-xs text-foreground italic py-1 border-b border-border/30 last:border-0">"{t}"</p>
              ))}
            </div>
          )}

          {/* Voice */}
          {brandKit.voice && (
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Brand Voice</label>
              <p className="text-xs text-foreground">{brandKit.voice.tone}</p>
              {brandKit.voice.dos?.length > 0 && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[9px] text-green-400 font-bold">DO</span>
                    {brandKit.voice.dos.map((d, i) => <p key={i} className="text-[10px] text-foreground">✓ {d}</p>)}
                  </div>
                  <div>
                    <span className="text-[9px] text-red-400 font-bold">DON'T</span>
                    {brandKit.voice.donts?.map((d, i) => <p key={i} className="text-[10px] text-foreground">✗ {d}</p>)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Copy templates */}
          {brandKit.elevator_pitch && (
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Elevator Pitch</label>
              <p className="text-xs text-foreground p-2 rounded-lg bg-card border border-border">{brandKit.elevator_pitch}</p>
            </div>
          )}
        </div>
      )}

      {/* Generated Assets */}
      {generatedAssets.length > 0 && (
        <div className="space-y-3">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase">Generated Assets ({generatedAssets.length})</label>
          {["Logo", "Print", "Social Media", "Extended"].filter(cat => generatedAssets.some(a => a.category === cat)).map(cat => (
            <div key={cat}>
              <label className="text-[9px] font-semibold text-primary uppercase mb-1 block">{cat}</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {generatedAssets.filter(a => a.category === cat).map((asset, i) => (
                  <div key={i} className="rounded-xl overflow-hidden border border-border group relative">
                    <img src={asset.url} alt={asset.name} className="w-full aspect-square object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                      <a href={asset.url} download target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg bg-white/20 hover:bg-white/30">
                        <Download className="w-4 h-4 text-white" />
                      </a>
                    </div>
                    <div className="p-1.5 bg-card">
                      <p className="text-[9px] font-semibold text-foreground truncate">{asset.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}