import { Check, CheckCheck } from "lucide-react";
import { DEFAULT_TOOLS } from "../dashboard/dashboardDefaults";

export default function AgentToolAccess({ selected, onChange }) {
  const allSelected = DEFAULT_TOOLS.every(t => selected.includes(t.id));

  const toggleAll = () => {
    onChange(allSelected ? [] : DEFAULT_TOOLS.map(t => t.id));
  };

  const toggle = (id) => {
    onChange(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">System Tool Access</h3>
        <button
          onClick={toggleAll}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            allSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-secondary/80"
          }`}
        >
          <CheckCheck className="w-3.5 h-3.5" />
          {allSelected ? "Deselect All" : "Select All"}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
        {DEFAULT_TOOLS.map(tool => {
          const isOn = selected.includes(tool.id);
          return (
            <button
              key={tool.id}
              onClick={() => toggle(tool.id)}
              className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-left text-xs transition-all ${
                isOn ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <div className={`w-3.5 h-3.5 rounded flex-shrink-0 flex items-center justify-center border ${
                isOn ? "bg-primary border-primary" : "border-muted-foreground/40"
              }`}>
                {isOn && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
              </div>
              <span className={isOn ? "text-foreground font-medium" : "text-muted-foreground"}>{tool.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}