import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, Search, Loader2, Briefcase, User, FileText, Phone, Bot } from "lucide-react";
import { Input } from "@/components/ui/input";

const ENTITY_TYPES = [
  { type: "Lead", label: "Leads", icon: User, nameField: "company" },
  { type: "CommercialJob", label: "Jobs", icon: Briefcase, nameField: "job_name" },
  { type: "Proposal", label: "Proposals", icon: FileText, nameField: "title" },
  { type: "ScheduledCall", label: "Calls", icon: Phone, nameField: "title" },
  { type: "AgentTask", label: "Tasks", icon: Bot, nameField: "task_description" },
];

export default function ProjectLinker({ onSelect, onClose }) {
  const [activeType, setActiveType] = useState("Lead");
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRecords();
  }, [activeType]);

  const loadRecords = async () => {
    setLoading(true);
    const entityMap = {
      Lead: base44.entities.Lead,
      CommercialJob: base44.entities.CommercialJob,
      Proposal: base44.entities.Proposal,
      ScheduledCall: base44.entities.ScheduledCall,
      AgentTask: base44.entities.AgentTask,
    };
    const entity = entityMap[activeType];
    if (entity) {
      const data = await entity.list("-created_date", 50);
      setRecords(data);
    }
    setLoading(false);
  };

  const cfg = ENTITY_TYPES.find(e => e.type === activeType);
  const nameField = cfg?.nameField || "title";

  const filtered = records.filter(r => {
    const name = r[nameField] || r.title || "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="absolute inset-0 bg-background/95 backdrop-blur-md z-10 flex flex-col rounded-2xl">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/50">
        <span className="text-sm font-bold text-foreground">Link Project</span>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4 text-muted-foreground" /></button>
      </div>

      {/* Type tabs */}
      <div className="flex gap-1 px-5 py-2 overflow-x-auto scrollbar-hide">
        {ENTITY_TYPES.map(et => {
          const Icon = et.icon;
          return (
            <button
              key={et.type}
              onClick={() => setActiveType(et.type)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${activeType === et.type ? "metallic-gold-bg text-background" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}
            >
              <Icon className="w-3 h-3" /> {et.label}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="px-5 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 glass-input text-xs h-8"
          />
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-1">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground">No records found</div>
        ) : (
          filtered.map(r => (
            <button
              key={r.id}
              onClick={() => onSelect(activeType, r.id, r[nameField] || r.title || `${activeType} #${r.id}`)}
              className="w-full text-left p-2.5 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <div className="text-xs font-medium text-foreground truncate">{r[nameField] || r.title || `ID: ${r.id}`}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {activeType} · Created {r.created_date ? new Date(r.created_date).toLocaleDateString() : ""}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}