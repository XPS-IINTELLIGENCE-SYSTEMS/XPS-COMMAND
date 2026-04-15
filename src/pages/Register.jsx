import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import PageHexGlow from "../components/PageHexGlow";
import { Loader2, ArrowLeft, UserPlus } from "lucide-react";

export default function Register() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const role = sessionStorage.getItem("xps-login-role") || "";

  const roleLabel = {
    owner: "Owner",
    admin: "Admin",
    manager: "Manager",
    team_member: "Team Member",
  }[role] || "Team Member";

  const handleCreateAccount = () => {
    setLoading(true);
    base44.auth.redirectToLogin("/signin?from=auth");
  };

  return (
    <div className="hex-bg min-h-screen bg-background text-foreground relative flex items-center justify-center px-4 py-12">
      <PageHexGlow />

      <div className="relative z-[1] w-full max-w-sm text-center">
        {/* Brand */}
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
        <p className="text-xs text-muted-foreground tracking-[0.25em] uppercase mb-10">
          Contractor Command Platform
        </p>

        <div className="glass-card rounded-2xl p-8 animated-silver-border">
          <h2 className="text-lg font-bold text-foreground mb-1">Create Account</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Signing up as <span className="text-primary font-semibold">{roleLabel}</span>
          </p>

          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            You'll create your account and then complete a quick onboarding to personalize your XPS experience.
          </p>

          <button
            onClick={handleCreateAccount}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-base metallic-gold-bg text-background hover:brightness-110 transition-all duration-300 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <UserPlus className="w-5 h-5" />
            )}
            {loading ? "Redirecting..." : "Create Account"}
          </button>

          <button
            onClick={() => navigate("/signin")}
            className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </button>
        </div>

        <p className="text-[10px] text-muted-foreground/40 mt-8 tracking-wider">
          XTREME POLISHING SYSTEMS &bull; PROPRIETARY &amp; CONFIDENTIAL
        </p>
      </div>
    </div>
  );
}