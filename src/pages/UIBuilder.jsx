import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Code, Loader2, Play, Copy, Check, RefreshCw, Globe, Sparkles, Save, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function UIBuilder() {
  const [prompt, setPrompt] = useState("");
  const [referenceUrl, setReferenceUrl] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [componentType, setComponentType] = useState("page");
  const iframeRef = useRef(null);

  const generateUI = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setGeneratedCode("");
    setPreviewHtml("");

    const res = await base44.functions.invoke("openClawEngine", {
      action: "generate_ui",
      description: prompt,
      reference_url: referenceUrl || undefined,
      component_type: componentType
    });

    const code = res.data?.code || "";
    setGeneratedCode(code);

    // Build preview HTML
    const preview = buildPreviewHtml(code);
    setPreviewHtml(preview);

    setHistory(prev => [{ prompt, code, timestamp: new Date().toISOString() }, ...prev].slice(0, 20));
    setGenerating(false);
  };

  const buildPreviewHtml = (code) => {
    return `<!DOCTYPE html>
<html class="dark">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script src="https://cdn.tailwindcss.com"><\/script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: { extend: { colors: { background: '#0a0a0f', foreground: '#ffffff', card: '#111118', border: '#1e1e2e', primary: '#c9a227', muted: { foreground: '#888' } } } }
    }
  <\/script>
  <style>body { background: #0a0a0f; color: #fff; font-family: Inter, system-ui, sans-serif; margin: 0; padding: 16px; }</style>
</head>
<body>
  <div id="preview-root">
    <div style="padding: 20px; color: #888; font-size: 13px;">
      <p style="font-weight: 600; color: #c9a227; margin-bottom: 8px;">Generated Component Preview</p>
      <p>This is a static preview. The component code is ready to be saved to your app.</p>
      <pre style="background: #111118; border: 1px solid #1e1e2e; border-radius: 8px; padding: 12px; margin-top: 12px; font-size: 11px; overflow-x: auto; white-space: pre-wrap; color: #ccc; max-height: 500px; overflow-y: auto;">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
    </div>
  </div>
</body>
</html>`;
  };

  // Removed manual doc.write — using srcdoc attribute instead

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const TEMPLATES = [
    { label: "Dashboard with stats cards", prompt: "A dashboard page with 4 KPI stat cards at top (total leads, active jobs, proposals sent, revenue), a line chart showing monthly trends, and a recent activity feed below" },
    { label: "Data table with filters", prompt: "A full data table component with search input, column sorting, pagination, row selection checkboxes, and filter dropdowns for status and category" },
    { label: "Lead capture form", prompt: "A professional lead capture form with fields for company name, contact name, email, phone, industry dropdown, square footage, and a submit button that creates a Lead entity" },
    { label: "Kanban board", prompt: "A kanban board with drag-and-drop columns for pipeline stages: Incoming, Qualified, Proposal, Negotiation, Won. Each card shows company name, value, and contact" },
    { label: "Chat interface", prompt: "A chat interface with message bubbles, typing indicator, input field with send button, and a sidebar showing conversation history" },
    { label: "Settings page", prompt: "An account settings page with sections for Profile (name, email, phone), Notifications (toggle switches), AI Preferences (mode selector), and a save button" },
  ];

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <Code className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-foreground">UI Builder</h1>
          <p className="text-xs text-muted-foreground">Generate production React components from natural language</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Input */}
        <div className="space-y-4">
          {/* Component type */}
          <div className="flex gap-1.5">
            {["page", "component", "section", "form", "table", "chart"].map(t => (
              <button key={t} onClick={() => setComponentType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${componentType === t ? "metallic-gold-bg text-background" : "glass-card text-muted-foreground hover:text-foreground"}`}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Main prompt */}
          <div className="glass-card rounded-xl p-4 space-y-3">
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={5}
              placeholder="Describe the UI you want to build...&#10;&#10;Example: A lead pipeline dashboard with stage columns, drag-and-drop cards, and a stats bar at the top showing total leads, conversion rate, and pipeline value"
              className="w-full px-3 py-2.5 rounded-lg bg-card border border-border text-sm text-foreground resize-none focus:outline-none focus:border-primary placeholder:text-muted-foreground/50"
            />

            {/* Reference URL */}
            <div className="flex gap-2 items-center">
              <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input
                value={referenceUrl}
                onChange={e => setReferenceUrl(e.target.value)}
                placeholder="Reference URL to clone style from (optional)"
                className="flex-1 px-3 py-2 rounded-lg bg-card border border-border text-xs text-foreground focus:outline-none focus:border-primary placeholder:text-muted-foreground/50"
              />
            </div>

            <Button onClick={generateUI} disabled={generating || !prompt.trim()} className="w-full gap-2 metallic-gold-bg text-background h-11">
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {generating ? "Generating..." : "Generate Component"}
            </Button>
          </div>

          {/* Templates */}
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-2 block">Quick Templates</label>
            <div className="grid grid-cols-2 gap-1.5">
              {TEMPLATES.map((t, i) => (
                <button key={i} onClick={() => setPrompt(t.prompt)}
                  className="glass-card rounded-lg p-2.5 text-left transition-all hover:border-primary/30">
                  <span className="text-[11px] font-medium text-foreground">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-2 block">Generation History</label>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {history.map((h, i) => (
                  <button key={i} onClick={() => { setPrompt(h.prompt); setGeneratedCode(h.code); setPreviewHtml(buildPreviewHtml(h.code)); }}
                    className="w-full text-left glass-card rounded-lg p-2 hover:border-primary/30 transition-all">
                    <span className="text-[11px] text-foreground truncate block">{h.prompt}</span>
                    <span className="text-[9px] text-muted-foreground">{new Date(h.timestamp).toLocaleTimeString()}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Preview + Code */}
        <div className="space-y-3">
          {generatedCode ? (
            <>
              {/* Preview */}
              <div className="glass-card rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                  <span className="text-xs font-semibold text-foreground">Preview</span>
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="ghost" onClick={copyCode} className="h-7 gap-1 text-[10px]">
                      {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                      {copied ? "Copied" : "Copy Code"}
                    </Button>
                  </div>
                </div>
                <iframe
                  ref={iframeRef}
                  srcDoc={previewHtml}
                  className="w-full bg-background border-0"
                  style={{ height: "400px" }}
                  sandbox="allow-scripts"
                  title="UI Preview"
                />
              </div>

              {/* Code */}
              <div className="glass-card rounded-xl overflow-hidden">
                <button onClick={() => setShowCode(!showCode)}
                  className="flex items-center justify-between w-full px-3 py-2 border-b border-border hover:bg-secondary/30 transition-colors">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-2">
                    <Code className="w-3.5 h-3.5 text-primary" /> Generated Code
                    <Badge variant="secondary" className="text-[8px]">{generatedCode.split("\n").length} lines</Badge>
                  </span>
                  {showCode ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>
                {showCode && (
                  <div className="max-h-96 overflow-auto">
                    <pre className="p-3 text-[10px] font-mono text-foreground/80 whitespace-pre-wrap leading-relaxed">{generatedCode}</pre>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="glass-card rounded-xl flex items-center justify-center h-96">
              <div className="text-center">
                <Code className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Describe a UI and hit Generate</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">Components are generated as production React + Tailwind code</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}