import { useState } from "react";
import { Loader2, Sparkles, Building2, Pencil, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import BlueprintUploadSection from "./BlueprintUploadSection";
import TakeoffResultsPanel from "./TakeoffResultsPanel";
import BlueprintCanvas from "./BlueprintCanvas";
import ScaleCalibrator from "./ScaleCalibrator";
import CanvasTakeoffSummary from "./CanvasTakeoffSummary";
import TakeoffOverlayEditor from "./TakeoffOverlayEditor";

const PROJECT_TYPES = [
  "warehouse", "retail", "restaurant", "fitness", "healthcare", "industrial",
  "data_center", "hotel", "automotive", "brewery", "food_processing",
  "office", "education", "government", "mixed_use", "parking_garage", "other"
];

export default function BlueprintTakeoffView({ onNavigateToProposal }) {
  const [fileUrl, setFileUrl] = useState(null);
  const [jobName, setJobName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [projectType, setProjectType] = useState("other");
  const [notes, setNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("ai"); // "ai" | "canvas"
  const [scaleFactor, setScaleFactor] = useState(0.0625); // default ~8px per foot
  const [canvasZones, setCanvasZones] = useState([]);

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

  // Save canvas takeoff to a job
  const saveCanvasTakeoff = async () => {
    if (canvasZones.length === 0) return;
    setProcessing(true);

    const polygonArea = (pts) => {
      let area = 0;
      for (let i = 0; i < pts.length; i++) {
        const j = (i + 1) % pts.length;
        area += pts[i].x * pts[j].y;
        area -= pts[j].x * pts[i].y;
      }
      return Math.abs(area / 2);
    };

    const zoneData = canvasZones.map(z => ({
      zone_name: z.name,
      sqft: Math.round(polygonArea(z.points) * scaleFactor),
      recommended_system: z.system,
      material_zone: z.system,
    }));
    const totalSqft = zoneData.reduce((s, z) => s + z.sqft, 0);

    const job = await base44.entities.CommercialJob.create({
      job_name: jobName || "Canvas Takeoff Project",
      city: city || "",
      state: state || "",
      project_type: projectType,
      total_sqft: totalSqft,
      flooring_sqft: totalSqft,
      takeoff_data: JSON.stringify({ zones: zoneData, total_sqft: totalSqft }),
      takeoff_complete: true,
      project_phase: "design",
    });

    setResult({
      success: true,
      job_id: job.id,
      takeoff: { total_sqft: totalSqft, zones: zoneData },
    });
    setProcessing(false);
  };

  // Send zones to proposal generator
  const handleSendToProposal = async (zoneData, totalSqft) => {
    // First save the takeoff as a job if not already saved
    if (!result?.job_id) {
      await saveCanvasTakeoff();
    }
    // Navigate to proposal generator
    onNavigateToProposal?.();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold metallic-gold">Blueprint Takeoff</h2>
            <p className="text-xs text-white/50">Upload plans → draw zones → auto-calculate sqft</p>
          </div>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
        <button onClick={() => setMode("canvas")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
            mode === "canvas" ? "bg-primary/15 text-primary" : "text-white/40 hover:text-white/60"
          }`}
        >
          <Pencil className="w-4 h-4" /> Interactive Canvas
        </button>
        <button onClick={() => setMode("ai")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
            mode === "ai" ? "bg-primary/15 text-primary" : "text-white/40 hover:text-white/60"
          }`}
        >
          <Sparkles className="w-4 h-4" /> AI Auto-Detect
        </button>
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

      {mode === "canvas" ? (
        <>
          {/* Scale calibrator */}
          <ScaleCalibrator onCalibrate={setScaleFactor} currentScale={scaleFactor} />

          {/* Interactive canvas */}
          <BlueprintCanvas
            imageUrl={fileUrl}
            scaleFactor={scaleFactor}
            zones={canvasZones}
            onZonesChange={setCanvasZones}
          />

          {/* Editable zone overlay */}
          <TakeoffOverlayEditor
            zones={canvasZones}
            scaleFactor={scaleFactor}
            onZonesChange={setCanvasZones}
          />

          {/* Takeoff summary with proposal link */}
          <CanvasTakeoffSummary
            zones={canvasZones}
            scaleFactor={scaleFactor}
            onSendToProposal={handleSendToProposal}
          />

          {/* Save as job */}
          {canvasZones.length > 0 && !result?.job_id && (
            <Button onClick={saveCanvasTakeoff} disabled={processing} variant="outline" className="w-full h-10">
              {processing ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</> : "Save Takeoff as Commercial Job"}
            </Button>
          )}

          {result?.job_id && (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-sm text-green-400">
              Takeoff saved as job. Total: {result.takeoff?.total_sqft?.toLocaleString()} sqft across {result.takeoff?.zones?.length} zones.
            </div>
          )}
        </>
      ) : (
        <>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Notes (optional)</label>
            <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special requirements…" className="bg-white/5 border-white/10" />
          </div>

          <Button onClick={runTakeoff} disabled={!fileUrl || processing} className="w-full metallic-gold-bg text-black font-bold h-11">
            {processing ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Analyzing Blueprint…</> : <><Sparkles className="w-4 h-4 mr-2" /> Run AI Takeoff</>}
          </Button>

          {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>}
          {result && (
            <>
              <TakeoffResultsPanel takeoff={result.takeoff} jobId={result.job_id} />
              {result.takeoff?.zones?.length > 0 && (
                <TakeoffOverlayEditor
                  zones={result.takeoff.zones.map((z, i) => ({
                    name: z.zone_name || `Zone ${i + 1}`,
                    points: z.points || [{ x: 0, y: 0 }],
                    system: z.recommended_system || z.material_zone || "Epoxy",
                    manual_sqft: null,
                    ...z
                  }))}
                  scaleFactor={1}
                  onZonesChange={(updated) => {
                    setResult(prev => ({
                      ...prev,
                      takeoff: {
                        ...prev.takeoff,
                        zones: updated.map(z => ({
                          ...z,
                          sqft: z.manual_sqft || z.sqft,
                          zone_name: z.name
                        })),
                        total_sqft: updated.reduce((s, z) => s + (z.manual_sqft || z.sqft || 0), 0)
                      }
                    }));
                  }}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}