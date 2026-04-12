import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HexGlow from "../components/HexGlow";
import { base44 } from "@/api/base44Client";

const stats = [
  { value: "60+", label: "LOCATIONS" },
  { value: "200+", label: "XTREME TEAM" },
  { value: "50K+", label: "LEADS" },
  { value: "24/7", label: "AI SUPPORT" },
];

export default function SignIn() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to Base44 auth immediately
    base44.auth.redirectToLogin("/dashboard");
  }, []);

  return (
    <div className="hex-bg min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-0">
        <HexGlow />
      </div>

      <div className="relative z-[1] w-full max-w-md mx-auto px-6">
        {/* Glassmorphic Card */}
        <div className="shimmer-card rounded-2xl border border-[#8a8a8a]/25 bg-card/40 backdrop-blur-xl p-8 md:p-10 flex flex-col items-center text-center shadow-2xl shadow-black/40">
          <img
            src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg"
            alt="XPS"
            className="w-20 h-20 object-contain mb-6"
          />
          <h1 className="text-2xl md:text-3xl font-extrabold xps-gold-slow-shimmer tracking-wider" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            XPS INTELLIGENCE
          </h1>
          <p className="text-xs font-semibold metallic-silver tracking-widest mt-1 mb-4">
            XTREME POLISHING SYSTEMS
          </p>
          <p className="text-sm text-white/70 leading-relaxed mb-6">
            Your AI-powered contractor command center.
            Dominate your territory — leads, proposals, and revenue on autopilot.
          </p>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-3 w-full mb-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-lg font-extrabold metallic-gold">{stat.value}</div>
                <div className="text-[9px] font-semibold text-white/40 tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Spinner */}
          <div className="mb-5">
            <div className="w-8 h-8 border-4 border-white/10 border-t-primary rounded-full animate-spin" />
          </div>
          <p className="text-xs text-white/50 mb-5">Redirecting to secure sign-in...</p>

          {/* Sign In Button */}
          <button
            onClick={() => base44.auth.redirectToLogin("/dashboard")}
            className="w-full px-6 py-3.5 rounded-xl metallic-silver-bg text-white text-sm font-bold tracking-wider hover:brightness-110 transition-all active:scale-[0.98] shadow-lg"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            SIGN IN TO COMMAND CENTER
          </button>
        </div>
      </div>
    </div>
  );
}