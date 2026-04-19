import { createContext, useContext, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

const SiteSettingsContext = createContext({});

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}

// Map setting keys to CSS custom properties
const CSS_VAR_MAP = {
  primary_color: "--primary",
  background_color: "--background",
  card_color: "--card",
  border_color: "--border",
  muted_color: "--muted",
  accent_color: "--accent",
  destructive_color: "--destructive",
  foreground_color: "--foreground",
};

function hslFromHex(hex) {
  hex = hex.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export default function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState({});
  const [loaded, setLoaded] = useState(false);

  const loadSettings = async () => {
    try {
      const all = await base44.entities.SiteSettings.filter({ is_active: true }, "-updated_date", 100);
      const map = {};
      all.forEach(s => { map[s.setting_key] = s.setting_value; });
      setSettings(map);
      applySettings(map);
    } catch {
      // Settings not available yet — use defaults
    }
    setLoaded(true);
  };

  const applySettings = (map) => {
    const root = document.documentElement;

    // Apply color overrides
    Object.entries(CSS_VAR_MAP).forEach(([key, cssVar]) => {
      if (map[key]) {
        const val = map[key].startsWith("#") ? hslFromHex(map[key]) : map[key];
        root.style.setProperty(cssVar, val);
      }
    });

    // Apply font
    if (map.font_family) {
      root.style.setProperty("--font-inter", `'${map.font_family}', sans-serif`);
      // Try to load from Google Fonts
      const link = document.getElementById("site-settings-font");
      if (link) link.remove();
      const el = document.createElement("link");
      el.id = "site-settings-font";
      el.rel = "stylesheet";
      el.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(map.font_family)}:wght@300;400;500;600;700;800&display=swap`;
      document.head.appendChild(el);
    }

    // Apply border radius
    if (map.border_radius) {
      root.style.setProperty("--radius", map.border_radius);
    }

    // Apply custom CSS
    if (map.custom_css) {
      let styleEl = document.getElementById("site-settings-css");
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = "site-settings-css";
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = map.custom_css;
    }
  };

  useEffect(() => {
    loadSettings();

    // Subscribe to live changes so agent edits appear instantly
    const unsub = base44.entities.SiteSettings.subscribe(() => {
      loadSettings();
    });
    return unsub;
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, loaded, reload: loadSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}