import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import PageHexGlow from "../components/PageHexGlow";
import { LogIn, Loader2, Shield, Crown, Users, Wrench } from "lucide-react";

const ROLES = [
  {
    id: "owner",
    label: "Owner",
    desc: "Full platform access, executive dashboards & strategy tools",
    Icon: Crown,
    route: "/owner",
  },
  {
    id: "manager",
    label: "Manager",
    desc: "Team oversight, pipeline management & performance tracking",
    Icon: Users,
    route: "/manager",
  },
  {
    id: "team",
    label: "Team Member",
    desc: "Day-to-day tools, leads, proposals & outreach",
    Icon: Wrench,
    route: "/dashboard",
  },
];

function routeForProfile(profile) {
  const t = (profile?.title || "").toLowerCase();
  if (t.includes("owner")) return "/owner";
  if (t.includes("manager")) return "/manager";
  return "/dashboard";
}

export default function CustomLogin() {
  const [selectedRole, setSelectedRole] = useState(null);
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

        // User is authenticated — check if they have a profile
        const user = await base44.auth.me();
        let profiles = [];
        try {
          profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
        } catch {
          // If entity access fails, still let them proceed
        }

        if (cancelled) return;

        if (profiles.length > 0) {
          // Returning user — send to their dashboard
          navigate(routeForProfile(profiles[0]), { replace: true });
        } else {
          // Authenticated but no profile — needs onboarding
          navigate("/onboarding", { replace: true });
        }
      } catch {
        // Any error — just show the login page
        if (!cancelled) setCheckingAuth(false);
      }
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  const handleSignIn = () => {
    if (!selectedRole) return;
    setLoading(true);
    // Store the selected role for onboarding pre-fill
    try { sessionStorage.setItem("xps-login-role", selectedRole); } catch {}
    // Redirect to Base44 auth — after login, user comes back to /custom-login
    // and the useEffect above will route them to onboarding or their dashboard
    base44.auth.redirectToLogin("/custom-login");
  };

  if (checkingAuth) {
    return (
      <div className="hex-bg min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="hex-bg min-h-screen bg-background text-foreground relative flex items-center justify-center px-4">
      <PageHexGlow />

      <div className="relative z-[1] w-full max-w-md text-center">
        {/* Logo */}
        <img
          src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg"
          alt="XPS"
          className="w-20 h-20 mx-auto mb-5 object-contain drop-shadow-lg"
        />
        <h1
          className="text-3xl font-black metallic-gold-silver-text tracking-widest mb-1"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          XPS INTELLIGENCE
        </h1>
        <p className="text-xs text-muted-foreground tracking-[0.25em] uppercase mb-8">
          Contractor Command Platform
        </p>

        {/* Role Selection Card */}
        <div className="glass-card rounded-2xl p-6 animated-silver-border text-left">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-primary/70" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
              Select Your Access Level
            </span>
          </div>

          <div className="space-y-2 mb-6">
            {ROLES.map((role) => {
              const RIcon = role.Icon;
              const active = selectedRole === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`shimmer-card w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left ${
                    active
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card/60 hover:border-primary/30"
                  }`}
                >
                  <div
                    className={`shimmer-icon-container w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      active ? "bg-primary/15" : "bg-secondary"
                    }`}
                  >
                    <RIcon
                      className={`w-5 h-5 shimmer-icon ${
                        active ? "metallic-gold-icon" : "metallic-silver-icon"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-bold ${active ? "text-primary" : "text-foreground"}`}>
                      {role.label}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                      {role.desc}
                    </p>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${
                      active ? "border-primary bg-primary" : "border-muted-foreground/30"
                    }`}
                  >
                    {active && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-background" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleSignIn}
            disabled={!selectedRole || loading}
            className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-base transition-all duration-300 ${
              selectedRole
                ? "metallic-gold-bg text-background hover:brightness-110"
                : "bg-secondary text-muted-foreground cursor-not-allowed"
            }`}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            {loading ? "Redirecting..." : "Sign In"}
          </button>
        </div>

        <p className="text-[10px] text-muted-foreground/40 mt-8 tracking-wider">
          XTREME POLISHING SYSTEMS &bull; PROPRIETARY &amp; CONFIDENTIAL
        </p>
      </div>
    </div>
  );
}