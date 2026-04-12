import { useState } from "react";
import PhaseToolPicker from "./PhaseToolPicker";
import ToolModuleWorkspace from "./ToolModuleWorkspace";

export default function PhaseView({ phaseId, onChatCommand }) {
  const [mode, setMode] = useState("pick"); // "pick" | "modules"
  const [selectedTools, setSelectedTools] = useState([]);

  const handleLaunch = (tools) => {
    setSelectedTools(tools);
    setMode("modules");
  };

  const handleBack = () => {
    setMode("pick");
  };

  const handleExecute = async (payload) => {
    // The ToolModuleWorkspace now calls functions directly and shows results inline.
    // We still forward a summary to the chat agent for awareness.
    if (!payload) return;
    const parts = payload.map((item) => {
      const paramStr = Object.entries(item.params)
        .filter(([_, v]) => v && v.toString().trim())
        .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`)
        .join(", ");
      return paramStr ? `${item.label} (${paramStr})` : item.label;
    });

    const command = `User just executed tools inline:\n${parts.map((p, i) => `${i + 1}. ${p}`).join("\n")}`;

    if (onChatCommand) {
      onChatCommand(command);
    }
    // Don't auto-return — user can click "Done" in the workspace
  };

  if (mode === "modules") {
    return (
      <ToolModuleWorkspace
        tools={selectedTools}
        onBack={handleBack}
        onExecute={handleExecute}
      />
    );
  }

  return <PhaseToolPicker phaseId={phaseId} onLaunch={handleLaunch} />;
}