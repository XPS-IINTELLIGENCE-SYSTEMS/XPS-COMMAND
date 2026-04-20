import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { MapPin, Layers, Eye, EyeOff } from "lucide-react";

// US state approximate center coordinates for the map
const STATE_COORDS = {
  AL:[32.8,-86.8],AK:[64.2,-152.5],AZ:[34.3,-111.7],AR:[34.8,-92.2],CA:[36.8,-119.4],
  CO:[39.1,-105.4],CT:[41.6,-72.7],DE:[39.0,-75.5],FL:[27.8,-81.7],GA:[33.0,-83.6],
  HI:[20.5,-157.5],ID:[44.2,-114.5],IL:[40.3,-89.0],IN:[40.3,-86.1],IA:[42.0,-93.2],
  KS:[38.5,-98.3],KY:[37.7,-84.7],LA:[31.2,-91.9],ME:[44.7,-69.4],MD:[39.0,-76.6],
  MA:[42.2,-71.5],MI:[43.3,-84.5],MN:[45.7,-93.9],MS:[32.7,-89.7],MO:[38.5,-92.3],
  MT:[46.8,-110.4],NE:[41.1,-98.3],NV:[38.3,-117.1],NH:[43.5,-71.5],NJ:[40.1,-74.5],
  NM:[34.8,-106.2],NY:[42.2,-74.9],NC:[35.6,-79.8],ND:[47.5,-100.0],OH:[40.4,-82.7],
  OK:[35.6,-96.9],OR:[43.8,-120.6],PA:[40.6,-77.2],RI:[41.7,-71.5],SC:[33.9,-80.9],
  SD:[44.3,-99.4],TN:[35.7,-86.6],TX:[31.2,-99.2],UT:[39.3,-111.1],VT:[44.0,-72.7],
  VA:[37.8,-78.2],WA:[47.4,-120.7],WV:[38.5,-80.9],WI:[44.3,-89.6],WY:[42.8,-107.6],
  DC:[38.9,-77.0],
};

const LAYERS = [
  { id: "gcs", label: "GC Database", color: "#d4af37" },
  { id: "scopes", label: "Active Scopes", color: "#06b6d4" },
  { id: "won", label: "Won Projects", color: "#22c55e" },
  { id: "competitors", label: "Competitor Zones", color: "#ef4444" },
];

