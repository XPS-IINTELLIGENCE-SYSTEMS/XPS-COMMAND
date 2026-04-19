import { useState } from "react";
import { Plus, Check, Circle } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function PunchListSection({ items, onItemsChange }) {
  const [newItem, setNewItem] = useState("");

  const addItem = () => {
    if (!newItem.trim()) return;
    const updated = [...items, { text: newItem.trim(), done: false, added: new Date().toISOString() }];
    onItemsChange(updated);
    setNewItem("");
  };

  const toggleItem = (idx) => {
    const updated = items.map((item, i) => i === idx ? { ...item, done: !item.done } : item);
    onItemsChange(updated);
  };

  const doneCount = items.filter(i => i.done).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-white">Punch List</h4>
        {items.length > 0 && (
          <span className="text-xs text-white/40">{doneCount}/{items.length} complete</span>
        )}
      </div>

      {/* Progress bar */}
      {items.length > 0 && (
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-green-500 transition-all"
            style={{ width: `${(doneCount / items.length) * 100}%` }}
          />
        </div>
      )}

      {/* Items */}
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => toggleItem(i)}
            className="flex items-center gap-3 w-full p-3 rounded-lg bg-white/[0.03] border border-white/8 active:bg-white/[0.06] transition-all text-left"
          >
            {item.done
              ? <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0"><Check className="w-3 h-3 text-green-400" /></div>
              : <Circle className="w-5 h-5 text-white/20 flex-shrink-0" />
            }
            <span className={`text-sm flex-1 ${item.done ? "text-white/30 line-through" : "text-white/80"}`}>
              {item.text}
            </span>
          </button>
        ))}
      </div>

      {/* Add new */}
      <div className="flex gap-2">
        <Input
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addItem()}
          placeholder="Add punch list item…"
          className="bg-white/5 border-white/10 text-sm flex-1"
        />
        <button
          onClick={addItem}
          disabled={!newItem.trim()}
          className="p-2 rounded-lg bg-primary/15 text-primary disabled:opacity-30 active:bg-primary/25 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}