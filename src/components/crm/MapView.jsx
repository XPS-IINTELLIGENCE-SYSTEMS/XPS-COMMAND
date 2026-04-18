import { useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Search } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Fix leaflet default icon
import L from "leaflet";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Simple geocoding: state center coords
const STATE_COORDS = {
  FL: [27.6648, -81.5158], TX: [31.9686, -99.9018], CA: [36.7783, -119.4179],
  NY: [40.7128, -74.006], AZ: [34.0489, -111.0937], GA: [32.1656, -83.5085],
  OH: [40.4173, -82.9071], PA: [41.2033, -77.1945], IL: [40.6331, -89.3985],
  NC: [35.7596, -79.0193], NJ: [40.0583, -74.4057], VA: [37.4316, -78.6569],
  WA: [47.7511, -120.7401], MA: [42.4072, -71.3824], TN: [35.5175, -86.5804],
  CO: [39.5501, -105.7821], AL: [32.3182, -86.9023], SC: [33.8361, -81.1637],
};

export default function MapView({ leads }) {
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("All");

  const filtered = leads.filter(l => {
    if (search && !`${l.company} ${l.contact_name}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (ratingFilter === "Hot" && (l.score || 0) < 80) return false;
    if (ratingFilter === "Warm" && ((l.score || 0) < 50 || (l.score || 0) >= 80)) return false;
    if (ratingFilter === "Cold" && (l.score || 0) >= 50) return false;
    return true;
  });

  // Pick map center from first lead with a state, or default
  const center = useMemo(() => {
    for (const lead of leads) {
      if (lead.state && STATE_COORDS[lead.state]) return STATE_COORDS[lead.state];
    }
    return [39.8283, -98.5795]; // US center
  }, [leads]);

  return (
    <div className="flex h-[calc(100vh-60px)]">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-card flex flex-col flex-shrink-0">
        <div className="p-3 border-b border-border">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Leads ({filtered.length})</div>
          <div className="relative mb-2">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full pl-8 pr-3 py-1.5 rounded-md bg-secondary/50 border border-border text-xs text-foreground" />
          </div>
          <div className="flex gap-1">
            {["All", "Hot", "Warm", "Cold"].map(r => (
              <button key={r} onClick={() => setRatingFilter(r)} className={`text-[10px] px-2 py-0.5 rounded-full border ${ratingFilter === r ? "bg-primary/15 text-primary border-primary/30" : "text-muted-foreground border-border"}`}>{r}</button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map(lead => (
            <div key={lead.id} className="px-3 py-2.5 border-b border-border/50 hover:bg-secondary/30 cursor-pointer">
              <div className="text-sm font-semibold text-foreground">{lead.company}</div>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${lead.stage === "Won" ? "bg-green-500/15 text-green-400" : lead.stage === "Lost" ? "bg-red-500/15 text-red-400" : "bg-secondary text-muted-foreground"}`}>{lead.stage}</span>
                {lead.score != null && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${lead.score >= 80 ? "bg-green-500/15 text-green-400" : lead.score >= 50 ? "bg-yellow-500/15 text-yellow-400" : "bg-red-500/15 text-red-400"}`}>
                    {lead.score >= 80 ? "Hot" : lead.score >= 50 ? "Warm" : "Cold"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1">
        <MapContainer center={center} zoom={5} className="h-full w-full" scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          {filtered.map(lead => {
            const coords = lead.state && STATE_COORDS[lead.state];
            if (!coords) return null;
            // Add slight jitter so markers don't overlap
            const jitter = [coords[0] + (Math.random() - 0.5) * 0.5, coords[1] + (Math.random() - 0.5) * 0.5];
            return (
              <Marker key={lead.id} position={jitter}>
                <Popup>
                  <strong>{lead.company}</strong><br />
                  {lead.contact_name}<br />
                  {lead.location || [lead.city, lead.state].filter(Boolean).join(", ")}
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}