export default function SniperGeoMap({ gcs, scopes }) {
  const [competitors, setCompetitors] = useState([]);
  const [visibleLayers, setVisibleLayers] = useState(["gcs", "scopes", "won", "competitors"]);
  const [hoveredState, setHoveredState] = useState(null);

  useEffect(() => {
    base44.entities.FlooringCompetitor.list("-created_date", 100)
      .then(setCompetitors)
      .catch(() => setCompetitors([]));
  }, []);

  const toggleLayer = (id) => {
    setVisibleLayers(prev => prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]);
  };

  // Aggregate data by state
  const stateData = useMemo(() => {
    const data = {};

    // Initialize all states
    Object.keys(STATE_COORDS).forEach(st => {
      data[st] = { gcCount: 0, scopeCount: 0, wonCount: 0, wonValue: 0, competitorCount: 0, competitorNames: [], opportunityScore: 0 };
    });

    // GCs by state
    gcs.forEach(gc => {
      const st = gc.state?.toUpperCase()?.trim();
      if (st && data[st]) data[st].gcCount++;
    });

    // Scopes by state
    scopes.forEach(s => {
      const st = s.project_state?.toUpperCase()?.trim();
      if (st && data[st]) {
        if (s.bid_status === "won") {
          data[st].wonCount++;
          data[st].wonValue += s.contract_value || s.total_bid_price || 0;
        } else if (!["lost", "no_response"].includes(s.bid_status)) {
          data[st].scopeCount++;
        }
      }
    });

    // Competitors by state
    competitors.forEach(c => {
      let states = [];
      try { states = JSON.parse(c.states_active || "[]"); } catch {}
      states.forEach(st => {
        const key = st?.toUpperCase()?.trim();
        if (key && data[key]) {
          data[key].competitorCount++;
          data[key].competitorNames.push(c.company_name);
        }
      });
    });

    // Calculate opportunity score: high volume potential + low competition = high opportunity
    Object.keys(data).forEach(st => {
      const d = data[st];
      const volume = d.gcCount + d.scopeCount * 3 + d.wonCount * 5;
      const competition = d.competitorCount;
      // High volume, low competition = high opportunity
      d.opportunityScore = volume > 0 ? Math.round((volume / Math.max(1, competition)) * 10) : 0;
    });

    return data;
  }, [gcs, scopes, competitors]);

  // Find max values for scaling
  const maxGC = Math.max(1, ...Object.values(stateData).map(d => d.gcCount));
  const maxOpp = Math.max(1, ...Object.values(stateData).map(d => d.opportunityScore));

  // Get hovered state info
  const hoverInfo = hoveredState ? stateData[hoveredState] : null;

  return (
    <div className="glass-card rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 metallic-gold-icon" />
          <span className="text-xs font-bold metallic-gold">Geographic Intelligence Map</span>
        </div>
        <div className="flex items-center gap-1">
          {LAYERS.map(l => (
            <button
              key={l.id}
              onClick={() => toggleLayer(l.id)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] border transition-all ${
                visibleLayers.includes(l.id)
                  ? "border-white/20 bg-white/[0.06]"
                  : "border-transparent bg-white/[0.02] opacity-50"
              }`}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
              <span className="hidden sm:inline text-muted-foreground">{l.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Map visualization — US state grid */}
      <div className="relative">
        <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(12, 1fr)", gridTemplateRows: "repeat(8, 1fr)" }}>
          {US_GRID.map(({ state, col, row }) => {
            const d = stateData[state] || {};
            const hasActivity = d.gcCount > 0 || d.scopeCount > 0 || d.wonCount > 0;
            const hasCompetitors = d.competitorCount > 0;
            
            // Color gradient based on opportunity score
            const oppRatio = d.opportunityScore / maxOpp;
            let bgColor = "rgba(255,255,255,0.02)";
            let borderColor = "rgba(255,255,255,0.06)";

            if (hasActivity && visibleLayers.includes("gcs")) {
              // Green = high opportunity (high volume, low competition)
              // Red = high competition
              if (hasCompetitors && visibleLayers.includes("competitors")) {
                const ratio = d.gcCount / Math.max(1, d.competitorCount);
                if (ratio > 3) {
                  bgColor = `rgba(34, 197, 94, ${Math.min(0.5, oppRatio * 0.5 + 0.1)})`;
                  borderColor = "rgba(34, 197, 94, 0.4)";
                } else if (ratio > 1) {
                  bgColor = `rgba(212, 175, 55, ${Math.min(0.4, oppRatio * 0.4 + 0.1)})`;
                  borderColor = "rgba(212, 175, 55, 0.4)";
                } else {
                  bgColor = `rgba(239, 68, 68, ${Math.min(0.4, 0.15 + d.competitorCount * 0.05)})`;
                  borderColor = "rgba(239, 68, 68, 0.4)";
                }
              } else {
                bgColor = `rgba(212, 175, 55, ${Math.min(0.5, (d.gcCount / maxGC) * 0.5 + 0.08)})`;
                borderColor = "rgba(212, 175, 55, 0.3)";
              }
            } else if (hasCompetitors && visibleLayers.includes("competitors")) {
              bgColor = `rgba(239, 68, 68, ${Math.min(0.3, 0.1 + d.competitorCount * 0.05)})`;
              borderColor = "rgba(239, 68, 68, 0.3)";
            }

            return (
              <div
                key={state}
                style={{ gridColumn: col, gridRow: row, backgroundColor: bgColor, borderColor }}
                className="aspect-square rounded-md border flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-110 hover:z-10 relative"
                onMouseEnter={() => setHoveredState(state)}
                onMouseLeave={() => setHoveredState(null)}
              >
                <span className="text-[8px] sm:text-[9px] font-bold text-foreground/80">{state}</span>
                {/* Dot indicators */}
                <div className="flex gap-0.5 mt-0.5">
                  {d.wonCount > 0 && visibleLayers.includes("won") && <div className="w-1 h-1 rounded-full bg-green-400" />}
                  {d.scopeCount > 0 && visibleLayers.includes("scopes") && <div className="w-1 h-1 rounded-full bg-cyan-400" />}
                  {d.competitorCount > 0 && visibleLayers.includes("competitors") && <div className="w-1 h-1 rounded-full bg-red-400" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Hover tooltip */}
        {hoveredState && hoverInfo && (
          <div className="absolute top-2 right-2 z-20 rounded-xl bg-card/95 backdrop-blur-md border border-border p-3 shadow-xl min-w-[180px]">
            <div className="text-xs font-bold text-foreground mb-2">{hoveredState}</div>
            <div className="space-y-1 text-[10px]">
              <InfoRow color="#d4af37" label="GCs in Database" value={hoverInfo.gcCount} />
              <InfoRow color="#06b6d4" label="Active Scopes" value={hoverInfo.scopeCount} />
              <InfoRow color="#22c55e" label="Won Projects" value={hoverInfo.wonCount} />
              {hoverInfo.wonValue > 0 && <InfoRow color="#22c55e" label="Won Value" value={`$${(hoverInfo.wonValue/1000).toFixed(0)}K`} />}
              <InfoRow color="#ef4444" label="Competitors" value={hoverInfo.competitorCount} />
              {hoverInfo.competitorNames.length > 0 && (
                <div className="text-[9px] text-muted-foreground mt-1 border-t border-border/30 pt-1">
                  {hoverInfo.competitorNames.slice(0, 3).join(", ")}
                  {hoverInfo.competitorNames.length > 3 && ` +${hoverInfo.competitorNames.length - 3}`}
                </div>
              )}
              <div className="border-t border-border/30 pt-1 mt-1">
                <span className="text-[9px] text-muted-foreground">Opportunity Score: </span>
                <span className={`text-[10px] font-bold ${hoverInfo.opportunityScore > 30 ? "text-green-400" : hoverInfo.opportunityScore > 10 ? "text-yellow-400" : "text-muted-foreground"}`}>
                  {hoverInfo.opportunityScore}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend + Top Opportunity States */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-foreground">Color Legend</span>
          <div className="flex flex-wrap gap-2 text-[9px]">
            <LegendItem color="rgba(34, 197, 94, 0.4)" label="High opportunity (volume > competition)" />
            <LegendItem color="rgba(212, 175, 55, 0.4)" label="Balanced (active, moderate competition)" />
            <LegendItem color="rgba(239, 68, 68, 0.4)" label="High competition (competitor dominated)" />
          </div>
        </div>
        <div>
          <span className="text-[10px] font-bold text-foreground">Top Opportunity States</span>
          <div className="space-y-0.5 mt-1">
            {Object.entries(stateData)
              .filter(([, d]) => d.opportunityScore > 0)
              .sort((a, b) => b[1].opportunityScore - a[1].opportunityScore)
              .slice(0, 5)
              .map(([st, d]) => (
                <div key={st} className="flex items-center justify-between text-[10px]">
                  <span className="text-foreground font-medium">{st}</span>
                  <span className="text-muted-foreground">{d.gcCount} GCs • {d.wonCount} won • {d.competitorCount} comp</span>
                  <span className="text-green-400 font-bold">{d.opportunityScore}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ color, label, value }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-muted-foreground">{label}</span>
      </div>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-1">
      <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

// US state grid positions (approximate geographic layout)
const US_GRID = [
  { state: "AK", col: 1, row: 1 }, { state: "ME", col: 12, row: 1 },
  { state: "WI", col: 7, row: 2 }, { state: "VT", col: 11, row: 1 }, { state: "NH", col: 12, row: 2 },
  { state: "WA", col: 2, row: 1 }, { state: "MT", col: 3, row: 1 }, { state: "ND", col: 5, row: 1 }, { state: "MN", col: 6, row: 1 },
  { state: "MI", col: 8, row: 2 }, { state: "NY", col: 10, row: 2 }, { state: "MA", col: 11, row: 2 },
  { state: "OR", col: 2, row: 2 }, { state: "ID", col: 3, row: 2 }, { state: "SD", col: 5, row: 2 }, { state: "IA", col: 6, row: 2 },
  { state: "CT", col: 11, row: 3 }, { state: "RI", col: 12, row: 3 },
  { state: "WY", col: 3, row: 3 }, { state: "NE", col: 5, row: 3 }, { state: "IL", col: 7, row: 3 },
  { state: "IN", col: 8, row: 3 }, { state: "OH", col: 9, row: 3 }, { state: "PA", col: 10, row: 3 }, { state: "NJ", col: 11, row: 4 },
  { state: "NV", col: 2, row: 3 }, { state: "UT", col: 3, row: 4 }, { state: "CO", col: 4, row: 4 }, { state: "KS", col: 5, row: 4 },
  { state: "MO", col: 6, row: 4 }, { state: "KY", col: 8, row: 4 }, { state: "WV", col: 9, row: 4 }, { state: "VA", col: 10, row: 4 },
  { state: "MD", col: 10, row: 5 }, { state: "DE", col: 11, row: 5 },
  { state: "CA", col: 1, row: 4 }, { state: "AZ", col: 2, row: 5 }, { state: "NM", col: 3, row: 5 },
  { state: "OK", col: 5, row: 5 }, { state: "AR", col: 6, row: 5 }, { state: "TN", col: 7, row: 5 },
  { state: "NC", col: 9, row: 5 }, { state: "SC", col: 9, row: 6 }, { state: "DC", col: 11, row: 6 },
  { state: "TX", col: 4, row: 6 }, { state: "LA", col: 5, row: 6 }, { state: "MS", col: 6, row: 6 },
  { state: "AL", col: 7, row: 6 }, { state: "GA", col: 8, row: 6 }, { state: "FL", col: 9, row: 7 },
  { state: "HI", col: 1, row: 8 },
];