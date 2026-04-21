import { useState, useRef } from "react";
import { Upload, X, Image, Loader2, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";

export default function PhotoUploader({ onAvatarCreated }) {
  const [photos, setPhotos] = useState([]);
  const [avatarName, setAvatarName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [status, setStatus] = useState("");
  const fileRef = useRef(null);

  const handleFiles = async (files) => {
    setUploading(true);
    const newPhotos = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      newPhotos.push({ url: file_url, name: file.name, preview: URL.createObjectURL(file) });
    }
    setPhotos(prev => [...prev, ...newPhotos]);
    setUploading(false);
  };

  const removePhoto = (idx) => setPhotos(prev => prev.filter((_, i) => i !== idx));

  const createAvatar = async () => {
    if (!photos.length || !avatarName.trim()) return;
    setCreating(true);
    setStatus("Uploading to HeyGen...");

    const res = await base44.functions.invoke("heygenAvatar", {
      action: "create_photo_avatar",
      image_url: photos[0].url,
      avatar_name: avatarName.trim(),
    });

    const avatarData = res.data;
    const avatarId = avatarData?.data?.avatar_id || avatarData?.data?.id || null;

    setStatus(avatarId ? "Saving avatar..." : "Avatar queued — may take a few minutes");

    // Save to entity
    await base44.entities.HeyGenAvatar.create({
      avatar_name: avatarName.trim(),
      avatar_id: avatarId || `pending_${Date.now()}`,
      avatar_type: "photo",
      source: "uploaded",
      preview_url: photos[0].url,
      photo_urls: JSON.stringify(photos.map(p => p.url)),
      status: avatarId ? "ready" : "creating",
      metadata: JSON.stringify(avatarData),
    });

    setCreating(false);
    setStatus("");
    setPhotos([]);
    setAvatarName("");
    onAvatarCreated?.();
  };

  return (
    <div className="glass-card rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <User className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">Create Custom Avatar</h3>
          <p className="text-[10px] text-muted-foreground">Upload photos to create a lifelike AI avatar</p>
        </div>
      </div>

      {/* Name */}
      <Input value={avatarName} onChange={e => setAvatarName(e.target.value)} placeholder="Avatar name (e.g. 'Sales Rep James')" className="h-9 text-xs" />

      {/* Upload zone */}
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        className="border-2 border-dashed border-border/50 hover:border-primary/40 rounded-xl p-6 text-center cursor-pointer transition-all group"
      >
        {uploading ? (
          <Loader2 className="w-8 h-8 mx-auto text-primary animate-spin" />
        ) : (
          <>
            <Upload className="w-8 h-8 mx-auto text-muted-foreground group-hover:text-primary transition-colors mb-2" />
            <p className="text-xs text-muted-foreground">Drop photos here or click to upload</p>
            <p className="text-[9px] text-muted-foreground/60 mt-1">Best results: clear face, good lighting, front-facing</p>
          </>
        )}
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
      </div>

      {/* Photo preview grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {photos.map((p, i) => (
            <div key={i} className="relative group rounded-lg overflow-hidden aspect-square border border-border/50">
              <img src={p.preview || p.url} alt={p.name} className="w-full h-full object-cover" />
              <button onClick={() => removePhoto(i)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="w-3 h-3 text-white" />
              </button>
              {i === 0 && <div className="absolute bottom-0 inset-x-0 bg-primary/80 text-[7px] text-center text-primary-foreground py-0.5 font-bold">PRIMARY</div>}
            </div>
          ))}
        </div>
      )}

      {status && <p className="text-[10px] text-primary animate-pulse">{status}</p>}

      <Button onClick={createAvatar} disabled={creating || !photos.length || !avatarName.trim()} className="w-full metallic-gold-bg text-background font-bold">
        {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
        {creating ? "Creating Avatar..." : "Generate Lifelike Avatar"}
      </Button>
    </div>
  );
}