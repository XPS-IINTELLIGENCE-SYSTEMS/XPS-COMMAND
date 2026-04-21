import { useState } from "react";
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, AlignLeft, Type } from "lucide-react";

const TOOLBAR_BTNS = [
  { icon: Bold, cmd: "bold", label: "Bold" },
  { icon: Italic, cmd: "italic", label: "Italic" },
  { icon: Heading1, cmd: "h1", label: "Heading 1" },
  { icon: Heading2, cmd: "h2", label: "Heading 2" },
  { icon: List, cmd: "insertUnorderedList", label: "Bullet List" },
  { icon: ListOrdered, cmd: "insertOrderedList", label: "Numbered List" },
  { icon: AlignLeft, cmd: "justifyLeft", label: "Align Left" },
];

export default function WorkspaceNotes({ content, onChange }) {
  const execCmd = (cmd) => {
    if (cmd === "h1") {
      document.execCommand("formatBlock", false, "h1");
    } else if (cmd === "h2") {
      document.execCommand("formatBlock", false, "h2");
    } else {
      document.execCommand(cmd, false, null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Writing toolbar */}
      <div className="flex items-center gap-0.5 px-3 py-2 border-b border-border">
        <Type className="w-3.5 h-3.5 text-muted-foreground mr-2" />
        {TOOLBAR_BTNS.map(btn => (
          <button
            key={btn.cmd}
            onClick={() => execCmd(btn.cmd)}
            className="p-1.5 rounded hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
            title={btn.label}
          >
            <btn.icon className="w-3.5 h-3.5" />
          </button>
        ))}
      </div>

      {/* Editable content area */}
      <div
        contentEditable
        suppressContentEditableWarning
        className="flex-1 p-4 sm:p-6 text-sm text-foreground outline-none overflow-y-auto prose prose-sm prose-invert max-w-none
          [&>h1]:text-xl [&>h1]:font-bold [&>h1]:mb-2 [&>h1]:text-white
          [&>h2]:text-base [&>h2]:font-semibold [&>h2]:mb-2 [&>h2]:text-white/90
          [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2 [&>li]:ml-4"
        dangerouslySetInnerHTML={{ __html: content }}
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        data-placeholder="Start writing... Use the toolbar above for formatting."
        style={{ minHeight: 200 }}
      />
    </div>
  );
}