import { useState, useEffect, useRef } from "react";
import { MessageSquare } from "lucide-react";

export default function NotesWidget({ content, onChange }) {
  const [value, setValue] = useState(content || "");
  const timer = useRef(null);

  useEffect(() => { setValue(content || ""); }, [content]);

  const handleChange = (e) => {
    const v = e.target.value;
    setValue(v);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(v), 800);
  };

  return (
    <div className="glass-card rounded-xl p-3">
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="w-3.5 h-3.5 metallic-gold-icon" />
        <span className="text-[11px] font-bold metallic-gold">Quick Notes</span>
      </div>
      <textarea
        value={value}
        onChange={handleChange}
        placeholder="Type your notes here... (auto-saves)"
        className="w-full min-h-[80px] max-h-[200px] resize-y bg-transparent text-xs text-foreground placeholder:text-muted-foreground/40 outline-none border border-white/[0.06] rounded-lg p-2"
      />
    </div>
  );
}