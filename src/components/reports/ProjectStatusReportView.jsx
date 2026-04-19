import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { FileText, Send, Loader2, RefreshCcw, Eye, Mail, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

function JobReportCard({ job, onGenerate, onEmail, generating }) {
  let progressPct = 0;
  try {
    const stages = JSON.parse(job.work_stages || "[]");
    const done = stages.filter(s => s.done).length;
    progressPct = stages.length > 0 ? Math.round((done / stages.length) * 100) : 0;
  } catch {}

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-foreground text-sm">{job.job_name}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 text-white/60">
              {(job.project_phase || "").replace(/_/g, " ")}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {job.city}, {job.state} · {(job.project_type || "").replace(/_/g, " ")}
            {job.gc_name && ` · GC: ${job.gc_name}`}
          </div>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="text-[10px] text-white/40 flex-shrink-0">{progressPct}%</span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          <Button size="sm" variant="outline" className="gap-1 text-xs"
            onClick={() => onGenerate(job.id)} disabled={generating}>
            {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Eye className="w-3 h-3" />}
            Preview
          </Button>
          {(job.gc_email || job.owner_email) && (
            <Button size="sm" variant="outline" className="gap-1 text-xs"
              onClick={() => onEmail(job.id, job.gc_email || job.owner_email)} disabled={generating}>
              <Mail className="w-3 h-3" /> Email
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProjectStatusReportView() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState({});
  const [previewHtml, setPreviewHtml] = useState(null);
  const [customEmail, setCustomEmail] = useState("");

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.CommercialJob.list("-created_date", 200);
    const activeJobs = data.filter(j => ["awarded", "under_construction", "bid_submitted"].includes(j.project_phase));
    setJobs(activeJobs);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const generateReport = async (jobId) => {
    setGenerating(p => ({ ...p, [jobId]: true }));
    const res = await base44.functions.invoke("projectStatusReport", { job_id: jobId });
    if (res.data?.success) {
      setPreviewHtml(res.data.report.html);
      toast({ title: "Report Generated", description: res.data.job_name });
    }
    setGenerating(p => ({ ...p, [jobId]: false }));
  };

  const emailReport = async (jobId, email) => {
    const target = email || customEmail;
    if (!target) { toast({ title: "No email address", variant: "destructive" }); return; }
    setGenerating(p => ({ ...p, [jobId]: true }));
    const res = await base44.functions.invoke("projectStatusReport", { job_id: jobId, send_to: target });
    if (res.data?.success) {
      toast({ title: "Report Emailed", description: `Sent to ${target}` });
    }
    setGenerating(p => ({ ...p, [jobId]: false }));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Status Reports</h2>
            <p className="text-xs text-muted-foreground">Auto-generate & email project status reports</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={load}><RefreshCcw className="w-3.5 h-3.5" /></Button>
      </div>

      {/* Custom email target */}
      <div className="flex gap-2">
        <Input value={customEmail} onChange={e => setCustomEmail(e.target.value)}
          placeholder="Override email recipient..." className="text-sm" />
      </div>

      {/* Active jobs list */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Loading active jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          <Building2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
          No active jobs found (awarded / under construction)
        </div>
      ) : (
        <div className="space-y-2">
          {jobs.map(job => (
            <JobReportCard
              key={job.id}
              job={job}
              onGenerate={generateReport}
              onEmail={(id, email) => emailReport(id, customEmail || email)}
              generating={!!generating[job.id]}
            />
          ))}
        </div>
      )}

      {/* Preview modal */}
      {previewHtml && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPreviewHtml(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-3 flex items-center justify-between z-10">
              <span className="text-sm font-semibold text-gray-800">Report Preview</span>
              <Button size="sm" variant="outline" onClick={() => setPreviewHtml(null)}>Close</Button>
            </div>
            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>
        </div>
      )}
    </div>
  );
}