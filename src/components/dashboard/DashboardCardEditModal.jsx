import { useState } from "react";
import { X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ICON_OPTIONS, COLOR_OPTIONS, ICON_MAP } from "./dashboardDefaults";
import { cn } from "@/lib/utils";

export default function DashboardCardEditModal({ card, onSave, onClose, showNumbers, customNumber, onToggleNumbers, onSetCustomNumber }) {
  const [label, setLabel] = useState(card.label);
  const [desc, setDesc] = useState(card.desc);
  const [iconName, setIconName] = useState(card.iconName);
  const [color, setColor] = useState(card.color);
  const [numberVal, setNumberVal] = useState(customNumber ?? "");

  const handleSave = () => {
    if (onSetCustomNumber) {
      onSetCustomNumber(card.id, numberVal === "" ? null : numberVal);
    }
    onSave({ ...card, label, desc, iconName, color });
    onClose();
  };

  const SelectedIcon = ICON_MAP[iconName] || ICON_MAP["Users"];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-base font-bold text-foreground">Edit Card</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Preview */}
          <div className="flex items-center gap-3 p-4 rounded-xl glass-card">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
              <SelectedIcon className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">{label || "Untitled"}</div>
              <div className="text-xs text-muted-foreground">{desc || "No description"}</div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Card Name</label>
            <Input value={label} onChange={e => setLabel(e.target.value)} placeholder="Card name" className="h-9 text-sm" />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Description</label>
            <Input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Short description" className="h-9 text-sm" />
          </div>

          {/* Icon Picker */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block">Icon</label>
            <div className="grid grid-cols-8 gap-1.5">
              {ICON_OPTIONS.map(opt => {
                const Ic = opt.icon;
                return (
                  <button
                    key={opt.name}
                    onClick={() => setIconName(opt.name)}
                    className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                      iconName === opt.name
                        ? "bg-primary/20 border-2 border-primary"
                        : "bg-secondary/50 border border-transparent hover:border-border"
                    )}
                  >
                    <Ic className="w-4 h-4" style={{ color: iconName === opt.name ? color : undefined }} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block">Icon Color</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all border-2",
                    color === c ? "border-white scale-110" : "border-transparent hover:scale-105"
                  )}
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Number Badge Settings */}
          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground">Show Numbers on Cards</label>
              <Switch checked={showNumbers} onCheckedChange={onToggleNumbers} />
            </div>
            {showNumbers && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Custom Number for This Card</label>
                <Input
                  value={numberVal}
                  onChange={e => setNumberVal(e.target.value)}
                  placeholder="Auto (leave blank for auto)"
                  className="h-9 text-sm"
                />
                <p className="text-[10px] text-muted-foreground mt-1">Leave blank for auto-numbering, or enter a custom value.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}