import { useState, useCallback } from "react";
import { Settings, X, Copy, Palette, Type, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardCustomizer() {
  const [customizations, setCustomizations] = useState(
    JSON.parse(localStorage.getItem("dashboardCustomizations") || "{}")
  );
  const [editingSection, setEditingSection] = useState(null);
  const [showCustomizer, setShowCustomizer] = useState(false);

  const saveCustumizations = (updated) => {
    setCustomizations(updated);
    localStorage.setItem("dashboardCustomizations", JSON.stringify(updated));
  };

  const updateSection = (sectionId, updates) => {
    const updated = {
      ...customizations,
      [sectionId]: { ...customizations[sectionId], ...updates },
    };
    saveCustumizations(updated);
  };

  const getSectionStyle = (sectionId) => {
    const custom = customizations[sectionId];
    return {
      backgroundColor: custom?.bgColor,
      color: custom?.textColor,
      fontSize: custom?.fontSize === "small" ? "12px" : custom?.fontSize === "large" ? "16px" : "14px",
      opacity: custom?.hidden ? 0.5 : 1,
      order: custom?.order,
      display: custom?.hidden ? "none" : "block",
    };
  };

  const getDashboardOrder = () => {
    const sections = Object.entries(customizations)
      .filter(([, config]) => config.order !== undefined)
      .sort(([, a], [, b]) => (a.order || 999) - (b.order || 999));
    return sections;
  };

  const sectionConfig = (sectionId) => customizations[sectionId] || {};

  return {
    customizations,
    showCustomizer,
    setShowCustomizer,
    updateSection,
    getSectionStyle,
    editingSection,
    setEditingSection,
    sectionConfig,
    
    // Customizer Panel Component
    Panel: ({ sectionId, title, onClose }) => {
      const config = customizations[sectionId] || {};

      return (
        <div className="glass-card rounded-xl p-4 space-y-3 border border-primary/20 fixed bottom-6 right-6 z-50 w-80">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold">{title} Settings</h3>
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            <div>
              <label className="text-[9px] font-bold text-muted-foreground">Background Color</label>
              <input
                type="color"
                value={config.bgColor || "#1a1a2e"}
                onChange={(e) => updateSection(sectionId, { bgColor: e.target.value })}
                className="w-full h-8 rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="text-[9px] font-bold text-muted-foreground">Text Color</label>
              <input
                type="color"
                value={config.textColor || "#ffffff"}
                onChange={(e) => updateSection(sectionId, { textColor: e.target.value })}
                className="w-full h-8 rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="text-[9px] font-bold text-muted-foreground">Font Size</label>
              <select
                value={config.fontSize || "normal"}
                onChange={(e) => updateSection(sectionId, { fontSize: e.target.value })}
                className="w-full bg-secondary/40 rounded px-2 py-1.5 text-[9px] text-foreground outline-none"
              >
                <option value="small">Small</option>
                <option value="normal">Normal</option>
                <option value="large">Large</option>
              </select>
            </div>

            <div>
              <label className="text-[9px] font-bold text-muted-foreground">Display Order</label>
              <input
                type="number"
                value={config.order || 999}
                onChange={(e) => updateSection(sectionId, { order: parseInt(e.target.value) })}
                className="w-full bg-secondary/40 rounded px-2 py-1.5 text-[9px] text-foreground outline-none"
              />
            </div>

            <button
              onClick={() => updateSection(sectionId, { hidden: !config.hidden })}
              className="w-full text-[9px] py-1.5 rounded-lg bg-secondary/40 hover:bg-secondary/60 transition-all flex items-center justify-center gap-1"
            >
              {config.hidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              {config.hidden ? "Show" : "Hide"}
            </button>

            <Button size="sm" onClick={onClose} className="w-full text-[9px]">
              Done
            </Button>
          </div>
        </div>
      );
    },

    // Apply customization to section
    applyToSection: (element, sectionId) => {
      const style = getSectionStyle(sectionId);
      Object.assign(element.style, style);
    },
  };
}