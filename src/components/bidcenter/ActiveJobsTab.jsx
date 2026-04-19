import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { HardHat, Camera, FileText, Plus, RefreshCcw, DollarSign, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge, DataLoading, EmptyState } from "../shared/DataPageLayout";
import { toast } from "@/components/ui/use-toast";

const STATUS_COLORS = {
  Mobilization: "bg-blue-500/10 text-blue-400",
  "In Progress": "bg-yellow-500/10 text-yellow-400",
  "Punch List": "bg-orange-500/10 text-orange-400",
  "Final Inspection": "bg-purple-500/10 text-purple-400",
  Complete: "bg-emerald-500/10 text-emerald-400",
  Invoiced: "bg-cyan-500/10 text-cyan-400",
  Paid: "bg-green-500/10 text-green-400",
  default: "bg-secondary text-muted-foreground",
};

export default function ActiveJobsTab() {
  const [ops, setOps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingNote, setAddingNote] = useState(null);
  const [noteText, setNoteText] = useState("");

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.JobOperation.list("-created_date", 100);
    setOps(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addDailyNote = async (opId) => {
    const op = ops.find(o => o.id === opId);
    let notes = [];
    try { notes = JSON.parse(op.daily_notes || "[]"); } catch {}
    notes.push({ date: new Date().toISOString(), note: noteText, by: "Manager" });
    await base44.entities.JobOperation.update(opId, { daily_notes: JSON.stringify(notes) });
    setAddingNote(null);
    setNoteText("");
    toast({ title: "Note added" });
    load();
  };

  const updateStatus = async (opId, newStatus) => {
    await base44.entities.JobOperation.update(opId, { status: newStatus });
    load();
  };

  const generateFinalInvoice = async (op) => {
    toast({ title: "Generating final invoice..." });
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a final invoice summary for job: ${op.job_name}. 
      Labor hours: ${op.labor_hours || 0}, Material cost: $${op.actual_material_cost || 0}, Labor cost: $${op.actual_labor_cost || 0}.
      Create invoice line items and total.`,
      response_json_schema: {
        type: "object",
        properties: { total: { type: "number" }, line_items: { type: "string" } }
      }
    });
    await base44.entities.JobOperation.update(op.id, {
      final_invoice_sent: true,
      final_invoice_amount: result.total || (op.actual_material_cost || 0) + (op.actual_labor_cost || 0),
      status: "Invoiced"
    });
    toast({ title: `Invoice generated: $${result.total?.toLocaleString()}` });
    load();
  };

  if (loading) return <DataLoading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Active Jobs</h2>
          <p className="text-xs text-muted-foreground">{ops.length} active operations</p>
        </div>
        <Button variant="outline" size="sm" onClick={load}><RefreshCcw className="w-3.5 h-3.5" /></Button>
      </div>

      {ops.length === 0 ? <EmptyState icon={HardHat} message="No active job operations. Win a bid to start!" /> : (
        <div className="space-y-3">
          {ops.map(op => {
            let notes = [];
            try { notes = JSON.parse(op.daily_notes || "[]"); } catch {}
            return (
              <div key={op.id} className="glass-card rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-sm">{op.job_name}</span>
                      <StatusBadge status={op.status} colorMap={STATUS_COLORS} />
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      {op.crew_lead && <span>Crew Lead: {op.crew_lead}</span>}
                      {op.crew_size && <span>Crew: {op.crew_size}</span>}
                      {op.start_date && <span>Start: {op.start_date}</span>}
                      {op.target_end_date && <span>Target: {op.target_end_date}</span>}
                    </div>

                    {notes.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase">Daily Notes</span>
                        {notes.slice(-3).map((n, i) => (
                          <div key={i} className="text-xs p-2 rounded bg-card/50 border border-border">
                            <span className="text-muted-foreground">{new Date(n.date).toLocaleDateString()}: </span>
                            <span className="text-foreground">{n.note}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {addingNote === op.id && (
                      <div className="mt-2 flex gap-2">
                        <input value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add daily note..."
                          className="flex-1 px-3 py-1.5 rounded-lg bg-card border border-border text-xs text-foreground" />
                        <Button size="sm" onClick={() => addDailyNote(op.id)}>Add</Button>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <Button size="sm" variant="ghost" className="text-xs gap-1" onClick={() => setAddingNote(addingNote === op.id ? null : op.id)}>
                      <Camera className="w-3 h-3" /> Add Note
                    </Button>
                    {op.status === "Complete" && !op.final_invoice_sent && (
                      <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => generateFinalInvoice(op)}>
                        <DollarSign className="w-3 h-3" /> Final Invoice
                      </Button>
                    )}
                    {["Mobilization", "In Progress", "Punch List", "Final Inspection", "Complete"].map((s, i, arr) => {
                      if (s === op.status && i < arr.length - 1) {
                        return (
                          <Button key={s} size="sm" variant="outline" className="text-xs" onClick={() => updateStatus(op.id, arr[i + 1])}>
                            → {arr[i + 1]}
                          </Button>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}