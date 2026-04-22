import { useState } from "react";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";

const SCRIPTS = [
  {
    title: "Cold Call Opener — XPress Sales",
    script: `"Hi [NAME], this is [YOUR NAME] with XPS Xpress! I'm reaching out because I noticed your company does [SPECIALTY] work, and I think we might be able to help you save on materials while upgrading quality. Do you have 2 minutes?"`,
  },
  {
    title: "Warm Lead Follow-Up",
    script: `"Hey [NAME], it's [YOUR NAME] from XPS. We spoke briefly [TIMEFRAME] ago about your flooring needs. I wanted to follow up — we actually just launched a new contractor pricing program that I think would be perfect for [COMPANY]. Can I share some details?"`,
  },
  {
    title: "GC / Commercial Intro",
    script: `"Good morning [NAME], I'm [YOUR NAME] with XPS — we're the nation's largest epoxy and polished concrete supplier with 60+ locations. We specialize in providing materials and specs for commercial projects like yours. I'd love to get on your approved vendor list. Who handles your flooring subcontractor bids?"`,
  },
  {
    title: "Closing Script",
    script: `"Based on what you've told me, I'd recommend our [PRODUCT]. For contractors like you, we offer it at [CONTRACTOR PRICE] — that's [SAVINGS]% below retail. Plus, right now we have [CURRENT DEAL]. If you place your first order today, I can also include [BONUS]. How does that sound?"`,
  },
];

const REBUTTALS = [
  { objection: "We already have a supplier", response: "That's great — it means you understand the importance of quality materials. Many of our best contractors use us as a secondary source because our pricing on [PRODUCT] is typically 20-30% below competitors. Can I send you a comparison?" },
  { objection: "Not interested", response: "I completely understand, and I don't want to waste your time. Quick question though — are you currently using epoxy or polyaspartic coatings? Because we just released a new fast-cure system that's cutting application time in half for our installers." },
  { objection: "Too expensive", response: "I hear you on price. That's actually why I'm calling — our contractor pricing is significantly below retail. For example, our 100% solids epoxy is $139/gal for contractors vs $189 retail. And we have volume deals that bring it even lower. What quantities are you typically ordering?" },
  { objection: "Send me info", response: "Absolutely! I'll send that over right now. To make sure I send the most relevant info — are you more focused on residential garage coatings or commercial/industrial work? That way I can include the right product specs and pricing." },
  { objection: "Call back later", response: "Of course! When would be the best time to reach you? I'll put it on my calendar. In the meantime, can I shoot you a quick text with our product catalog link? That way you can browse at your convenience." },
];

export default function CallScriptPanel() {
  const [openScript, setOpenScript] = useState(null);
  const [openRebuttal, setOpenRebuttal] = useState(null);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-bold text-primary flex items-center gap-1.5 mb-2"><FileText className="w-3.5 h-3.5" /> Call Scripts</h3>
        <div className="space-y-1.5">
          {SCRIPTS.map((s, i) => (
            <div key={i} className="glass-card rounded-lg overflow-hidden">
              <button onClick={() => setOpenScript(openScript === i ? null : i)} className="w-full flex items-center justify-between p-2.5 text-left">
                <span className="text-[11px] font-bold text-foreground">{s.title}</span>
                {openScript === i ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
              </button>
              {openScript === i && (
                <div className="px-2.5 pb-2.5">
                  <p className="text-[10px] text-foreground/80 italic bg-primary/5 rounded-lg p-2 border-l-2 border-primary/40">{s.script}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold text-red-400 flex items-center gap-1.5 mb-2">🛡️ Rebuttals</h3>
        <div className="space-y-1.5">
          {REBUTTALS.map((r, i) => (
            <div key={i} className="glass-card rounded-lg overflow-hidden">
              <button onClick={() => setOpenRebuttal(openRebuttal === i ? null : i)} className="w-full flex items-center justify-between p-2.5 text-left">
                <span className="text-[11px] font-bold text-red-400">"{r.objection}"</span>
                {openRebuttal === i ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
              </button>
              {openRebuttal === i && (
                <div className="px-2.5 pb-2.5">
                  <p className="text-[10px] text-foreground/80 bg-green-500/5 rounded-lg p-2 border-l-2 border-green-500/40">→ {r.response}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}