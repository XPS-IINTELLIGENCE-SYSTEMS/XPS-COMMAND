import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function SniperBidUpload({ onScopeCreated }) {
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    if (!file) return;
    setProcessing(true);
    setResult(null);

    // 1. Upload file
    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    // 2. Extract data with LLM
    const extracted = await base44.integrations.Core.InvokeLLM({
      prompt: `You are analyzing a GC bid invitation / flooring scope PDF. Extract the following from this document:
- Project name
- Project address, city, state
- General contractor company name
- GC contact name and email (if present)
- Bid due date and time
- Flooring scope: total square footage, types of flooring systems specified, zones/areas
- Special requirements (moisture mitigation, ESD, USDA, cove base, etc.)
- Project type (warehouse, retail, restaurant, healthcare, industrial, education, government, hotel, automotive, fitness, mixed_use, other)

Be thorough — extract every detail available.`,
      file_urls: [file_url],
      response_json_schema: {
        type: "object",
        properties: {
          project_name: { type: "string" },
          project_address: { type: "string" },
          project_city: { type: "string" },
          project_state: { type: "string" },
          gc_company_name: { type: "string" },
          gc_contact_name: { type: "string" },
          gc_contact_email: { type: "string" },
          bid_due_date: { type: "string", description: "YYYY-MM-DD format" },
          bid_due_time: { type: "string" },
          total_flooring_sqft: { type: "number" },
          specified_system: { type: "string" },
          zones: { type: "array", items: { type: "object", properties: { name: { type: "string" }, sqft: { type: "number" }, system_type: { type: "string" } } } },
          special_requirements: { type: "array", items: { type: "string" } },
          project_type: { type: "string" },
        }
      },
      model: "claude_sonnet_4_6"
    });

    // 3. Create FloorScope record
    const scope = await base44.entities.FloorScope.create({
      project_name: extracted.project_name || file.name,
      gc_company_name: extracted.gc_company_name || "Unknown GC",
      gc_contact_name: extracted.gc_contact_name || "",
      gc_contact_email: extracted.gc_contact_email || "",
      project_address: extracted.project_address || "",
      project_city: extracted.project_city || "",
      project_state: extracted.project_state || "",
      project_type: extracted.project_type || "other",
      bid_due_date: extracted.bid_due_date || "",
      bid_due_time: extracted.bid_due_time || "",
      total_flooring_sqft: extracted.total_flooring_sqft || 0,
      specified_system: extracted.specified_system || "",
      extracted_zones: JSON.stringify(extracted.zones || []),
      special_requirements: JSON.stringify(extracted.special_requirements || []),
      raw_scope_document: file_url,
      scope_received_date: new Date().toISOString(),
      bid_status: "not_started",
      takeoff_status: "pending",
    });

    // 4. Send notification email
    await base44.integrations.Core.SendEmail({
      to: "jeremy@shopxps.com",
      subject: `[NEW SCOPE] ${extracted.project_name || "Uploaded"} — ${extracted.gc_company_name || "Unknown GC"}`,
      body: `New bid invitation uploaded and processed.\n\nProject: ${extracted.project_name}\nGC: ${extracted.gc_company_name}\nLocation: ${extracted.project_city}, ${extracted.project_state}\nBid Due: ${extracted.bid_due_date} ${extracted.bid_due_time || ""}\nSqFt: ${extracted.total_flooring_sqft?.toLocaleString() || "TBD"}\nSystem: ${extracted.specified_system || "TBD"}\nZones: ${(extracted.zones || []).length}\nSpecial: ${(extracted.special_requirements || []).join(", ") || "None"}\n\nReview in the Lead Sniper dashboard.`,
      from_name: "XPS Lead Sniper"
    }).catch(() => {});

    setResult({ extracted, scope });
    setFile(null);
    setProcessing(false);
    onScopeCreated?.();
  };

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Upload className="w-4 h-4 metallic-gold-icon" />
        <span className="text-xs font-bold metallic-gold">Upload Bid Invitation</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-border/50 hover:border-primary/30 cursor-pointer transition-colors">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {file ? file.name : "Drop PDF or click to select"}
          </span>
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            className="hidden"
            onChange={e => setFile(e.target.files?.[0] || null)}
          />
        </label>
        <Button
          size="sm"
          onClick={handleUpload}
          disabled={!file || processing}
          className="text-xs h-10 metallic-gold-bg text-background"
        >
          {processing ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Upload className="w-3.5 h-3.5 mr-1" />}
          {processing ? "Extracting..." : "Process & Create Scope"}
        </Button>
      </div>

      {result && (
        <div className="mt-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-xs font-bold text-green-400">Scope Created — Notification Sent</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
            <Detail label="Project" value={result.extracted.project_name} />
            <Detail label="GC" value={result.extracted.gc_company_name} />
            <Detail label="Location" value={`${result.extracted.project_city}, ${result.extracted.project_state}`} />
            <Detail label="Due" value={result.extracted.bid_due_date} />
            <Detail label="SqFt" value={result.extracted.total_flooring_sqft?.toLocaleString()} />
            <Detail label="System" value={result.extracted.specified_system} />
            <Detail label="Zones" value={`${(result.extracted.zones || []).length} zones`} />
            <Detail label="Special" value={(result.extracted.special_requirements || []).join(", ") || "None"} />
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <span className="text-muted-foreground">{label}: </span>
      <span className="text-foreground font-medium">{value || "—"}</span>
    </div>
  );
}