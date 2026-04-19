import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { FileText, Loader2, Download, Send, Sparkles, Building2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

export default function AutoProposalGenerator() {
  const [jobs, setJobs] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [selectedContractorId, setSelectedContractorId] = useState("");
  const [generating, setGenerating] = useState(false);
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [j, c] = await Promise.all([
        base44.entities.CommercialJob.list("-created_date", 200),
        base44.entities.Contractor.list("-created_date", 200),
      ]);
      setJobs(j || []);
      setContractors(c || []);
      setLoading(false);
    };
    load();
  }, []);

  const selectedJob = jobs.find(j => j.id === selectedJobId);
  const selectedContractor = contractors.find(c => c.id === selectedContractorId);

  const generate = async () => {
    if (!selectedJob) return;
    setGenerating(true);

    let takeoff = null;
    try { takeoff = JSON.parse(selectedJob.takeoff_data || "null"); } catch {}

    const prompt = `You are an expert commercial flooring estimator for Xtreme Polishing Systems (XPS).
Generate a professional bid proposal for this project:

PROJECT: ${selectedJob.job_name}
LOCATION: ${selectedJob.city}, ${selectedJob.state}
TYPE: ${selectedJob.project_type}
TOTAL SQFT: ${selectedJob.total_sqft || "Unknown"}
FLOORING SQFT: ${selectedJob.flooring_sqft || selectedJob.total_sqft || "Unknown"}
SECTOR: ${selectedJob.sector || "Commercial Private"}
${selectedJob.gc_name ? `GENERAL CONTRACTOR: ${selectedJob.gc_name}` : ""}
${selectedContractor ? `BID RECIPIENT: ${selectedContractor.company_name}, ${selectedContractor.contact_name}` : ""}
${takeoff ? `TAKEOFF DATA: ${JSON.stringify(takeoff)}` : ""}

Based on regional labor costs for ${selectedJob.state}, generate:
1. A detailed scope of work
2. Zone-by-zone pricing breakdown (if takeoff data available)
3. Materials specification with product recommendations
4. Suggested pricing with 3 tiers: Aggressive (win-focused), Optimal (balanced), Premium (high-margin)
5. Project timeline estimate
6. Terms and conditions

Use these typical regional rates as baseline:
- Surface prep: $1.25-2.50/sqft
- Epoxy base coat: $2.00-4.00/sqft  
- Top coat/sealer: $1.50-3.00/sqft
- Decorative/metallic: $4.00-8.00/sqft
- Polished concrete: $3.00-6.00/sqft
- Labor rate: $45-85/hr depending on region
- Mobilization: $1,500-5,000 based on distance

Format as a professional proposal.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          scope_of_work: { type: "string" },
          materials_spec: { type: "string" },
          zones: { type: "array", items: { type: "object", properties: { name: { type: "string" }, sqft: { type: "number" }, system: { type: "string" }, price_per_sqft: { type: "number" }, total: { type: "number" } } } },
          aggressive_total: { type: "number" },
          optimal_total: { type: "number" },
          premium_total: { type: "number" },
          timeline: { type: "string" },
          terms: { type: "string" },
          cover_letter: { type: "string" },
        }
      }
    });

    setProposal(result);
    setGenerating(false);
  };

  const saveProposal = async (tier) => {
    if (!proposal || !selectedJob) return;
    setSending(true);
    const totalMap = { aggressive: proposal.aggressive_total, optimal: proposal.optimal_total, premium: proposal.premium_total };
    const sqft = selectedJob.flooring_sqft || selectedJob.total_sqft || 1;

    await base44.entities.BidDocument.create({
      job_id: selectedJob.id,
      bid_number: `BID-${Date.now().toString(36).toUpperCase()}`,
      bid_date: new Date().toISOString().split("T")[0],
      recipient_name: selectedContractor?.contact_name || selectedJob.gc_contact || "",
      recipient_email: selectedContractor?.email || selectedJob.gc_email || "",
      recipient_company: selectedContractor?.company_name || selectedJob.gc_name || "",
      project_name: selectedJob.job_name,
      project_address: `${selectedJob.address || ""} ${selectedJob.city}, ${selectedJob.state}`,
      scope_of_work: proposal.scope_of_work,
      materials_spec: proposal.materials_spec,
      total_bid_value: totalMap[tier] || proposal.optimal_total,
      bid_document_content: `<h1>${selectedJob.job_name} — Proposal</h1><p>${proposal.cover_letter}</p><h2>Scope</h2><p>${proposal.scope_of_work}</p><h2>Materials</h2><p>${proposal.materials_spec}</p><h2>Timeline</h2><p>${proposal.timeline}</p><h2>Terms</h2><p>${proposal.terms}</p>`,
      send_status: "draft",
      validation_passed: true,
    });

    await base44.entities.CommercialJob.update(selectedJob.id, {
      bid_status: "bid_generated",
      estimated_flooring_value: totalMap[tier] || proposal.optimal_total,
    });

    toast({ title: `${tier.charAt(0).toUpperCase() + tier.slice(1)} proposal saved!` });
    setSending(false);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold metallic-gold">AI Proposal Generator</h1>
          <p className="text-xs text-white/40">Auto-draft bids from job data + regional pricing</p>
        </div>
      </div>

      {/* Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-white/60">Select Project</label>
          <Select value={selectedJobId} onValueChange={setSelectedJobId}>
            <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Choose a job..." /></SelectTrigger>
            <SelectContent>
              {jobs.map(j => <SelectItem key={j.id} value={j.id}>{j.job_name} — {j.city}, {j.state}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-white/60">Send To (optional)</label>
          <Select value={selectedContractorId} onValueChange={setSelectedContractorId}>
            <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Choose recipient..." /></SelectTrigger>
            <SelectContent>
              {contractors.map(c => <SelectItem key={c.id} value={c.id}>{c.company_name} — {c.contact_name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Job preview */}
      {selectedJob && (
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <div><p className="text-lg font-bold text-white">{(selectedJob.flooring_sqft || selectedJob.total_sqft || 0).toLocaleString()}</p><p className="text-[10px] text-white/40">Sqft</p></div>
          <div><p className="text-lg font-bold text-white capitalize">{(selectedJob.project_type || "").replace(/_/g, " ")}</p><p className="text-[10px] text-white/40">Type</p></div>
          <div><p className="text-lg font-bold text-white">{selectedJob.sector || "Private"}</p><p className="text-[10px] text-white/40">Sector</p></div>
          <div><p className="text-lg font-bold text-white">{selectedJob.takeoff_complete ? "Yes" : "No"}</p><p className="text-[10px] text-white/40">Takeoff Done</p></div>
        </div>
      )}

      <Button onClick={generate} disabled={!selectedJobId || generating} className="w-full h-12 metallic-gold-bg text-black font-bold">
        {generating ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Generating AI Proposal...</> : <><Sparkles className="w-4 h-4 mr-2" /> Generate Proposal</>}
      </Button>

      {/* Results */}
      {proposal && (
        <div className="space-y-4">
          {/* Pricing tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { key: "aggressive", label: "Aggressive", color: "text-blue-400 border-blue-500/30 bg-blue-500/5", total: proposal.aggressive_total },
              { key: "optimal", label: "Optimal", color: "text-green-400 border-green-500/30 bg-green-500/5", total: proposal.optimal_total },
              { key: "premium", label: "Premium", color: "text-purple-400 border-purple-500/30 bg-purple-500/5", total: proposal.premium_total },
            ].map(tier => (
              <div key={tier.key} className={`p-4 rounded-xl border ${tier.color}`}>
                <p className="text-xs font-semibold opacity-70">{tier.label}</p>
                <p className="text-2xl font-bold mt-1">${(tier.total || 0).toLocaleString()}</p>
                <p className="text-[10px] opacity-50 mt-1">
                  ${((tier.total || 0) / Math.max(selectedJob?.flooring_sqft || selectedJob?.total_sqft || 1, 1)).toFixed(2)}/sqft
                </p>
                <Button size="sm" variant="outline" className="mt-3 w-full text-xs" onClick={() => saveProposal(tier.key)} disabled={sending}>
                  <FileText className="w-3 h-3 mr-1" /> Save as Bid
                </Button>
              </div>
            ))}
          </div>

          {/* Zone breakdown */}
          {proposal.zones?.length > 0 && (
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
              <h3 className="text-sm font-semibold text-white">Zone Breakdown</h3>
              {proposal.zones.map((z, i) => (
                <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-white/5 last:border-0">
                  <div>
                    <span className="text-white/80">{z.name}</span>
                    <span className="text-xs text-white/40 ml-2">{z.sqft?.toLocaleString()} sqft · {z.system}</span>
                  </div>
                  <span className="font-bold text-primary">${(z.total || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}

          {/* Scope */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
            <h3 className="text-sm font-semibold text-white">Scope of Work</h3>
            <p className="text-sm text-white/60 whitespace-pre-wrap">{proposal.scope_of_work}</p>
          </div>

          {/* Timeline */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
            <h3 className="text-sm font-semibold text-white">Timeline</h3>
            <p className="text-sm text-white/60 whitespace-pre-wrap">{proposal.timeline}</p>
          </div>
        </div>
      )}
    </div>
  );
}