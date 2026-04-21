import { Search, Loader2 } from "lucide-react";

export default function BrowserSearchResults({ query, results, onNavigate, loading }) {
  // Extract domain from URL for display
  const getDomain = (url) => {
    try { return new URL(url).hostname.replace("www.", ""); } catch { return url; }
  };

  return (
    <div className="min-h-full bg-[#202124]">
      {/* Results header */}
      <div className="px-6 pt-4 pb-2 border-b border-[#3c3c3c]">
        <p className="text-xs text-[#9aa0a6]">
          {loading ? "Searching..." : `About ${results.length} results for "${query}"`}
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      )}

      {/* Results list — Google-style */}
      {!loading && results.length > 0 && (
        <div className="px-6 py-4 space-y-6 max-w-[650px]">
          {results.map((r, i) => (
            <div key={i} className="group">
              {/* URL breadcrumb */}
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-[#303134] flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] text-[#9aa0a6] font-bold uppercase">{getDomain(r.href)?.[0]}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-[#bdc1c6] truncate">{getDomain(r.href)}</p>
                  <p className="text-[10px] text-[#9aa0a6] truncate">{r.href}</p>
                </div>
              </div>
              {/* Title link */}
              <button
                onClick={() => onNavigate(r.href)}
                className="text-left text-lg text-[#8ab4f8] hover:underline font-normal leading-snug mb-1"
              >
                {r.title?.replace(/&amp;/g, "&") || getDomain(r.href)}
              </button>
              {/* Snippet */}
              {r.snippet && (
                <p className="text-sm text-[#bdc1c6] leading-relaxed line-clamp-2">
                  {r.snippet}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No results */}
      {!loading && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <Search className="w-12 h-12 text-[#5f6368] mb-4" />
          <p className="text-sm text-[#9aa0a6]">No results found for "{query}"</p>
          <p className="text-xs text-[#5f6368] mt-1">Try different keywords or check your spelling</p>
        </div>
      )}
    </div>
  );
}