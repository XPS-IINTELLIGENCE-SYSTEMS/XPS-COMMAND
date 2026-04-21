import { useState } from "react";
import { X } from "lucide-react";
import EditorChat from "./EditorChat";
import EditorCanvas from "./EditorCanvas";
import EditorToolbar from "./EditorToolbar";
import AppContent from "../app/AppContent";

export default function EditorWorkspace() {
  const [htmlContent, setHtmlContent] = useState(null);
  const [activeToolId, setActiveToolId] = useState(null);

  const handleToolSelect = (toolId) => {
    setActiveToolId(toolId);
    setHtmlContent(null);
  };

  const handleCanvasUpdate = (html) => {
    setHtmlContent(html);
    setActiveToolId(null);
  };

  const handleToolCommand = (toolId) => {
    setActiveToolId(toolId);
    setHtmlContent(null);
  };

  const activeToolView = activeToolId ? (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-card/50">
        <span className="text-xs font-bold text-foreground capitalize">{activeToolId.replace(/_/g, " ")}</span>
        <button onClick={() => setActiveToolId(null)} className="p-1 rounded hover:bg-secondary">
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <AppContent activeView={activeToolId} onNavigate={handleToolSelect} />
      </div>
    </div>
  ) : null;

  return (
    <div className="flex h-full w-full overflow-hidden bg-background">
      {/* Left: Chat */}
      <div className="w-80 border-r border-border flex-shrink-0">
        <EditorChat
          onToolCommand={handleToolCommand}
          onCanvasUpdate={handleCanvasUpdate}
        />
      </div>

      {/* Center: Canvas */}
      <div className="flex-1 min-w-0">
        <EditorCanvas
          htmlContent={htmlContent}
          activeToolView={activeToolView}
        />
      </div>

      {/* Right: Toolbar */}
      <EditorToolbar onToolSelect={handleToolSelect} />
    </div>
  );
}