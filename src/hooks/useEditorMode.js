import { useState, useEffect } from "react";
import { isEditorMode } from "@/lib/editorMode";

export default function useEditorMode() {
  const [editing, setEditing] = useState(isEditorMode());

  useEffect(() => {
    const handler = (e) => setEditing(e.detail.enabled);
    window.addEventListener("xps-editor-mode-change", handler);
    return () => window.removeEventListener("xps-editor-mode-change", handler);
  }, []);

  return editing;
}