import { useState } from "react";
import { Upload, FileText, Loader2, CheckCircle, Database, Brain, BookOpen, Swords } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const CATEGORIES = [
  { id: "Product Info", icon: FileText, label: "Product Info" },
  { id: "Pricing", icon: FileText, label: "Pricing" },
  { id: "Technical Spec", icon: Database, label: "Technical Spec" },
  { id: "Competitor Intel", icon: Swords, label: "Competitor Intel" },
  { id: "Market Data", icon: Brain, label: "Market Data" },
  { id: "Training Material", icon: BookOpen, label: "Training" },
  { id: "Case Study", icon: FileText, label: "Case Study" },
  { id: "Custom", icon: FileText, label: "Custom" },
];

export default function KnowledgeUploadView() {
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [category, setCategory] = useState("Product Info");
  const [title, setTitle] = useState("");
  const [manualContent, setManualContent] = useState("");
  const [uploaded, setUploaded] = useState([]);
  const { toast } = useToast();

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    // Extract data from file
    setProcessing(true);
    const extracted = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url,
      json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          content: { type: "string" },
          key_facts: { type: "array", items: { type: "string" } },
          tags: { type: "array", items: { type: "string" } },
        }
      }
    });

    const data = extracted.output || {};

    // Use AI to categorize and enrich
    const enriched = await base44.integrations.Core.InvokeLLM({
      prompt: `Categorize and summarize this knowledge for a flooring/epoxy business CRM:
Title: ${title || data.title || file.name}
Category: ${category}
Content: ${data.content || "File uploaded: " + file.name}

Provide a concise summary, key facts, and relevant tags for the knowledge base.`,
      response_json_schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          key_facts: { type: "string" },
          tags: { type: "string" },
          subcategory: { type: "string" }
        }
      }
    });

    await base44.entities.KnowledgeEntry.create({
      title: title || data.title || file.name,
      category,
      subcategory: enriched.subcategory || "",
      content: data.content || "Uploaded file",
      summary: enriched.summary || "",
      key_facts: enriched.key_facts || "[]",
      tags: enriched.tags || "",
      source_url: file_url,
      ingested_date: new Date().toISOString(),
    });

    setUploaded(prev => [...prev, { name: file.name, category }]);
    toast({ title: "Knowledge Ingested", description: `${file.name} processed and stored.` });
    setUploading(false);
    setProcessing(false);
    setTitle("");
    e.target.value = "";
  };

  const handleManualAdd = async () => {
    if (!title.trim() || !manualContent.trim()) return;
    setProcessing(true);

    const enriched = await base44.integrations.Core.InvokeLLM({
      prompt: `Summarize and tag this knowledge entry for a flooring/epoxy CRM:
Title: ${title}
Category: ${category}
Content: ${manualContent}`,
      response_json_schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          key_facts: { type: "string" },
          tags: { type: "string" },
          subcategory: { type: "string" }
        }
      }
    });

    await base44.entities.KnowledgeEntry.create({
      title,
      category,
      subcategory: enriched.subcategory || "",
      content: manualContent,
      summary: enriched.summary || "",
      key_facts: enriched.key_facts || "[]",
      tags: enriched.tags || "",
      ingested_date: new Date().toISOString(),
    });

    setUploaded(prev => [...prev, { name: title, category }]);
    toast({ title: "Knowledge Added", description: `"${title}" ingested.` });
    setTitle("");
    setManualContent("");
    setProcessing(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Knowledge Upload</h1>
        <p className="text-sm text-muted-foreground mt-1">Upload documents, data, and intelligence to strengthen the system</p>
      </div>

      {/* Category Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map(c => {
          const Icon = c.icon;
          return (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                category === c.id ? "bg-primary/10 border-primary text-primary" : "bg-card border-border text-muted-foreground hover:border-primary/30"
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {c.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* File Upload */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-sm font-bold text-foreground mb-4">Upload File</h3>
          <input
            placeholder="Title (optional)"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full h-9 px-3 mb-3 bg-secondary/30 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
          />
          <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/40 transition-colors">
            {uploading || processing ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">{processing ? "AI Processing..." : "Uploading..."}</span>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-xs text-muted-foreground">CSV, PDF, Excel, JSON, Images</span>
              </>
            )}
            <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
          </label>
        </div>

        {/* Manual Entry */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-sm font-bold text-foreground mb-4">Manual Entry</h3>
          <input
            placeholder="Title *"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full h-9 px-3 mb-3 bg-secondary/30 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
          />
          <textarea
            placeholder="Paste knowledge content here..."
            value={manualContent}
            onChange={e => setManualContent(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 mb-3 bg-secondary/30 border border-border rounded-lg text-sm text-foreground resize-none focus:outline-none focus:border-primary"
          />
          <Button onClick={handleManualAdd} disabled={processing || !title.trim() || !manualContent.trim()} className="w-full">
            {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Brain className="w-4 h-4 mr-2" />}
            Ingest Knowledge
          </Button>
        </div>
      </div>

      {/* Recent Uploads */}
      {uploaded.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Recently Ingested</h3>
          <div className="space-y-2">
            {uploaded.map((u, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm text-foreground">{u.name}</span>
                <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{u.category}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}