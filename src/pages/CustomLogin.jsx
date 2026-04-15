import { useState } from "react";
import { base44 } from "@/api/base44Client";
import PageHexGlow from "../components/PageHexGlow";
import { LogIn, Loader2, Shield } from "lucide-react";

export default function CustomLogin() {
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    base44.auth.redirectToLogin("/onboarding");
  };

  return (
    <div className="hex-bg min-h-screen bg-background text-foreground relative flex items-center justify-center px-4">
      <PageHexGlow />

      <div className="relative z-[1] w-full max-w-sm text-center">
        {/* Logo */}
        <img
          src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg"
          alt="XPS"
          className="w-24 h-24 mx-auto mb-6 object-contain drop-shadow-lg"
        />

        {/* Title */}
        <h1
          className="text-4xl font-black metallic-gold-silver-text tracking-widest mb-1"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          XPS
        </h1>
        <p className="text-sm text-muted-foreground tracking-[0.3em] uppercase mb-10">
          Intelligence Platform
        </p>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8 animated-silver-border">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-primary/70" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              Secure Access
            </span>
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            Sign in to access the XPS command center, intelligence tools, and live dashboards.
          </p>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl metallic-gold-bg text-background font-bold text-base hover:brightness-110 transition-all duration-300 disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            {loading ? "Redirecting..." : "Sign In"}
          </button>
        </div>

        {/* Footer */}
        <p className="text-[10px] text-muted-foreground/40 mt-8 tracking-wider">
          XTREME POLISHING SYSTEMS &bull; PROPRIETARY &amp; CONFIDENTIAL
        </p>
      </div>
    </div>
  );
}