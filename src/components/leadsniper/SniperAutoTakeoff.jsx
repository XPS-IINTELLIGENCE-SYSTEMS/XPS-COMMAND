import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, Ruler, Package, DollarSign, CheckCircle2, FileText } from "lucide-react";

export default function SniperAutoTakeoff({ scope, onTakeoffComplete }) {
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const runTakeoff = async () => {
    setProcessing(true);
    setResult(null);

    let fileUrl = scope.raw_scope_document;

    // If new file uploaded, use that instead
    if (file) {
      const uploaded = await base44.integrations.Core.UploadFile({ file });
      fileUrl = uploaded.file_url;
    }

    if (!fileUrl) {
      alert("No floor plan document available. Upload a PDF or image.");
      setProcessing(false);
      return;
    }

    // Run AI takeoff analysis
    const takeoff = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert flooring takeoff estimator for Xtreme Polishing Systems. Analyze this floor plan document and perform a complete takeoff.

PROJECT CONTEXT:
- Name: ${scope.project_name}
- Type: ${scope.project_type || "commercial"}
- Specified System: ${scope.specified_system || "Not specified"}
- Total SF (if known): ${scope.total_flooring_sqft || "Calculate from plans"}

For EACH zone/room/area visible in the plans, calculate:
1. Net square footage (deduct columns, penetrations, non-flooring areas)
2. Perimeter length in linear feet (for cove base calculations)
3. Required flooring system type
4. Material volumes needed:
   - Primer: coverage rate 200-300 SF/gal depending on porosity
   - Body coat (epoxy/urethane/polyaspartic): 100-160 SF/gal per coat, typically 2 coats
   - Topcoat: 250-400 SF/gal
   - Aggregate/broadcast: 8-12 lbs per 100 SF if required
   - Cove base material: LF of perimeter × 6 inches height
   - Crack repair: estimate 5% of total SF
   - Moisture mitigation: if required, full coverage at 100 SF/gal

Use XPS pricing:
- Primer: $35-55/gal
- Epoxy body coat: $85-145/gal
- Polyaspartic: $120-180/gal
- Urethane topcoat: $95-160/gal
- Aggregate: $1.50-3.00/lb
- Cove base: $8-15/LF
- Crack repair: $2-4/SF
- Moisture mitigation: $1.50-3.00/SF

Be precise and thorough. Calculate everything zone by zone.`,
      file_urls: [fileUrl],
      response_json_schema: {
        type: "object",
        properties: {
          total_net_sqft: { type: "number" },
          total_perimeter_lf: { type: "number" },
          zones: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                gross_sqft: { type: "number" },
                net_sqft: { type: "number" },
                deductions_sqft: { type: "number" },
                perimeter_lf: { type: "number" },
                system_type: { type: "string" },
                materials: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      item: { type: "string" },
                      quantity: { type: "string" },
                      unit: { type: "string" },
                      coverage_rate: { type: "string" },
                      unit_cost: { type: "number" },
                      total_cost: { type: "number" }
                    }
                  }
                },
                zone_material_cost: { type: "number" },
                zone_labor_hours: { type: "number" }
              }
            }
          },
          material_summary: {
            type: "array",
            items: {
              type: "object",
              properties: {
                item: { type: "string" },
                total_quantity: { type: "string" },
                unit: { type: "string" },
                total_cost: { type: "number" }
              }
            }
          },
          total_material_cost: { type: "number" },
          total_labor_hours: { type: "number" },
          estimated_labor_cost: { type: "number" },
          estimated_equipment_cost: { type: "number" },
          notes: { type: "string" }
        }
      },
      model: "claude_sonnet_4_6"
    });

    // Update the FloorScope record with takeoff data
    const updateData = {
      takeoff_data: JSON.stringify(takeoff),
      takeoff_status: "complete",
      total_flooring_sqft: takeoff.total_net_sqft || scope.total_flooring_sqft,
      material_cost: takeoff.total_material_cost || 0,
      labor_cost: takeoff.estimated_labor_cost || 0,
      equipment_cost: takeoff.estimated_equipment_cost || 0,
    };

    if (takeoff.zones?.length > 0) {
      updateData.extracted_zones = JSON.stringify(takeoff.zones.map(z => ({
        name: z.name,
        sqft: z.net_sqft,
        system_type: z.system_type,
        perimeter_lf: z.perimeter_lf,
      })));
    }

    if (file && fileUrl !== scope.raw_scope_document) {
      updateData.raw_scope_document = fileUrl;
    }

    await base44.entities.FloorScope.update(scope.id, updateData);

    setResult(takeoff);
    setFile(null);
    setProcessing(false);
    onTakeoffComplete?.({ ...scope, ...updateData, takeoff_data: JSON.stringify(takeoff) });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Ruler className="w-4 h-4 metallic-gold-icon" />
          <span className="text-xs font-bold metallic-gold">AI Auto-Takeoff</span>
        </div>
        {scope.takeoff_status === "complete" && !result && (
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">Takeoff Complete</span>
        )}
      </div>

      {/* Upload or use existing */}
      <div className="flex flex-col sm:flex-row gap-2">
        <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 border-dashed border-border/50 hover:border-primary/30 cursor-pointer transition-colors">
          <FileText className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">
            {file ? file.name : scope.raw_scope_document ? "Upload new plans (or use existing)" : "Upload floor plans (PDF/image)"}
          </span>
          <input type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
        </label>
        <Button size="sm" onClick={runTakeoff} disabled={processing || (!file && !scope.raw_scope_document)} className="text-xs h-9 metallic-gold-bg text-background">
          {processing ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Ruler className="w-3.5 h-3.5 mr-1" />}
          {processing ? "Analyzing Plans..." : "Run AI Takeoff"}
        </Button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-3">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <TakeoffKPI icon={Ruler} label="Net SqFt" value={result.total_net_sqft?.toLocaleString()} color="#d4af37" />
            <TakeoffKPI icon={Ruler} label="Perimeter" value={`${result.total_perimeter_lf?.toLocaleString()} LF`} color="#06b6d4" />
            <TakeoffKPI icon={Package} label="Material Cost" value={`$${result.total_material_cost?.toLocaleString()}`} color="#8b5cf6" />
            <TakeoffKPI icon={DollarSign} label="Labor Cost" value={`$${result.estimated_labor_cost?.toLocaleString()}`} color="#f59e0b" />
            <TakeoffKPI icon={DollarSign} label="Equipment" value={`$${result.estimated_equipment_cost?.toLocaleString()}`} color="#22c55e" />
          </div>

          {/* Zone Breakdown */}
          {(result.zones || []).length > 0 && (
            <div>
              <h3 className="text-[11px] font-bold text-foreground mb-1.5">Zone Breakdown ({result.zones.length} zones)</h3>
              <div className="space-y-2 max-h-[250px] overflow-y-auto">
                {result.zones.map((z, i) => (
                  <div key={i} className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-foreground">{z.name}</span>
                      <span className="text-[10px] text-primary font-mono">{z.net_sqft?.toLocaleString()} SF net</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-[9px] mb-2">
                      <span className="text-muted-foreground">Gross: {z.gross_sqft?.toLocaleString()} SF</span>
                      <span className="text-muted-foreground">Deductions: {z.deductions_sqft?.toLocaleString()} SF</span>
                      <span className="text-muted-foreground">Perimeter: {z.perimeter_lf?.toLocaleString()} LF</span>
                      <span className="text-muted-foreground">System: {z.system_type}</span>
                    </div>
                    {(z.materials || []).length > 0 && (
                      <div className="space-y-0.5">
                        {z.materials.map((m, j) => (
                          <div key={j} className="flex justify-between text-[9px]">
                            <span className="text-muted-foreground">{m.item} ({m.quantity} {m.unit})</span>
                            <span className="text-foreground">${m.total_cost?.toLocaleString()}</span>
                          </div>
                        ))}
                        <div className="border-t border-border/20 pt-0.5 flex justify-between text-[9px] font-medium">
                          <span className="text-muted-foreground">Zone Total</span>
                          <span className="text-primary">${z.zone_material_cost?.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Material Summary */}
          {(result.material_summary || []).length > 0 && (
            <div>
              <h3 className="text-[11px] font-bold text-foreground mb-1.5">Material Summary (for RFQ)</h3>
              <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
                <div className="space-y-1">
                  {result.material_summary.map((m, i) => (
                    <div key={i} className="flex items-center justify-between text-[10px]">
                      <span className="text-foreground">{m.item}</span>
                      <span className="text-muted-foreground">{m.total_quantity} {m.unit}</span>
                      <span className="text-foreground font-medium">${m.total_cost?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {result.notes && (
            <div className="text-[9px] text-muted-foreground italic p-2 rounded-lg bg-white/[0.02]">{result.notes}</div>
          )}

          <div className="flex items-center gap-2 text-[10px] text-green-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Takeoff data saved to scope — material costs and zones updated</span>
          </div>
        </div>
      )}

      {/* Show existing takeoff data if no new result */}
      {!result && scope.takeoff_status === "complete" && scope.takeoff_data && (
        <ExistingTakeoff data={scope.takeoff_data} />
      )}
    </div>
  );
}

function TakeoffKPI({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2 text-center">
      <Icon className="w-3 h-3 mx-auto mb-0.5" style={{ color }} />
      <div className="text-[11px] font-bold text-foreground">{value || "—"}</div>
      <div className="text-[8px] text-muted-foreground">{label}</div>
    </div>
  );
}

function ExistingTakeoff({ data }) {
  let parsed = null;
  try { parsed = JSON.parse(data); } catch { return null; }
  if (!parsed) return null;

  return (
    <div className="rounded-lg bg-green-500/5 border border-green-500/20 p-3">
      <div className="text-[10px] font-bold text-green-400 mb-1.5">Previous Takeoff Results</div>
      <div className="grid grid-cols-3 gap-2 text-[10px]">
        <div><span className="text-muted-foreground">Net SF: </span><span className="text-foreground">{parsed.total_net_sqft?.toLocaleString()}</span></div>
        <div><span className="text-muted-foreground">Materials: </span><span className="text-foreground">${parsed.total_material_cost?.toLocaleString()}</span></div>
        <div><span className="text-muted-foreground">Labor: </span><span className="text-foreground">${parsed.estimated_labor_cost?.toLocaleString()}</span></div>
      </div>
      {(parsed.zones || []).length > 0 && (
        <div className="mt-1.5 text-[9px] text-muted-foreground">{parsed.zones.length} zones analyzed</div>
      )}
    </div>
  );
}