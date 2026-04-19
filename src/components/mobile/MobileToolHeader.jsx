import { ArrowLeft } from "lucide-react";

export default function MobileToolHeader({ title, onBack }) {
  return (
    <div
      className="lg:hidden sticky top-0 z-40 flex items-center gap-3 h-12 px-4 border-b"
      style={{
        background: "rgba(8, 10, 18, 0.92)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      <button
        onClick={onBack}
        className="p-2 -ml-2 rounded-lg active:bg-white/10 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 text-white/70" />
      </button>
      <span className="text-sm font-semibold text-white truncate">{title}</span>
    </div>
  );
}