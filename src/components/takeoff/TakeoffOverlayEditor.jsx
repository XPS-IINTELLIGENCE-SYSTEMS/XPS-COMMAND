import { useState } from "react";
import { Ruler, GripVertical, Pencil, Check, X, Minus, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ZONE_COLORS = [
  "#d4af37", "#06b6d4", "#22c55e", "#f59e0b", "#ec4899",
  "#8b5cf6", "#14b8a6", "#f97316", "#ef4444", "#84cc16",
];

export default function TakeoffOverlayEditor({ zones, scaleFactor, onZonesChange }) {
  const [editingIdx, setEditingIdx] = useState(null);
  const [editSqft, setEditSqft] = useState("");
  const [editName, setEditName] = useState("");
  const [dragIdx, setDragIdx] = useState(null);

  if (!zones || zones.length === 0) return null;

  const polygonArea = (pts) => {
    let area = 0;
    for (let i = 0; i < pts.length; i++) {
      const j = (i + 1) % pts.length;
      area += pts[i].x * pts[j].y;
      area -= pts[j].x * pts[i].y;
    }
    return Math.abs(area / 2);
  };

  const getZoneSqft = (zone) => Math.round(polygonArea(zone.points) * (scaleFactor || 1));

  const startEdit = (idx) => {
    const zone = zones[idx];
    const sqft = zone.manual_sqft || getZoneSqft(zone);
    setEditingIdx(idx);
    setEditSqft(String(sqft));
    setEditName(zone.name);
  };

  const saveEdit = () => {
    if (editingIdx === null) return;
    const updated = zones.map((z, i) => {
      if (i !== editingIdx) return z;
      return {
        ...z,
        name: editName || z.name,
        manual_sqft: parseInt(editSqft) || null,
      };
    });
    onZonesChange(updated);
    setEditingIdx(null);
  };

  const cancelEdit = () => setEditingIdx(null);

  const adjustSqft = (idx, delta) => {
    const zone = zones[idx];
    const current = zone.manual_sqft || getZoneSqft(zone);
    const updated = zones.map((z, i) => {
      if (i !== idx) return z;
      return { ...z, manual_sqft: Math.max(1, current + delta) };
    });
    onZonesChange(updated);
  };

  // Drag & drop reorder
  const handleDragStart = (idx) => setDragIdx(idx);
  const handleDragOver = (e, idx) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const newZones = [...zones];
    const [moved] = newZones.splice(dragIdx, 1);
    newZones.splice(idx, 0, moved);
    onZonesChange(newZones);
    setDragIdx(idx);
  };
  const handleDragEnd = () => setDragIdx(null);

  const totalSqft = zones.reduce((sum, z) => sum + (z.manual_sqft || getZoneSqft(z)), 0);
  const aiTotal = zones.reduce((sum, z) => sum + getZoneSqft(z), 0);
  const hasManualEdits = zones.some(z => z.manual_sqft);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Ruler className="w-4 h-4 text-primary" /> Zone Editor
          {hasManualEdits && <span className="text-[10px] text-yellow-400 font-normal">(manually adjusted)</span>}
        </h3>
        <span className="text-xs text-white/40">{zones.length} zones · {totalSqft.toLocaleString()} sqft</span>
      </div>

      {/* Zone cards */}
      <div className="space-y-1.5">
        {zones.map((zone, i) => {
          const color = ZONE_COLORS[i % ZONE_COLORS.length];
          const aiSqft = getZoneSqft(zone);
          const displaySqft = zone.manual_sqft || aiSqft;
          const isEditing = editingIdx === i;
          const isAdjusted = zone.manual_sqft && zone.manual_sqft !== aiSqft;

          return (
            <div
              key={i}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                dragIdx === i ? "border-primary/40 bg-primary/5 scale-[1.02]" :
                isEditing ? "border-white/30 bg-white/[0.06]" :
                "border-white/8 bg-white/[0.02] hover:bg-white/[0.04]"
              }`}
            >
              <GripVertical className="w-3.5 h-3.5 text-white/20 cursor-grab flex-shrink-0" />
              <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />

              {isEditing ? (
                <div className="flex-1 flex items-center gap-2 flex-wrap">
                  <Input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="h-7 text-xs bg-white/5 border-white/10 w-28"
                    placeholder="Zone name"
                  />
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      value={editSqft}
                      onChange={e => setEditSqft(e.target.value)}
                      className="h-7 text-xs bg-white/5 border-white/10 w-20 text-right"
                    />
                    <span className="text-[10px] text-white/40">sqft</span>
                  </div>
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={saveEdit}>
                    <Check className="w-3 h-3 text-green-400" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={cancelEdit}>
                    <X className="w-3 h-3 text-red-400" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-white">{zone.name}</span>
                    <span className="text-xs text-white/30 ml-2">{zone.system}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => adjustSqft(i, -50)}
                      className="w-5 h-5 rounded flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/40 hover:text-white">
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <div className="text-right min-w-[60px]">
                      <span className="text-sm font-bold text-primary">{displaySqft.toLocaleString()}</span>
                      <span className="text-[10px] text-white/30 ml-0.5">sqft</span>
                      {isAdjusted && (
                        <div className="text-[9px] text-yellow-400/60 line-through">{aiSqft.toLocaleString()}</div>
                      )}
                    </div>
                    <button onClick={() => adjustSqft(i, 50)}
                      className="w-5 h-5 rounded flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/40 hover:text-white">
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                    <button onClick={() => startEdit(i)}
                      className="w-5 h-5 rounded flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/40 hover:text-white ml-1">
                      <Pencil className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Totals */}
      <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between">
        <div>
          <p className="text-xs text-white/50">Adjusted Total</p>
          <p className="text-2xl font-bold text-primary">{totalSqft.toLocaleString()} sqft</p>
          {hasManualEdits && (
            <p className="text-[10px] text-white/30">AI estimate: {aiTotal.toLocaleString()} sqft ({totalSqft > aiTotal ? '+' : ''}{totalSqft - aiTotal} diff)</p>
          )}
        </div>
        <Ruler className="w-6 h-6 text-primary/40" />
      </div>
    </div>
  );
}