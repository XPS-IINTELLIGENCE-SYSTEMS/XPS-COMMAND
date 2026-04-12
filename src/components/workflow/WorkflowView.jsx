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
      <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-card/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-xps-purple/20 border border-xps-purple/30 flex items-center justify-center">
            <Workflow className="w-4 h-4 text-xps-purple" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">AI Workflow Orchestrator</h1>
            <p className="text-[10px] text-muted-foreground">Build autonomous AI pipelines with drag-and-drop</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Workflow tabs */}
          <div className="flex items-center gap-1 mr-2">
            {workflows.map(wf => (
              <button
                key={wf.id}
                onClick={() => { setActiveWfId(wf.id); setNodes(wf.nodes); }}
                className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
                  activeWfId === wf.id
                    ? "bg-white/[0.07] backdrop-blur-sm border border-white/[0.12] text-white"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                {wf.name}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={createWorkflow}>
            <Plus className="w-3 h-3" /> New Workflow
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <WorkflowSidebar onAddNode={addNode} agents={agents} setAgents={setAgents} />
        <WorkflowCanvas nodes={nodes} setNodes={setNodes} agents={agents} />
      </div>
    </div>
  );
}