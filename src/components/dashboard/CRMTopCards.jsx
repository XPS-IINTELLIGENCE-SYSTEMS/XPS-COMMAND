import { useState } from "react";
import { UserCheck, Clock, Users } from "lucide-react";
import { CRM_COLORS, getIconColor, setIconColor } from "@/lib/iconColors";
import useColorRefresh from "@/hooks/useColorRefresh";
import useEditorMode from "@/hooks/useEditorMode";
import ColorPicker from "../shared/ColorPicker";

const CARDS = [
  { id: "contact_first", label: "Contact First", desc: "Highest priority awaiting contact", icon: UserCheck, color: CRM_COLORS.contact_first, nav: "crm" },
  { id: "follow_up_crm", label: "Follow Up", desc: "Awaiting follow-up response", icon: Clock, color: CRM_COLORS.follow_up_crm, nav: "follow_up" },
  { id: "in_pipeline", label: "In Pipeline", desc: "Active leads in pipeline", icon: Users, color: CRM_COLORS.in_pipeline, nav: "crm" },
];

export default function CRMTopCards({ leads, onNavigate }) {
  const [colorPicker, setColorPicker] = useState(null);
  useColorRefresh();
  const editorMode = useEditorMode();

  const openPicker = (e, id, label) => {
    if (!editorMode) return;
    e.preventDefault();
    e.stopPropagation();
    setColorPicker({ id, x: e.clientX, y: e.clientY, label });
  };
  const contactFirst = leads.filter(l =>
    ["Qualified", "Prioritized", "Validated"].includes(l.pipeline_status) && !l.last_contacted
  ).length;

  const followUp = leads.filter(l =>
    ["Contacted", "Proposal", "Negotiation"].includes(l.stage)
  ).length;

  const pipeline = leads.filter(l => !["Won", "Lost"].includes(l.stage));
  const pipelineValue = pipeline.reduce((s, l) => s + (l.estimated_value || 0), 0);

  const statMap = {
    contact_first: `${contactFirst} leads`,
    follow_up_crm: `${followUp} awaiting`,
    in_pipeline: `${pipeline.length} · $${(pipelineValue / 1000).toFixed(0)}k`,
  };

  return (
    <>
    <div className="text-center mb-4">
      <h2 className="text-lg md:text-xl font-extrabold xps-gold-slow-shimmer tracking-wide" style={{ fontFamily: "'Montserrat', sans-serif" }}>
        Priority Actions
      </h2>
      <p className="text-[11px] text-muted-foreground mt-0.5">Your most urgent leads — take action now</p>
    </div>
    <div className="flex md:grid md:grid-cols-3 gap-3 md:gap-4 mb-10 overflow-x-auto md:overflow-visible scrollbar-hide snap-x snap-mandatory pb-2 md:pb-0 -mx-2 px-2 md:mx-0 md:px-0">
      {CARDS.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="snap-start flex-shrink-0 w-[70vw] sm:w-[45vw] md:w-auto rounded-2xl p-4 md:p-5 text-center transition-all duration-200 bg-white/[0.04] backdrop-blur-2xl border animated-silver-border hover:border-white/[0.25] hover:shadow-[0_0_30px_rgba(255,255,255,0.06)]"
          >
            <button
              onClick={(e) => openPicker(e, card.id, card.label)}
              className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center mb-3 mx-auto hover:scale-110 hover:border-white/20 transition-all cursor-pointer"
              title="Click to change color"
            >
              <Icon className="w-6 h-6" style={{ color: getIconColor(card.id) || card.color }} />
            </button>
            <button onClick={() => onNavigate(card.nav)} className="w-full">
              <div className="text-sm font-bold text-foreground mb-0.5">{card.label}</div>
              <div className="text-[11px] text-muted-foreground leading-snug">{card.desc}</div>
              <div className="mt-2 text-xs font-semibold text-primary/80">{statMap[card.id]}</div>
            </button>
          </div>
        );
      })}
    </div>
    {colorPicker && (
      <ColorPicker
        targetId={colorPicker.id}
        position={{ x: colorPicker.x, y: colorPicker.y }}
        onClose={() => setColorPicker(null)}
        label={colorPicker.label}
      />
    )}
    </>
  );
}