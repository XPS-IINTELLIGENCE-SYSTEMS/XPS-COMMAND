import { useState } from "react";
import { ImagePlus, Loader2, Download, Sparkles, Wand2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AdminImageCreator() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const generate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setImageUrl(null);
    try {
      const res = await base44.integrations.Core.GenerateImage({ prompt });
      setImageUrl(res.url);
      setHistory(prev => [{ prompt, url: res.url, time: new Date().toISOString() }, ...prev].slice(0, 20));
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Prompt Bar */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center gap-2">
          <Wand2 className="w-4 h-4 metallic-gold-icon" />
          <span className="text-sm font-bold text-foreground">AI Image Generator</span>
        </div>
        <div className="flex gap-2">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), generate())}
            placeholder="Describe the image you want to create in detail..."
            rows={2}
            className="flex-1 bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 resize-none"
          />
          <button onClick={generate} disabled={loading || !prompt.trim()} className="px-5 rounded-xl metallic-gold-bg text-background text-sm font-bold disabled:opacity-50 flex items-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? "Creating..." : "Generate"}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading && (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Generating your image...</p>
          </div>
        )}

        {imageUrl && !loading && (
          <div className="space-y-3">
            <div className="rounded-xl overflow-hidden border border-border bg-card/30">
              <img src={imageUrl} alt={prompt} className="w-full max-h-[500px] object-contain" />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground truncate max-w-[70%]">{prompt}</p>
              <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border text-xs font-medium text-foreground hover:bg-secondary">
                <Download className="w-3 h-3" /> Download
              </a>
            </div>
          </div>
        )}

        {!imageUrl && !loading && (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
            <ImagePlus className="w-12 h-12 opacity-30" />
            <p className="text-sm">Enter a prompt to generate an image</p>
          </div>
        )}

        {/* History */}
        {history.length > 1 && (
          <div className="mt-6 space-y-3">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">History</h4>
            <div className="grid grid-cols-3 gap-2">
              {history.slice(1).map((item, i) => (
                <button key={i} onClick={() => { setImageUrl(item.url); setPrompt(item.prompt); }} className="group rounded-lg overflow-hidden border border-border hover:border-primary/30 transition-all">
                  <img src={item.url} alt={item.prompt} className="w-full h-20 object-cover" />
                  <p className="text-[9px] text-muted-foreground p-1 truncate">{item.prompt}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}