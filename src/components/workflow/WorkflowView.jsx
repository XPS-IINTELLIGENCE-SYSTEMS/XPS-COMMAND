import { useState } from "react";
import { Workflow, Plus, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import WorkflowSidebar from "./WorkflowSidebar";
import WorkflowCanvas from "./WorkflowCanvas";

const defaultAgents = [
  { id: "agent_scraper", name: "Scraper Agent", specialty: "Web crawling & data extraction", model: "fast" },
  { id: "agent_analyst", name: "Data Analyst", specialty: "Validation, scoring & analysis", model: "smart" },
  { id: "agent_sales", name: "Sales Agent", specialty: "Outreach, pitches & closing", model: "deep" },
];

export default function WorkflowView() {
  const [workflows, setWorkflows] = useState([
    { id: "wf_1", name: "Lead Generation Pipeline", nodes: [], agents: [...defaultAgents] },
  ]);
  const [activeWfId, setActiveWfId] = useState("wf_1");
  const [agents, setAgents] = useState([...defaultAgents]);
  const [nodes, setNodes] = useState([]);

  const activeWf = workflows.find(w => w.id === activeWfId);

  const addNode = (type) => {
    const newNode = {
      id: `node_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type,
      agent: "",
      config: {},
      priority: "normal",
    };
    setNodes(prev => [...prev, newNode]);
  };

  const createWorkflow = () => {
    const id = `wf_${Date.now()}`;
    const wf = { id, name: "New Workflow", nodes: [], agents: [...defaultAgents] };
    setWorkflows(prev => [...prev, wf]);
    setActiveWfId(id);
    setNodes([]);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-3 md:px-4 py-2 md:py-3 border-b border-border bg-card/30 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-secondary border border-[#8a8a8a]/30 flex items-center justify-center flex-shrink-0">
              <Workflow className="w-3.5 h-3.5 md:w-4 md:h-4 metallic-silver-icon" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xs md:text-sm font-bold text-foreground truncate">AI Workflow Orchestrator</h1>
              <p className="text-[9px] md:text-[10px] text-muted-foreground truncate">Build autonomous AI pipelines</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1 metallic-silver-bg text-background border-0 hover:brightness-110 flex-shrink-0" onClick={createWorkflow}>
            <Plus className="w-3 h-3" /> <span className="hidden md:inline">New Workflow</span><span className="md:hidden">New</span>
          </Button>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto">
          {workflows.map(wf => (
            <button
              key={wf.id}
              onClick={() => { setActiveWfId(wf.id); setNodes(wf.nodes); }}
              className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                activeWfId === wf.id
                  ? "bg-secondary/80 border border-[#8a8a8a]/30 text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {wf.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}