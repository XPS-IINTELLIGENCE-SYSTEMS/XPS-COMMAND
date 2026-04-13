import { useState, useEffect } from "react";
import { getIconColor, subscribeColors } from "@/lib/iconColors";

/**
 * React hook that returns the current icon color for an id.
 * Automatically re-renders when the color changes via setIconColor().
 */
export default function useIconColor(id) {
  const [color, setColor] = useState(() => getIconColor(id));

  useEffect(() => {
    setColor(getIconColor(id));
    const unsub = subscribeColors((changedId) => {
      if (changedId === id || changedId === null) {
        setColor(getIconColor(id));
      }
    });
    return unsub;
  }, [id]);

  return color;
}