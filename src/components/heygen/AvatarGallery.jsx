import { useState } from "react";
import { User, Star, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function AvatarGallery({ avatars, savedAvatars, selectedAvatar, onSelect, loading }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const stockAvatars = avatars?.data?.avatars || avatars?.data || [];
  const allAvatars = [
    ...savedAvatars.map(a => ({ ...a, _saved: true, avatar_id: a.avatar_id, preview_image_url: a.preview_url, avatar_name: a.avatar_name })),
    ...stockAvatars.map(a => ({ ...a, _saved: false })),
  ];

  const filtered = allAvatars.filter(a => {
    const name = (a.avatar_name || a.avatar_id || "").toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase());
    const matchFilter = filter === "all" || (filter === "saved" && a._saved) || (filter === "stock" && !a._saved) || (filter === "male" && a.gender === "male") || (filter === "female" && a.gender === "female");
    return matchSearch && matchFilter;
  });

  if (loading) return (
    <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
  );

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search avatars..." className="pl-8 h-8 text-xs" />
        </div>
        {["all", "saved", "stock", "male", "female"].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-2.5 py-1 rounded-md text-[9px] font-medium transition-all ${filter === f ? 'bg-primary/10 text-primary border border-primary/30' : 'text-muted-foreground hover:text-foreground border border-border/50'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-[340px] overflow-y-auto">
        {filtered.map((avatar, i) => {
          const id = avatar.avatar_id || avatar.id || i;
          const isSelected = selectedAvatar === id;
          const imgUrl = avatar.preview_image_url || avatar.preview_url || "";
          return (
            <button
              key={id}
              onClick={() => onSelect(avatar)}
              className={`relative group rounded-xl overflow-hidden border-2 transition-all aspect-[3/4] ${isSelected ? 'border-primary shadow-lg shadow-primary/20 scale-105' : 'border-border/30 hover:border-primary/40 hover:scale-102'}`}
            >
              {imgUrl ? (
                <img src={imgUrl} alt={avatar.avatar_name || id} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-secondary flex items-center justify-center"><User className="w-6 h-6 text-muted-foreground" /></div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5">
                <p className="text-[8px] text-white font-medium truncate">{avatar.avatar_name || id}</p>
              </div>
              {avatar._saved && (
                <div className="absolute top-1 right-1"><Star className="w-3 h-3 text-primary fill-primary" /></div>
              )}
              {isSelected && <div className="absolute inset-0 bg-primary/10 ring-2 ring-primary rounded-xl" />}
            </button>
          );
        })}
        {filtered.length === 0 && <div className="col-span-full text-center py-8 text-xs text-muted-foreground">No avatars found</div>}
      </div>
    </div>
  );
}