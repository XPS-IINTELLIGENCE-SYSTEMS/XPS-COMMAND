import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const CATEGORIES = ["GC Bid List Intro", "Contractor Intro", "Epoxy Company Intro", "Follow-Up", "Sales", "Proposal", "Thank You", "Custom"];
const TONES = ["Professional", "Casual", "Urgent", "Friendly", "Formal"];

export default function NewTemplateModal({ onClose, onSave }) {
  const [data, setData] = useState({
    name: "",
    subject: "",
    body: "",
    category: "Contractor Intro",
    tone: "Professional",
    channel: "Email",
    is_active: true,
    usage_count: 0,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!data.name || !data.body) return;
    setSaving(true);
    await base44.entities.MessageTemplate.create(data);
    setSaving(false);
    onSave?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass-panel rounded-2xl w-full max-w-lg p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black metallic-gold">New Email Template</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4" /></button>
        </div>

        <Input value={data.name} onChange={e => setData({...data, name: e.target.value})} placeholder="Template name" className="text-sm" />
        <Input value={data.subject} onChange={e => setData({...data, subject: e.target.value})} placeholder="Subject line" className="text-sm" />

        <div className="flex gap-2">
          <select value={data.category} onChange={e => setData({...data, category: e.target.value})} className="glass-input rounded-lg px-3 py-2 text-xs text-foreground flex-1">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={data.tone} onChange={e => setData({...data, tone: e.target.value})} className="glass-input rounded-lg px-3 py-2 text-xs text-foreground flex-1">
            {TONES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <Textarea
          value={data.body}
          onChange={e => setData({...data, body: e.target.value})}
          placeholder="Email body... Use {{contact_name}}, {{company}}, {{specialty}} as variables"
          className="text-sm min-h-[200px]"
        />

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !data.name || !data.body}>
            <Check className="w-3.5 h-3.5 mr-1" /> Save Template
          </Button>
        </div>
      </div>
    </div>
  );
}