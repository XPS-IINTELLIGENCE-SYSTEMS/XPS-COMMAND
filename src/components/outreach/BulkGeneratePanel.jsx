import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Sparkles, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const GENERATE_OPTIONS = [
  { id: "contractor_intro", label: "Contractor Introductory (Epoxy/Polished/Decorative)", count: 5, category: "Contractor Intro" },
  { id: "epoxy_intro", label: "Epoxy Company Introductory", count: 5, category: "Epoxy Company Intro" },
  { id: "gc_bid", label: "GC Bid List Intro", count: 5, category: "GC Bid List Intro" },
  { id: "followup", label: "Follow-Up Templates", count: 5, category: "Follow-Up" },
  { id: "sales", label: "Sales / Close Templates", count: 5, category: "Sales" },
];

export default function BulkGeneratePanel({ onClose, onDone }) {
  const [selected, setSelected] = useState(new Set(["contractor_intro", "epoxy_intro", "followup", "sales"]));
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState("");
  const [done, setDone] = useState(false);

  const toggle = (id) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const generate = async () => {
    setGenerating(true);
    setDone(false);

    for (const opt of GENERATE_OPTIONS) {
      if (!selected.has(opt.id)) continue;
      setProgress(`Generating ${opt.label}...`);

      const prompt = buildPrompt(opt);
      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            templates: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  subject: { type: "string" },
                  body: { type: "string" },
                },
              },
            },
          },
        },
      });

      const templates = res.templates || [];
      for (const t of templates) {
        await base44.entities.MessageTemplate.create({
          name: t.name,
          subject: t.subject,
          body: t.body,
          category: opt.category,
          channel: "Email",
          tone: "Professional",
          is_active: true,
          usage_count: 0,
        });
      }
    }

    setProgress("");
    setGenerating(false);
    setDone(true);
    onDone?.();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass-panel rounded-2xl w-full max-w-lg p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black metallic-gold">AI Generate Templates</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4" /></button>
        </div>

        <p className="text-xs text-muted-foreground">Select which template categories to generate. Each generates 5 unique XPS-branded email templates from jeremy@shopxps.com.</p>

        <div className="space-y-2">
          {GENERATE_OPTIONS.map(opt => (
            <label key={opt.id} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${selected.has(opt.id) ? "glass-card-active" : "glass-card"}`}>
              <input type="checkbox" checked={selected.has(opt.id)} onChange={() => toggle(opt.id)} className="rounded" />
              <div className="flex-1">
                <div className="text-sm font-bold text-foreground">{opt.label}</div>
                <div className="text-[10px] text-muted-foreground">{opt.count} templates</div>
              </div>
            </label>
          ))}
        </div>

        {progress && (
          <div className="flex items-center gap-2 text-xs text-primary">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> {progress}
          </div>
        )}

        {done && (
          <div className="flex items-center gap-2 text-xs text-green-400">
            <Check className="w-3.5 h-3.5" /> All templates generated and saved!
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={generate} disabled={generating || selected.size === 0}>
            {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Sparkles className="w-3.5 h-3.5 mr-1" />}
            Generate {Array.from(selected).length * 5} Templates
          </Button>
        </div>
      </div>
    </div>
  );
}

function buildPrompt(opt) {
  const base = `You are writing professional outreach email templates for Xtreme Polishing Systems (XPS Xpress — "Floors For Life").

COMPANY INFO:
- Brand: Xtreme Polishing Systems (XPS Xpress)
- Sub-brands: Polished Concrete University, National Concrete Polishing
- Sender: Jeremy Bensen, AI Marketing & Sales Director
- Email: jeremy@shopxps.com
- 60+ franchise locations nationwide
- 50,000+ completed projects
- 5,000+ trained professionals
- 10-year warranty programs
- Products: epoxy, polyaspartic, polyurea, metallic epoxy, polished concrete, decorative concrete, industrial coatings, diamond tooling, grinders, densifiers, stains, sealers
- Services: contractor training, certification, equipment sales, material supply, job support

Generate exactly ${opt.count} unique email templates. Each must have: name, subject, body.
The body should be plain text (no HTML). Professional but warm tone. Include specific XPS product mentions. End with Jeremy Bensen's sign-off.`;

  switch (opt.id) {
    case "contractor_intro":
      return `${base}\n\nThese are INTRODUCTORY emails to EPOXY, DECORATIVE CONCRETE, and POLISHED CONCRETE contractors. The goal is to introduce XPS as their material/equipment supplier and training partner. Mention contractor-exclusive pricing, free training at Polished Concrete University, and the XPS contractor app. Each template should target a slightly different specialty (epoxy installer, decorative concrete artist, polished concrete crew, garage coating company, multi-service flooring contractor).`;
    case "epoxy_intro":
      return `${base}\n\nThese are INTRODUCTORY emails specifically for EPOXY COMPANIES. The goal is to introduce XPS products as superior alternatives to what they currently use (Penntek, Rust-Oleum, etc.). Highlight XPS polyaspartic fast-cure systems, metallic epoxy kits, industrial-grade formulas, bulk contractor pricing, and same-day shipping from 60+ locations. Each template targets a different epoxy business type (residential garage, commercial kitchen, industrial warehouse, metallic/decorative epoxy, startup epoxy company).`;
    case "gc_bid":
      return `${base}\n\nThese are INTRODUCTORY emails to GENERAL CONTRACTORS asking to be placed on their bidders list for flooring subcontract work. Position XPS/NCP as a national specialty flooring subcontractor. Mention GSA approval, LEED certification, AI-driven estimating, 60+ locations for reliable manpower. Each targets a different GC type (national, regional, healthcare, warehouse/industrial, government).`;
    case "followup":
      return `${base}\n\nThese are FOLLOW-UP emails after initial contact with contractors or GCs. The goal is to re-engage, provide value, and move toward a sale or bid list placement. Include templates for: 1) 3-day follow-up after intro email, 2) 1-week follow-up with a specific product highlight, 3) 2-week follow-up with a case study or success story, 4) "checking in" follow-up after a call, 5) "special offer" follow-up with a limited-time contractor discount.`;
    case "sales":
      return `${base}\n\nThese are SALES / CLOSING emails designed to convert interested contractors into buyers. Include templates for: 1) New contractor welcome package offer, 2) Volume discount proposal, 3) Equipment + material bundle deal, 4) Training enrollment pitch with product trial, 5) Exclusive territory / preferred contractor program pitch. Each should have urgency and clear CTAs.`;
    default:
      return base;
  }
}