import { useState, useRef } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

export default function BlueprintUploadSection({ onFileUploaded, isProcessing }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const inputRef = useRef(null);

  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
    setFileUrl(file_url);
    setUploading(false);
    onFileUploaded(file_url);
  };

  const clearFile = () => {
    setFile(null);
    setFileUrl(null);
    onFileUploaded(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-white/80">Upload Blueprint (PDF or Image)</label>
      {!file ? (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-white/15 rounded-xl p-8 text-center cursor-pointer hover:border-primary/40 hover:bg-white/[0.02] transition-all"
        >
          <Upload className="w-8 h-8 text-white/30 mx-auto mb-3" />
          <p className="text-sm text-white/50">Click to upload PDF site plan, floor plan, or image</p>
          <p className="text-xs text-white/30 mt-1">Supports PDF, PNG, JPG</p>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            className="hidden"
            onChange={handleFile}
          />
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
          <FileText className="w-5 h-5 text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{file.name}</p>
            <p className="text-xs text-white/40">{(file.size / 1024).toFixed(0)} KB</p>
          </div>
          {uploading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
          {fileUrl && !isProcessing && (
            <button onClick={clearFile} className="p-1 rounded hover:bg-white/10">
              <X className="w-4 h-4 text-white/40" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}