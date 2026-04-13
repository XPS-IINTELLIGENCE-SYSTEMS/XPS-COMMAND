import { Pencil } from "lucide-react";
import useEditorMode from "@/hooks/useEditorMode";
import { toggleEditorMode } from "@/lib/editorMode";

export default function EditorModeToggle() {
  const editing = useEditorMode();

  return (
    <button
      onClick={toggleEditorMode}
      className={`shimmer-card p-2 rounded-xl transition-colors ${editing ? "bg-green-600/20 text-green-400" : "hover:bg-secondary/50 text-muted-foreground"}`}
      title={editing ? "Editor Mode ON — click to lock" : "Editor Mode OFF — click to edit"}
    >
      <Pencil className="w-4 h-4 shimmer-icon" />
    </button>
  );
}