import { useState } from "react";
import { ChevronDown, ArrowUpDown, X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

const US_STATES = [
  "All", "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
];

const SPECIALTIES = ["All", "Epoxy", "Polished Concrete", "Stained Concrete", "Decorative Concrete", "Metallic Epoxy", "Polyaspartic", "Polyurea", "Urethane", "Garage Coating", "Industrial Coating", "Other"];

const VERTICALS = ["All", "Retail", "Food & Bev", "Warehouse", "Automotive", "Healthcare", "Fitness", "Education", "Industrial", "Residential", "Government", "Office", "Restaurant", "Kitchen", "Other"];

const BID_STAGES = ["All", "Not Started", "Planning", "Pre-Bid", "Bid Submitted", "Under Review", "Awarded", "Lost Bid", "No Bid"];

const SORT_OPTIONS = [
  { label: "Newest First", value: "date_desc" },
  { label: "Oldest First", value: "date_asc" },
  { label: "Value: High → Low", value: "value_desc" },
  { label: "Value: Low → High", value: "value_asc" },
  { label: "Priority: High → Low", value: "priority_desc" },
  { label: "Priority: Low → High", value: "priority_asc" },
  { label: "Score: High → Low", value: "score_desc" },
  { label: "Score: Low → High", value: "score_asc" },
];

function DropdownFilter({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const isActive = value !== "All";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
          isActive
            ? "bg-primary/10 text-primary border-primary/30"
            : "bg-card text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
        }`}
      >
        {label}{isActive ? `: ${value}` : ""}
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-50 bg-card border border-border rounded-lg shadow-xl max-h-64 overflow-y-auto min-w-[140px]">
            {options.map(opt => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setOpen(false); }}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-secondary transition-colors ${
                  value === opt ? "text-primary font-semibold" : "text-foreground"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const current = SORT_OPTIONS.find(s => s.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors"
      >
        <ArrowUpDown className="w-3 h-3" />
        {current?.label || "Sort"}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-card border border-border rounded-lg shadow-xl min-w-[180px]">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-secondary transition-colors ${
                  value === opt.value ? "text-primary font-semibold" : "text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function LeadFilterBar({ filters, onFiltersChange, sortBy, onSortChange }) {
  const activeCount = Object.entries(filters).filter(([k, v]) => v !== "All").length;

  const clearAll = () => {
    onFiltersChange({ stateFilter: "All", specialtyFilter: "All", verticalFilter: "All", bidStageFilter: "All" });
    onSortChange("date_desc");
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <div className="flex items-center gap-1.5 mr-1">
        <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Filters</span>
      </div>

      <DropdownFilter label="State" options={US_STATES} value={filters.stateFilter} onChange={(v) => onFiltersChange({ ...filters, stateFilter: v })} />
      <DropdownFilter label="Specialty" options={SPECIALTIES} value={filters.specialtyFilter} onChange={(v) => onFiltersChange({ ...filters, specialtyFilter: v })} />
      <DropdownFilter label="Vertical" options={VERTICALS} value={filters.verticalFilter} onChange={(v) => onFiltersChange({ ...filters, verticalFilter: v })} />
      <DropdownFilter label="Bid Stage" options={BID_STAGES} value={filters.bidStageFilter} onChange={(v) => onFiltersChange({ ...filters, bidStageFilter: v })} />

      <div className="ml-auto">
        <SortDropdown value={sortBy} onChange={onSortChange} />
      </div>

      {activeCount > 0 && (
        <button onClick={clearAll} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium text-destructive hover:bg-destructive/10 transition-colors">
          <X className="w-3 h-3" /> Clear ({activeCount})
        </button>
      )}
    </div>
  );
}

export { SORT_OPTIONS };