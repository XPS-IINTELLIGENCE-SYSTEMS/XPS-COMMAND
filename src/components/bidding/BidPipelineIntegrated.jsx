import { useMasterDashboard } from "@/hooks/useMasterDashboard";
import { FileText, Briefcase, CheckCircle2, ArrowRight, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function BidPipelineIntegrated() {
  const { filteredJobs, filteredBids, filteredProposals, selectedJob, selectedBid, stats, actions } = useMasterDashboard();
  const [submitting, setSubmitting] = useState(false);

  const handleSelectJob = (job) => {
    actions.selectJob(job);
  };

  const handleSelectBid = (bid) => {
    actions.selectBid(bid);
  };

  const handleSendBid = async (bidId) => {
    setSubmitting(true);
    await actions.updateBid(bidId, { send_status: "sent" });
    setSubmitting(false);
  };

  const handleApproveBid = async (bidId) => {
    setSubmitting(true);
    await actions.updateBid(bidId, { outcome: "won" });
    setSubmitting(false);
  };

  const jobPhases = {
    discovered: "🔍 Discovered",
    permit_filed: "📋 Permit Filed",
    design: "✏️ Design",
    pre_bid: "📝 Pre-Bid",
    bidding: "💰 Bidding",
    bid_submitted: "✅ Submitted",
    awarded: "🏆 Awarded",
    under_construction: "🏗️ In Progress",
    complete: "✨ Complete",
    lost: "❌ Lost",
  };

  const bidStatuses = {
    draft: "Draft",
    submitted: "Submitted",
    under_review: "Under Review",
    won: "Won",
    lost: "Lost",
  };

  return (
    <div className="space-y-4">
      {/* Pipeline Stats */}
      <div className="grid grid-cols-4 gap-2">
        <div className="glass-card rounded-lg p-3 text-center">
          <div className="text-2xl font-black text-blue-400">{stats.jobs}</div>
          <div className="text-[9px] text-muted-foreground">Active Jobs</div>
        </div>
        <div className="glass-card rounded-lg p-3 text-center">
          <div className="text-2xl font-black text-cyan-400">{stats.bids}</div>
          <div className="text-[9px] text-muted-foreground">Bids</div>
        </div>
        <div className="glass-card rounded-lg p-3 text-center">
          <div className="text-2xl font-black text-amber-400">{filteredProposals.filter(p => p.status === "Draft").length}</div>
          <div className="text-[9px] text-muted-foreground">Drafts</div>
        </div>
        <div className="glass-card rounded-lg p-3 text-center">
          <div className="text-2xl font-black text-green-400">{filteredProposals.filter(p => p.status === "Approved").length}</div>
          <div className="text-[9px] text-muted-foreground">Approved</div>
        </div>
      </div>

      {/* Selected Job Detail */}
      {selectedJob && (
        <div className="glass-card rounded-xl p-4 border border-blue-500/30 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-black text-lg text-foreground">{selectedJob.job_name}</h3>
              <p className="text-[10px] text-muted-foreground">{selectedJob.address}</p>
            </div>
            <span className="text-[9px] px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 font-bold">
              {jobPhases[selectedJob.project_phase] || selectedJob.project_phase}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div>
              <span className="text-muted-foreground">Flooring SqFt:</span>
              <p className="font-bold text-foreground">{selectedJob.flooring_sqft?.toLocaleString() || "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Est. Value:</span>
              <p className="font-bold text-foreground">${(selectedJob.estimated_flooring_value || 0).toLocaleString()}</p>
            </div>
            <div>
              <span className="text-muted-foreground">GC:</span>
              <p className="font-bold text-foreground">{selectedJob.gc_name || "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Need Date:</span>
              <p className="font-bold text-foreground">{selectedJob.flooring_need_date || "—"}</p>
            </div>
          </div>

          {/* Phase progression */}
          <div>
            <p className="text-[9px] font-bold text-muted-foreground uppercase mb-2">Project Phase</p>
            <div className="flex gap-1 overflow-x-auto">
              {Object.keys(jobPhases).map((phase) => (
                <button
                  key={phase}
                  onClick={() => actions.updateJob(selectedJob.id, { project_phase: phase })}
                  className={`px-2 py-1 rounded-lg text-[9px] font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                    selectedJob.project_phase === phase
                      ? "metallic-gold-bg text-background"
                      : "glass-card hover:bg-secondary"
                  }`}
                >
                  {jobPhases[phase]}
                </button>
              ))}
            </div>
          </div>

          {/* Linked Bids */}
          {filteredBids.filter(b => b.job_id === selectedJob.id).length > 0 && (
            <div className="border-t border-border pt-3">
              <p className="text-[9px] font-bold text-muted-foreground mb-2">📄 Linked Bids</p>
              <div className="space-y-2">
                {filteredBids.filter(b => b.job_id === selectedJob.id).map((bid, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectBid(bid)}
                    className={`w-full text-left p-2 rounded-lg text-[9px] transition-all ${
                      selectedBid?.id === bid.id ? "bg-primary/20 border border-primary" : "glass-card hover:bg-secondary"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{bid.recipient_company || "Bid"}</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold ${
                        bid.send_status === "sent" ? "bg-green-500/20 text-green-400" :
                        bid.send_status === "draft" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-secondary"
                      }`}>{bidStatuses[bid.send_status] || bid.send_status}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selected Bid Detail */}
      {selectedBid && (
        <div className="glass-card rounded-xl p-4 border border-cyan-500/30 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-black text-lg text-foreground">Bid: {selectedBid.project_name}</h3>
              <p className="text-[10px] text-muted-foreground">To: {selectedBid.recipient_company}</p>
            </div>
            <span className="text-sm font-black text-cyan-400">${(selectedBid.total_bid_value || 0).toLocaleString()}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div>
              <span className="text-muted-foreground">Status:</span>
              <p className="font-bold text-foreground">{bidStatuses[selectedBid.send_status]}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Outcome:</span>
              <p className="font-bold text-foreground">{selectedBid.outcome || "Pending"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Material Cost:</span>
              <p className="font-bold text-foreground">${(selectedBid.total_material_cost || 0).toLocaleString()}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Labor Cost:</span>
              <p className="font-bold text-foreground">${(selectedBid.total_labor_cost || 0).toLocaleString()}</p>
            </div>
          </div>

          {/* Actions based on status */}
          <div className="flex gap-2">
            {selectedBid.send_status === "draft" && (
              <Button
                onClick={() => handleSendBid(selectedBid.id)}
                disabled={submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
                size="sm"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Send Bid
              </Button>
            )}
            {selectedBid.send_status === "sent" && (
              <Button
                onClick={() => handleApproveBid(selectedBid.id)}
                disabled={submitting}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
                size="sm"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                Mark as Won
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Jobs List */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Jobs ({filteredJobs.length})</h3>
        {filteredJobs.slice(0, 8).map((job, i) => (
          <button
            key={i}
            onClick={() => handleSelectJob(job)}
            className={`w-full glass-card rounded-lg p-3 text-left transition-all ${
              selectedJob?.id === job.id ? "border border-blue-500 bg-blue-500/10" : "hover:bg-secondary"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div>
                <p className="text-sm font-bold text-foreground">{job.job_name}</p>
                <p className="text-[9px] text-muted-foreground">{job.city}, {job.state}</p>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-secondary">{jobPhases[job.project_phase]}</span>
            </div>
            <div className="text-[10px] text-muted-foreground">
              {job.flooring_sqft?.toLocaleString()} sqft • ${(job.estimated_flooring_value || 0).toLocaleString()}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}