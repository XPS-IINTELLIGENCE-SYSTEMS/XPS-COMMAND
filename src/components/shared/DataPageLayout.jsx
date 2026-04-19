import { Search, Loader2 } from "lucide-react";

export function DataPageHeader({ title, subtitle, count }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}{count != null ? ` · ${count} records` : ""}</p>}
    </div>
  );
}

export function DataSearchBar({ value, onChange, placeholder }) {
  return (
    <div className="relative mb-5">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Search..."}
        className="w-full h-10 pl-10 pr-4 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
      />
    </div>
  );
}

export function FilterPills({ options, active, onChange, label }) {
  return (
    <div className="flex items-center gap-2 flex-wrap mb-5">
      {label && <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mr-1">{label}</span>}
      {options.map((opt) => {
        const isActive = active === opt;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-transparent text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

export function StatusBadge({ status, colorMap }) {
  const colors = colorMap || {
    default: "bg-secondary text-muted-foreground",
  };
  const cls = colors[status] || colors.default || "bg-secondary text-muted-foreground";
  return (
    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${cls}`}>
      {status}
    </span>
  );
}

export function ScoreBadge({ score }) {
  if (!score && score !== 0) return null;
  const color = score >= 70 ? "text-green-400 bg-green-500/10" : score >= 40 ? "text-yellow-400 bg-yellow-500/10" : "text-muted-foreground bg-secondary";
  const label = score >= 70 ? "Hot" : score >= 40 ? "Warm" : "Cold";
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${color}`}>
      {label}
    </span>
  );
}

export function DataLoading() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );
}

export function EmptyState({ icon: Icon, message }) {
  return (
    <div className="text-center py-16 text-muted-foreground">
      {Icon && <Icon className="w-12 h-12 mx-auto mb-3 opacity-20" />}
      <p className="text-sm">{message || "No data found"}</p>
    </div>
  );
}