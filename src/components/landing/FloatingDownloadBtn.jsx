import { Link } from "react-router-dom";
import { Download } from "lucide-react";

export default function FloatingDownloadBtn() {
  return (
    <Link
      to="/payment"
      className="fixed bottom-6 right-4 z-50 md:hidden flex items-center gap-2 px-4 py-3 rounded-full animated-silver-border animate-slide-in-right"
      style={{
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <Download className="w-4 h-4 metallic-gold-icon" />
      <span className="download-flash text-sm font-black tracking-wider text-white">
        DOWNLOAD
      </span>
    </Link>
  );
}