import { useState } from "react";
import { FileText, Link2, Image, ChevronRight, ExternalLink } from "lucide-react";

const TABS = [
  { id: "reader", label: "Reader", icon: FileText },
  { id: "links", label: "Links", icon: Link2 },
  { id: "images", label: "Images", icon: Image },
];

export default function BrowserPageView({ data, onNavigate, onSearch }) {
  const [activeTab, setActiveTab] = useState("reader");

  const getDomain = (url) => {
    try { return new URL(url).hostname.replace("www.", ""); } catch { return url; }
  };

  return (
    <div className="min-h-full bg-white">
      {/* Page header — like a real webpage */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-start gap-3">
          {data.favicon && (
            <img src={data.favicon} alt="" className="w-5 h-5 mt-1 rounded flex-shrink-0" onError={(e) => e.target.style.display = 'none'} />
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-medium text-gray-900 leading-tight">{data.title || "Untitled"}</h1>
            <p className="text-xs text-green-700 truncate mt-0.5">{data.url}</p>
            {data.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{data.description}</p>
            )}
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 mt-3 -mb-4">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            const count = tab.id === "links" ? data.links?.length : tab.id === "images" ? data.images?.length : null;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                  active
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                {count !== null && <span className="text-[10px] text-gray-400 ml-0.5">({count || 0})</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content area */}
      <div className="px-6 py-5 max-w-[750px]">
        {/* Reader view */}
        {activeTab === "reader" && (
          <div>
            {/* OG Image banner */}
            {data.ogImage && (
              <img
                src={data.ogImage}
                alt=""
                className="w-full max-h-[240px] object-cover rounded-lg mb-5"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}

            {/* Headings & text */}
            {data.headings?.length > 0 ? (
              <div className="space-y-4">
                {data.headings.map((h, i) => {
                  if (h.level === 1) return <h2 key={i} className="text-xl font-semibold text-gray-900">{h.text}</h2>;
                  if (h.level === 2) return <h3 key={i} className="text-lg font-medium text-gray-800 mt-2">{h.text}</h3>;
                  return <h4 key={i} className="text-base font-medium text-gray-700 mt-1">{h.text}</h4>;
                })}
                {data.text && (
                  <p className="text-sm text-gray-600 leading-relaxed mt-4 whitespace-pre-line">
                    {data.text.substring(0, 3000)}
                  </p>
                )}
              </div>
            ) : data.text ? (
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {data.text.substring(0, 3000)}
              </p>
            ) : (
              <p className="text-sm text-gray-400 italic">No readable content extracted from this page.</p>
            )}
          </div>
        )}

        {/* Links view */}
        {activeTab === "links" && (
          <div className="space-y-1">
            {data.links?.length > 0 ? data.links.map((link, i) => (
              <button
                key={i}
                onClick={() => onNavigate(link.href)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-left group transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">{getDomain(link.href)?.[0]}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-blue-600 group-hover:underline truncate">{link.label}</p>
                  <p className="text-xs text-gray-400 truncate">{getDomain(link.href)}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 flex-shrink-0" />
              </button>
            )) : (
              <p className="text-sm text-gray-400 italic py-4">No links found on this page.</p>
            )}
          </div>
        )}

        {/* Images view */}
        {activeTab === "images" && (
          <div>
            {data.images?.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {data.images.map((img, i) => (
                  <a
                    key={i}
                    href={img.src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative overflow-hidden rounded-lg bg-gray-100 aspect-video"
                  >
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-full object-cover"
                      onError={(e) => e.target.parentElement.style.display = 'none'}
                    />
                    {img.alt && (
                      <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[10px] text-white truncate">{img.alt}</p>
                      </div>
                    )}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic py-4">No images found on this page.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}