import { Lightbulb, Play, BookOpen, Star } from "lucide-react";

const tips = [
  { title: "Surface Prep Secrets", desc: "The #1 mistake contractors make with moisture testing", icon: Play, tag: "Video" },
  { title: "Pricing for Profit", desc: "How to quote epoxy jobs at $8-12/sqft and win every time", icon: BookOpen, tag: "Guide" },
  { title: "Metallic Epoxy Techniques", desc: "Advanced manipulation methods for show-stopping floors", icon: Star, tag: "Pro Tip" },
  { title: "Upselling Coatings", desc: "Turn a $3k garage job into a $7k full system install", icon: Lightbulb, tag: "Sales" },
  { title: "Diamond Grinding 101", desc: "Grit selection, speed settings, and pattern strategy", icon: Play, tag: "Video" },
  { title: "Handling Callbacks", desc: "How to prevent and professionally resolve coating failures", icon: BookOpen, tag: "Guide" },
];

export default function TipsView() {
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shimmer-card">
            <Lightbulb className="w-5 h-5 metallic-gold-icon shimmer-icon" />
          </div>
          <div>
            <h1 className="text-lg font-bold xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>Tips & Tricks</h1>
            <p className="text-xs text-muted-foreground">Pro knowledge to grow your flooring business</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {tips.map((tip) => {
            const Icon = tip.icon;
            return (
              <button
                key={tip.title}
                className="shimmer-card text-left p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="shimmer-icon-container w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 shimmer-icon metallic-silver-icon" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-foreground">{tip.title}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{tip.tag}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{tip.desc}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}