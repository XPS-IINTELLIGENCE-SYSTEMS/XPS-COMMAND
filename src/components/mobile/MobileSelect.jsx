import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function MobileSelect({ value, onChange, options, label, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 rounded-lg bg-card border border-border text-xs text-foreground flex items-center justify-between"
      >
        <span>{selectedLabel}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-xs text-left transition-colors ${
                value === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-secondary text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}