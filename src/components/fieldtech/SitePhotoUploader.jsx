import { useState } from "react";
import { Camera, X, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function SitePhotoUploader({ photos, onPhotosChange }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploading(true);

    const newPhotos = [];
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      newPhotos.push({
        url: file_url,
        name: file.name,
        date: new Date().toISOString()
      });
    }
    onPhotosChange([...photos, ...newPhotos]);
    setUploading(false);
    e.target.value = "";
  };

  const removePhoto = (idx) => {
    onPhotosChange(photos.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Camera className="w-4 h-4 text-blue-400" /> Site Photos
        </h3>
        <span className="text-xs text-white/40">{photos.length} photos</span>
      </div>

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo, i) => (
            <div key={i} className="relative rounded-lg overflow-hidden aspect-square group">
              <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
              <button onClick={() => removePhoto(i)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity">
                <X className="w-3 h-3 text-white" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1.5 py-0.5">
                <p className="text-[8px] text-white/60 truncate">{new Date(photo.date).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <label className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-white/10 hover:border-primary/30 active:bg-white/5 transition-colors cursor-pointer">
        {uploading
          ? <Loader2 className="w-5 h-5 text-primary animate-spin" />
          : <Camera className="w-5 h-5 text-white/30" />
        }
        <span className="text-xs text-white/40">{uploading ? "Uploading..." : "Tap to add photos"}</span>
        <input type="file" accept="image/*" multiple capture="environment" onChange={handleUpload} className="hidden" />
      </label>
    </div>
  );
}