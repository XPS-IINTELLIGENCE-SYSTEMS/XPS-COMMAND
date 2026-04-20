import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Copy, Loader2, Check, AlertTriangle, Database, GitBranch, Bot, Users, FileText, Building2, Layers, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

const CLONE_TYPES = [
  { id: "leads", label: "Leads", desc: "Clone lead records with all metadata", icon: Users, entity: "Lead" },
  { id: "contractors", label: "GC Database", desc: "Clone contractor company records", icon: Building2, entity: "ContractorCompany" },
  { id: "workflows", label: "Workflows", desc: "Clone workflow configurations", icon: GitBranch, entity: "Workflow" },
  { id: "templates", label: "Message Templates", desc: "Clone outreach email templates", icon: FileText, entity: "MessageTemplate" },
  { id: "intel", label: "Intel Records", desc: "Clone intelligence data", icon: Database, entity: "IntelRecord" },
  { id: "scopes", label: "Floor Scopes", desc: "Clone bid scope records", icon: Layers, entity: "FloorScope" },
  { id: "competitors", label: "Competitors", desc: "Clone competitor profiles", icon: Building2, entity: "FlooringCompetitor" },
  { id: "jobs", label: "Commercial Jobs", desc: "Clone job records", icon: Building2, entity: "CommercialJob" },
];

