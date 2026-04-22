import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Mail, Plus, Search, RefreshCcw, Loader2, Filter, Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EmailTemplateCard from "./EmailTemplateCard";
import NewTemplateModal from "./NewTemplateModal";
import BulkGeneratePanel from "./BulkGeneratePanel";

const CATEGORIES = [
  { id: "all", label: "All", color: "#d4af37" },
  { id: "GC Bid List Intro", label: "GC Bid List", color: "#3b82f6" },
  { id: "Contractor Intro", label: "Contractor Intro", color: "#d4af37" },
  { id: "Epoxy Company Intro", label: "Epoxy Intro", color: "#22c55e" },
  { id: "Follow-Up", label: "Follow-Up", color: "#f59e0b" },
  { id: "Sales", label: "Sales", color: "#ef4444" },
  { id: "Proposal", label: "Proposal", color: "#8b5cf6" },
];

export default function EmailTemplatesView() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [showNew, setShowNew] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);

  const load = async () => {
    setLoading(true);
    const list = await base44.entities.MessageTemplate.list("-created_date", 500);
    setTemplates(list);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let list = [...templates];
    if (category !== "all") list = list.filter(t => t.category === category);
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(t =>
        (t.name || "").toLowerCase().includes(s) ||
        (t.subject || "").toLowerCase().includes(s) ||
        (t.body || "").toLowerCase().includes(s)
      );
    }
    return list;
  }, [templates, category, search]);

  const catCounts = useMemo(() => {
    const counts = { all: templates.length };
    templates.forEach(t => { counts[t.category] = (counts[t.category] || 0) + 1; });
    return counts;
  }, [templates]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl metallic-gold-bg flex items-center justify-center">
            <Mail className="w-5 h-5 text-background" />
          </div>
          <div>
            <h1 className="text-lg font-black metallic-gold">Email Templates</h1>
            <p className="text-[11px] text-muted-foreground">XPS branded outreach — edit, send, and manage</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowGenerate(true)}>
            <Sparkles className="w-3.5 h-3.5 mr-1" /> AI Generate
          </Button>
          <Button size="sm" onClick={() => setShowNew(true)}>
            <Plus className="w-3.5 h-3.5 mr-1" /> New Template
          </Button>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-7 gap-2">
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`rounded-xl p-2.5 text-center transition-all ${category === c.id ? "ring-1 ring-primary" : ""}`}
            style={{ backgroundColor: category === c.id ? `${c.color}15` : "transparent", border: `1px solid ${c.color}20` }}
          >
            <div className="text-lg font-black" style={{ color: c.color }}>{catCounts[c.id] || 0}</div>
            <div className="text-[9px] text-muted-foreground mt-0.5">{c.label}</div>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 glass-input rounded-lg px-3 py-2">
        <Search className="w-3.5 h-3.5 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search templates by name, subject, or body..."
          className="flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>

      {/* Template list */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-sm text-muted-foreground">No templates found. Create one or use AI Generate.</div>
      ) : (
        <div className="space-y-2 max-h-[calc(100vh-380px)] overflow-y-auto">
          {filtered.map(t => (
            <EmailTemplateCard key={t.id} template={t} onUpdate={load} onDelete={load} />
          ))}
        </div>
      )}

      {/* New Template Modal */}
      {showNew && <NewTemplateModal onClose={() => setShowNew(false)} onSave={load} />}

      {/* Bulk Generate Panel */}
      {showGenerate && <BulkGeneratePanel onClose={() => setShowGenerate(false)} onDone={load} />}
    </div>
  );
}