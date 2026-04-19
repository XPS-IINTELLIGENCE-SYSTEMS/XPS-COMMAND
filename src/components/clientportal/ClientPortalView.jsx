import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Building2, Camera, Check, FileText, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import SignaturePad from "./SignaturePad";

export default function ClientPortalView() {
  const [user, setUser] = useState(null);
  const [access, setAccess] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [changeOrders, setChangeOrders] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signingCO, setSigningCO] = useState(null);
  const [approving, setApproving] = useState({});

  useEffect(() => {
    const init = async () => {
      const me = await base44.auth.me();
      setUser(me);
      const accesses = await base44.entities.ClientPortalAccess.filter({ client_email: me.email, is_active: true });
      if (accesses.length === 0) { setLoading(false); return; }
      setAccess(accesses[0]);
      let jobIds = [];
      try { jobIds = JSON.parse(accesses[0].job_ids || "[]"); } catch {}
      if (jobIds.length > 0) {
        const allJobs = await base44.entities.CommercialJob.list("-created_date", 500);
        setJobs(allJobs.filter(j => jobIds.includes(j.id)));
      }
      const cos = await base44.entities.ChangeOrder.list("-created_date", 200);
      setChangeOrders(cos.filter(co => jobIds.includes(co.job_id)));
      setLoading(false);
    };
    init();
  }, []);

  // Parse photos from job notes
  const getPhotos = (job) => {
    try { return JSON.parse(job.notes?.match(/\[PHOTOS\](.*)\[\/PHOTOS\]/s)?.[1] || "{}"); } catch { return {}; }
  };
  const getPunchList = (job) => {
    try { return JSON.parse(job.notes?.match(/\[PUNCH\](.*)\[\/PUNCH\]/s)?.[1] || "[]"); } catch { return []; }
  };

  const approvePunchItem = async (job, idx) => {
    setApproving(p => ({ ...p, [`${job.id}-${idx}`]: true }));
    const punchList = getPunchList(job);
    punchList[idx] = { ...punchList[idx], done: true, approved_by: user.email, approved_at: new Date().toISOString() };
    const notes = (job.notes || "")
      .replace(/\[PUNCH\].*\[\/PUNCH\]/s, "")
      .trim() + `\n[PUNCH]${JSON.stringify(punchList)}[/PUNCH]`;
    await base44.entities.CommercialJob.update(job.id, { notes });
    const allJobs = await base44.entities.CommercialJob.list("-created_date", 500);
    let jobIds = [];
    try { jobIds = JSON.parse(access.job_ids || "[]"); } catch {}
    setJobs(allJobs.filter(j => jobIds.includes(j.id)));
    if (selectedJob?.id === job.id) {
      setSelectedJob(allJobs.find(j => j.id === job.id));
    }
    setApproving(p => ({ ...p, [`${job.id}-${idx}`]: false }));
    toast({ title: "Punch item approved" });
  };

  const signChangeOrder = async (coId, sigData) => {
    await base44.entities.ChangeOrder.update(coId, {
      status: "approved", approved_by: user.email,
      signature_data: sigData, signed_at: new Date().toISOString(),
    });
    setChangeOrders(prev => prev.map(co => co.id === coId ? { ...co, status: "approved", signature_data: sigData } : co));
    setSigningCO(null);
    toast({ title: "Change order signed!" });
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  if (!access) {
    return (
      <div className="text-center py-20 space-y-3">
        <AlertCircle className="w-12 h-12 text-white/20 mx-auto" />
        <p className="text-white/40">No client portal access found for your account.</p>
        <p className="text-xs text-white/20">Contact your XPS project manager to get access.</p>
      </div>
    );
  }

  if (selectedJob) {
    const photos = getPhotos(selectedJob);
    const punchList = getPunchList(selectedJob);
    const jobCOs = changeOrders.filter(co => co.job_id === selectedJob.id);

    return (
      <div className="space-y-5 max-w-2xl mx-auto">
        <button onClick={() => setSelectedJob(null)} className="text-sm text-primary hover:underline">← Back to Projects</button>
        <div>
          <h2 className="text-lg font-bold text-white">{selectedJob.job_name}</h2>
          <p className="text-xs text-white/40">{selectedJob.city}, {selectedJob.state} · Phase: {(selectedJob.project_phase || "").replace(/_/g, " ")}</p>
        </div>

        {/* Progress Photos */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Camera className="w-4 h-4 text-primary" /> Progress Photos</h3>
          {Object.entries(photos).length === 0 ? (
            <p className="text-xs text-white/30 py-4 text-center">No photos uploaded yet</p>
          ) : (
            Object.entries(photos).map(([zone, zonePhotos]) => (
              <div key={zone} className="space-y-2">
                <h4 className="text-xs font-medium text-white/50">{zone}</h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {(zonePhotos || []).map((p, i) => (
                    <a key={i} href={p.url} target="_blank" rel="noreferrer" className="aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-primary/40 transition-colors">
                      <img src={p.url} alt="" className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Punch List */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Punch List ({punchList.filter(p => p.done).length}/{punchList.length})</h3>
          {punchList.length === 0 ? (
            <p className="text-xs text-white/30 py-4 text-center">No punch items yet</p>
          ) : (
            <div className="space-y-1.5">
              {punchList.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/8">
                  {item.done ? (
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0"><Check className="w-3.5 h-3.5 text-green-400" /></div>
                  ) : (
                    <Button size="sm" variant="outline" className="h-6 px-2 text-[10px] flex-shrink-0" onClick={() => approvePunchItem(selectedJob, i)} disabled={approving[`${selectedJob.id}-${i}`]}>
                      {approving[`${selectedJob.id}-${i}`] ? <Loader2 className="w-3 h-3 animate-spin" /> : "Approve"}
                    </Button>
                  )}
                  <span className={`text-sm flex-1 ${item.done ? "text-white/30 line-through" : "text-white/70"}`}>{item.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Change Orders */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2"><FileText className="w-4 h-4 text-yellow-400" /> Change Orders</h3>
          {jobCOs.length === 0 ? (
            <p className="text-xs text-white/30 py-4 text-center">No change orders</p>
          ) : (
            jobCOs.map(co => (
              <div key={co.id} className="p-4 rounded-xl border border-white/10 bg-white/[0.03] space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{co.title}</p>
                    <p className="text-xs text-white/40">{co.description}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${co.status === "approved" ? "bg-green-500/10 text-green-400" : co.status === "pending" ? "bg-yellow-500/10 text-yellow-400" : "bg-secondary text-muted-foreground"}`}>
                    {co.status}
                  </span>
                </div>
                <p className="text-lg font-bold text-primary">${(co.amount || 0).toLocaleString()}</p>
                {co.status === "pending" && signingCO !== co.id && (
                  <Button size="sm" onClick={() => setSigningCO(co.id)} className="gap-1"><FileText className="w-3 h-3" /> Review & Sign</Button>
                )}
                {signingCO === co.id && (
                  <SignaturePad onSave={(sig) => signChangeOrder(co.id, sig)} />
                )}
                {co.signature_data && (
                  <div className="mt-2">
                    <p className="text-[10px] text-white/30">Signed by {co.approved_by}</p>
                    <img src={co.signature_data} alt="Signature" className="h-12 opacity-60" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold metallic-gold">Client Portal</h1>
          <p className="text-xs text-white/40">Welcome, {access.client_name}</p>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-white/60">Your Projects</h3>
        {jobs.length === 0 ? (
          <p className="text-xs text-white/30 py-8 text-center">No projects assigned yet</p>
        ) : (
          jobs.map(job => {
            const punchList = getPunchList(job);
            const doneCount = punchList.filter(p => p.done).length;
            const photoCount = Object.values(getPhotos(job)).reduce((a, z) => a + (z?.length || 0), 0);
            const jobCOs = changeOrders.filter(co => co.job_id === job.id);
            const pendingCOs = jobCOs.filter(co => co.status === "pending").length;

            return (
              <button key={job.id} onClick={() => setSelectedJob(job)}
                className="w-full text-left p-4 rounded-xl border border-border bg-card/30 active:bg-card/50 transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-foreground truncate">{job.job_name}</div>
                    <div className="text-xs text-muted-foreground">{job.city}, {job.state}</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
                    {(job.project_phase || "").replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex gap-4 text-xs text-white/40">
                  <span>{photoCount} photos</span>
                  <span>{doneCount}/{punchList.length} punch items</span>
                  {pendingCOs > 0 && <span className="text-yellow-400">{pendingCOs} pending CO</span>}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}