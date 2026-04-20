import { useState, useEffect } from "react";
import { List, Plus, X, ExternalLink, GripVertical } from "lucide-react";

export default function QuickLinksWidget({ links, onChange }) {
  const [items, setItems] = useState(links || []);
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");

  useEffect(() => { setItems(links || []); }, [links]);

  const save = (updated) => {
    setItems(updated);
    onChange(updated);
  };

  const addLink = () => {
    if (!newLabel.trim() || !newUrl.trim()) return;
    const url = newUrl.startsWith("http") ? newUrl : `https://${newUrl}`;
    save([...items, { label: newLabel.trim(), url }]);
    setNewLabel("");
    setNewUrl("");
    setAdding(false);
  };

  const removeLink = (idx) => save(items.filter((_, i) => i !== idx));

  return (
    <div className="glass-card rounded-xl p-3">
      <div className="flex items-center gap-2 mb-2">
        <List className="w-3.5 h-3.5 metallic-gold-icon" />
        <span className="text-[11px] font-bold metallic-gold">Quick Links</span>
        <button onClick={() => setAdding(!adding)} className="ml-auto p-1 rounded hover:bg-white/10">
          <Plus className="w-3 h-3 text-muted-foreground" />
        </button>
      </div>

      {adding && (
        <div className="flex flex-col gap-1.5 mb-2 p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          <input
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            placeholder="Link label..."
            className="text-[11px] bg-transparent border-b border-border outline-none text-foreground pb-0.5 placeholder:text-muted-foreground/40"
            autoFocus
          />
          <input
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
            placeholder="https://..."
            className="text-[11px] bg-transparent border-b border-border outline-none text-foreground pb-0.5 placeholder:text-muted-foreground/40"
            onKeyDown={e => e.key === "Enter" && addLink()}
          />
          <div className="flex gap-2 pt-1">
            <button onClick={addLink} className="text-[10px] text-primary font-medium">Add</button>
            <button onClick={() => setAdding(false)} className="text-[10px] text-muted-foreground">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-1">
        {items.length === 0 && !adding && (
          <p className="text-[10px] text-muted-foreground py-2 text-center">No links yet — tap + to add</p>
        )}
        {items.map((link, i) => (
          <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] group">
            <ExternalLink className="w-3 h-3 text-primary flex-shrink-0" />
            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-foreground hover:text-primary flex-1 truncate">
              {link.label}
            </a>
            <button onClick={() => removeLink(i)} className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/20">
              <X className="w-2.5 h-2.5 text-red-400" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}