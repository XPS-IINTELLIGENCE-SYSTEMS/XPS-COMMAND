import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Database, Download, Upload, Share2, Loader2, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataSearchBar, FilterPills, DataLoading, EmptyState } from "../shared/DataPageLayout";
import { useToast } from "@/components/ui/use-toast";

const STAGES = ["All", "Incoming", "Validated", "Qualified", "Prioritized", "Contacted", "Proposal", "Won", "Lost"];

export default function DataBankView() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("All");
  const [importing, setImporting] = useState(false);
  const { toast } = useToast();

  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Lead.list("-created_date", 1000);
    setLeads(data || []);
    setLoading(false);
  };

  const filtered = leads.filter(l => {
    if (stageFilter !== "All" && l.stage !== stageFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (l.company || "").toLowerCase().includes(s) || (l.contact_name || "").toLowerCase().includes(s) || (l.email || "").toLowerCase().includes(s);
    }
    return true;
  });

  const handleExport = () => {
    const csv = [
      ["Company", "Contact", "Email", "Phone", "City", "State", "Stage", "Score", "Value", "Source"].join(","),
      ...filtered.map(l => [l.company, l.contact_name, l.email, l.phone, l.city, l.state, l.stage, l.score, l.estimated_value, l.ingestion_source].map(v => `"${v || ""}"`).join(","))
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `leads_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast({ title: "Exported", description: `${filtered.length} leads exported.` });
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const extracted = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url,
      json_schema: {
        type: "object",
        properties: {
          leads: { type: "array", items: { type: "object", properties: {
            company: { type: "string" }, contact_name: { type: "string" }, email: { type: "string" },
            phone: { type: "string" }, city: { type: "string" }, state: { type: "string" }
          }}}
        }
      }
    });
    if (extracted.output?.leads?.length) {
      await base44.entities.Lead.bulkCreate(extracted.output.leads.map(l => ({
        ...l, stage: "Incoming", pipeline_status: "Incoming", ingestion_source: "Attachment", lead_type: "XPress"
      })));
      toast({ title: "Imported", description: `${extracted.output.leads.length} leads imported.` });
      load();
    }
    setImporting(false);
    e.target.value = "";
  };

  const handleShare = () => {
    const text = `XPS Lead Report: ${filtered.length} leads, $${(filtered.reduce((s, l) => s + (l.estimated_value || 0), 0) / 1000).toFixed(0)}k pipeline`;
    if (navigator.share) {
      navigator.share({ title: "XPS Leads", text });
    } else {
      navigator.clipboard.writeText(text);
      toast({ title: "Copied", description: "Lead summary copied to clipboard." });
    }
  };

  if (loading) return <DataLoading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Data Bank</h1>
          <p className="text-sm text-muted-foreground">{leads.length} total leads · ${(leads.reduce((s, l) => s + (l.estimated_value || 0), 0) / 1000).toFixed(0)}k total value</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <label className="cursor-pointer">
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <span>{importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />} Import</span>
            </Button>
            <input type="file" accept=".csv,.xlsx,.json" className="hidden" onChange={handleImport} />
          </label>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExport}><Download className="w-3.5 h-3.5" /> Export</Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleShare}><Share2 className="w-3.5 h-3.5" /> Share</Button>
        </div>
      </div>

      <DataSearchBar value={search} onChange={setSearch} placeholder="Search all leads..." />
      <FilterPills label="Stage" options={STAGES} active={stageFilter} onChange={setStageFilter} />

      {filtered.length === 0 ? <EmptyState icon={Database} message="No leads in data bank" /> : (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-card/50 text-[11px] text-muted-foreground uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Company</th>
                  <th className="text-left px-4 py-3">Contact</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Location</th>
                  <th className="text-left px-4 py-3">Stage</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Score</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Value</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.slice(0, 200).map(l => (
                  <tr key={l.id} className="hover:bg-card/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{l.company}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{l.contact_name} {l.email ? `· ${l.email}` : ""}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">{l.city}{l.state ? `, ${l.state}` : ""}</td>
                    <td className="px-4 py-3"><span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{l.stage}</span></td>
                    <td className="px-4 py-3 hidden sm:table-cell text-xs">{l.score || "—"}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs">{l.estimated_value ? `$${l.estimated_value.toLocaleString()}` : "—"}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-[10px] text-muted-foreground">{l.ingestion_source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}