export default function CloneSystemPanel() {
  const [selectedType, setSelectedType] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [cloning, setCloning] = useState(false);
  const [clonePrefix, setClonePrefix] = useState("CLONE");
  const [cloneCount, setCloneCount] = useState(1);
  const [filterText, setFilterText] = useState("");
  const [counts, setCounts] = useState({});

  // Load record counts on mount
  useEffect(() => {
    const loadCounts = async () => {
      const countMap = {};
      for (const ct of CLONE_TYPES) {
        const recs = await base44.entities[ct.entity].list("-created_date", 1).catch(() => []);
        // We can't get exact count, so we'll do a list
        const all = await base44.entities[ct.entity].list("-created_date", 200).catch(() => []);
        countMap[ct.id] = all.length;
      }
      setCounts(countMap);
    };
    loadCounts();
  }, []);

  const loadRecords = async (type) => {
    setSelectedType(type);
    setLoading(true);
    setSelectedIds(new Set());
    setRecords([]);
    const ct = CLONE_TYPES.find(t => t.id === type);
    if (!ct) return;
    const list = await base44.entities[ct.entity].list("-created_date", 100).catch(() => []);
    setRecords(list);
    setLoading(false);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === records.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(records.map(r => r.id)));
    }
  };

  const getRecordLabel = (record) => {
    return record.company || record.company_name || record.job_name || record.project_name
      || record.name || record.title || record.competitor_name || record.gc_company_name
      || record.email || record.id;
  };

  const getRecordSub = (record) => {
    return record.contact_name || record.state || record.city || record.status
      || record.stage || record.category || record.channel || record.bid_status || "";
  };

  const cloneSelected = async () => {
    if (selectedIds.size === 0) return;
    setCloning(true);
    const ct = CLONE_TYPES.find(t => t.id === selectedType);
    if (!ct) return;

    const toClone = records.filter(r => selectedIds.has(r.id));
    let clonedCount = 0;

    for (let copy = 0; copy < cloneCount; copy++) {
      const cloneData = toClone.map(record => {
        const clone = { ...record };
        // Remove system fields
        delete clone.id;
        delete clone.created_date;
        delete clone.updated_date;
        delete clone.created_by;

        // Add prefix to identifiable fields
        const nameField = clone.company || clone.company_name || clone.job_name
          || clone.project_name || clone.name || clone.title || clone.competitor_name;
        if (nameField) {
          const suffix = cloneCount > 1 ? ` (${clonePrefix} ${copy + 1})` : ` (${clonePrefix})`;
          if (clone.company) clone.company = clone.company + suffix;
          if (clone.company_name) clone.company_name = clone.company_name + suffix;
          if (clone.job_name) clone.job_name = clone.job_name + suffix;
          if (clone.project_name) clone.project_name = clone.project_name + suffix;
          if (clone.name) clone.name = clone.name + suffix;
          if (clone.title) clone.title = clone.title + suffix;
          if (clone.competitor_name) clone.competitor_name = clone.competitor_name + suffix;
        }

        return clone;
      });

      await base44.entities[ct.entity].bulkCreate(cloneData);
      clonedCount += cloneData.length;
    }

    setCloning(false);
    toast({ title: `Cloned ${clonedCount} records successfully!` });

    // Refresh
    await loadRecords(selectedType);
  };

  const filtered = records.filter(r => {
    if (!filterText) return true;
    const label = getRecordLabel(r).toLowerCase();
    return label.includes(filterText.toLowerCase());
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Copy className="w-5 h-5 text-violet-400" />
        <h3 className="text-sm font-bold text-foreground">Clone System</h3>
        <Badge variant="secondary" className="text-[9px]">Duplicate & Multiply</Badge>
      </div>

      {/* Type selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {CLONE_TYPES.map(ct => {
          const Icon = ct.icon;
          return (
            <button key={ct.id} onClick={() => loadRecords(ct.id)}
              className={`p-3 rounded-xl border text-left transition-all ${selectedType === ct.id ? "border-violet-500/40 bg-violet-500/10" : "border-border hover:border-violet-500/20"}`}>
              <div className="flex items-center justify-between mb-1">
                <Icon className={`w-4 h-4 ${selectedType === ct.id ? "text-violet-400" : "text-muted-foreground"}`} />
                <Badge variant="secondary" className="text-[8px]">{counts[ct.id] || 0}</Badge>
              </div>
              <span className="text-[11px] font-semibold text-foreground block">{ct.label}</span>
              <span className="text-[9px] text-muted-foreground">{ct.desc}</span>
            </button>
          );
        })}
      </div>

      {/* Record list */}
      {selectedType && (
        <div className="glass-card rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Input value={filterText} onChange={e => setFilterText(e.target.value)}
              placeholder="Filter records..." className="text-xs h-8 flex-1" />
            <Button size="sm" variant="outline" onClick={selectAll} className="text-[10px] h-8 gap-1">
              <Check className="w-3 h-3" /> {selectedIds.size === records.length ? "Deselect All" : "Select All"}
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground">No records found</div>
          ) : (
            <div className="max-h-72 overflow-y-auto space-y-1">
              {filtered.map(r => (
                <label key={r.id} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${selectedIds.has(r.id) ? "bg-violet-500/10 border border-violet-500/30" : "hover:bg-card border border-transparent"}`}>
                  <input type="checkbox" checked={selectedIds.has(r.id)} onChange={() => toggleSelect(r.id)}
                    className="rounded border-border" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-foreground truncate block">{getRecordLabel(r)}</span>
                    <span className="text-[10px] text-muted-foreground">{getRecordSub(r)}</span>
                  </div>
                  <span className="text-[9px] text-muted-foreground">{new Date(r.created_date).toLocaleDateString()}</span>
                </label>
              ))}
            </div>
          )}

          {selectedIds.size > 0 && (
            <div className="border-t border-border pt-3 space-y-2">
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Clone Tag</label>
                  <Input value={clonePrefix} onChange={e => setClonePrefix(e.target.value)} className="text-xs h-8" />
                </div>
                <div className="w-24">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Copies</label>
                  <select value={cloneCount} onChange={e => setCloneCount(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg bg-card border border-border text-xs text-foreground h-8">
                    {[1, 2, 3, 5, 10].map(n => <option key={n} value={n}>{n}x</option>)}
                  </select>
                </div>
              </div>
              <Button onClick={cloneSelected} disabled={cloning} className="w-full gap-2 bg-violet-600 hover:bg-violet-700 text-white">
                {cloning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                {cloning ? "Cloning..." : `Clone ${selectedIds.size} record${selectedIds.size > 1 ? "s" : ""} × ${cloneCount}`}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}