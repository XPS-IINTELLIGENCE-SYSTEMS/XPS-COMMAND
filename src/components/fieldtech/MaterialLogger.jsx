import { useState } from "react";
import { Package, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const COMMON_MATERIALS = [
  "Epoxy Resin", "Hardener", "Primer", "Polyaspartic", "Polyurea",
  "Concrete Densifier", "Flake/Chip", "Top Coat Sealer", "Crack Filler",
  "Diamond Pads", "Grinding Segments", "Tape/Masking", "Other"
];

const UNITS = ["gallons", "lbs", "sqft", "bags", "boxes", "rolls", "sets", "hours"];

export default function MaterialLogger({ entries, onEntriesChange }) {
  const [material, setMaterial] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("gallons");
  const [note, setNote] = useState("");
  const [showCommon, setShowCommon] = useState(false);

  const addEntry = () => {
    if (!material || !quantity) return;
    const entry = {
      material,
      quantity: Number(quantity),
      unit,
      note,
      date: new Date().toISOString()
    };
    onEntriesChange([...entries, entry]);
    setMaterial("");
    setQuantity("");
    setNote("");
    setShowCommon(false);
  };

  const removeEntry = (idx) => {
    onEntriesChange(entries.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Package className="w-4 h-4 text-yellow-400" /> Material Log
        </h3>
        <span className="text-xs text-white/40">{entries.length} entries</span>
      </div>

      {/* Existing entries */}
      {entries.length > 0 && (
        <div className="space-y-1">
          {entries.map((entry, i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/8">
              <div className="flex-1 min-w-0">
                <span className="text-sm text-white">{entry.material}</span>
                <span className="text-xs text-primary ml-2">{entry.quantity} {entry.unit}</span>
                {entry.note && <p className="text-[10px] text-white/30 truncate">{entry.note}</p>}
              </div>
              <span className="text-[9px] text-white/20 flex-shrink-0">{new Date(entry.date).toLocaleDateString()}</span>
              <button onClick={() => removeEntry(i)} className="p-1 hover:bg-white/10 rounded text-white/20 hover:text-red-400">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Quick-pick materials */}
      <button onClick={() => setShowCommon(!showCommon)} className="text-[10px] text-primary hover:underline">
        {showCommon ? "Hide" : "Show"} common materials
      </button>
      {showCommon && (
        <div className="flex flex-wrap gap-1">
          {COMMON_MATERIALS.map(m => (
            <button key={m} onClick={() => setMaterial(m)}
              className={`px-2 py-1 rounded text-[10px] border transition-colors ${
                material === m ? "bg-primary/15 text-primary border-primary/30" : "bg-white/5 text-white/50 border-white/10 active:bg-white/10"
              }`}
            >{m}</button>
          ))}
        </div>
      )}

      {/* Add new entry */}
      <div className="grid grid-cols-2 gap-2">
        <Input value={material} onChange={e => setMaterial(e.target.value)}
          placeholder="Material name" className="h-8 text-xs bg-white/5 border-white/10" />
        <div className="flex gap-1">
          <Input type="number" value={quantity} onChange={e => setQuantity(e.target.value)}
            placeholder="Qty" className="h-8 text-xs bg-white/5 border-white/10 w-16" />
          <select value={unit} onChange={e => setUnit(e.target.value)}
            className="h-8 text-xs bg-white/5 border border-white/10 rounded-md px-1 text-white flex-1">
            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        <Input value={note} onChange={e => setNote(e.target.value)}
          placeholder="Note (optional)" className="h-8 text-xs bg-white/5 border-white/10"
          onKeyDown={e => e.key === 'Enter' && addEntry()} />
        <Button size="sm" onClick={addEntry} disabled={!material || !quantity} className="h-8 px-3 gap-1">
          <Plus className="w-3 h-3" /> Log
        </Button>
      </div>
    </div>
  );
}