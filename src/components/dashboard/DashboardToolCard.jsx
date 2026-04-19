import { Star, Pencil } from "lucide-react";
import { ICON_MAP } from "./dashboardDefaults";
import { cn } from "@/lib/utils";

export default function DashboardToolCard({ tool, starred, onOpen, onToggleStar, onEdit, dragHandleProps, displayNumber }) {
  const Icon = ICON_MAP[tool.iconName] || ICON_MAP["Users"];

  return (
    <div
      className="group rounded-xl p-4 text-left cursor-pointer relative"
      style={{
        background: "rgba(0, 0, 0, 0.45)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)",
        transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease, border-color 0.3s ease",
      }}
      onClick={() => onOpen(tool.id)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px) scale(1.03)";
        e.currentTarget.style.borderImage = "linear-gradient(135deg, #b8860b, #d4af37, #f5e6a3, #c0c0c0, #d4af37, #b8860b) 1";
        e.currentTarget.style.boxShadow = "0 12px 40px rgba(212,175,55,0.15), 0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.borderImage = "none";
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

      {/* Star + number (top-right, hidden on hover for action buttons) */}
      <div className="absolute top-2 right-2 flex flex-col items-center gap-0.5 group-hover:hidden">
        {starred && <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />}
        {displayNumber != null && (
          <span className="text-[10px] font-semibold text-white/60">{displayNumber}</span>
        )}
      </div>

      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 mt-1 transition-colors"
        style={{ backgroundColor: `${tool.color}18` }}
      >
        <Icon className="w-5 h-5 transition-colors" style={{ color: tool.color }} />
      </div>
      <div className="text-[15px] font-bold metallic-gold truncate">{tool.label}</div>
      <div className="text-[13px] text-white mt-0.5 leading-tight">{tool.desc}</div>
    </div>
  );
}