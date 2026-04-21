import { Folder, FileText, Table2, Presentation, Image, FileType, Video, Link2, Briefcase } from "lucide-react";

const TYPE_CONFIG = {
  folder:       { icon: Folder, color: "#d4af37", bg: "#d4af3720" },
  document:     { icon: FileText, color: "#6366f1", bg: "#6366f120" },
  spreadsheet:  { icon: Table2, color: "#22c55e", bg: "#22c55e20" },
  presentation: { icon: Presentation, color: "#f59e0b", bg: "#f59e0b20" },
  image:        { icon: Image, color: "#ec4899", bg: "#ec489920" },
  pdf:          { icon: FileType, color: "#ef4444", bg: "#ef444420" },
  video:        { icon: Video, color: "#8b5cf6", bg: "#8b5cf620" },
  link:         { icon: Link2, color: "#06b6d4", bg: "#06b6d420" },
  workspace:    { icon: Briefcase, color: "#d4af37", bg: "#d4af3720" },
};

export default function DriveItemIcon({ type, size = "md", folderColor }) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.document;
  const Icon = cfg.icon;
  const s = size === "lg" ? "w-12 h-12" : size === "sm" ? "w-6 h-6" : "w-9 h-9";
  const iconS = size === "lg" ? "w-6 h-6" : size === "sm" ? "w-3.5 h-3.5" : "w-4.5 h-4.5";
  const color = type === "folder" && folderColor ? folderColor : cfg.color;
  const bg = type === "folder" && folderColor ? folderColor + "20" : cfg.bg;

  return (
    <div className={`${s} rounded-xl flex items-center justify-center flex-shrink-0`} style={{ backgroundColor: bg }}>
      <Icon className={iconS} style={{ color }} />
    </div>
  );
}