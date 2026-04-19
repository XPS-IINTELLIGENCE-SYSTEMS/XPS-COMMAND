import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Eye, Plus, Play, Loader2, AlertTriangle, CheckCircle2, Clock, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SEVERITY_STYLES = {
  critical: "bg-red-500/15 text-red-400 border-red-500/30",
  high: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  low: "bg-green-500/15 text-green-400 border-green-500/30",
};

function ScheduleForm({ onSave, onCancel }) {
  const [name, setName] = useState("");
  const [urls, setUrls] = useState("");
  const [schedule, setSchedule] = useState("Daily");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name || !urls) return;
    setSaving(true);
    await base44.functions.invoke("shadowBrowser", {
      action: "schedule",
      competitor_name: name,
      urls: urls.split(",").map(u => u.trim()).filter(Boolean),
      schedule,
    });
    setSaving(false);
    onSave();
  };

  return (
    <div className="p-3 bg-secondary/50 rounded-lg space-y-2.5">
      <p className="text-xs font-semibold text-foreground">New Shadow Monitor</p>
      <Input placeholder="Competitor name" value={name} onChange={e => setName(e.target.value)} className="h-8 text-xs" />
      <Input placeholder="URLs to monitor (comma separated)" value={urls} onChange={e => setUrls(e.target.value)} className="h-8 text-xs" />
      <Select value={schedule} onValueChange={setSchedule}>
        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="Daily">Daily</SelectItem>
          <SelectItem value="Every 6 hours">Every 6 hours</SelectItem>
          <SelectItem value="Hourly">Hourly</SelectItem>
          <SelectItem value="Weekly">Weekly</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={saving || !name || !urls} className="text-xs h-7 gap-1">
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />} Save
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel} className="text-xs h-7">Cancel</Button>
      </div>
    </div>
  );
}

function IntelCard({ record }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`p-3 rounded-lg border cursor-pointer transition-all ${record.change_detected ? SEVERITY_STYLES[record.severity] || SEVERITY_STYLES.low : 'bg-card/50 border-border'}`} onClick={() => setExpanded(!expanded)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {record.change_detected ? <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> : <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />}
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate">{record.competitor_name}</p>
            <p className="text-[10px] text-muted-foreground truncate">{record.website_url}</p>
          </div>
        </div>
        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{record.scanned_at ? new Date(record.scanned_at).toLocaleDateString() : ''}</span>
      </div>
      {record.change_detected && <p className="text-[11px] mt-1.5 line-clamp-2">{record.diff_summary}</p>}
      {expanded && (
        <div className="mt-2 pt-2 border-t border-border/50 space-y-1.5 text-[11px] text-muted-foreground">
          {record.change_type !== "no_change" && <p><span className="font-medium text-foreground">Change:</span> {record.change_type}</p>}
          {record.ai_analysis && <p><span className="font-medium text-foreground">Analysis:</span> {record.ai_analysis}</p>}
          {record.recommendations && <p><span className="font-medium text-foreground">Recommended:</span> {record.recommendations}</p>}
          {record.pricing_data && record.pricing_data !== "{}" && (
            <p><span className="font-medium text-foreground">Pricing:</span> {record.pricing_data.substring(0, 200)}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function ShadowBrowserPanel() {
  const [schedules, setSchedules] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [running, setRunning] = useState(false);
  const [scanningId, setScanningId] = useState(null);

  const load = async () => {
    setLoading(true);
    const [schedRes, histRes] = await Promise.all([
      base44.functions.invoke("shadowBrowser", { action: "list_schedules" }),
      base44.functions.invoke("shadowBrowser", { action: "history", limit: 20 }),
    ]);
    setSchedules(schedRes.data?.schedules || []);
    setHistory(histRes.data?.records || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const runAll = async () => {
    setRunning(true);
    await base44.functions.invoke("shadowBrowser", { action: "run_scheduled" });
    setTimeout(load, 2000);
    setRunning(false);
  };

  const runSingle = async (job) => {
    setScanningId(job.id);
    const urls = (job.urls || "").split(",").map(u => u.trim()).filter(Boolean);
    for (const url of urls) {
      await base44.functions.invoke("shadowBrowser", {
        action: "scan_competitor",
        competitor_name: job.name,
        website_url: url,
        scrape_job_id: job.id,
      });
    }
    setScanningId(null);
    load();
  };

  const deleteSchedule = async (id) => {
    await base44.entities.ScrapeJob.delete(id);
    load();
  };

  const changesCount = history.filter(r => r.change_detected).length;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Shadow Browser</h3>
          {changesCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-500/20 text-red-400 rounded-full">{changesCount} changes</span>
          )}
        </div>
        <div className="flex gap-1.5">
          <Button size="sm" variant="outline" onClick={load} className="h-7 text-[11px] gap-1">
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button size="sm" variant="outline" onClick={runAll} disabled={running || schedules.length === 0} className="h-7 text-[11px] gap-1">
            {running ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />} Run All
          </Button>
          <Button size="sm" onClick={() => setShowForm(true)} className="h-7 text-[11px] gap-1">
            <Plus className="w-3 h-3" /> Monitor
          </Button>
        </div>
      </div>

      {showForm && <ScheduleForm onSave={() => { setShowForm(false); load(); }} onCancel={() => setShowForm(false)} />}

      {/* Schedules */}
      {schedules.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Active Monitors</p>
          {schedules.map(job => (
            <div key={job.id} className="flex items-center justify-between p-2.5 rounded-lg bg-card/50 border border-border">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground truncate">{job.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{job.urls || "No URLs"}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="w-3 h-3" /> {job.schedule}
                </span>
                <span className="text-[10px] text-muted-foreground">{job.run_count || 0} runs</span>
                <button onClick={() => runSingle(job)} disabled={scanningId === job.id} className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-green-400">
                  {scanningId === job.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                </button>
                <button onClick={() => deleteSchedule(job.id)} className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-red-400">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Intel History */}
      <div className="space-y-1.5">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          Recent Scans {history.length > 0 && `(${history.length})`}
        </p>
        {loading ? (
          <div className="py-6 text-center"><Loader2 className="w-4 h-4 animate-spin mx-auto text-muted-foreground" /></div>
        ) : history.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">No scans yet. Add a competitor to start monitoring.</p>
        ) : (
          <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
            {history.map(r => <IntelCard key={r.id} record={r} />)}
          </div>
        )}
      </div>
    </div>
  );
}