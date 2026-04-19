import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { GitBranch, Plus, Loader2, Trash2, Play, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataPageHeader, DataLoading, StatusBadge, EmptyState } from "../shared/DataPageLayout";
import WorkflowEditorModal from "./WorkflowEditorModal";

const STATUS_COLORS = {
  Draft: "bg-secondary text-muted-foreground",
  Active: "bg-green-500/10 text-green-400",
  Paused: "bg-yellow-500/10 text-yellow-400",
  Completed: "bg-blue-500/10 text-blue-400",
  Failed: "bg-red-500/10 text-red-400",
  default: "bg-secondary text-muted-foreground",
};

export default function WorkflowCreatorView() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showEditor, setShowEditor] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Workflow.list("-created_date", 100);
    setWorkflows(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const deleteWorkflow = async (id) => {
    await base44.entities.Workflow.delete(id);
    load();
  };

  if (loading) return <DataLoading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <DataPageHeader title="Workflow Creator" subtitle="Build drag-and-drop automation workflows" count={workflows.length} />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}><RefreshCcw className="w-3.5 h-3.5" /></Button>
          <Button size="sm" onClick={() => { setEditing(null); setShowEditor(true); }} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" /> New Workflow
          </Button>
        </div>
      </div>

      {workflows.length === 0 ? (
        <EmptyState icon={GitBranch} message="No workflows yet. Create your first automation." />
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-card/50 text-[11px] text-muted-foreground uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-semibold">Workflow</th>
                  <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Trigger</th>
                  <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Steps</th>
                  <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Runs</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {workflows.map(wf => {
                  let stepCount = 0;
                  try { stepCount = JSON.parse(wf.steps || "[]").length; } catch {}
                  return (
                    <tr key={wf.id} className="hover:bg-card/40 transition-colors cursor-pointer" onClick={() => { setEditing(wf); setShowEditor(true); }}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{wf.name}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[250px]">{wf.description || "—"}</div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">{wf.trigger || "Manual"}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-xs font-semibold">{stepCount}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-xs">{wf.run_count || 0}</td>
                      <td className="px-4 py-3"><StatusBadge status={wf.status} colorMap={STATUS_COLORS} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          <button onClick={() => { setEditing(wf); setShowEditor(true); }} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground" title="Edit">
                            <GitBranch className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteWorkflow(wf.id)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-red-400" title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showEditor && (
        <WorkflowEditorModal
          workflow={editing}
          onClose={() => { setShowEditor(false); setEditing(null); }}
          onSaved={() => { setShowEditor(false); setEditing(null); load(); }}
        />
      )}
    </div>
  );
}