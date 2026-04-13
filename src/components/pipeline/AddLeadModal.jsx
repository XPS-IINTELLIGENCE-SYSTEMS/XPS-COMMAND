import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

const EMPTY = {
  company: "", contact_name: "", email: "", phone: "", website: "",
  city: "", state: "", zip: "", employee_count: 0, existing_material: "",
  equipment_used: "", estimated_value: 0, stage: "Incoming",
  pipeline_status: "Incoming", ingestion_source: "Manual"
};

export default function AddLeadModal({ onClose }) {
  const [form, setForm] = useState(EMPTY);
  const { toast } = useToast();

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const create = async () => {
    if (!form.company.trim()) return;
    await base44.entities.Lead.create({
      ...form,
      location: [form.city, form.state].filter(Boolean).join(", "),
    });
    toast({ title: "Created", description: "New lead added to Incoming" });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative glass-panel rounded-xl p-5 w-[440px] max-h-[80vh] overflow-y-auto space-y-3 shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-sm font-bold text-foreground mb-2">Add New Lead</h3>
        <Input placeholder="Company name *" value={form.company} onChange={e => set("company", e.target.value)} className="h-9 text-sm" />
        <Input placeholder="Contact name" value={form.contact_name} onChange={e => set("contact_name", e.target.value)} className="h-9 text-sm" />
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="Email" value={form.email} onChange={e => set("email", e.target.value)} className="h-9 text-sm" />
          <Input placeholder="Phone" value={form.phone} onChange={e => set("phone", e.target.value)} className="h-9 text-sm" />
        </div>
        <Input placeholder="Website" value={form.website} onChange={e => set("website", e.target.value)} className="h-9 text-sm" />
        <div className="grid grid-cols-3 gap-2">
          <Input placeholder="City" value={form.city} onChange={e => set("city", e.target.value)} className="h-9 text-sm" />
          <Input placeholder="State" value={form.state} onChange={e => set("state", e.target.value)} className="h-9 text-sm" />
          <Input placeholder="ZIP" value={form.zip} onChange={e => set("zip", e.target.value)} className="h-9 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input type="number" placeholder="Employees" value={form.employee_count || ""} onChange={e => set("employee_count", Number(e.target.value))} className="h-9 text-sm" />
          <Input type="number" placeholder="Est. value ($)" value={form.estimated_value || ""} onChange={e => set("estimated_value", Number(e.target.value))} className="h-9 text-sm" />
        </div>
        <Input placeholder="Existing floor material" value={form.existing_material} onChange={e => set("existing_material", e.target.value)} className="h-9 text-sm" />
        <Input placeholder="Equipment used" value={form.equipment_used} onChange={e => set("equipment_used", e.target.value)} className="h-9 text-sm" />

        {/* Source selector */}
        <div>
          <label className="text-[10px] text-muted-foreground font-medium mb-1 block">Ingestion Source</label>
          <select value={form.ingestion_source} onChange={e => set("ingestion_source", e.target.value)} className="w-full h-9 text-sm glass-input rounded-lg px-2 text-foreground bg-transparent">
            <option value="Manual">Manual</option>
            <option value="ChatGPT">ChatGPT</option>
            <option value="Attachment">Attachment</option>
            <option value="Google Drive">Google Drive</option>
            <option value="Supabase">Supabase</option>
          </select>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button size="sm" className="flex-1" onClick={create}>Create Lead</Button>
        </div>
      </div>
    </div>
  );
}