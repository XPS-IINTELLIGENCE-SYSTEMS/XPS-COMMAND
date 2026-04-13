import { getIconColor } from "@/lib/iconColors";
import useColorRefresh from "@/hooks/useColorRefresh";
import { Settings } from "lucide-react";

export default function DashboardScrollRow({ cards, statMap, onNav, onColorPick, iconMap }) {
  useColorRefresh();

  return (
    <div className="flex md:grid md:grid-cols-3 gap-3 md:gap-4 overflow-x-auto md:overflow-visible scrollbar-hide snap-x snap-mandatory pb-2 md:pb-0 -mx-2 px-2 md:mx-0 md:px-0">
      {cards.map((card) => {
        const Icon = iconMap[card.icon] || Settings;
        return (
          <div
            key={card.id}
            className="snap-start flex-shrink-0 w-[70vw] sm:w-[45vw] md:w-auto rounded-2xl p-4 md:p-5 text-center transition-all duration-200 bg-white/[0.04] backdrop-blur-2xl border animated-silver-border hover:border-white/[0.25] hover:shadow-[0_0_30px_rgba(255,255,255,0.06)]"
            style={{ borderColor: card.borderColor || undefined }}
          >
            <div className="w-full flex flex-col items-center">
              <button
                onClick={(e) => onColorPick(e, card.id, card.label)}
                className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center mb-3 hover:scale-110 hover:border-white/20 transition-all cursor-pointer"
                title="Click to change icon color"
              >
                <Icon className="w-6 h-6" style={{ color: getIconColor(card.id) }} />
              </button>
              <button onClick={() => onNav(card.nav)} className="text-sm font-bold text-foreground mb-0.5 hover:text-primary transition-colors">{card.label}</button>
              <div className="text-[11px] text-muted-foreground leading-snug">{card.desc}</div>
              {statMap[card.id] && (
                <div className="mt-2 text-xs font-semibold text-primary/80">{statMap[card.id]}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}