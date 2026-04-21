import { Briefcase, User, FileText, Phone, Bot, Layers } from "lucide-react";

const PROJECT_ICONS = {
  Lead: User,
  CommercialJob: Briefcase,
  Proposal: FileText,
  ScheduledCall: Phone,
  AgentTask: Bot,
  Custom: Layers,
};

function timeToSlot(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 4 + Math.floor(m / 15);
}

export default function CalendarEventBlock({ event, slotHeight, onClick }) {
  const startSlot = timeToSlot(event.start_time);
  const endSlot = timeToSlot(event.end_time);
  const span = Math.max(endSlot - startSlot, 1);
  const top = startSlot * slotHeight;
  const height = span * slotHeight;
  const color = event.color || "#d4af37";
  const Icon = PROJECT_ICONS[event.project_type] || Layers;
  const isSmall = height < 40;

  return (
    <button
      onClick={onClick}
      className="absolute left-0.5 right-0.5 z-20 rounded-md overflow-hidden text-left group transition-all hover:brightness-110 hover:shadow-lg"
      style={{
        top,
        height,
        backgroundColor: color + "20",
        borderLeft: `3px solid ${color}`,
      }}
    >
      <div className={`px-1.5 ${isSmall ? "py-0" : "py-1"} h-full`}>
        <div className="flex items-center gap-1">
          {!isSmall && <Icon className="w-3 h-3 flex-shrink-0" style={{ color }} />}
          <span
            className={`font-semibold truncate ${isSmall ? "text-[9px]" : "text-[10px]"}`}
            style={{ color }}
          >
            {event.title}
          </span>
        </div>
        {!isSmall && event.project_label && (
          <div className="text-[9px] text-muted-foreground truncate mt-0.5">
            {event.project_label}
          </div>
        )}
        {!isSmall && height >= 56 && (
          <div className="text-[9px] text-muted-foreground/60 mt-0.5">
            {event.start_time} – {event.end_time}
          </div>
        )}
      </div>
    </button>
  );
}