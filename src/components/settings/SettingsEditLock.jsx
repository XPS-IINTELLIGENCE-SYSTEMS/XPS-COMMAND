import { useState, useEffect } from "react";
import { Lock, Unlock } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function SettingsEditLock() {
  const [locked, setLocked] = useState(() => {
    return localStorage.getItem("xps-edit-locked") === "true";
  });

  useEffect(() => {
    localStorage.setItem("xps-edit-locked", locked);
    window.dispatchEvent(new CustomEvent("xps-edit-lock-change", { detail: { locked } }));
  }, [locked]);

  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
          {locked ? <Lock className="w-4 h-4 text-destructive" /> : <Unlock className="w-4 h-4 text-green-500" />}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-foreground">Edit Lock</h3>
          <p className="text-[10px] text-muted-foreground">
            {locked ? "UI is locked — editing disabled to prevent accidental changes" : "UI is unlocked — you can edit cards, labels, colors, and layout"}
          </p>
        </div>
        <Switch checked={!locked} onCheckedChange={() => setLocked(!locked)} />
      </div>
    </div>
  );
}