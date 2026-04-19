import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Ruler, Save, Loader2, CheckCircle2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import ZonePhotoUploader from "./ZonePhotoUploader";
import PunchListSection from "./PunchListSection";

const PHASE_OPTIONS = [
  "discovered", "permit_filed", "design", "pre_bid", "bidding",
  "bid_submitted", "awarded", "under_construction", "complete", "lost"
];

export default function JobDetailView({ job, onBack, onUpdated }) {
  const [phase, setPhase] = useState(job.project_phase || "discovered");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Parse existing data
  const [zonePhotos, setZonePhotos] = useState(() => {
    try { return JSON.parse(job.notes?.match(/\[PHOTOS\](.*)\[\/PHOTOS\]/s)?.[1] || "{}"); } catch { return {}; }
  });
  const [punchList, setPunchList] = useState(() => {
    try { return JSON.parse(job.notes?.match(/\[PUNCH\](.*)\[\/PUNCH\]/s)?.[1] || "[]"); } catch { return []; }
  });

  let takeoff = null;
  try { takeoff = JSON.parse(job.takeoff_data || "null"); } catch {}
  const zones = takeoff?.zones || [];

  const handleZonePhotos = (zoneName, photos) => {
    setZonePhotos(prev => ({ ...prev, [zoneName]: photos }));
  };

  const saveAll = async () => {
    setSaving(true);
    // Build notes with embedded structured data
    const existingNotes = (job.notes || "")
      .replace(/\[PHOTOS\].*\[\/PHOTOS\]/s, "")
      .replace(/\[PUNCH\].*\[\/PUNCH\]/s, "")
      .trim();

    const updatedNotes = [
      existingNotes,
      `[PHOTOS]${JSON.stringify(zonePhotos)}[/PHOTOS]`,
      `[PUNCH]${JSON.stringify(punchList)}[/PUNCH]`
    ].filter(Boolean).join("\n");

    await base44.entities.CommercialJob.update(job.id, {
      project_phase: phase,
      notes: updatedNotes
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onUpdated?.();
  };

  const doneCount = punchList.filter(i => i.done).length;
  const allDone = punchList.length > 0 && doneCount === punchList.length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/10 active:bg-white/15 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white/60" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-white truncate">{job.job_name}</h2>
          <div className="flex items-center gap-2 text-xs text-white/40">
            <MapPin className="w-3 h-3" />{job.city}, {job.state}
            {(job.flooring_sqft || job.total_sqft) > 0 && (
              <><Ruler className="w-3 h-3 ml-1" />{(job.flooring_sqft || job.total_sqft).toLocaleString()} sqft</>
            )}
          </div>
        </div>
      </div>

      {/* Status update */}
      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
        <label className="text-xs font-medium text-white/60">Job Status</label>
        <Select value={phase} onValueChange={setPhase}>
          <SelectTrigger className="bg-white/5 border-white/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PHASE_OPTIONS.map(p => (
              <SelectItem key={p} value={p}>{p.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Zone photos */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" /> Zone Progress Photos
        </h3>
        {zones.length > 0 ? (
          zones.map((zone, i) => (
            <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/8 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">{zone.zone_name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{zone.sqft?.toLocaleString()} sqft</span>
              </div>
              <ZonePhotoUploader
                zoneName={zone.zone_name}
                existingPhotos={zonePhotos[zone.zone_name] || []}
                onPhotosChange={(photos) => handleZonePhotos(zone.zone_name, photos)}
              />
            </div>
          ))
        ) : (
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/8">
            <ZonePhotoUploader
              zoneName="General"
              existingPhotos={zonePhotos["General"] || []}
              onPhotosChange={(photos) => handleZonePhotos("General", photos)}
            />
          </div>
        )}
      </div>

      {/* Punch list */}
      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
        <PunchListSection items={punchList} onItemsChange={setPunchList} />
      </div>

      {/* Save button */}
      <Button onClick={saveAll} disabled={saving} className="w-full h-12 metallic-gold-bg text-black font-bold text-base">
        {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving…</>
          : saved ? <><CheckCircle2 className="w-4 h-4 mr-2" />Saved!</>
          : <><Save className="w-4 h-4 mr-2" />Save All Changes</>
        }
      </Button>
    </div>
  );
}