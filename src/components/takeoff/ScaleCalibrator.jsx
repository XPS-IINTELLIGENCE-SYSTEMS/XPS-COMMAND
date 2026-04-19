import { useState } from "react";
import { Ruler, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ScaleCalibrator({ onCalibrate, currentScale }) {
  const [knownDim, setKnownDim] = useState("");
  const [pixelDim, setPixelDim] = useState("");
  const [calibrated, setCalibrated] = useState(!!currentScale);

  const calculate = () => {
    const known = parseFloat(knownDim);
    const pixels = parseFloat(pixelDim);
    if (!known || !pixels) return;
    // scale = sqft per pixel² = (known_ft / pixels)²
    const feetPerPixel = known / pixels;
    const sqftPerPx2 = feetPerPixel * feetPerPixel;
    onCalibrate(sqftPerPx2);
    setCalibrated(true);
  };

  return (
    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
      <div className="flex items-center gap-2">
        <Ruler className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-white">Scale Calibration</span>
        {calibrated && <Check className="w-4 h-4 text-green-400 ml-auto" />}
      </div>
      <p className="text-[11px] text-white/40">
        Enter a known dimension to calibrate. For example, if a wall on the plan represents 50 feet 
        and spans ~200 pixels, enter both values.
      </p>
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="text-[10px] text-white/40 mb-0.5 block">Known length (ft)</label>
          <Input value={knownDim} onChange={e => setKnownDim(e.target.value)} placeholder="50"
            className="h-8 text-sm bg-white/5 border-white/10" type="number" />
        </div>
        <div className="flex-1">
          <label className="text-[10px] text-white/40 mb-0.5 block">Pixel length (px)</label>
          <Input value={pixelDim} onChange={e => setPixelDim(e.target.value)} placeholder="200"
            className="h-8 text-sm bg-white/5 border-white/10" type="number" />
        </div>
        <Button size="sm" onClick={calculate} className="h-8 px-3 gap-1" disabled={!knownDim || !pixelDim}>
          <Ruler className="w-3 h-3" /> Set Scale
        </Button>
      </div>
      {calibrated && currentScale > 0 && (
        <p className="text-[10px] text-green-400/70">
          Scale: 1 pixel² = {currentScale.toFixed(6)} sqft ({(1 / Math.sqrt(currentScale)).toFixed(1)} px/ft)
        </p>
      )}
    </div>
  );
}