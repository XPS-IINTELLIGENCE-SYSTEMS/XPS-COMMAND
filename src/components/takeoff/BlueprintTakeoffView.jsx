import { useState } from "react";
import { Loader2, Sparkles, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import BlueprintUploadSection from "./BlueprintUploadSection";
import TakeoffResultsPanel from "./TakeoffResultsPanel";

const PROJECT_TYPES = [
  "warehouse", "retail", "restaurant", "fitness", "healthcare", "industrial",
  "data_center", "hotel", "automotive", "brewery", "food_processing",
  "office", "education", "government", "mixed_use", "parking_garage", "other"
];

export default function BlueprintTakeoffView() {
  const [fileUrl, setFileUrl] = useState(null);
  const [jobName, setJobName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [projectType, setProjectType] = useState("other");
  const [notes, setNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const runTakeoff = async () => {
    if (!fileUrl) return;
    setProcessing(true);
    setError(null);
    setResult(null);

    const res = await base44.functions.invoke("blueprintTakeoff", {
      file_url: fileUrl,
      job_name: jobName,
      city,
      state,
      project_type: projectType,
      notes
    });

    if (res.data?.success) {
      setResult(res.data);
    } else {
      setError(res.data?.error || "Takeoff failed");
    }
    setProcessing(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold metallic-gold">Blueprint Takeoff</h2>
            <p className="text-xs text-white/50">Upload a site plan — AI extracts rooms, sqft, zones, and creates a job</p>
          </div>
        </div>
      </div>

      {/* Upload */}
      <BlueprintUploadSection onFileUploaded={setFileUrl} isProcessing={processing} />

      {/* Project details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-white/50 mb-1 block">Project Name</label>
          <Input value={jobName} onChange={e => setJobName(e.target.value)} placeholder="e.g. Amazon Warehouse - Phoenix" className="bg-white/5 border-white/10" />
        </div>
        <div>
          <label className="text-xs text-white/50 mb-1 block">Project Type</label>
          <Select value={projectType} onValueChange={setProjectType}>
            <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PROJECT_TYPES.map(t => (
                <SelectItem key={t} value={t}>{t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-white/50 mb-1 block">City</label>
          <Input value={city} onChange={e => setCity(e.target.value)} placeholder="Phoenix" className="bg-white/5 border-white/10" />
        </div>
        <div>
          <label className="text-xs text-white/50 mb-1 block">State</label>
          <Input value={state} onChange={e => setState(e.target.value)} placeholder="AZ" className="bg-white/5 border-white/10" />
        </div>
      </div>
      <div>
        <label className="text-xs text-white/50 mb-1 block">Notes (optional)</label>
        <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special requirements…" className="bg-white/5 border-white/10" />
      </div>

      {/* Run button */}
      <Button onClick={runTakeoff} disabled={!fileUrl || processing} className="w-full metallic-gold-bg text-black font-bold h-11">
        {processing ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Analyzing Blueprint…</> : <><Sparkles className="w-4 h-4 mr-2" /> Run AI Takeoff</>}
      </Button>

      {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>}

      {/* Results */}
      {result && <TakeoffResultsPanel takeoff={result.takeoff} jobId={result.job_id} />}
    </div>
  );
}