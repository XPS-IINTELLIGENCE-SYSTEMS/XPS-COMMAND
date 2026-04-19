import { useState, useRef } from "react";
import { Camera, Loader2, X, Image } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ZonePhotoUploader({ zoneName, existingPhotos, onPhotosChange }) {
  const [photos, setPhotos] = useState(existingPhotos || []);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);

    const newPhotos = [...photos];
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      newPhotos.push({ url: file_url, timestamp: new Date().toISOString(), name: file.name });
    }
    setPhotos(newPhotos);
    onPhotosChange(newPhotos);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const removePhoto = (idx) => {
    const updated = photos.filter((_, i) => i !== idx);
    setPhotos(updated);
    onPhotosChange(updated);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-white/60">{zoneName} Photos</span>
        <span className="text-[10px] text-white/30">{photos.length} uploaded</span>
      </div>

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {photos.map((photo, i) => (
            <div key={i} className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-white/10">
              <img src={photo.url} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => removePhoto(i)}
                className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/70 flex items-center justify-center"
              >
                <X className="w-2.5 h-2.5 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-white/15 text-xs text-white/50 hover:border-primary/30 hover:text-primary/70 transition-all w-full justify-center"
      >
        {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
        {uploading ? "Uploading…" : "Add Photo"}
      </button>
      <input ref={inputRef} type="file" accept="image/*" multiple capture="environment" className="hidden" onChange={handleUpload} />
    </div>
  );
}