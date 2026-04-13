import { useState, useEffect } from "react";
import { User, Phone, Mail, MapPin, Save, Loader2, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

export default function SettingsProfile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    phone: "",
    secondary_email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    company: "",
    title: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      const me = await base44.auth.me();
      setUser(me);
      if (me) {
        setForm({
          phone: me.phone || "",
          secondary_email: me.secondary_email || "",
          address: me.address || "",
          city: me.city || "",
          state: me.state || "",
          zip: me.zip || "",
          company: me.company || "",
          title: me.title || "",
        });
      }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    await base44.auth.updateMe(form);
    toast({ title: "Profile saved" });
    setSaving(false);
    setEditing(false);
  };

  const handleDelete = (field) => {
    setForm(prev => ({ ...prev, [field]: "" }));
  };

  if (!user) return null;

  const fields = [
    { key: "phone", label: "Phone Number", icon: Phone, placeholder: "+1 (555) 000-0000" },
    { key: "secondary_email", label: "Additional Email", icon: Mail, placeholder: "backup@email.com" },
    { key: "company", label: "Company", icon: User, placeholder: "Company name" },
    { key: "title", label: "Job Title", icon: User, placeholder: "Your role" },
    { key: "address", label: "Street Address", icon: MapPin, placeholder: "123 Main St" },
    { key: "city", label: "City", icon: MapPin, placeholder: "City" },
    { key: "state", label: "State", icon: MapPin, placeholder: "State" },
    { key: "zip", label: "ZIP Code", icon: MapPin, placeholder: "ZIP" },
  ];

  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-sm font-semibold xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>PROFILE</h3>
            <p className="text-[10px] text-white/40">Your account details — edit, add, or remove</p>
          </div>
        </div>
        <Button size="sm" variant="ghost" className="text-xs gap-1" onClick={() => setEditing(!editing)}>
          {editing ? <X className="w-3 h-3" /> : <Pencil className="w-3 h-3" />}
          {editing ? "Cancel" : "Edit"}
        </Button>
      </div>

      {/* Read-only fields */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between py-2 px-2 rounded-lg border-b border-border/30">
          <span className="text-sm text-white">Display Name</span>
          <span className="text-sm text-white/40">{user.full_name || "Not set"}</span>
        </div>
        <div className="flex items-center justify-between py-2 px-2 rounded-lg border-b border-border/30">
          <span className="text-sm text-white">Email</span>
          <span className="text-sm text-white/40">{user.email || "Not set"}</span>
        </div>
        <div className="flex items-center justify-between py-2 px-2 rounded-lg border-b border-border/30">
          <span className="text-sm text-white">Role</span>
          <span className="text-sm text-white/40 capitalize">{user.role || "operator"}</span>
        </div>
      </div>

      {/* Editable fields */}
      <div className="space-y-2">
        {fields.map(f => {
          const Icon = f.icon;
          return (
            <div key={f.key} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-white/[0.03] border-b border-border/30 last:border-0">
              <div className="flex items-center gap-2">
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm text-white">{f.label}</span>
              </div>
              {editing ? (
                <div className="flex items-center gap-1.5">
                  <Input
                    value={form[f.key]}
                    onChange={(e) => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="h-7 w-40 text-xs bg-transparent"
                  />
                  {form[f.key] && (
                    <button onClick={() => handleDelete(f.key)} className="p-1 rounded hover:bg-white/10">
                      <X className="w-3 h-3 text-destructive" />
                    </button>
                  )}
                </div>
              ) : (
                <span className="text-sm text-white/40">{form[f.key] || "Not set"}</span>
              )}
            </div>
          );
        })}
      </div>

      {editing && (
        <div className="mt-4 flex justify-end">
          <Button size="sm" onClick={save} disabled={saving} className="gap-1.5 text-xs">
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            Save Profile
          </Button>
        </div>
      )}
    </div>
  );
}