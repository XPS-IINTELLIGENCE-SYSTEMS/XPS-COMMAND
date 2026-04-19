import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Plus, Bot, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import AgentBuilder from "./AgentBuilder";
import AgentFleetCard from "./AgentFleetCard";

export default function AgentFleetView() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("fleet"); // "fleet" | "builder"
  const [editingAgent, setEditingAgent] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.CustomAgent.list("-created_date", 200);
    setAgents(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (agent) => {
    const newStatus = agent.status === "active" ? "paused" : "active";
    await base44.entities.CustomAgent.update(agent.id, { status: newStatus });
    load();
  };

  const handleDelete = async (agent) => {
    await base44.entities.CustomAgent.delete(agent.id);
    load();
  };

  const openBuilder = (agent) => {
    setEditingAgent(agent || null);
    setView("builder");
  };

  const handleBuilderSave = () => {
    setView("fleet");
    setEditingAgent(null);
    load();
  };

  if (view === "builder") {
    return (
      <AgentBuilder
        existingAgent={editingAgent}
        onSave={handleBuilderSave}
        onCancel={() => { setView("fleet"); setEditingAgent(null); }}
      />
    );
  }

  const filtered = agents.filter(a => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (search && !a.name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const activeCount = agents.filter(a => a.status === "active").length;
  const draftCount = agents.filter(a => a.status === "draft").length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Bot className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-lg font-extrabold text-foreground">Agent Fleet</h2>
            <p className="text-[11px] text-muted-foreground">
              {agents.length} agents — {activeCount} active, {draftCount} drafts
            </p>
          </div>
        </div>
        <button
          onClick={() => openBuilder(null)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Build New Agent
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search agents..."
            className="pl-9 h-8 text-xs"
          />
        </div>
        <div className="flex gap-1">
          {["all", "active", "paused", "draft"].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Fleet Grid */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <Bot className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-bold text-foreground mb-1">
            {agents.length === 0 ? "No agents yet" : "No matching agents"}
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            {agents.length === 0 ? "Build your first AI agent to get started." : "Try a different search or filter."}
          </p>
          {agents.length === 0 && (
            <button onClick={() => openBuilder(null)} className="text-sm text-primary font-semibold hover:underline">
              + Build First Agent
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(agent => (
            <AgentFleetCard
              key={agent.id}
              agent={agent}
              onEdit={openBuilder}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}