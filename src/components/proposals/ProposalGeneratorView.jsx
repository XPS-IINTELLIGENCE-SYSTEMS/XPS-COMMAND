import { useState } from "react";
import { FileText, Loader2, Sparkles, Download, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import JobSelector from "./JobSelector";

const PRICING_TIERS = [
  { value: "aggressive", label: "Aggressive — Win-focused, lower margin" },
  { value: "optimal", label: "Optimal — Best balance of win rate & profit" },
  { value: "premium", label: "Premium — Maximum margin" },
  { value: "custom", label: "Custom — Set your own price" },
];

export default function ProposalGeneratorView() {
  const [selectedJob, setSelectedJob] = useState(null);
  const [pricingTier, setPricingTier] = useState("optimal");
  const [customPrice, setCustomPrice] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const generate = async () => {
    if (!selectedJob) return;
    setProcessing(true);
    setError(null);
    setResult(null);

    const params = {
      job_id: selectedJob.id,
      pricing_tier: pricingTier !== "custom" ? pricingTier : "optimal",
    };
    if (pricingTier === "custom" && Number(customPrice) > 0) {
      params.custom_price_per_sqft = Number(customPrice);
    }

    const res = await base44.functions.invoke("generateJobProposalPdf", params);

    if (res.data?.success) {
      setResult(res.data);
    } else {
      setError(res.data?.error || "Failed to generate proposal");
    }
    setProcessing(false);
  };

  const takeoff = selectedJob?.takeoff_data ? (() => { try { return JSON.parse(selectedJob.takeoff_data); } catch { return null; } })() : null;

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold metallic-gold">Proposal Generator</h2>
          <p className="text-xs text-white/50">Auto-generate PDF proposals from job takeoffs with dynamic pricing</p>
        </div>
      </div>

      {/* Job selector */}
      <JobSelector onSelect={setSelectedJob} selectedId={selectedJob?.id} />

      {/* Job summary */}
      {selectedJob && (
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/8 space-y-2">
          <h3 className="text-sm font-bold text-white">{selectedJob.job_name}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div><span className="text-white/40">Type</span><br/><span className="text-white">{(selectedJob.project_type || '').replace(/_/g, ' ')}</span></div>
            <div><span className="text-white/40">Sqft</span><br/><span className="text-white">{(selectedJob.flooring_sqft || selectedJob.total_sqft || 0).toLocaleString()}</span></div>
            <div><span className="text-white/40">System</span><br/><span className="text-white">{selectedJob.flooring_system_recommendation || '—'}</span></div>
            <div><span className="text-white/40">Takeoff</span><br/><span className={selectedJob.takeoff_complete ? "text-green-400" : "text-yellow-400"}>{selectedJob.takeoff_complete ? `✓ ${takeoff?.zones?.length || 0} zones` : 'Not done'}</span></div>
          </div>
          {takeoff?.zones?.length > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-[11px] text-white/40 font-medium">Zones from takeoff:</p>
              <div className="flex flex-wrap gap-1.5">
                {takeoff.zones.map((z, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-white/60">
                    {z.zone_name} — {z.sqft?.toLocaleString()} sqft
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pricing tier */}
      {selectedJob && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-white/80">Pricing Strategy</label>
          <Select value={pricingTier} onValueChange={setPricingTier}>
            <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PRICING_TIERS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
          {pricingTier === "custom" && (
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-white/40" />
              <Input
                type="number"
                step="0.01"
                value={customPrice}
                onChange={e => setCustomPrice(e.target.value)}
                placeholder="Price per sqft"
                className="bg-white/5 border-white/10 w-40"
              />
              <span className="text-xs text-white/40">/sqft</span>
            </div>
          )}
        </div>
      )}

      {/* Generate button */}
      <Button
        onClick={generate}
        disabled={!selectedJob || processing}
        className="w-full metallic-gold-bg text-black font-bold h-11"
      >
        {processing
          ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Generating Proposal PDF…</>
          : <><Sparkles className="w-4 h-4 mr-2" /> Generate Professional Proposal</>
        }
      </Button>

      {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>}

      {/* Result */}
      {result && (
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-green-500/10 border border-green-500/25 text-center space-y-3">
            <FileText className="w-10 h-10 text-green-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">Proposal Ready</h3>
            <div className="grid grid-cols-2 gap-3 text-sm max-w-xs mx-auto">
              <div><span className="text-white/40">Total Bid</span><br/><span className="text-xl font-bold metallic-gold">${result.total_bid?.toLocaleString()}</span></div>
              <div><span className="text-white/40">Price/sqft</span><br/><span className="text-xl font-bold text-white">${result.price_per_sqft?.toFixed(2)}</span></div>
            </div>
            {result.zones_count > 0 && <p className="text-xs text-white/40">{result.zones_count} zones included</p>}
            {result.pricing_data?.recommended && (
              <p className="text-xs text-white/40">Dynamic pricing recommended: ${result.pricing_data.recommended?.toFixed(2)}/sqft</p>
            )}
          </div>

          <a
            href={result.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full h-11 rounded-lg bg-white/10 hover:bg-white/15 text-white font-semibold transition-colors"
          >
            <Download className="w-4 h-4" /> Download PDF Proposal
          </a>
        </div>
      )}
    </div>
  );
}