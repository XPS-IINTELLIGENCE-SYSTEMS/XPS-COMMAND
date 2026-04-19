import { Star, Pencil } from "lucide-react";
import { ICON_MAP } from "./dashboardDefaults";
import { cn } from "@/lib/utils";

export default function DashboardToolCard({ tool, starred, onOpen, onToggleStar, onEdit, dragHandleProps, displayNumber }) {
  const Icon = ICON_MAP[tool.iconName] || ICON_MAP["Users"];

  return (
    <div
      className="group rounded-xl p-3 sm:p-4 text-left cursor-pointer relative active:scale-[0.97] transition-transform"
      style={{
        background: "rgba(0, 0, 0, 0.45)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
      onClick={() => onOpen(tool.id)}
      {...dragHandleProps}
    >
      {/* Star + Edit — always visible on mobile, hover on desktop */}
      <div className="absolute top-1.5 right-1.5 flex gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(tool); }}
          className="p-2 rounded-md active:bg-white/10 sm:hover:bg-white/10"
          title="Edit card"
        >
          <Pencil className="w-3.5 h-3.5 text-white/40" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleStar(tool.id); }}
          className="p-2 rounded-md active:bg-white/10 sm:hover:bg-white/10"
          title={starred ? "Unstar" : "Star"}
        >
          <Star className={cn("w-3.5 h-3.5", starred ? "fill-yellow-400 text-yellow-400" : "text-white/40")} />
        </button>
      </div>

      <div
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mb-2 sm:mb-3 mt-1 transition-colors"
        style={{ backgroundColor: `${tool.color}18` }}
      >
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 transition-colors" style={{ color: tool.color }} />
      </div>
      <div className="text-[13px] sm:text-[15px] font-bold metallic-gold truncate pr-6">{tool.label}</div>
      <div className="text-[11px] sm:text-[13px] text-white/70 mt-0.5 leading-tight line-clamp-2">{tool.desc}</div>
    </div>
  );
}