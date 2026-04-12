import { useState } from "react";
import { 
  Globe, Bug, UserPlus, Sparkles, Image, Video, Code, Bot, 
  GitBranch, StickyNote, FileText, Database, Search, Mail,
  BarChart3, Zap, Loader2, ExternalLink, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";

const panelConfig = {
  browser: { title: "Web Browser", icon: Globe, description: "Browse any website and extract information" },
  scraping: { title: "Web Scraping", icon: Bug, description: "Scrape and extract structured data from websites" },
  leads: { title: "New Leads", icon: UserPlus, description: "Find and qualify new business leads" },
  insights: { title: "AI Insights", icon: Sparkles, description: "AI-powered analysis of your data and market" },
  image: { title: "Image Generator", icon: Image, description: "Generate AI images for marketing and sales" },
  video: { title: "Video Creator", icon: Video, description: "Create video content with AI" },
  ui: { title: "UI Creator", icon: Code, description: "Build UI components and layouts" },
  agent: { title: "Agent Creator", icon: Bot, description: "Design and deploy custom AI agents" },
  workflow: { title: "Workflow Builder", icon: GitBranch, description: "Create automated multi-step workflows" },
  notes: { title: "Notes", icon: StickyNote, description: "Quick notes and task tracking" },
  proposals: { title: "Proposals", icon: FileText, description: "Generate and manage business proposals" },
  data: { title: "Data Query", icon: Database, description: "Query and analyze your CRM data" },
  research: { title: "Research", icon: Search, description: "Deep research on companies and markets" },
  outreach: { title: "Outreach", icon: Mail, description: "Email campaigns and outreach sequences" },
  analytics: { title: "Analytics", icon: BarChart3, description: "Performance metrics and forecasts" },
  automations: { title: "Automations", icon: Zap, description: "Scheduled tasks and event triggers" },
};

function BrowserPanel() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleBrowse = async () => {
    if (!url.trim()) return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke("webBrowse", { url: url.trim() });
      setResult(res.data);
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" className="text-xs h-8" onKeyDown={(e) => e.key === "Enter" && handleBrowse()} />
        <Button size="sm" className="h-8 text-xs" onClick={handleBrowse} disabled={loading}>
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <><ExternalLink className="w-3 h-3 mr-1" /> Browse</>}
        </Button>
      </div>
      {result && (
        <div className="bg-secondary/30 rounded-lg p-3 max-h-[400px] overflow-y-auto">
          <pre className="text-[10px] text-foreground/80 whitespace-pre-wrap">{typeof result === "string" ? result : JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

function ImagePanel() {
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await base44.integrations.Core.GenerateImage({ prompt: prompt.trim() });
      setImages(prev => [{ prompt: prompt.trim(), url: res.url }, ...prev]);
      setPrompt("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe the image..." className="text-xs h-8" onKeyDown={(e) => e.key === "Enter" && handleGenerate()} />
        <Button size="sm" className="h-8 text-xs" onClick={handleGenerate} disabled={loading}>
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Generate"}
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {images.map((img, i) => (
          <div key={i} className="rounded-lg overflow-hidden border border-border">
            <img src={img.url} alt={img.prompt} className="w-full aspect-square object-cover" />
            <p className="text-[9px] text-muted-foreground p-1.5 truncate">{img.prompt}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotesPanel() {
  const [notes, setNotes] = useState([]);
  const [current, setCurrent] = useState("");

  const addNote = () => {
    if (!current.trim()) return;
    setNotes(prev => [{ text: current.trim(), time: new Date().toLocaleTimeString() }, ...prev]);
    setCurrent("");
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="Type a note..." className="text-xs h-8" onKeyDown={(e) => e.key === "Enter" && addNote()} />
        <Button size="sm" className="h-8 text-xs" onClick={addNote}><Plus className="w-3 h-3 mr-1" /> Add</Button>
      </div>
      <div className="space-y-2">
        {notes.map((n, i) => (
          <div key={i} className="bg-secondary/30 rounded-lg p-2.5">
            <p className="text-xs text-foreground">{n.text}</p>
            <p className="text-[9px] text-muted-foreground mt-1">{n.time}</p>
          </div>
        ))}
        {notes.length === 0 && <p className="text-[10px] text-muted-foreground text-center py-4">No notes yet</p>}
      </div>
    </div>
  );
}

function GenericPanel({ config }) {
  const Icon = config.icon;
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-sm font-medium text-foreground mb-1">{config.title}</h3>
      <p className="text-[10px] text-muted-foreground max-w-[200px]">{config.description}</p>
      <p className="text-[10px] text-primary/70 mt-3">Use the chat to interact with this tool →</p>
    </div>
  );
}

export default function OperatorPanel({ activePanel }) {
  const config = panelConfig[activePanel];
  if (!config) return null;

  const Icon = config.icon;

  const renderContent = () => {
    switch (activePanel) {
      case "browser": return <BrowserPanel />;
      case "image": return <ImagePanel />;
      case "notes": return <NotesPanel />;
      default: return <GenericPanel config={config} />;
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="h-10 min-h-[40px] border-b border-border flex items-center gap-2 px-4">
        <Icon className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold text-foreground">{config.title}</span>
        <span className="text-[9px] text-muted-foreground ml-1">— {config.description}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {renderContent()}
      </div>
    </div>
  );
}