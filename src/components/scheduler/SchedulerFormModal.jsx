import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATEGORIES = ["Company Research", "Competitor Intel", "Market Analysis", "Lead Research", "Industry News", "Pricing Intel", "Technology", "Custom"];
const DESTINATIONS = ["Pre-Stage", "Stage", "HubSpot Ready", "Google Drive", "Supabase", "Airtable", "Knowledge Base", "Local"];
const SCHEDULES = ["Manual", "Every 15 min", "Every 30 min", "Hourly", "Every 6 hours", "Daily", "Weekly"];
const VERTICALS = ["All", "Retail", "Food & Bev", "Warehouse", "Automotive", "Healthcare", "Fitness", "Education", "Industrial", "Residential", "Government"];
const SEARCH_TYPES = ["Companies", "Jobs"];
const STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

export default function SchedulerFormModal({ job, onClose, onSaved }) {
  const isEditing = !!job;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: job?.name || "",
    keywords: job?.keywords || "",
    urls: job?.urls || "",
    industry: job?.industry || "",
    location: job?.location || "",
    category: job?.category || "Lead Research",
    destination: job?.destination || "Local",
    mode: job?.mode || "Single",
    schedule: job?.schedule || "Manual",
    is_active: job?.is_active ?? true,
    // Extended fields stored as JSON in urls field if needed
  });
  const [searchType, setSearchType] = useState("Companies");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [radius, setRadius] = useState("50");
  const [vertical, setVertical] = useState("All");
  const [leadCount, setLeadCount] = useState("25");
  const [emailResults, setEmailResults] = useState(true);
  const [smsResults, setSmsResults] = useState(false);
  const [addToCrm, setAddToCrm] = useState(true);
  const [emailAddress, setEmailAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    if (!form.name) return;
    setSaving(true);

    const locationStr = [city, state].filter(Boolean).join(", ") + (radius !== "50" ? ` (${radius}mi radius)` : "");
    const configJson = JSON.stringify({
      search_type: searchType,
      state, city, radius: parseInt(radius),
      vertical: vertical === "All" ? "" : vertical,
      lead_count: parseInt(leadCount),
      email_results: emailResults,
      sms_results: smsResults,
      add_to_crm: addToCrm,
      email_address: emailAddress,
      phone_number: phoneNumber,
    });

    const payload = {
      ...form,
      location: locationStr || form.location,
      industry: vertical === "All" ? form.industry : vertical,
      urls: configJson,
    };

    if (isEditing) {
      await base44.entities.ScrapeJob.update(job.id, payload);
    } else {
      await base44.entities.ScrapeJob.create({ ...payload, status: "Scheduled", results_count: 0, run_count: 0 });
    }
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold">{isEditing ? "Edit Schedule" : "New Scraper Schedule"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4" /></button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Job Name */}
          <Field label="Job Name">
            <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g., Florida Epoxy Contractors Weekly" className="bg-secondary/50" />
          </Field>

          {/* Search Type */}
          <Field label="Search Type">
            <div className="flex gap-2">
              {SEARCH_TYPES.map(t => (
                <button key={t} onClick={() => setSearchType(t)}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${searchType === t ? "bg-primary text-primary-foreground border-primary" : "bg-secondary/50 border-border text-muted-foreground hover:text-foreground"}`}>
                  {t}
                </button>
              ))}
            </div>
          </Field>

          {/* Location */}
          <div className="grid grid-cols-3 gap-3">
            <Field label="State">
              <Select value={state} onValueChange={setState}>
                <SelectTrigger className="bg-secondary/50"><SelectValue placeholder="Select state" /></SelectTrigger>
                <SelectContent>{STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="City">
              <Input value={city} onChange={e => setCity(e.target.value)} placeholder="Tampa" className="bg-secondary/50" />
            </Field>
            <Field label="Radius (miles)">
              <Input type="number" value={radius} onChange={e => setRadius(e.target.value)} className="bg-secondary/50" />
            </Field>
          </div>

          {/* Industry / Vertical */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Industry / Vertical">
              <Select value={vertical} onValueChange={setVertical}>
                <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
                <SelectContent>{VERTICALS.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Specialty Keywords">
              <Input value={form.keywords} onChange={e => set("keywords", e.target.value)} placeholder="epoxy flooring, polished concrete" className="bg-secondary/50" />
            </Field>
          </div>

          {/* Lead Count and Category */}
          <div className="grid grid-cols-3 gap-3">
            <Field label="Lead Count">
              <Input type="number" value={leadCount} onChange={e => setLeadCount(e.target.value)} className="bg-secondary/50" />
            </Field>
            <Field label="Category">
              <Select value={form.category} onValueChange={v => set("category", v)}>
                <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Destination">
              <Select value={form.destination} onValueChange={v => set("destination", v)}>
                <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
                <SelectContent>{DESTINATIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          </div>

          {/* Frequency */}
          <Field label="Run Frequency">
            <div className="flex flex-wrap gap-2">
              {SCHEDULES.map(s => (
                <button key={s} onClick={() => set("schedule", s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${form.schedule === s ? "bg-primary text-primary-foreground border-primary" : "bg-transparent text-muted-foreground border-border hover:border-foreground/30"}`}>
                  {s}
                </button>
              ))}
            </div>
          </Field>

          {/* Delivery Options */}
          <div className="rounded-xl border border-border p-4 space-y-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Delivery Options</div>
            <ToggleRow label="Email results to me" checked={emailResults} onChange={setEmailResults} />
            {emailResults && (
              <Input value={emailAddress} onChange={e => setEmailAddress(e.target.value)} placeholder="your@email.com" className="bg-secondary/50 text-sm" />
            )}
            <ToggleRow label="Text message results to me" checked={smsResults} onChange={setSmsResults} />
            {smsResults && (
              <Input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="+1 555-123-4567" className="bg-secondary/50 text-sm" />
            )}
            <ToggleRow label="Auto-add results to CRM" checked={addToCrm} onChange={setAddToCrm} />
          </div>

          {/* Target URLs (optional) */}
          <Field label="Target URLs (optional, one per line)">
            <textarea
              value={form.urls?.startsWith("{") ? "" : form.urls}
              onChange={e => set("urls", e.target.value)}
              placeholder="https://example.com/directory&#10;https://maps.google.com/..."
              rows={3}
              className="w-full rounded-lg bg-secondary/50 border border-border px-3 py-2 text-sm resize-none focus:outline-none focus:border-primary/50"
            />
          </Field>
        </div>

        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.name} className="gap-1.5">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            {isEditing ? "Update Schedule" : "Create Schedule"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={`w-9 h-5 rounded-full transition-colors relative ${checked ? "bg-primary" : "bg-secondary"}`}
      >
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`} />
      </div>
      <span className="text-sm text-foreground">{label}</span>
    </label>
  );
}