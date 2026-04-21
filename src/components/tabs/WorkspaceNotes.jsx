import { useRef, useEffect } from "react";
import { X } from "lucide-react";

export default function WorkspaceNotes({ notes, onChange, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = Math.max(120, ref.current.scrollHeight) + "px";
    }
  }, [notes]);

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes</div>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        )}
      </div>
      <textarea
        ref={ref}
        value={notes}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your notes here..."
        className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 resize-none outline-none min-h-[120px]"
      />
    </div>
  );
}