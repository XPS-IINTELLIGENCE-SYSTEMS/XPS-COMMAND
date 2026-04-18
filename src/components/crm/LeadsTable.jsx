import { useState } from "react";
import { Search, Star, MapPin, Mail, MoreVertical, Phone, ExternalLink, ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import AddLeadDialog from "./AddLeadDialog";

const STAGES = ["All", "Incoming", "Validated", "Qualified", "Prioritized", "Contacted", "Proposal", "Won", "Lost"];
const VERTICALS = ["All", "Retail", "Food & Bev", "Warehouse", "Automotive", "Healthcare", "Fitness", "Education", "Industrial", "Residential", "Government", "Other"];

function ScoreBadge({ score }) {
  if (!score && score !== 0) return <span className="text-muted-foreground text-xs">—</span>;
  const color = score >= 80 ? "bg-green-500/15 text-green-400" : score >= 50 ? "bg-yellow-500/15 text-yellow-400" : "bg-red-500/15 text-red-400";
  const label = score >= 80 ? "Hot" : score >= 50 ? "Warm" : "Cold";
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${color}`}>{label}</span>;
}

function StageBadge({ stage }) {
  const colors = {
    Incoming: "bg-blue-500/15 text-blue-400",
    Validated: "bg-cyan-500/15 text-cyan-400",
    Qualified: "bg-green-500/15 text-green-400",
    Prioritized: "bg-yellow-500/15 text-yellow-400",
    Contacted: "bg-purple-500/15 text-purple-400",
    Proposal: "bg-indigo-500/15 text-indigo-400",
    Won: "bg-emerald-500/15 text-emerald-400",
    Lost: "bg-red-500/15 text-red-400",
  };
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${colors[stage] || "bg-secondary text-muted-foreground"}`}>{stage}</span>;
}

function PriorityDots({ priority }) {
  if (!priority) return <span className="text-muted-foreground text-xs">—</span>;
  const dots = Math.min(5, Math.ceil(priority / 2));
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < dots ? "bg-primary" : "bg-secondary"}`} />
      ))}
    </div>
  );
}

export default function LeadsTable({ leads, onUpdate, onDelete, onSelect }) {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("All");
  const [verticalFilter, setVerticalFilter] = useState("All");
  const [favorites, setFavorites] = useState(new Set());
  const [showFavorites, setShowFavorites] = useState(false);
  const [showAddLead, setShowAddLead] = useState(false);

  const toggleFav = (id) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = leads.filter(l => {
    if (search && !`${l.company} ${l.contact_name} ${l.email} ${l.vertical}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (stageFilter !== "All" && l.stage !== stageFilter) return false;
    if (verticalFilter !== "All" && l.vertical !== verticalFilter) return false;
    if (showFavorites && !favorites.has(l.id)) return false;
    return true;
  });

  return (
    <div>
      {/* Search + Favorites + Add */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search leads..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
          />
        </div>
        <Button
          variant={showFavorites ? "default" : "outline"}
          size="sm"
          onClick={() => setShowFavorites(!showFavorites)}
          className="gap-1.5"
        >
          <Star className={`w-3.5 h-3.5 ${showFavorites ? "fill-current" : ""}`} />
          Favorites
        </Button>
        <Button size="sm" onClick={() => setShowAddLead(true)} className="gap-1.5 metallic-gold-bg text-background hover:brightness-110">
          <Plus className="w-3.5 h-3.5" /> Add Lead
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-5">
        <FilterRow label="STAGE" options={STAGES} value={stageFilter} onChange={setStageFilter} />
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Vertical</span>
          <select
            value={verticalFilter}
            onChange={e => setVerticalFilter(e.target.value)}
            className="text-xs bg-secondary/50 border border-border rounded-md px-2 py-1 text-foreground focus:outline-none"
          >
            {VERTICALS.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-[10px] text-muted-foreground uppercase tracking-wider bg-secondary/30">
                <th className="text-left px-4 py-3 w-8"></th>
                <th className="text-left px-4 py-3">Business</th>
                <th className="text-left px-4 py-3">Contact</th>
                <th className="text-left px-4 py-3">Vertical</th>
                <th className="text-left px-4 py-3">Location</th>
                <th className="text-left px-4 py-3">Score</th>
                <th className="text-left px-4 py-3">Priority</th>
                <th className="text-left px-4 py-3">Stage</th>
                <th className="text-left px-4 py-3 w-10">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-muted-foreground">No leads found</td></tr>
              ) : filtered.map(lead => (
                <tr key={lead.id} className="border-b border-border/50 hover:bg-secondary/20 cursor-pointer transition-colors" onClick={() => onSelect?.(lead)}>
                  <td className="px-4 py-3" onClick={e => { e.stopPropagation(); toggleFav(lead.id); }}>
                    <Star className={`w-4 h-4 cursor-pointer transition-colors ${favorites.has(lead.id) ? "fill-primary text-primary" : "text-muted-foreground/30 hover:text-muted-foreground"}`} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-foreground">{lead.company}</div>
                    {lead.website && <div className="text-[10px] text-muted-foreground truncate max-w-[180px]">{lead.website}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-foreground">{lead.contact_name || "—"}</div>
                    <div className="text-[10px] text-muted-foreground">{lead.email || ""}</div>
                    {lead.phone && <div className="text-[10px] text-muted-foreground">{lead.phone}</div>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{lead.vertical || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{lead.location || [lead.city, lead.state].filter(Boolean).join(", ") || "—"}</td>
                  <td className="px-4 py-3"><ScoreBadge score={lead.score} /></td>
                  <td className="px-4 py-3"><PriorityDots priority={lead.priority} /></td>
                  <td className="px-4 py-3"><StageBadge stage={lead.stage} /></td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 rounded hover:bg-secondary"><MoreVertical className="w-4 h-4 text-muted-foreground" /></button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {lead.email && <DropdownMenuItem onClick={() => window.open(`mailto:${lead.email}`)}><Mail className="w-3.5 h-3.5 mr-2" /> Email</DropdownMenuItem>}
                        {lead.phone && <DropdownMenuItem onClick={() => window.open(`tel:${lead.phone}`)}><Phone className="w-3.5 h-3.5 mr-2" /> Call</DropdownMenuItem>}
                        {lead.website && <DropdownMenuItem onClick={() => window.open(lead.website.startsWith("http") ? lead.website : `https://${lead.website}`, "_blank")}><ExternalLink className="w-3.5 h-3.5 mr-2" /> Website</DropdownMenuItem>}
                        <DropdownMenuItem onClick={() => onDelete?.(lead)} className="text-destructive"><MoreVertical className="w-3.5 h-3.5 mr-2" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-3 text-xs text-muted-foreground">{filtered.length} lead{filtered.length !== 1 ? "s" : ""}</div>

      {showAddLead && <AddLeadDialog onClose={() => setShowAddLead(false)} onSave={onUpdate} />}
    </div>
  );
}

function FilterRow({ label, options, value, onChange }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`text-xs px-3 py-1 rounded-full border transition-colors ${
            value === opt
              ? "bg-primary/15 text-primary border-primary/30"
              : "text-muted-foreground border-border hover:border-foreground/20 hover:text-foreground"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}