import { Check, CheckCheck } from "lucide-react";
import { CAPABILITY_CATEGORIES, ALL_CAPABILITY_IDS } from "./agentBuilderConfig";

export default function AgentBuilderCapabilities({ selected, onChange }) {
  const allSelected = ALL_CAPABILITY_IDS.every(id => selected.includes(id));

  const toggleAll = () => {
    onChange(allSelected ? [] : [...ALL_CAPABILITY_IDS]);
  };

  const toggle = (id) => {
    onChange(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">Skills & Capabilities</h3>
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

      {CAPABILITY_CATEGORIES.map(cat => (
        <div key={cat.category}>
          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-2">
            {cat.category}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {cat.items.map(item => {
              const isOn = selected.includes(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => toggle(item.id)}
                  className={`flex items-start gap-2 p-2.5 rounded-lg border text-left transition-all text-xs ${
                    isOn
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  <div className={`w-4 h-4 mt-0.5 rounded flex-shrink-0 flex items-center justify-center border ${
                    isOn ? "bg-primary border-primary" : "border-muted-foreground/40"
                  }`}>
                    {isOn && <Check className="w-3 h-3 text-primary-foreground" />}
                  </div>
                  <div>
                    <div className="font-semibold">{item.label}</div>
                    <div className="text-[10px] text-muted-foreground leading-tight">{item.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}