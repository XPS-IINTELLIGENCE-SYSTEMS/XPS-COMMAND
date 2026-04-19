import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { CreditCard, Loader2, Sparkles, Download, Pencil, RotateCcw, Save, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

const TEMPLATES = [
  { id: "executive_gold", name: "Executive Gold", desc: "Black & gold luxury", colors: "#0a0a0f,#d4af37,#ffffff" },
  { id: "modern_minimal", name: "Modern Minimal", desc: "Clean white space", colors: "#ffffff,#1a1a2e,#d4af37" },
  { id: "industrial_steel", name: "Industrial Steel", desc: "Brushed metal look", colors: "#2d2d3a,#c0c0c0,#d4af37" },
  { id: "bold_contractor", name: "Bold Contractor", desc: "High-impact construction", colors: "#1a1a2e,#ff6b35,#ffffff" },
  { id: "premium_dark", name: "Premium Dark", desc: "Dark luxury brand", colors: "#0d0d12,#d4af37,#e8e8e8" },
  { id: "clean_corporate", name: "Clean Corporate", desc: "Professional & trusted", colors: "#ffffff,#2563eb,#1a1a2e" },
  { id: "gradient_modern", name: "Gradient Modern", desc: "Dynamic gradient style", colors: "#667eea,#764ba2,#ffffff" },
  { id: "concrete_raw", name: "Concrete Raw", desc: "Textured concrete look", colors: "#8b8680,#d4af37,#1a1a2e" },
  { id: "neon_edge", name: "Neon Edge", desc: "Dark with neon accents", colors: "#0a0a0f,#00ff88,#ffffff" },
  { id: "classic_embossed", name: "Classic Embossed", desc: "Timeless embossed style", colors: "#f5f0e8,#1a1a2e,#b8860b" },
];

export default function BusinessCardCreator() {
  const [template, setTemplate] = useState("executive_gold");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState([]);
  const [info, setInfo] = useState({
    name: "", title: "", company: "Xtreme Polishing Systems",
    phone: "", email: "", website: "xtremepolishingsystems.com",
    tagline: "Premium Commercial & Industrial Flooring Solutions"
  });

  const generate = async () => {
    setLoading(true);
    const tpl = TEMPLATES.find(t => t.id === template);
    const promises = [1, 2, 3].map(async (variant) => {
      const prompt = `Professional business card design, variant ${variant}/3.
TEMPLATE STYLE: ${tpl.name} - ${tpl.desc}
COLORS: ${tpl.colors}
NAME: ${info.name || "John Smith"}
TITLE: ${info.title || "Sales Director"}
COMPANY: ${info.company}
PHONE: ${info.phone || "(555) 123-4567"}
EMAIL: ${info.email || "info@xps.com"}
WEBSITE: ${info.website}
TAGLINE: ${info.tagline}
Design a stunning, high-end business card. ${variant === 1 ? "Front view, horizontal layout." : variant === 2 ? "Front view, vertical/creative layout." : "Back design with company branding."} Premium print quality, 3.5x2 inch proportions, photorealistic mockup on dark surface.`;
      const res = await base44.integrations.Core.GenerateImage({ prompt });
      return { url: res.url, variant, template: tpl.name };
    });
    const results = await Promise.all(promises);
    setCards(results);
    setLoading(false);
    toast({ title: "3 business card designs generated!" });
  };

  const saveToProject = async (card) => {
    await base44.entities.MediaProject.create({
      name: `Business Card - ${info.name || info.company}`,
      project_type: "Business Cards",
      client_name: info.company,
      assets: JSON.stringify([{ type: "business_card", url: card.url, name: card.template, category: "Business Cards" }]),
      brand_colors: JSON.stringify(TEMPLATES.find(t => t.id === template)?.colors.split(",")),
      status: "Complete"
    });
    toast({ title: "Saved to Projects!" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <CreditCard className="w-5 h-5 text-primary" />
        <h2 className="text-base font-bold text-foreground">AI Business Card Creator</h2>
      </div>

      {/* Template selector */}
      <div>
        <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-2 block">Choose Template ({TEMPLATES.length} styles)</label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => setTemplate(t.id)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                template === t.id ? "border-primary bg-primary/10 shadow-lg shadow-primary/10" : "border-border hover:border-primary/30"
              }`}>
              <div className="flex gap-1 mb-1.5">
                {t.colors.split(",").map((c, i) => (
                  <div key={i} className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: c }} />
                ))}
              </div>
              <p className="text-[11px] font-semibold text-foreground">{t.name}</p>
              <p className="text-[9px] text-muted-foreground">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Contact info editor */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-foreground">Card Information</span>
          <button onClick={() => setEditing(!editing)} className="text-[10px] text-primary flex items-center gap-1">
            <Pencil className="w-3 h-3" /> {editing ? "Done" : "Edit"}
          </button>
        </div>
        {editing ? (
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(info).map(([key, val]) => (
              <div key={key}>
                <label className="text-[9px] font-semibold text-muted-foreground uppercase">{key.replace(/_/g, " ")}</label>
                <Input value={val} onChange={e => setInfo(p => ({ ...p, [key]: e.target.value }))}
                  className="h-8 text-xs mt-0.5" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            {Object.entries(info).filter(([_, v]) => v).map(([key, val]) => (
              <div key={key} className="flex gap-2">
                <span className="text-muted-foreground capitalize w-16 flex-shrink-0">{key.replace(/_/g, " ")}</span>
                <span className="text-foreground truncate">{val}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generate */}
      <Button onClick={generate} disabled={loading} className="w-full gap-2 h-11">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {loading ? "Generating 3 designs..." : "Generate 3 Business Card Designs"}
      </Button>

      {/* Results — 3 variants */}
      {cards.length > 0 && (
        <div>
          <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-2 block">Choose Your Design (3 variants)</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {cards.map((card, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-border group relative">
                <img src={card.url} alt={`Card ${i + 1}`} className="w-full aspect-[16/10] object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                  <a href={card.url} download target="_blank" rel="noopener noreferrer"
                    className="p-2.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                    <Download className="w-4 h-4 text-white" />
                  </a>
                  <button onClick={() => saveToProject(card)}
                    className="p-2.5 rounded-lg bg-primary/30 hover:bg-primary/50 transition-colors">
                    <Save className="w-4 h-4 text-white" />
                  </button>
                </div>
                <div className="p-2 bg-card">
                  <p className="text-[10px] font-semibold text-foreground">Variant {i + 1}: {card.template}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}