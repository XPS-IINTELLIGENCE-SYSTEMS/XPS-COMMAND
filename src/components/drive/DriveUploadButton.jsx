import { Upload } from "lucide-react";

export default function DriveUploadButton({ onUpload }) {
  return (
    <label className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer glass-card hover:scale-[1.02] transition-all text-sm font-medium text-foreground">
      <Upload className="w-4 h-4 text-primary" />
      Upload
      <input type="file" className="hidden" onChange={onUpload} />
    </label>
  );
}