import { useState, useRef, useEffect } from "react";
import { X, RotateCcw, Check } from "lucide-react";
import { COLOR_PALETTE, getIconColor, setIconColor, resetIconColor, getDefaultColor } from "@/lib/iconColors";
import { cn } from "@/lib/utils";

/**
 * ColorPicker — a floating popover for changing an item's color.
 * Shows psychology-driven presets + custom hex input.
 *
 * Props:
 *   targetId  — the icon/element id (maps to iconColors system)
 *   position  — { x, y } screen coords for the popover
 *   onClose   — callback to dismiss
 *   label     — optional display name shown in header
 */
export default function ColorPicker({ targetId, position, onClose, label }) {
  const [customHex, setCustomHex] = useState("");
  const ref = useRef(null);
  const currentColor = getIconColor(targetId);
  const defaultColor = getDefaultColor(targetId);
  const isOverridden = currentColor !== defaultColor;

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Position clamping so it doesn't go off screen
  const style = {};
  if (position) {
    const w = 280, h = 400;
    const x = Math.min(position.x, window.innerWidth - w - 12);
    const y = Math.min(position.y, window.innerHeight - h - 12);
    style.position = "fixed";
    style.left = Math.max(8, x);
    style.top = Math.max(8, y);
    style.zIndex = 9999;
  }

  const applyColor = (hex) => {
    setIconColor(targetId, hex);
  };

  const handleReset = () => {
    resetIconColor(targetId);
  };

  const handleCustomApply = () => {
    const hex = customHex.trim();
    if (/^#?[0-9a-fA-F]{6}$/.test(hex)) {
      applyColor(hex.startsWith("#") ? hex : `#${hex}`);
      setCustomHex("");
    }
  };

  return (
    <div ref={ref} style={style} className="w-[272px] rounded-xl glass-panel border border-white/[0.12] shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md border border-white/20" style={{ backgroundColor: currentColor }} />
          <span className="text-xs font-semibold text-foreground truncate max-w-[140px]">
            {label || targetId}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {isOverridden && (
            <button onClick={handleReset} className="p-1 rounded-md hover:bg-white/10 text-muted-foreground" title="Reset to default">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
          <button onClick={onClose} className="p-1 rounded-md hover:bg-white/10 text-muted-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Preset palette */}
      <div className="p-3">
        <div className="text-[9px] text-muted-foreground/60 uppercase tracking-wider font-semibold mb-2">Psychology Palette</div>
        <div className="grid grid-cols-5 gap-1.5">
          {COLOR_PALETTE.map((c) => {
            const isActive = currentColor.toLowerCase() === c.hex.toLowerCase();
            return (
              <button
                key={c.hex}
                onClick={() => applyColor(c.hex)}
                title={`${c.name} — ${c.meaning}`}
                className={cn(
                  "group relative w-full aspect-square rounded-lg border transition-all duration-150 hover:scale-110 hover:z-10",
                  isActive ? "border-white ring-2 ring-white/40 scale-110" : "border-white/10 hover:border-white/30"
                )}
                style={{ backgroundColor: c.hex }}
              >
                {isActive && (
                  <Check className="w-3 h-3 absolute inset-0 m-auto" style={{ color: c.hex === "#ffffff" || c.hex === "#e2e8f0" ? "#000" : "#fff" }} />
                )}
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-md bg-black/90 text-[9px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-white/60">{c.meaning}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom hex input */}
      <div className="px-3 pb-3">
        <div className="text-[9px] text-muted-foreground/60 uppercase tracking-wider font-semibold mb-1.5">Custom Color</div>
        <div className="flex gap-1.5">
          <div className="flex-1 flex items-center gap-1.5 glass-input rounded-lg px-2 py-1.5">
            <span className="text-[10px] text-muted-foreground">#</span>
            <input
              value={customHex}
              onChange={(e) => setCustomHex(e.target.value.replace(/[^0-9a-fA-F]/g, "").slice(0, 6))}
              onKeyDown={(e) => e.key === "Enter" && handleCustomApply()}
              placeholder="d4af37"
              className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/40 outline-none font-mono"
              maxLength={6}
            />
          </div>
          <button
            onClick={handleCustomApply}
            disabled={!/^[0-9a-fA-F]{6}$/.test(customHex.trim())}
            className="px-3 py-1.5 rounded-lg text-[10px] font-semibold metallic-gold-bg text-background disabled:opacity-30 transition-all hover:brightness-110"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Current info */}
      <div className="px-3 pb-2.5 flex items-center justify-between">
        <span className="text-[9px] text-muted-foreground/50 font-mono">{currentColor}</span>
        {isOverridden && (
          <span className="text-[9px] text-primary/60">customized</span>
        )}
      </div>
    </div>
  );
}