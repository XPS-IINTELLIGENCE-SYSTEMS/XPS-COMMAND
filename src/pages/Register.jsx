import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import PageHexGlow from "../components/PageHexGlow";
import { Loader2, ArrowLeft } from "lucide-react";

export default function Register() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateAccount = () => {
    setLoading(true);
    base44.auth.redirectToLogin("/onboarding");
  };

  return (
    <div className="hex-bg min-h-screen bg-background text-foreground relative flex items-center justify-center px-4 py-12">
      <PageHexGlow />

      <div className="relative z-[1] w-full max-w-sm text-center">
        <img
          src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg"
          alt="XPS"
          className="w-20 h-20 mx-auto mb-5 object-contain drop-shadow-lg"
        />
        <h1
          className="text-2xl md:text-3xl font-black metallic-gold-silver-text tracking-widest mb-1"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          XPS INTELLIGENCE
        </h1>
        <p className="text-xs text-muted-foreground tracking-[0.2em] uppercase mb-10">
          Contractor Command Platform
        </p>

        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-lg font-bold text-foreground mb-2">Create Your Account</h2>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            Sign up to get started. You'll complete a quick setup to personalize your experience.
          </p>

          <button
            onClick={handleCreateAccount}
            disabled={loading}
            className="w-full sign-in-pill rounded-full px-6 py-3.5 font-semibold text-white text-sm transition-all duration-300 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Redirecting...
              </span>
            ) : (
              "Sign Up"
            )}
          </button>

          <button
            onClick={() => navigate("/signin")}
            className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Already have an account? Sign In
          </button>
        </div>

        <p className="text-[10px] text-muted-foreground/40 mt-8 tracking-wider">
          XTREME POLISHING SYSTEMS &bull; PROPRIETARY &amp; CONFIDENTIAL
        </p>
      </div>
    </div>
  );
}