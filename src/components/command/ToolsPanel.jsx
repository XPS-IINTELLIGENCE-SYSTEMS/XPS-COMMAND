import { useState } from "react";
import { cn } from "@/lib/utils";
import { Image, Video, Code, Globe, Wand2 } from "lucide-react";
import ImageGenerator from "../editor/ImageGenerator";
import VideoCreator from "../editor/VideoCreator";
import UIBuilder from "../editor/UIBuilder";
import WebBrowser from "../editor/WebBrowser";

const TOOL_TABS = [
  { id: "image", label: "Image Gen", icon: Image },
  { id: "video", label: "Video Creator", icon: Video },
  { id: "ui", label: "UI Builder", icon: Code },
  { id: "web", label: "Web View", icon: Globe },
];

export default function ToolsPanel() {
  const [tool, setTool] = useState("image");

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Tool Selector */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-border bg-card/30 flex-shrink-0">
        <Wand2 className="w-3.5 h-3.5 metallic-gold-icon mr-2" />
        {TOOL_TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                tool === t.id ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-3 h-3" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tool Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {tool === "image" && <ImageGenerator />}
        {tool === "video" && <VideoCreator />}
        {tool === "ui" && <UIBuilder />}
        {tool === "web" && <WebBrowser />}
      </div>
    </div>
  );
}