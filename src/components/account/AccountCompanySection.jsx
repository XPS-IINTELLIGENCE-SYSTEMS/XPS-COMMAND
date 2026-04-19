import { useState } from "react";
import { Building2, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AccountCompanySection({ profile, saveField, saveBatch }) {
  const [draft, setDraft] = useState({
    company_name: profile?.company_name || "",
    company_location: profile?.company_location || "",
    industry: profile?.industry || "",
    default_vertical: profile?.default_vertical || "",
    default_state: profile?.default_state || "",
  });
  const [dirty, setDirty] = useState(false);

  const update = (key, val) => {
    setDraft(prev => ({ ...prev, [key]: val }));
    setDirty(true);
  };

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-base font-bold xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>COMPANY</h3>
          <p className="text-[11px] text-white/50">Business information</p>
        </div>
        {dirty && (
          <Button size="sm" onClick={() => { saveBatch(draft); setDirty(false); }} className="ml-auto gap-1.5 metallic-gold-bg text-black text-xs">
            <Save className="w-3.5 h-3.5" /> Save
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <Field label="Company" value={draft.company_name} onChange={v => update("company_name", v)} />
        <Field label="Location" value={draft.company_location} onChange={v => update("company_location", v)} />
        <Field label="Industry" value={draft.industry} onChange={v => update("industry", v)} />
        <Field label="Def. Vertical" value={draft.default_vertical} onChange={v => update("default_vertical", v)} />
        <Field label="Def. State" value={draft.default_state} onChange={v => update("default_state", v)} />
      </div>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-border/30">
      <span className="text-xs text-white/50 w-24 shrink-0">{label}</span>
      <Input
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        className="h-8 text-sm bg-transparent border-0 shadow-none focus-visible:ring-0 px-0 text-white"
      />
    </div>
  );
}