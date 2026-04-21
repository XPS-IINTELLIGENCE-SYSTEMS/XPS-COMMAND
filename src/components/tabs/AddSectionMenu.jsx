import { StickyNote, Wrench, SeparatorHorizontal, Type } from "lucide-react";

const SECTION_OPTIONS = [
  { id: "notes", label: "Notes Section", icon: StickyNote, color: "#f59e0b", contentType: "notes" },
  { id: "tools", label: "Tools Section", icon: Wrench, color: "#ec4899", contentType: "tools" },
  { id: "text", label: "Text Block", icon: Type, color: "#6366f1", contentType: "text" },
  { id: "divider", label: "Divider", icon: SeparatorHorizontal, color: "#64748b", contentType: null },
];

export default function AddSectionMenu({ onAdd, onClose }) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="relative z-50 flex flex-wrap items-center justify-center gap-2 py-3 px-4 rounded-xl glass-card border border-white/10">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-bold mr-2">Add:</span>
        {SECTION_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.id}
              onClick={() => { onAdd(opt.id, opt.contentType); onClose(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
            >
              <Icon className="w-3.5 h-3.5" style={{ color: opt.color }} />
              {opt.label}
            </button>
          );
        })}
      </div>
    </>
  );
}