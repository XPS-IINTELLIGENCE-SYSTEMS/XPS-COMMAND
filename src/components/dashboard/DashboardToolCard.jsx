import { Star, Pencil } from "lucide-react";
import { ICON_MAP } from "./dashboardDefaults";
import { cn } from "@/lib/utils";

export default function DashboardToolCard({ tool, starred, onOpen, onToggleStar, onEdit, dragHandleProps, index }) {
  const Icon = ICON_MAP[tool.iconName] || ICON_MAP["Users"];

  return (
    <div
      className="group rounded-xl p-4 text-left transition-all duration-200 cursor-pointer relative"
      style={{
        background: "rgba(0, 0, 0, 0.45)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
      onClick={() => onOpen(tool.id)}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(212, 175, 55, 0.25)";
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
        e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)";
      }}
      {...dragHandleProps}
    >
      {/* Star + Edit buttons */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(tool); }}
          className="p-1.5 rounded-md hover:bg-white/10"
          title="Edit card"
        >
          <Pencil className="w-3.5 h-3.5 text-white/50" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleStar(tool.id); }}
          className="p-1.5 rounded-md hover:bg-white/10"
          title={starred ? "Unstar" : "Star"}
        >
          <Star className={cn("w-3.5 h-3.5", starred ? "fill-yellow-400 text-yellow-400" : "text-white/50")} />
        </button>
      </div>

      {/* Star indicator (always visible when starred) */}
      {starred && (
        <div className="absolute top-2.5 right-2.5 group-hover:hidden">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
        </div>
      )}

      {/* Number badge */}
      {typeof index === "number" && (
        <div className="absolute top-2.5 left-2.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold metallic-gold-bg text-black">
          {index + 1}
        </div>
      )}

      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 mt-1 transition-colors"
        style={{ backgroundColor: `${tool.color}18` }}
      >
        <Icon className="w-5 h-5 transition-colors" style={{ color: tool.color }} />
      </div>
      <div className="text-[15px] font-bold metallic-gold truncate">{tool.label}</div>
      <div className="text-[13px] text-white/40 mt-0.5 leading-tight">{tool.desc}</div>
    </div>
  );
}