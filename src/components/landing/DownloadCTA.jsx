import { Link } from "react-router-dom";

export default function DownloadCTA() {
  return (
    <Link
      to="/custom-login"
      className="download-cta-btn block w-full rounded-xl px-5 py-4 text-center animated-silver-border transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
      style={{
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <div className="text-base font-extrabold xps-gold-slow-shimmer tracking-wider leading-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
        XPS INTELLIGENCE
      </div>
      <div className="text-xs font-bold metallic-silver tracking-widest mt-0.5">
        CONTRACTOR ASSIST
      </div>
      <div className="mt-2 mb-1">
        <span className="download-flash text-lg font-black tracking-wider text-white">
          DOWNLOAD NOW
        </span>
      </div>
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-0.5 text-[10px] font-semibold xps-gold-slow-shimmer tracking-wide">
        <span>Get Live Leads</span>
        <span>·</span>
        <span>Insider Knowledge</span>
        <span>·</span>
        <span>AI Insight &amp; Recommendations</span>
      </div>
    </Link>
  );
}