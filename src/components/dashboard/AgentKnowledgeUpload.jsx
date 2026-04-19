import { useState } from "react";
import { Upload, FileText, Loader2, CheckCircle2, Brain, BookOpen, Swords, DollarSign, Wrench, GraduationCap, Trash2, Globe } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const CATEGORIES = [
  { id: "Product Info", icon: FileText, label: "Products" },
  { id: "Pricing", icon: DollarSign, label: "Pricing" },
  { id: "Technical Spec", icon: Wrench, label: "Tech Specs" },
  { id: "Competitor Intel", icon: Swords, label: "Competitors" },
  { id: "Market Data", icon: Globe, label: "Market Data" },
  { id: "Training Material", icon: GraduationCap, label: "Training" },
  { id: "Case Study", icon: BookOpen, label: "Case Studies" },
  { id: "Custom", icon: Brain, label: "Custom" },
];

export default function AgentKnowledgeUpload() {
  const [files, setFiles] = useState([]);
  const [urlInput, setUrlInput] = useState("");
  const [category, setCategory] = useState("Product Info");
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState([]);
  const { toast } = useToast();

  const addFiles = (e) => {
    const newFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...newFiles]);
    e.target.value = "";
  };

  const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const processAll = async () => {
    if (files.length === 0 && !urlInput.trim()) return;
    setProcessing(true);
    const results = [];

    // Process files
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const extracted = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: { title: { type: "string" }, content: { type: "string" }, key_facts: { type: "array", items: { type: "string" } } }
        }
      });
      const data = extracted.output || {};

      const enriched = await base44.integrations.Core.InvokeLLM({
        prompt: `Summarize this for an AI agent's knowledge base (flooring/epoxy industry):
Title: ${data.title || file.name}
Category: ${category}
Content: ${(data.content || "").substring(0, 5000)}

Return a concise summary, key facts, and tags.`,
        response_json_schema: {
          type: "object",
          properties: { summary: { type: "string" }, key_facts: { type: "string" }, tags: { type: "string" }, subcategory: { type: "string" } }
        }
      });

      await base44.entities.KnowledgeEntry.create({
        title: data.title || file.name,
        category,
        subcategory: enriched.subcategory || "",
        content: (data.content || "").substring(0, 10000),
        summary: enriched.summary || "",
        key_facts: enriched.key_facts || "",
        tags: enriched.tags || "",
        source_url: file_url,
        ingested_date: new Date().toISOString(),
      });
      results.push({ name: file.name, status: "success" });
    }

    // Process URL if provided
    if (urlInput.trim()) {
      const urlRes = await base44.integrations.Core.InvokeLLM({
        prompt: `Research this URL and extract knowledge for an epoxy/flooring AI agent:
URL: ${urlInput}
Category: ${category}

Extract: title, detailed content summary, key facts, tags, and any pricing data.`,
        add_context_from_internet: true,
        model: "gemini_3_flash",
        response_json_schema: {
          type: "object",
          properties: { title: { type: "string" }, content: { type: "string" }, summary: { type: "string" }, key_facts: { type: "string" }, tags: { type: "string" } }
        }
      });

      await base44.entities.KnowledgeEntry.create({
        title: urlRes.title || urlInput,
        category,
        content: urlRes.content || "",
        summary: urlRes.summary || "",
        key_facts: urlRes.key_facts || "",
        tags: urlRes.tags || "",
        source_url: urlInput,
        ingested_date: new Date().toISOString(),
      });
      results.push({ name: urlInput, status: "success" });
    }

    setProcessed(prev => [...prev, ...results]);
    setFiles([]);
    setUrlInput("");
    setProcessing(false);
    toast({ title: "Knowledge Uploaded", description: `${results.length} items ingested into agent knowledge base.` });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-foreground">Agent Knowledge Upload</h1>
        <p className="text-sm text-muted-foreground mt-1">Feed documents, URLs, and data directly into your AI agents</p>
      </div>

      {/* Category Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map(c => {
          const Icon = c.icon;
          return (
            <button key={c.id} onClick={() => setCategory(c.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${category === c.id ? "bg-primary/10 border-primary text-primary" : "bg-card border-border text-muted-foreground hover:border-primary/30"}`}>
              <Icon className="w-3.5 h-3.5" /> {c.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File Upload Zone */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-sm font-bold text-foreground mb-4">Upload Files</h3>
          <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/40 transition-colors mb-4">
            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
            <span className="text-xs text-muted-foreground">CSV, PDF, Excel, JSON, Images, Word Docs</span>
            <span className="text-[10px] text-muted-foreground mt-1">Drop files or click to browse</span>
            <input type="file" multiple className="hidden" onChange={addFiles} />
          </label>

          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 border border-border/50">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-foreground truncate max-w-[200px]">{f.name}</span>
                    <span className="text-[9px] text-muted-foreground">{(f.size / 1024).toFixed(0)}KB</span>
                  </div>
                  <button onClick={() => removeFile(i)} className="p-1 rounded hover:bg-destructive/10"><Trash2 className="w-3 h-3 text-muted-foreground" /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* URL Scrape */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-sm font-bold text-foreground mb-4">Scrape URL</h3>
          <p className="text-xs text-muted-foreground mb-3">Paste a URL to scrape and ingest as agent knowledge</p>
          <div className="relative mb-4">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={urlInput} onChange={e => setUrlInput(e.target.value)} placeholder="https://example.com/product-page"
              className="w-full h-10 pl-10 pr-4 bg-secondary/30 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary" />
          </div>
          <div className="text-[10px] text-muted-foreground space-y-1">
            <p>• Product pages, spec sheets, competitor sites</p>
            <p>• Industry articles, training documentation</p>
            <p>• Pricing pages, rate cards, catalogs</p>
          </div>
        </div>
      </div>

      {/* Process Button */}
      <div className="mt-6">
        <Button onClick={processAll} disabled={processing || (files.length === 0 && !urlInput.trim())}
          className="w-full h-12 text-base font-bold metallic-gold-bg text-background gap-2">
          {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Brain className="w-5 h-5" />}
          {processing ? "Processing & Ingesting..." : `Ingest ${files.length + (urlInput.trim() ? 1 : 0)} Item${files.length + (urlInput.trim() ? 1 : 0) !== 1 ? "s" : ""} into Agent`}
        </Button>
      </div>

      {/* Recent Uploads */}
      {processed.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Recently Ingested</h3>
          <div className="space-y-2">
            {processed.map((p, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-sm text-foreground truncate">{p.name}</span>
                <span className="text-[10px] text-green-400 ml-auto">✓ Ingested</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}