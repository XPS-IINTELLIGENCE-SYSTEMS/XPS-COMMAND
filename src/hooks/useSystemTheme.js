import { useEffect } from "react";

/**
 * Detects system dark mode preference and syncs with app theme.
 * If the user has a manual override stored in localStorage, respects that.
 * Otherwise, follows the OS setting and listens for live changes.
 */
export default function useSystemTheme() {
  useEffect(() => {
    const stored = localStorage.getItem("xps-theme");
    const mq = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = (theme) => {
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(theme);
    };

    // If no manual override, use system preference
    if (!stored) {
      apply(mq.matches ? "dark" : "light");
    }

    // Listen for system theme changes (only if no stored override)
    const handler = (e) => {
      if (!localStorage.getItem("xps-theme")) {
        apply(e.matches ? "dark" : "light");
      }
    };

    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
}