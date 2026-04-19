import { useState } from "react";
import { ChevronRight, Plus, Search, Bot } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import NODE_REGISTRY, { AGENT_REGISTRY, AI_RECOMMENDATIONS } from "./workflowNodeRegistry";
import WorkflowAITooltip from "./WorkflowAITooltip";

export default function WorkflowNodePalette({ onAddNode }) {
  const [search, setSearch] = useState("");
  const [expandedCat, setExpandedCat] = useState(null);
  const [tab, setTab] = useState("nodes");
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
    <div className="w-72 border-r border-border bg-card/50 flex flex-col h-full overflow-hidden flex-shrink-0">
      {/* Tab switcher */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setTab("nodes")}
          className={cn("flex-1 text-xs font-semibold py-3 transition-colors", tab === "nodes" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground")}
        >
          Nodes & Tools
        </button>
        <button
          onClick={() => setTab("agents")}
          className={cn("flex-1 text-xs font-semibold py-3 transition-colors", tab === "agents" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground")}
        >
          <Bot className="w-3.5 h-3.5 inline mr-1.5" />Agents
        </button>
      </div>

      {tab === "nodes" && (
        <>
          {/* Search */}
          <div className="px-3 py-2.5 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tools..."
                className="h-8 text-xs pl-8 bg-secondary/50"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
            {filteredCategories.map((cat) => {
              const CatIcon = cat.icon;
              return (
                <div key={cat.category}>
                  <button
                    onClick={() => setExpandedCat(expandedCat === cat.category ? null : cat.category)}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-xs font-bold text-foreground/90 hover:bg-secondary/50 transition-colors"
                  >
                    <CatIcon className="w-4 h-4" style={{ color: cat.color }} />
                    <span className="flex-1 text-left">{cat.category}</span>
                    <span className="text-[10px] text-muted-foreground mr-1 font-normal">{cat.nodes.length}</span>
                    <ChevronRight className={cn("w-3.5 h-3.5 transition-transform text-muted-foreground", expandedCat === cat.category && "rotate-90")} />
                  </button>

                  {expandedCat === cat.category && (
                    <div className="space-y-1.5 px-1 pb-2 pt-1">
                      {cat.nodes.map((node) => {
                        const Icon = node.icon;
                        const rec = AI_RECOMMENDATIONS[node.type];
                        return (
                          <div key={node.type} className="relative" onMouseEnter={() => setHoveredNode(node.type)} onMouseLeave={() => setHoveredNode(null)}>
                            <button
                              onClick={() => onAddNode(node)}
                              className="w-full rounded-lg border border-border bg-card/80 p-3 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all group text-left"
                            >
                              <div className="flex items-start gap-2.5">
                                <div
                                  className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                                  style={{ backgroundColor: `${cat.color}18` }}
                                >
                                  <Icon className="w-4 h-4" style={{ color: cat.color }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-semibold text-foreground leading-tight">{node.label}</div>
                                  <div className="text-[11px] text-muted-foreground leading-snug mt-0.5">{node.desc}</div>
                                </div>
                                <Plus className="w-4 h-4 text-muted-foreground/40 opacity-0 group-hover:opacity-100 flex-shrink-0 mt-0.5" />
                              </div>
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
        <div className="flex-1 overflow-y-auto px-2.5 py-2.5 space-y-2">
          <p className="text-[11px] text-muted-foreground px-1 mb-2">
            Assign specialist agents to workflow steps for autonomous execution.
          </p>
          {AGENT_REGISTRY.map((agent) => {
            const Icon = agent.icon;
            return (
              <div key={agent.id} className="rounded-lg border border-border bg-card/80 p-3 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: `${agent.color}15` }}>
                    <Icon className="w-4 h-4" style={{ color: agent.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-foreground truncate">{agent.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{agent.desc}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {agent.skills.slice(0, 4).map((skill, i) => (
                    <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">{skill}</span>
                  ))}
                  {agent.skills.length > 4 && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">+{agent.skills.length - 4}</span>
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