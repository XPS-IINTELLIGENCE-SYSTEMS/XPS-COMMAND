import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

const VERTICALS = ["Retail","Food & Bev","Warehouse","Automotive","Healthcare","Fitness","Education","Industrial","Residential","Government","Other"];
const STAGES = ["Incoming","Validated","Qualified","Prioritized","Contacted","Proposal","Negotiation","Won","Lost"];

export default function AddLeadDialog({ onClose, onSave }) {
  const [form, setForm] = useState({
    company: "", contact_name: "", email: "", phone: "", website: "",
    vertical: "Retail", location: "", city: "", state: "", stage: "Incoming",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.company || !form.contact_name) return;
    setSaving(true);
    await base44.entities.Lead.create(form);
    onSave?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl w-full max-w-lg p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-foreground">Add Lead</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-secondary"><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <Field label="Company *" value={form.company} onChange={v => set("company", v)} />
          <Field label="Contact Name *" value={form.contact_name} onChange={v => set("contact_name", v)} />
          <Field label="Email" value={form.email} onChange={v => set("email", v)} />
          <Field label="Phone" value={form.phone} onChange={v => set("phone", v)} />
          <Field label="Website" value={form.website} onChange={v => set("website", v)} />
          <Field label="City" value={form.city} onChange={v => set("city", v)} />
          <Field label="State" value={form.state} onChange={v => set("state", v)} />
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Vertical</label>
            <select value={form.vertical} onChange={e => set("vertical", e.target.value)} className="w-full rounded-lg bg-secondary/50 border border-border px-3 py-2 text-sm text-foreground">
              {VERTICALS.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Stage</label>
            <select value={form.stage} onChange={e => set("stage", e.target.value)} className="w-full rounded-lg bg-secondary/50 border border-border px-3 py-2 text-sm text-foreground">
              {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="mb-5">
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Notes</label>
          <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={2} className="w-full rounded-lg bg-secondary/50 border border-border px-3 py-2 text-sm text-foreground resize-none" />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.company || !form.contact_name} className="metallic-gold-bg text-background hover:brightness-110">
            {saving ? "Saving..." : "Save Lead"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div>
      <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} className="w-full rounded-lg bg-secondary/50 border border-border px-3 py-2 text-sm text-foreground" />
    </div>
  );
}