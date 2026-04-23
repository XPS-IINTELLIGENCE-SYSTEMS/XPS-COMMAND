import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Copy, Check } from "lucide-react";

const SPECIALTIES = [
  "epoxy contractors",
  "polished concrete",
  "decorative concrete",
  "concrete coatings",
  "garage flooring",
];

const STATES = ["Texas", "California", "Florida", "New York", "Illinois"];

export default function ConcreteContractorFinder() {
  const [specialty, setSpecialty] = useState("epoxy contractors");
  const [state, setState] = useState("Texas");
  const [count, setCount] = useState(20);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [copied, setCopied] = useState(null);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('findConcreteContractors', {
        specialty,
        state,
        count,
      });
      if (res.data?.companies) {
        setResults(res.data.companies);
      }
    } catch (e) {
      console.error(e);
      alert('Search failed: ' + e.message);
    }
    setLoading(false);
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-4 p-4 max-w-4xl">
      {/* Controls */}
      <div className="glass-card rounded-lg p-4 space-y-3">
        <h2 className="text-lg font-bold text-foreground">Find Contractors</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Specialty</label>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm"
            >
              {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">State</label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm"
            >
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Results</label>
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              min="5"
              max="100"
              className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm"
            />
          </div>
        </div>

        <Button
          onClick={handleSearch}
          disabled={loading}
          className="w-full bg-primary gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {loading ? "Searching..." : "Search Now"}
        </Button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            Found {results.length} contractors
          </div>

          <div className="bg-secondary/30 rounded-lg overflow-hidden border border-border">
            {results.map((company, i) => (
              <div key={i} className="border-b border-border p-3 hover:bg-secondary/50 transition-colors">
                <div className="font-bold text-foreground mb-2">{company.name}</div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                  {/* Phone */}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">📞</span>
                    <span className="font-mono text-xs">{company.phone}</span>
                    <button
                      onClick={() => copyToClipboard(company.phone, `phone-${i}`)}
                      className="p-1 hover:bg-secondary rounded"
                    >
                      {copied === `phone-${i}` ? (
                        <Check className="w-3 h-3 text-green-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-muted-foreground" />
                      )}
                    </button>
                  </div>

                  {/* Email */}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">✉️</span>
                    <span className="font-mono text-xs truncate">{company.email}</span>
                    <button
                      onClick={() => copyToClipboard(company.email, `email-${i}`)}
                      className="p-1 hover:bg-secondary rounded"
                    >
                      {copied === `email-${i}` ? (
                        <Check className="w-3 h-3 text-green-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-muted-foreground" />
                      )}
                    </button>
                  </div>

                  {/* Website */}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">🌐</span>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary text-xs truncate hover:underline"
                    >
                      {company.website ? 'Visit' : '-'}
                    </a>
                  </div>
                </div>

                {company.city && (
                  <div className="text-xs text-muted-foreground mt-2">
                    📍 {company.city}, {company.state}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Export button */}
          <Button
            variant="outline"
            onClick={() => {
              const csv = [
                ['Company', 'Phone', 'Email', 'Website', 'City', 'State'].join(','),
                ...results.map(c =>
                  [c.name, c.phone, c.email, c.website, c.city, c.state]
                    .map(v => `"${v || ''}"`)
                    .join(',')
                ),
              ].join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `contractors-${specialty.replace(/ /g, '-')}-${state}.csv`;
              a.click();
            }}
            className="w-full"
          >
            📥 Export to CSV
          </Button>
        </div>
      )}
    </div>
  );
}