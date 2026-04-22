import { useState } from "react";
import { Package, DollarSign, Tag, Loader2, Globe, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";

const XPS_PRODUCTS = [
  { name: "XPS Epoxy 100% Solids", retail: "$189/gal", contractor: "$139/gal", category: "Epoxy", desc: "Premium 100% solids epoxy — ultra durable, high gloss", deal: "Buy 10 get 2 free" },
  { name: "XPS Polyaspartic", retail: "$249/gal", contractor: "$179/gal", category: "Polyaspartic", desc: "Fast-cure polyaspartic — same day return to service", deal: "Free roller kit with 5+ gal" },
  { name: "XPS Metallic Epoxy", retail: "$269/gal", contractor: "$199/gal", category: "Metallic", desc: "Stunning metallic pigment system — designer finishes", deal: "15% off first order" },
  { name: "XPS Polyurea", retail: "$299/gal", contractor: "$219/gal", category: "Polyurea", desc: "Extreme durability coating — chemical & impact resistant", deal: "Free training with $500+ order" },
  { name: "XPS Primer", retail: "$89/gal", contractor: "$59/gal", category: "Primer", desc: "High-penetration concrete primer", deal: "Bundle with topcoat for 20% off" },
  { name: "XPS Flake System", retail: "$159/kit", contractor: "$109/kit", category: "Decorative", desc: "Complete decorative flake broadcast system", deal: "Buy 5 kits get starter tools free" },
  { name: "XPS Diamond Tooling", retail: "$299/set", contractor: "$219/set", category: "Tools", desc: "Professional diamond grinding segments", deal: "Free segment with grinder purchase" },
  { name: "XPS Polishing Pads", retail: "$49/pad", contractor: "$35/pad", category: "Tools", desc: "Wet/dry diamond polishing pads — 50-3000 grit", deal: "Full grit set 25% off" },
  { name: "XPS Densifier/Hardener", retail: "$129/gal", contractor: "$89/gal", category: "Chemical", desc: "Lithium silicate concrete densifier", deal: "Free sample with first order" },
  { name: "XPS Stain & Dye", retail: "$99/gal", contractor: "$69/gal", category: "Stain", desc: "Water-based concrete stain — 24 colors", deal: "Color sample kit free" },
];

const CLOSING_OFFERS = [
  "🔥 NEW CONTRACTOR WELCOME PACKAGE: 20% off first order + free training session",
  "⭐ VOLUME DEAL: Order $2,500+ and get free same-day shipping",
  "🎓 FREE CERTIFICATION: Complete XPS training and get certified installer status",
  "📦 STARTER KIT: $999 all-in-one garage kit (usually $1,399)",
  "🤝 REFERRAL BONUS: $100 credit for every contractor you refer",
  "⏰ LIMITED: Buy any 3 products, get 4th at 50% off",
];

export default function ProductReferencePanel() {
  const [filter, setFilter] = useState("All");
  const [scraping, setScraping] = useState(false);
  const [scrapedProducts, setScrapedProducts] = useState(null);

  const categories = ["All", ...new Set(XPS_PRODUCTS.map(p => p.category))];
  const filtered = filter === "All" ? XPS_PRODUCTS : XPS_PRODUCTS.filter(p => p.category === filter);

  const scrapeWebsite = async () => {
    setScraping(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: "List the top products and services available from XPS Xpress (xpsxpress.com) — America's flooring coatings franchise. Include product names, categories, and brief descriptions. Focus on epoxy, polyaspartic, metallic coatings, polished concrete supplies, diamond tooling, and training services.",
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            products: { type: "array", items: { type: "object", properties: { name: { type: "string" }, category: { type: "string" }, description: { type: "string" } } } },
            services: { type: "array", items: { type: "string" } },
            locations_count: { type: "string" },
          },
        },
        model: "gemini_3_flash",
      });
      setScrapedProducts(res);
    } catch (err) { console.error(err); }
    setScraping(false);
  };

  return (
    <div className="space-y-4">
      {/* Closing offers */}
      <div className="glass-card rounded-xl p-4">
        <h3 className="text-xs font-bold text-primary flex items-center gap-1.5 mb-2"><Tag className="w-3.5 h-3.5" /> Closing Offers & Deals</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
          {CLOSING_OFFERS.map((offer, i) => (
            <div key={i} className="bg-primary/5 border border-primary/20 rounded-lg p-2 text-[10px] text-foreground/80">{offer}</div>
          ))}
        </div>
      </div>

      {/* Live scrape button */}
      <button onClick={scrapeWebsite} disabled={scraping} className="flex items-center gap-2 px-4 py-2 rounded-lg metallic-gold-bg text-background text-xs font-bold hover:brightness-110 disabled:opacity-50">
        {scraping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
        {scraping ? "Scraping xpsxpress.com..." : "Live Scrape XPS Website"}
      </button>

      {scrapedProducts && (
        <div className="glass-card rounded-xl p-4 space-y-2">
          <h3 className="text-xs font-bold text-primary flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Live Website Data</h3>
          {scrapedProducts.products?.map((p, i) => (
            <div key={i} className="bg-secondary/30 rounded-lg p-2">
              <span className="text-[10px] font-bold text-foreground">{p.name}</span>
              <span className="text-[8px] text-primary ml-2">{p.category}</span>
              <p className="text-[9px] text-muted-foreground">{p.description}</p>
            </div>
          ))}
          {scrapedProducts.locations_count && (
            <p className="text-[10px] text-muted-foreground">📍 {scrapedProducts.locations_count} locations</p>
          )}
        </div>
      )}

      {/* Category filter */}
      <div className="flex gap-1 flex-wrap">
        {categories.map(c => (
          <button key={c} onClick={() => setFilter(c)} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold ${filter === c ? "metallic-gold-bg text-background" : "bg-secondary text-muted-foreground"}`}>{c}</button>
        ))}
      </div>

      {/* Product cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {filtered.map((p, i) => (
          <div key={i} className="glass-card rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-foreground">{p.name}</span>
              <span className="text-[8px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">{p.category}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mb-2">{p.desc}</p>
            <div className="flex items-center gap-4 mb-1.5">
              <div>
                <span className="text-[8px] text-muted-foreground block">Retail</span>
                <span className="text-xs font-bold text-foreground">{p.retail}</span>
              </div>
              <div>
                <span className="text-[8px] text-muted-foreground block">Contractor</span>
                <span className="text-xs font-bold text-green-400">{p.contractor}</span>
              </div>
            </div>
            <div className="bg-green-500/10 rounded-lg px-2 py-1 text-[9px] text-green-400 font-bold">🎁 {p.deal}</div>
          </div>
        ))}
      </div>
    </div>
  );
}