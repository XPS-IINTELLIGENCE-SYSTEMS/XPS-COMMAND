import { useRef, useEffect } from "react";

export default function WorkspaceNotes({ notes, onChange }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = Math.max(120, ref.current.scrollHeight) + "px";
    }
  }, [notes]);

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Notes</div>
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