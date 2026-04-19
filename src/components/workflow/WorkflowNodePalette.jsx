import { useState } from "react";
import { ChevronRight, Plus, Search, Bot } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import NODE_REGISTRY, { AGENT_REGISTRY, AI_RECOMMENDATIONS } from "./workflowNodeRegistry";
import WorkflowAITooltip from "./WorkflowAITooltip";

export default function WorkflowNodePalette({ onAddNode }) {
  const [search, setSearch] = useState("");
  const [expandedCat, setExpandedCat] = useState(null);
  const [tab, setTab] = useState("nodes"); // "nodes" | "agents"
  const [hoveredNode, setHoveredNode] = useState(null);

  const filteredCategories = NODE_REGISTRY.map(cat => ({
    ...cat,
    nodes: cat.nodes.filter(n =>
      n.label.toLowerCase().includes(search.toLowerCase()) ||
      n.desc.toLowerCase().includes(search.toLowerCase()) ||
      cat.category.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(cat => cat.nodes.length > 0);

  return (
    <div className="w-64 border-r border-border bg-card/50 flex flex-col h-full overflow-hidden flex-shrink-0">
      {/* Tab switcher */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setTab("nodes")}
          className={cn("flex-1 text-[10px] font-semibold py-2.5 transition-colors", tab === "nodes" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground")}
        >
          Nodes & Tools
        </button>
        <button
          onClick={() => setTab("agents")}
          className={cn("flex-1 text-[10px] font-semibold py-2.5 transition-colors", tab === "agents" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground")}
        >
          <Bot className="w-3 h-3 inline mr-1" />Agents
        </button>
      </div>

      {tab === "nodes" && (
        <>
          {/* Search */}
          <div className="px-2 py-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search nodes..."
                className="h-7 text-[10px] pl-7 bg-secondary/50"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex-1 overflow-y-auto px-1.5 py-1.5 space-y-0.5">
            {filteredCategories.map((cat) => {
              const CatIcon = cat.icon;
              return (
                <div key={cat.category}>
                  <button
                    onClick={() => setExpandedCat(expandedCat === cat.category ? null : cat.category)}
                    className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-[11px] font-semibold text-foreground/80 hover:bg-secondary/50 transition-colors"
                  >
                    <CatIcon className="w-3.5 h-3.5" style={{ color: cat.color }} />
                    <span className="flex-1 text-left">{cat.category}</span>
                    <span className="text-[9px] text-muted-foreground mr-1">{cat.nodes.length}</span>
                    <ChevronRight className={cn("w-3 h-3 transition-transform text-muted-foreground", expandedCat === cat.category && "rotate-90")} />
                  </button>

                  {expandedCat === cat.category && (
                    <div className="ml-1 space-y-0.5 mb-1">
                      {cat.nodes.map((node) => {
                        const Icon = node.icon;
                        const rec = AI_RECOMMENDATIONS[node.type];
                        return (
                          <div key={node.type} className="relative" onMouseEnter={() => setHoveredNode(node.type)} onMouseLeave={() => setHoveredNode(null)}>
                            <button
                              onClick={() => onAddNode(node)}
                              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-secondary/70 transition-colors group"
                            >
                              <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: cat.color }} />
                              <div className="text-left min-w-0 flex-1">
                                <div className="text-[10px] text-foreground/90 truncate">{node.label}</div>
                                <div className="text-[8px] text-muted-foreground truncate">{node.desc}</div>
                              </div>
                              <Plus className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 flex-shrink-0" />
                            </button>
                            {hoveredNode === node.type && rec && (
                              <WorkflowAITooltip recommendation={rec} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab === "agents" && (
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2">
          <p className="text-[9px] text-muted-foreground px-1 mb-1">
            Drag agents into workflow steps to assign specialists
          </p>
          {AGENT_REGISTRY.map((agent) => {
            const Icon = agent.icon;
            return (
              <div key={agent.id} className="rounded-lg border border-border bg-card/80 p-2.5 hover:border-primary/30 transition-colors group">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: `${agent.color}15` }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: agent.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-semibold text-foreground truncate">{agent.name}</div>
                    <div className="text-[8px] text-muted-foreground truncate">{agent.desc}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {agent.skills.slice(0, 4).map((skill, i) => (
                    <span key={i} className="text-[7px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">{skill}</span>
                  ))}
                  {agent.skills.length > 4 && (
                    <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">+{agent.skills.length - 4}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}