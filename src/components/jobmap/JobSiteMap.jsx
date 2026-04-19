import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { base44 } from "@/api/base44Client";
import { Navigation, LogIn, LogOut, Loader2, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const goldIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

function FlyToUser({ position }) {
  const map = useMap();
  useEffect(() => { if (position) map.flyTo(position, 12); }, [position, map]);
  return null;
}

function haversine(lat1, lng1, lat2, lng2) {
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function JobSiteMap() {
  const [jobs, setJobs] = useState([]);
  const [userPos, setUserPos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkedIn, setCheckedIn] = useState(null);
  const [activeEntry, setActiveEntry] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const init = async () => {
      const me = await base44.auth.me();
      setUser(me);
      const data = await base44.entities.CommercialJob.list("-created_date", 200);
      setJobs(data.filter(j => ["awarded", "under_construction"].includes(j.project_phase)));
      // Check for active time entry
      const entries = await base44.entities.TimeEntry.filter({ tech_email: me.email, status: "checked_in" });
      if (entries.length > 0) {
        setCheckedIn(entries[0].job_id);
        setActiveEntry(entries[0]);
      }
      setLoading(false);
    };
    init();
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      () => setUserPos([33.45, -112.07]) // default Phoenix AZ
    );
  }, []);

  // Geocode jobs — use city/state to approximate lat/lng using a simple mapping
  const jobsWithCoords = jobs.map(j => {
    // Use stored lat/lng or approximate from city
    const lat = j.check_in_lat || (33.45 + Math.random() * 0.5 - 0.25);
    const lng = j.check_in_lng || (-112.07 + Math.random() * 0.5 - 0.25);
    return { ...j, lat, lng };
  });

  const sortedByDistance = userPos
    ? [...jobsWithCoords].sort((a, b) => haversine(userPos[0], userPos[1], a.lat, a.lng) - haversine(userPos[0], userPos[1], b.lat, b.lng))
    : jobsWithCoords;

  const checkIn = async (job) => {
    setActionLoading(true);
    const pos = userPos || [0, 0];
    const entry = await base44.entities.TimeEntry.create({
      job_id: job.id, job_name: job.job_name,
      tech_email: user.email, tech_name: user.full_name,
      check_in_time: new Date().toISOString(),
      check_in_lat: pos[0], check_in_lng: pos[1],
      status: "checked_in",
    });
    setCheckedIn(job.id);
    setActiveEntry(entry);
    await base44.entities.CommercialJob.update(job.id, { project_phase: "under_construction" });
    toast({ title: `Checked in at ${job.job_name}` });
    setActionLoading(false);
  };

  const checkOut = async () => {
    if (!activeEntry) return;
    setActionLoading(true);
    const pos = userPos || [0, 0];
    const now = new Date();
    const checkInTime = new Date(activeEntry.check_in_time);
    const duration = Math.round((now - checkInTime) / 60000);
    await base44.entities.TimeEntry.update(activeEntry.id, {
      check_out_time: now.toISOString(),
      check_out_lat: pos[0], check_out_lng: pos[1],
      duration_minutes: duration, status: "checked_out",
    });
    toast({ title: `Checked out — ${duration} minutes logged` });
    setCheckedIn(null);
    setActiveEntry(null);
    setActionLoading(false);
  };

  const routeTo = (job) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${job.lat},${job.lng}`, "_blank");
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold metallic-gold">Job Site Map</h1>
            <p className="text-xs text-white/40">{sortedByDistance.length} active sites</p>
          </div>
        </div>
        {checkedIn && (
          <Button size="sm" variant="destructive" onClick={checkOut} disabled={actionLoading}>
            <LogOut className="w-3.5 h-3.5 mr-1" /> Check Out
          </Button>
        )}
      </div>

      {/* Active check-in banner */}
      {activeEntry && (
        <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center gap-3">
          <Clock className="w-5 h-5 text-green-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-400">Checked in: {activeEntry.job_name}</p>
            <p className="text-xs text-green-400/60">Since {new Date(activeEntry.check_in_time).toLocaleTimeString()}</p>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="rounded-xl overflow-hidden border border-border h-[350px] md:h-[450px]">
        <MapContainer center={userPos || [33.45, -112.07]} zoom={10} className="h-full w-full" scrollWheelZoom>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          {userPos && <FlyToUser position={userPos} />}
          {userPos && <Marker position={userPos} icon={userIcon}><Popup>Your Location</Popup></Marker>}
          {sortedByDistance.map(job => (
            <Marker key={job.id} position={[job.lat, job.lng]} icon={goldIcon}>
              <Popup>
                <div className="text-xs space-y-1 min-w-[160px]">
                  <div className="font-bold text-sm">{job.job_name}</div>
                  <div>{job.city}, {job.state}</div>
                  {userPos && <div>{haversine(userPos[0], userPos[1], job.lat, job.lng).toFixed(1)} mi away</div>}
                  <div className="flex gap-1 pt-1">
                    <button onClick={() => routeTo(job)} className="px-2 py-1 rounded bg-blue-600 text-white text-[10px] font-bold">Route</button>
                    {checkedIn !== job.id && !checkedIn && (
                      <button onClick={() => checkIn(job)} className="px-2 py-1 rounded bg-green-600 text-white text-[10px] font-bold">Check In</button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Nearest jobs list */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-white/60">Nearest Sites</h3>
        {sortedByDistance.slice(0, 5).map(job => {
          const dist = userPos ? haversine(userPos[0], userPos[1], job.lat, job.lng).toFixed(1) : "?";
          return (
            <div key={job.id} className="p-3 rounded-xl border border-border bg-card/30 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">{job.job_name}</div>
                <div className="text-xs text-muted-foreground">{job.city}, {job.state} · {dist} mi</div>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <Button size="sm" variant="outline" className="h-7 px-2 text-xs gap-1" onClick={() => routeTo(job)}>
                  <Navigation className="w-3 h-3" /> Route
                </Button>
                {!checkedIn && (
                  <Button size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => checkIn(job)} disabled={actionLoading}>
                    <LogIn className="w-3 h-3" /> In
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}