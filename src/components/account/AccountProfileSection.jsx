import { useState } from "react";
import { User, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AccountProfileSection({ profile, user, saveField, saveBatch }) {
  const [draft, setDraft] = useState({
    full_name: profile?.full_name || user?.full_name || "",
    title: profile?.title || "",
    phone: profile?.phone || "",
    alternate_email: profile?.alternate_email || "",
    address: profile?.address || "",
    city: profile?.city || "",
    state: profile?.state || "",
    zip: profile?.zip || "",
  });
  const [dirty, setDirty] = useState(false);

  const update = (key, val) => {
    setDraft(prev => ({ ...prev, [key]: val }));
    setDirty(true);
  };

  const handleSave = () => {
    saveBatch(draft);
    setDirty(false);
  };

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-base font-bold xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>PROFILE</h3>
          <p className="text-[11px] text-white/50">Personal information</p>
        </div>
        {dirty && (
          <Button size="sm" onClick={handleSave} className="ml-auto gap-1.5 metallic-gold-bg text-black text-xs">
            <Save className="w-3.5 h-3.5" /> Save
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-border/30">
          <span className="text-xs text-white/50 w-24 shrink-0">Email</span>
          <span className="text-sm text-white font-medium">{user?.email || "—"}</span>
        </div>
        <Field label="Full Name" value={draft.full_name} onChange={v => update("full_name", v)} />
        <Field label="Title / Role" value={draft.title} onChange={v => update("title", v)} />
        <Field label="Phone" value={draft.phone} onChange={v => update("phone", v)} />
        <Field label="Alt Email" value={draft.alternate_email} onChange={v => update("alternate_email", v)} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Address" value={draft.address} onChange={v => update("address", v)} />
          <Field label="City" value={draft.city} onChange={v => update("city", v)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="State" value={draft.state} onChange={v => update("state", v)} />
          <Field label="ZIP" value={draft.zip} onChange={v => update("zip", v)} />
        </div>
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