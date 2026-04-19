import { Building2, Ruler, DollarSign, Clock, Users, MapPin } from "lucide-react";

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="p-3 rounded-lg bg-white/5 border border-white/8">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4" style={{ color }} />
        <span className="text-xs text-white/50">{label}</span>
      </div>
      <span className="text-lg font-bold text-white">{value}</span>
    </div>
  );
}

function ZoneRow({ zone, index }) {
  return (
    <div className="p-3 rounded-lg bg-white/[0.03] border border-white/8">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-white">{zone.zone_name || `Zone ${index + 1}`}</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium">
          {zone.material_zone || zone.recommended_system}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-xs text-white/60">
        <span><Ruler className="w-3 h-3 inline mr-1" />{zone.sqft?.toLocaleString()} sqft</span>
        <span><MapPin className="w-3 h-3 inline mr-1" />{zone.perimeter_ft || zone.wall_length_ft || '—'} ft walls</span>
        <span><DollarSign className="w-3 h-3 inline mr-1" />${zone.material_cost_estimate?.toLocaleString()}</span>
        <span><Clock className="w-3 h-3 inline mr-1" />{zone.labor_hours}h labor</span>
      </div>
      {zone.notes && <p className="text-xs text-white/40 mt-1">{zone.notes}</p>}
    </div>
  );
}

export default function TakeoffResultsPanel({ takeoff, jobId }) {
  if (!takeoff) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold metallic-gold">Takeoff Results</h3>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Ruler} label="Total Sqft" value={takeoff.total_sqft?.toLocaleString() || '—'} color="#06b6d4" />
        <StatCard icon={DollarSign} label="Est. Value" value={`$${takeoff.total_estimated_value?.toLocaleString() || '—'}`} color="#22c55e" />
        <StatCard icon={Clock} label="Timeline" value={`${takeoff.timeline_days || '—'} days`} color="#f59e0b" />
        <StatCard icon={Users} label="Crew" value={takeoff.crew_size || '—'} color="#8b5cf6" />
      </div>

      {/* Cost breakdown */}
      <div className="p-4 rounded-lg bg-white/[0.03] border border-white/8">
        <h4 className="text-sm font-semibold text-white mb-2">Cost Breakdown</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between"><span className="text-white/50">Materials</span><span className="text-white">${takeoff.total_material_cost?.toLocaleString() || '—'}</span></div>
          <div className="flex justify-between"><span className="text-white/50">Labor</span><span className="text-white">${takeoff.total_labor_cost?.toLocaleString() || '—'}</span></div>
        </div>
      </div>

      {/* Zone list */}
      {takeoff.zones?.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-white">{takeoff.zones.length} Zones Identified</h4>
          {takeoff.zones.map((zone, i) => (
            <ZoneRow key={i} zone={zone} index={i} />
          ))}
        </div>
      )}

      {/* System recommendation */}
      {takeoff.recommended_system && (
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
          <Building2 className="w-4 h-4 text-primary inline mr-2" />
          <span className="text-sm text-white/80"><strong>Recommended:</strong> {takeoff.recommended_system}</span>
        </div>
      )}

      {takeoff.summary && (
        <p className="text-xs text-white/50 leading-relaxed">{takeoff.summary}</p>
      )}
    </div>
  );
}