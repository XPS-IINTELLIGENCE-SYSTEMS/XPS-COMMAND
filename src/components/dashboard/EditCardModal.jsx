import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const COLOR_OPTIONS = [
  { name: "Gold", value: "#d4af37" },
  { name: "Silver", value: "#c0c0c0" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#22c55e" },
  { name: "Red", value: "#ef4444" },
  { name: "Purple", value: "#a855f7" },
  { name: "Orange", value: "#f97316" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Pink", value: "#ec4899" },
  { name: "White", value: "#ffffff" },
];

export default function EditCardModal({ open, onClose, card, onSave }) {
  const [label, setLabel] = useState(card?.label || "");
  const [desc, setDesc] = useState(card?.desc || "");
  const [iconColor, setIconColor] = useState(card?.iconColor || "#d4af37");
  const [borderColor, setBorderColor] = useState(card?.borderColor || "");

  const handleSave = () => {
    onSave({ ...card, label, desc, iconColor, borderColor });
    onClose();
  };

  if (!card) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle>Edit Card</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Card Title</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Description</Label>
            <Input value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Icon Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setIconColor(c.value)}
                  className="w-7 h-7 rounded-full border-2 transition-all"
                  style={{
                    backgroundColor: c.value,
                    borderColor: iconColor === c.value ? "#fff" : "transparent",
                    boxShadow: iconColor === c.value ? `0 0 8px ${c.value}` : "none",
                  }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Border Color</Label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setBorderColor("")}
                className="w-7 h-7 rounded-full border-2 border-dashed border-muted-foreground/30 text-[8px] text-muted-foreground flex items-center justify-center"
                style={{ boxShadow: !borderColor ? "0 0 6px rgba(255,255,255,0.3)" : "none" }}
              >
                Auto
              </button>
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setBorderColor(c.value)}
                  className="w-7 h-7 rounded-full border-2 transition-all"
                  style={{
                    backgroundColor: c.value,
                    borderColor: borderColor === c.value ? "#fff" : "transparent",
                    boxShadow: borderColor === c.value ? `0 0 8px ${c.value}` : "none",
                  }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}