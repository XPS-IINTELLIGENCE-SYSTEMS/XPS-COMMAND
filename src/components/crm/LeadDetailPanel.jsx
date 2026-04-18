import { useState } from "react";
import { X, Mail, Phone, Globe, MapPin, Building2, Star, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

const STAGES = ["Incoming","Validated","Qualified","Prioritized","Contacted","Proposal","Negotiation","Won","Lost"];

export default function LeadDetailPanel({ lead, onClose, onRefresh }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...lead });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    const { id, created_date, updated_date, created_by, ...data } = form;
    await base44.entities.Lead.update(lead.id, data);
    setSaving(false);
    setEditing(false);
    onRefresh?.();
  };

  const handleDelete = async () => {
    if (!confirm("Delete this lead?")) return;
    await base44.entities.Lead.delete(lead.id);
    onClose();
    onRefresh?.();
  };

  const location = lead.location || [lead.city, lead.state].filter(Boolean).join(", ");

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/30 backdrop-blur-sm">
      <div className="h-full w-full max-w-md bg-card border-l border-border shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card border-b border-border px-5 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground truncate">{lead.company}</h2>
          <div className="flex items-center gap-2">
            {editing ? (
              <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1 metallic-gold-bg text-background"><Save className="w-3.5 h-3.5" />{saving ? "..." : "Save"}</Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>Edit</Button>
            )}
            <button onClick={onClose} className="p-1 rounded hover:bg-secondary"><X className="w-5 h-5 text-muted-foreground" /></button>
          </div>
        </div>

        <div className="p-5 space-y-6">
          {/* Quick Info */}
          <div className="space-y-3">
            <InfoRow icon={Building2} label="Company" value={editing ? <input value={form.company} onChange={e => set("company", e.target.value)} className="edit-input" /> : lead.company} />
            <InfoRow icon={Star} label="Contact" value={editing ? <input value={form.contact_name} onChange={e => set("contact_name", e.target.value)} className="edit-input" /> : lead.contact_name} />
            <InfoRow icon={Mail} label="Email" value={editing ? <input value={form.email || ""} onChange={e => set("email", e.target.value)} className="edit-input" /> : lead.email} link={lead.email ? `mailto:${lead.email}` : null} />
            <InfoRow icon={Phone} label="Phone" value={editing ? <input value={form.phone || ""} onChange={e => set("phone", e.target.value)} className="edit-input" /> : lead.phone} link={lead.phone ? `tel:${lead.phone}` : null} />
            <InfoRow icon={Globe} label="Website" value={editing ? <input value={form.website || ""} onChange={e => set("website", e.target.value)} className="edit-input" /> : lead.website} link={lead.website ? (lead.website.startsWith("http") ? lead.website : `https://${lead.website}`) : null} />
            <InfoRow icon={MapPin} label="Location" value={editing ? <input value={form.location || ""} onChange={e => set("location", e.target.value)} className="edit-input" /> : location} />
          </div>

          {/* Stage */}
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-2">Pipeline Stage</label>
            {editing ? (
              <select value={form.stage} onChange={e => set("stage", e.target.value)} className="w-full rounded-lg bg-secondary/50 border border-border px-3 py-2 text-sm text-foreground">
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            ) : (
              <div className="flex gap-1 flex-wrap">
                {STAGES.map(s => (
                  <span key={s} className={`text-[10px] px-2 py-1 rounded-full border ${lead.stage === s ? "bg-primary/15 text-primary border-primary/30" : "text-muted-foreground border-border"}`}>{s}</span>
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <StatBox label="Score" value={lead.score || "—"} />
            <StatBox label="Priority" value={lead.priority || "—"} />
            <StatBox label="Est. Value" value={lead.estimated_value ? `$${lead.estimated_value.toLocaleString()}` : "—"} />
          </div>

          {/* Notes */}
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-2">Notes</label>
            {editing ? (
              <textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={4} className="w-full rounded-lg bg-secondary/50 border border-border px-3 py-2 text-sm text-foreground resize-none" />
            ) : (
              <p className="text-sm text-muted-foreground">{lead.notes || "No notes"}</p>
            )}
          </div>

          {/* AI Insight */}
          {lead.ai_insight && (
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-2">AI Insight</label>
              <p className="text-sm text-foreground/80 bg-secondary/30 rounded-lg p-3">{lead.ai_insight}</p>
            </div>
          )}

          {/* Delete */}
          <Button variant="outline" className="w-full text-destructive border-destructive/30 hover:bg-destructive/10" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" /> Delete Lead
          </Button>
        </div>

        <style>{`.edit-input { width: 100%; border-radius: 0.5rem; padding: 0.375rem 0.75rem; font-size: 0.875rem; color: hsl(var(--foreground)); background: hsl(var(--secondary) / 0.5); border: 1px solid hsl(var(--border)); outline: none; }`}</style>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, link }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div className="min-w-0">
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
        {typeof value === "string" && link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">{value}</a>
        ) : (
          <div className="text-sm text-foreground break-all">{value || "—"}</div>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="rounded-lg bg-secondary/30 border border-border p-3 text-center">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{label}</div>
      <div className="text-lg font-bold text-foreground">{value}</div>
    </div>
  );
}