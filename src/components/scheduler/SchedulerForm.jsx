import { useState } from "react";
import { Plus, Search, MapPin, Tag, Clock, Hash, Globe, Crosshair, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
];

const CATEGORIES = [
  "Company Research", "Competitor Intel", "Market Analysis", "Lead Research",
  "Industry News", "Pricing Intel", "Technology", "Custom"
];

const FREQUENCIES = [
  { label: "Manual Only", value: "Manual" },
  { label: "Every 15 min", value: "Every 15 min" },
  { label: "Every 30 min", value: "Every 30 min" },
  { label: "Hourly", value: "Hourly" },
  { label: "Every 6 hours", value: "Every 6 hours" },
  { label: "Daily", value: "Daily" },
  { label: "Weekly", value: "Weekly" },
];

const DESTINATIONS = [
  "Pre-Stage", "Stage", "HubSpot Ready", "Google Drive", "Supabase", "Airtable", "Knowledge Base", "Local"
];

const VERTICALS = [
  "Epoxy Flooring", "Polished Concrete", "Decorative Concrete", "General Contractor",
  "Painting & Coatings", "Industrial Flooring", "Concrete Repair", "Restoration",
  "Automotive", "Healthcare", "Retail", "Warehouse", "Fitness", "Education", "Other"
];

export default function SchedulerForm({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: "",
    keywords: "",
    state: "AZ",
    city: "",
    industry: "",
    category: "Lead Research",
    urls: "",
    schedule: "Manual",
    destination: "Local",
    leadCount: 10,
    scrapeFor: "",
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const save = async () => {
    if (!form.name) { toast({ title: "Name required" }); return; }
    setSaving(true);
    await base44.entities.ScrapeJob.create({
      name: form.name,
      keywords: form.keywords,
      location: `${form.city}, ${form.state}`,
      industry: form.industry || form.scrapeFor,
      category: form.category,
      urls: form.urls,
      schedule: form.schedule,
      destination: form.destination,
      results_count: form.leadCount,
      mode: "Bulk",
      status: "Idle",
      is_active: true,
      run_count: 0,
    });
    toast({ title: "Created!", description: `${form.name} added to scheduler` });
    setForm({ name: "", keywords: "", state: "AZ", city: "", industry: "", category: "Lead Research", urls: "", schedule: "Manual", destination: "Local", leadCount: 10, scrapeFor: "" });
    setOpen(false);
    setSaving(false);
    onCreated?.();
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="w-full rounded-2xl p-6 text-left transition-all duration-300 bg-white/[0.03] backdrop-blur-2xl border border-dashed border-white/[0.15] animated-silver-border hover:border-primary/40 hover:bg-white/[0.06] group">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-all">
            <Plus className="w-6 h-6 text-primary" />
          </div>
          <div>
            <div className="text-lg font-bold text-foreground">Create New Scrape Job</div>
            <div className="text-sm text-muted-foreground">Configure keywords, location, frequency, and lead count</div>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="rounded-2xl p-6 md:p-8 bg-white/[0.04] backdrop-blur-2xl border border-white/[0.12] animated-silver-border space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>NEW SCRAPE JOB</h2>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Job Name */}
        <FormField icon={Tag} label="Job Name">
          <Input placeholder="e.g. AZ Epoxy Contractors" value={form.name} onChange={e => set("name", e.target.value)} className="glass-input rounded-xl h-11" />
        </FormField>

        {/* Keywords */}
        <FormField icon={Search} label="Keywords">
          <Input placeholder="epoxy flooring, concrete polishing, coatings..." value={form.keywords} onChange={e => set("keywords", e.target.value)} className="glass-input rounded-xl h-11" />
        </FormField>

        {/* State */}
        <FormField icon={MapPin} label="State">
          <select value={form.state} onChange={e => set("state", e.target.value)}
            className="w-full h-11 rounded-xl px-3 text-sm bg-white/[0.04] border border-white/[0.1] text-foreground focus:border-primary/40 focus:outline-none">
            <option value="">All States</option>
            {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </FormField>

        {/* City */}
        <FormField icon={MapPin} label="City">
          <Input placeholder="Phoenix, Tempe, Mesa..." value={form.city} onChange={e => set("city", e.target.value)} className="glass-input rounded-xl h-11" />
        </FormField>

        {/* What to scrape for */}
        <FormField icon={Crosshair} label="What to Scrape For">
          <select value={form.scrapeFor} onChange={e => set("scrapeFor", e.target.value)}
            className="w-full h-11 rounded-xl px-3 text-sm bg-white/[0.04] border border-white/[0.1] text-foreground focus:border-primary/40 focus:outline-none">
            <option value="">Select vertical...</option>
            {VERTICALS.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </FormField>

        {/* Category */}
        <FormField icon={Tag} label="Category">
          <select value={form.category} onChange={e => set("category", e.target.value)}
            className="w-full h-11 rounded-xl px-3 text-sm bg-white/[0.04] border border-white/[0.1] text-foreground focus:border-primary/40 focus:outline-none">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </FormField>

        {/* Lead Count */}
        <FormField icon={Hash} label="Leads Per Run">
          <Input type="number" min={1} max={50} value={form.leadCount} onChange={e => set("leadCount", parseInt(e.target.value) || 10)} className="glass-input rounded-xl h-11" />
        </FormField>

        {/* Frequency */}
        <FormField icon={Clock} label="Frequency">
          <select value={form.schedule} onChange={e => set("schedule", e.target.value)}
            className="w-full h-11 rounded-xl px-3 text-sm bg-white/[0.04] border border-white/[0.1] text-foreground focus:border-primary/40 focus:outline-none">
            {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </FormField>

        {/* Destination */}
        <FormField icon={Globe} label="Send Results To">
          <select value={form.destination} onChange={e => set("destination", e.target.value)}
            className="w-full h-11 rounded-xl px-3 text-sm bg-white/[0.04] border border-white/[0.1] text-foreground focus:border-primary/40 focus:outline-none">
            {DESTINATIONS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </FormField>

        {/* Target URLs */}
        <FormField icon={Globe} label="Target URLs (optional)">
          <Input placeholder="https://example.com, https://..." value={form.urls} onChange={e => set("urls", e.target.value)} className="glass-input rounded-xl h-11" />
        </FormField>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
        <Button onClick={save} disabled={saving} className="min-w-[140px]">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          Create Job
        </Button>
      </div>
    </div>
  );
}

function FormField({ icon: Icon, label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <Icon className="w-3.5 h-3.5" />{label}
      </label>
      {children}
    </div>
  );
}