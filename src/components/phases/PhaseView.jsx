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
    // Build a rich command string from all the tool params
    const parts = payload.map((item) => {
      const paramStr = Object.entries(item.params)
        .filter(([_, v]) => v && v.toString().trim())
        .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`)
        .join(", ");
      return paramStr ? `${item.label} (${paramStr})` : item.label;
    });

    const command = `Execute the following tools:\n${parts.map((p, i) => `${i + 1}. ${p}`).join("\n")}`;

    if (onChatCommand) {
      onChatCommand(command);
    }

    // Return to picker after firing
    setTimeout(() => {
      setMode("pick");
      setSelectedTools([]);
    }, 1500);
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