import { useState } from "react";
import { Plus, X, Check, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function loadButtons() {
  try {
    const saved = localStorage.getItem("xps-chat-quick-btns");
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
}

function saveButtons(btns) {
  localStorage.setItem("xps-chat-quick-btns", JSON.stringify(btns));
}

export default function QuickActionButtons({ onSend }) {
  const [buttons, setButtons] = useState(loadButtons);
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [command, setCommand] = useState("");

  const handleAdd = () => {
    if (!label.trim() || !command.trim()) return;
    const updated = [...buttons, { id: Date.now().toString(), label: label.trim(), command: command.trim() }];
    setButtons(updated);
    saveButtons(updated);
    setLabel("");
    setCommand("");
    setAdding(false);
  };

  const handleRemove = (id) => {
    const updated = buttons.filter(b => b.id !== id);
    setButtons(updated);
    saveButtons(updated);
  };

  if (buttons.length === 0 && !adding) {
    return (
      <button
        onClick={() => setAdding(true)}
        className="flex items-center gap-1 text-[9px] text-muted-foreground/60 hover:text-muted-foreground transition-colors mt-1.5 px-1"
      >
        <Plus className="w-2.5 h-2.5" /> Add quick action
      </button>
    );
  }

  return (
    <div className="mt-1.5 space-y-1.5">
      <div className="flex flex-wrap gap-1.5">
        {buttons.map((btn) => (
          <div key={btn.id} className="group relative">
            <button
              onClick={() => onSend(btn.command)}
              className="shimmer-card flex items-center gap-1 text-[9px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md glass-card"
            >
              <Zap className="w-2.5 h-2.5 shimmer-icon metallic-gold-icon" />
              {btn.label}
            </button>
            <button
              onClick={() => handleRemove(btn.id)}
              className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-2 h-2" />
            </button>
          </div>
        ))}
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-0.5 text-[9px] text-muted-foreground/50 hover:text-muted-foreground transition-colors px-1.5 py-1 rounded-md hover:bg-white/5"
        >
          <Plus className="w-2.5 h-2.5" />
        </button>
      </div>
      {adding && (
        <div className="flex items-center gap-1.5">
          <Input
            placeholder="Label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="h-6 text-[10px] bg-transparent flex-1 min-w-0"
          />
          <Input
            placeholder="Command to send"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            className="h-6 text-[10px] bg-transparent flex-[2] min-w-0"
          />
          <button onClick={handleAdd} className="p-0.5 rounded hover:bg-white/10"><Check className="w-3 h-3 text-primary" /></button>
          <button onClick={() => { setAdding(false); setLabel(""); setCommand(""); }} className="p-0.5 rounded hover:bg-white/10"><X className="w-3 h-3 text-muted-foreground" /></button>
        </div>
      )}
    </div>
  );
}