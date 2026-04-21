import { useState } from "react";
import { FileText, Link2, Image, ChevronRight, FormInput, Mail, Phone, Globe, Eye } from "lucide-react";

const DATA_TABS = [
  { id: "reader", label: "Reader", icon: FileText },
  { id: "links", label: "Links", icon: Link2 },
  { id: "images", label: "Images", icon: Image },
  { id: "forms", label: "Forms", icon: FormInput },
  { id: "contacts", label: "Contacts", icon: Mail },
];

export default function BrowserPageView({ data, onNavigate, onSearch, onSubmitForm }) {
  // "live" = real iframe, "data" = extracted data view
  const [mode, setMode] = useState("live");
  const [activeTab, setActiveTab] = useState("reader");
  const [formValues, setFormValues] = useState({});

  const getDomain = (url) => {
    try { return new URL(url).hostname.replace("www.", ""); } catch { return url; }
  };

  const handleFormFieldChange = (formIdx, fieldName, value) => {
    setFormValues(prev => ({ ...prev, [`${formIdx}_${fieldName}`]: value }));
  };

  const handleSubmitForm = (formIdx) => {
    const form = data.forms?.[formIdx];
    if (!form || !onSubmitForm) return;
    const formData = {};
    form.fields.forEach(f => {
      formData[f.name] = formValues[`${formIdx}_${f.name}`] ?? f.value ?? "";
    });
    onSubmitForm(form.action, form.method, formData);
  };

  const hasContacts = (data.emails?.length > 0) || (data.phones?.length > 0);

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ backgroundColor: "#fff" }}>
      {/* Mode toggle bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f1f3f4] border-b border-[#dadce0]">
        <button
          onClick={() => setMode("live")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            mode === "live" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Globe className="w-3 h-3" />
          Live Page
        </button>
        <button
          onClick={() => setMode("data")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            mode === "data" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Eye className="w-3 h-3" />
          Extracted Data
        </button>
        <div className="flex-1" />
        <span className="text-[10px] text-gray-400 truncate max-w-[200px]">{data.title}</span>
      </div>

      {/* LIVE MODE — real iframe */}
      {mode === "live" && (
        <div className="flex-1 relative">
          <iframe
            src={data.url}
            title={data.title || "Web page"}
            className="absolute inset-0 w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {/* DATA MODE — extracted content */}
      {mode === "data" && (
        <div className="flex-1 overflow-y-auto">
          {/* Page header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-start gap-3">
              {data.favicon && (
                <img src={data.favicon} alt="" className="w-5 h-5 mt-1 rounded flex-shrink-0" onError={(e) => e.target.style.display = 'none'} />
              )}
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-medium text-gray-900 leading-tight">{data.title || "Untitled"}</h1>
                <p className="text-xs text-green-700 truncate mt-0.5">{data.url}</p>
                {data.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{data.description}</p>}
              </div>
            </div>
            {/* Tab switcher */}
            <div className="flex items-center gap-1 mt-3 -mb-4 overflow-x-auto scrollbar-hide">
              {DATA_TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                let count = null;
                if (tab.id === "links") count = data.links?.length;
                else if (tab.id === "images") count = data.images?.length;
                else if (tab.id === "forms") count = data.forms?.length;
                else if (tab.id === "contacts") count = (data.emails?.length || 0) + (data.phones?.length || 0);
                if (tab.id === "contacts" && !hasContacts) return null;
                if (tab.id === "forms" && (!data.forms || data.forms.length === 0)) return null;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                      active ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                    {count !== null && count > 0 && <span className="text-[10px] text-gray-400 ml-0.5">({count})</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content area */}
          <div className="px-6 py-5 max-w-[750px]">
            {activeTab === "reader" && (
              <div>
                {data.ogImage && <img src={data.ogImage} alt="" className="w-full max-h-[240px] object-cover rounded-lg mb-5" onError={(e) => e.target.style.display = 'none'} />}
                {data.headings?.length > 0 ? (
                  <div className="space-y-4">
                    {data.headings.map((h, i) => {
                      if (h.level === 1) return <h2 key={i} className="text-xl font-semibold text-gray-900">{h.text}</h2>;
                      if (h.level === 2) return <h3 key={i} className="text-lg font-medium text-gray-800 mt-2">{h.text}</h3>;
                      return <h4 key={i} className="text-base font-medium text-gray-700 mt-1">{h.text}</h4>;
                    })}
                    {data.text && <p className="text-sm text-gray-600 leading-relaxed mt-4 whitespace-pre-line">{data.text.substring(0, 3000)}</p>}
                  </div>
                ) : data.text ? (
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{data.text.substring(0, 3000)}</p>
                ) : (
                  <p className="text-sm text-gray-400 italic">No readable content extracted.</p>
                )}
              </div>
            )}

            {activeTab === "links" && (
              <div className="space-y-1">
                {data.links?.length > 0 ? data.links.map((link, i) => (
                  <button key={i} onClick={() => onNavigate(link.href)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-left group transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] text-gray-500 font-bold uppercase">{getDomain(link.href)?.[0]}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-blue-600 group-hover:underline truncate">{link.label}</p>
                      <p className="text-xs text-gray-400 truncate">{getDomain(link.href)}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 flex-shrink-0" />
                  </button>
                )) : <p className="text-sm text-gray-400 italic py-4">No links found.</p>}
              </div>
            )}

            {activeTab === "images" && (
              <div>
                {data.images?.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {data.images.map((img, i) => (
                      <a key={i} href={img.src} target="_blank" rel="noopener noreferrer" className="group relative overflow-hidden rounded-lg bg-gray-100 aspect-video">
                        <img src={img.src} alt={img.alt} className="w-full h-full object-cover" onError={(e) => e.target.parentElement.style.display = 'none'} />
                        {img.alt && <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"><p className="text-[10px] text-white truncate">{img.alt}</p></div>}
                      </a>
                    ))}
                  </div>
                ) : <p className="text-sm text-gray-400 italic py-4">No images found.</p>}
              </div>
            )}

            {activeTab === "forms" && (
              <div className="space-y-4">
                {data.forms?.length > 0 ? data.forms.map((form, fi) => (
                  <div key={fi} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <FormInput className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">Form {fi + 1}</span>
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{form.method}</span>
                    </div>
                    <div className="space-y-2">
                      {form.fields.filter(f => f.type !== 'hidden').map((field, ffi) => (
                        <div key={ffi}>
                          <label className="text-xs text-gray-500 mb-0.5 block">{field.name || field.placeholder || `Field ${ffi + 1}`}</label>
                          <input
                            type={field.type === 'password' ? 'password' : 'text'}
                            value={formValues[`${fi}_${field.name}`] ?? field.value ?? ""}
                            onChange={(e) => handleFormFieldChange(fi, field.name, e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm text-gray-900 placeholder:text-gray-300"
                          />
                        </div>
                      ))}
                    </div>
                    <button onClick={() => handleSubmitForm(fi)} className="mt-3 px-4 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors">Submit</button>
                  </div>
                )) : <p className="text-sm text-gray-400 italic py-4">No forms detected.</p>}
              </div>
            )}

            {activeTab === "contacts" && (
              <div className="space-y-4">
                {data.emails?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2"><Mail className="w-4 h-4 text-blue-600" /> Emails</h3>
                    {data.emails.map((email, i) => (
                      <a key={i} href={`mailto:${email}`} className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-blue-600 hover:underline">{email}</a>
                    ))}
                  </div>
                )}
                {data.phones?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2"><Phone className="w-4 h-4 text-green-600" /> Phones</h3>
                    {data.phones.map((phone, i) => (
                      <a key={i} href={`tel:${phone}`} className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-green-700 hover:underline">{phone}</a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}