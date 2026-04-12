import { useState } from "react";
import OperatorActionBar from "./OperatorActionBar";
import OperatorChat from "./OperatorChat";
import OperatorPanel from "./OperatorPanel";

export default function OperatorEditor() {
  const [activePanel, setActivePanel] = useState("insights");

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Main workspace — split between panel and chat */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Active tool panel */}
        <div className="flex-1 border-r border-border overflow-hidden">
          <OperatorPanel activePanel={activePanel} />
        </div>
        {/* Right: Chat agent */}
        <div className="w-[380px] min-w-[380px] overflow-hidden">
          <OperatorChat activePanel={activePanel} />
        </div>
      </div>

      {/* Bottom: Action buttons */}
      <OperatorActionBar activePanel={activePanel} onPanelChange={setActivePanel} />
    </div>
  );
}