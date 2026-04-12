import { useState } from "react";
import OperatorActionBar from "./OperatorActionBar";

export default function OperatorEditor() {
  const [activePanel, setActivePanel] = useState(null);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Wide open canvas */}
      <div className="flex-1 overflow-auto" />

      {/* Bottom: Action buttons */}
      <OperatorActionBar activePanel={activePanel} onPanelChange={(id) => setActivePanel(activePanel === id ? null : id)} />
    </div>
  );
}