import { useState, useEffect } from "react";
import { subscribeColors } from "@/lib/iconColors";

/**
 * Hook that triggers a re-render whenever ANY icon color changes.
 * Use in components that display multiple colored icons.
 */
export default function useColorRefresh() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsub = subscribeColors(() => {
      setTick(t => t + 1);
    });
    return unsub;
  }, []);
}