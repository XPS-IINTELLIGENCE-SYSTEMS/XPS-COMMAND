import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import PageHexGlow from "../components/PageHexGlow";
import { LogIn, Loader2 } from "lucide-react";

/**
 * Determines the dashboard route based on the user's profile title
 * and Base44 role. Supports: owner, manager, admin, team member.
 */
function getDashboardRoute(profile, user) {
  const title = (profile?.title || "").toLowerCase();
  // Check profile title first
  if (title.includes("owner")) return "/owner";
  if (title.includes("manager")) return "/manager";
  if (title.includes("admin")) return "/admin";
  // Fall back to Base44 role
  if (user?.role === "admin") return "/owner";
  // Default — team member
  return "/dashboard";
}

export default function CustomLogin() {
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        if (!authed) {
          if (!cancelled) setCheckingAuth(false);
          return;
        }

        // User is already authenticated — find their profile and route them
        const user = await base44.auth.me();

        let profiles = [];
        try {
          profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
          if (profiles.length === 0) {
            // Fallback: match by created_by
            const allProfiles = await base44.entities.UserProfile.list();
            profiles = allProfiles.filter(
              (p) => p.user_email === user.email || p.created_by === user.email
            );
          }
        } catch {
          // Entity access might fail for new users
        }

        if (cancelled) return;

        if (profiles.length > 0) {
          // Existing user — send straight to their dashboard
          const route = getDashboardRoute(profiles[0], user);
          navigate(route, { replace: true });
        } else {
          // Authenticated but no profile — needs onboarding
          navigate("/onboarding", { replace: true });
        }
      } catch {
        if (!cancelled) setCheckingAuth(false);
      }
    })();

    return () => { cancelled = true; };
  }, [navigate]);

  const handleSignIn = () => {
    setLoading(true);
    base44.auth.redirectToLogin("/custom-login");
  };

  // Loading while checking auth
  if (checkingAuth) {
    return (
      <div className="hex-bg min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <p className="text-xs text-muted-foreground">Verifying credentials...</p>
      </div>
    );
  }

  // Sign-in view — shown only to unauthenticated users
  return (
    <div className="hex-bg min-h-screen bg-background text-foreground relative flex items-center justify-center px-4">
      <PageHexGlow />

      <div className="relative z-[1] w-full max-w-sm text-center">
        {/* Brand */}
        <img
          src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg"
          alt="XPS"
          className="w-24 h-24 mx-auto mb-6 object-contain drop-shadow-lg"
        />
        <h1
          className="text-3xl font-black metallic-gold-silver-text tracking-widest mb-1"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          XPS INTELLIGENCE
        </h1>
        <p className="text-xs text-muted-foreground tracking-[0.25em] uppercase mb-10">
          Contractor Command Platform
        </p>

        {/* Sign In Card */}
        <div className="glass-card rounded-2xl p-8 animated-silver-border">
          <h2 className="text-lg font-bold text-foreground mb-2">Welcome</h2>
          <p className="text-sm text-muted-foreground mb-8">
            Sign in to access your dashboard
          </p>

          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-base metallic-gold-bg text-background hover:brightness-110 transition-all duration-300"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            {loading ? "Redirecting..." : "Sign In"}
          </button>

          <p className="text-[11px] text-muted-foreground mt-6">
            Authorized personnel only. Contact your administrator for access.
          </p>
        </div>

        <p className="text-[10px] text-muted-foreground/40 mt-8 tracking-wider">
          XTREME POLISHING SYSTEMS &bull; PROPRIETARY &amp; CONFIDENTIAL
        </p>
      </div>
    </div>
  );
}