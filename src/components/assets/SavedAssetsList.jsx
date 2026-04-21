import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Database, Star, Trash2, ExternalLink, Code, Clock, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const TYPE_COLORS = {
  ui_component: "bg-blue-500/20 text-blue-400",
  site_clone: "bg-green-500/20 text-green-400",
  shadow_scrape: "bg-red-500/20 text-red-400",
  key_harvest: "bg-amber-500/20 text-amber-400",
  algorithm_extract: "bg-purple-500/20 text-purple-400",
  template: "bg-cyan-500/20 text-cyan-400",
  custom: "bg-gray-500/20 text-gray-400",
};

export default function SavedAssetsList({ filterType, onSelect, compact }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAssets(); }, [filterType]);

  const loadAssets = async () => {
    setLoading(true);
    const filter = filterType ? { asset_type: filterType } : {};
    const items = await base44.entities.GeneratedAsset.filter(filter, "-created_date", 50);
    setAssets(items);
    setLoading(false);
  };

  const toggleFavorite = async (asset) => {
    await base44.entities.GeneratedAsset.update(asset.id, { is_favorite: !asset.is_favorite });
    loadAssets();
  };

  const deleteAsset = async (id) => {
    await base44.entities.GeneratedAsset.delete(id);
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  if (loading) return <div className="flex items-center justify-center py-6"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>;

  if (assets.length === 0) return (
    <div className="text-center py-6 text-xs text-muted-foreground">
      <Database className="w-5 h-5 mx-auto mb-2 opacity-40" />
      No saved assets yet. Generate something to see it here.
    </div>
  );

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 px-1 mb-2">
        <Database className="w-3.5 h-3.5 text-primary" />
        <span className="text-[11px] font-bold text-foreground">Saved Assets</span>
        <Badge variant="secondary" className="text-[8px]">{assets.length}</Badge>
      </div>
      <div className={`space-y-1 ${compact ? "max-h-48" : "max-h-80"} overflow-y-auto`}>
        {assets.map(asset => (
          <div key={asset.id}
            className="flex items-center gap-2 p-2 rounded-lg glass-card hover:border-primary/20 transition-all cursor-pointer group"
            onClick={() => onSelect?.(asset)}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <Badge className={`text-[8px] border-0 ${TYPE_COLORS[asset.asset_type] || TYPE_COLORS.custom}`}>
                  {asset.asset_type?.replace(/_/g, " ")}
                </Badge>
                {asset.is_favorite && <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />}
              </div>
              <p className="text-[11px] font-medium text-foreground truncate mt-0.5">{asset.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {new Date(asset.created_date).toLocaleDateString()}
                </span>
                {asset.source_tool && <span className="text-[9px] text-muted-foreground">{asset.source_tool}</span>}
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={(e) => { e.stopPropagation(); toggleFavorite(asset); }}
                className="p-1 rounded hover:bg-secondary">
                <Star className={`w-3 h-3 ${asset.is_favorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); deleteAsset(asset.id); }}
                className="p-1 rounded hover:bg-red-500/20">
                <Trash2 className="w-3 h-3 text-red-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}