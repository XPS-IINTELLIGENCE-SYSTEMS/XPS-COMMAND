import { useState } from "react";
import { Search, Loader2 } from "lucide-react";

const SHORTCUTS = [
  { label: "Google", url: "https://www.google.com", icon: "🔍", color: "#4285f4" },
  { label: "YouTube", url: "https://www.youtube.com", icon: "▶️", color: "#ff0000" },
  { label: "Gmail", url: "https://mail.google.com", icon: "📧", color: "#ea4335" },
  { label: "Maps", url: "https://maps.google.com", icon: "📍", color: "#34a853" },
  { label: "Drive", url: "https://drive.google.com", icon: "💾", color: "#4285f4" },
  { label: "LinkedIn", url: "https://www.linkedin.com", icon: "💼", color: "#0a66c2" },
  { label: "Wikipedia", url: "https://en.wikipedia.org", icon: "📖", color: "#636466" },
  { label: "GitHub", url: "https://github.com", icon: "🐙", color: "#ffffff" },
];

export default function BrowserHomePage({ onSearch, onNavigate, loading }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim() || loading) return;
    const isUrl = query.includes(".") && !query.includes(" ");
    if (isUrl) {
      onNavigate(query.startsWith("http") ? query : "https://" + query);
    } else {
      onSearch(query);
    }
  };

  return (
    <div className="flex flex-col items-center pt-16 pb-8 px-4">
      {/* Google-style logo */}
      <div className="mb-8 flex items-center gap-0.5 select-none">
        <span className="text-5xl font-normal" style={{ color: "#4285f4", fontFamily: "'Product Sans', Arial, sans-serif" }}>X</span>
        <span className="text-5xl font-normal" style={{ color: "#ea4335", fontFamily: "'Product Sans', Arial, sans-serif" }}>P</span>
        <span className="text-5xl font-normal" style={{ color: "#fbbc05", fontFamily: "'Product Sans', Arial, sans-serif" }}>S</span>
        <span className="text-4xl font-light ml-2" style={{ color: "#9aa0a6", fontFamily: "'Product Sans', Arial, sans-serif" }}>Browser</span>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSubmit} className="w-full max-w-[560px] mb-8">
        <div className="flex items-center gap-3 px-4 py-3 rounded-full bg-[#303134] hover:bg-[#3c3d41] border border-[#5f6368] hover:border-[#6c6e72] shadow-lg transition-colors">
          <Search className="w-5 h-5 text-[#9aa0a6] flex-shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the web or type a URL"
            className="flex-1 bg-transparent text-base text-white outline-none placeholder:text-[#9aa0a6]"
            autoFocus
          />
          {loading && <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />}
        </div>
      </form>

      {/* Shortcut grid */}
      <div className="grid grid-cols-4 gap-4 max-w-[400px]">
        {SHORTCUTS.map((s) => (
          <button
            key={s.label}
            onClick={() => !loading && onNavigate(s.url)}
            className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-[#303134] transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-[#303134] group-hover:bg-[#3c3d41] flex items-center justify-center text-xl transition-colors">
              {s.icon}
            </div>
            <span className="text-xs text-[#bdc1c6] group-hover:text-white truncate max-w-full">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}