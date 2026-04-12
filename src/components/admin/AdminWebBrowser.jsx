import { useState } from "react";
import { Globe, ArrowLeft, ArrowRight, RotateCw, Search } from "lucide-react";

export default function AdminWebBrowser() {
  const [url, setUrl] = useState("https://www.google.com");
  const [inputUrl, setInputUrl] = useState("https://www.google.com");
  const [key, setKey] = useState(0);

  const navigate = (newUrl) => {
    let final = newUrl;
    if (!final.startsWith("http")) final = "https://" + final;
    setUrl(final);
    setInputUrl(final);
    setKey(k => k + 1);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Browser Chrome */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card/60">
        <button onClick={() => window.history.back()} className="p-1.5 rounded-md hover:bg-secondary/50">
          <ArrowLeft className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <button onClick={() => window.history.forward()} className="p-1.5 rounded-md hover:bg-secondary/50">
          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <button onClick={() => setKey(k => k + 1)} className="p-1.5 rounded-md hover:bg-secondary/50">
          <RotateCw className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <div className="flex-1 flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-1.5 border border-border">
          <Globe className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <input
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && navigate(inputUrl)}
            className="flex-1 bg-transparent text-xs text-foreground outline-none"
            placeholder="Enter URL..."
          />
          <button onClick={() => navigate(inputUrl)} className="p-1 rounded hover:bg-secondary/80">
            <Search className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Iframe */}
      <div className="flex-1 relative">
        <iframe
          key={key}
          src={url}
          className="absolute inset-0 w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          title="Web Browser"
        />
      </div>
    </div>
  );
}