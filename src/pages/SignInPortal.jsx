import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import PageHexGlow from "../components/PageHexGlow";
import { Loader2, Crown, ShieldCheck, Users, UserCheck } from "lucide-react";

const roles = [
  {
    id: "owner",
    label: "Owner",
    desc: "Full platform access — analytics, agents, admin controls",
    Icon: Crown,
  },
  {
    id: "admin",
    label: "Admin",
    desc: "System configuration, user management, full access",
    Icon: ShieldCheck,
  },
  {
    id: "manager",
    label: "Manager",
    desc: "Team performance, pipeline management, analytics",
    Icon: Users,
  },
  {
    id: "team_member",
    label: "Team Member",
    desc: "CRM dashboard, leads, proposals, daily tools",
    Icon: UserCheck,
  },
];

function getDashboardRoute(profile, user) {
  const title = (profile?.title || "").toLowerCase();
  if (title.includes("owner")) return "/owner";
  if (title.includes("manager")) return "/manager";
  if (title.includes("admin")) return "/admin";
  if (user?.role === "admin") return "/owner";
  return "/dashboard";
}

export default function SignInPortal() {
  const [loading, setLoading] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams(window.location.search);
    const isAuthCallback = params.get("from") === "auth";

    (async () => {
      // Only auto-redirect if this is a callback after login
      if (!isAuthCallback) {
        if (!cancelled) setCheckingAuth(false);
        return;
      }

      try {
        const authed = await base44.auth.isAuthenticated();
        if (!authed) {
          if (!cancelled) setCheckingAuth(false);
          return;
        }

        const user = await base44.auth.me();
        let profiles = [];
        try {
          profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
          if (profiles.length === 0) {
            const allProfiles = await base44.entities.UserProfile.list();
            profiles = allProfiles.filter(
              (p) => p.user_email === user.email || p.created_by === user.email
            );
          }
        } catch {
          // New user — no profile access yet
        }

        if (cancelled) return;

        if (profiles.length > 0) {
          const route = getDashboardRoute(profiles[0], user);
          navigate(route, { replace: true });
        } else {
          navigate("/onboarding", { replace: true });
        }
      } catch {
        if (!cancelled) setCheckingAuth(false);
      }
    })();

    return () => { cancelled = true; };
  }, [navigate]);

  const handleRoleSignIn = (roleId) => {
    setLoading(roleId);
    sessionStorage.setItem("xps-login-role", roleId);
    base44.auth.redirectToLogin("/signin?from=auth");
  };

  if (checkingAuth) {
    return (
      <div className="hex-bg min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <p className="text-xs text-muted-foreground">Verifying credentials...</p>
      </div>
    );
  }

  return (
    <div className="hex-bg min-h-screen bg-background text-foreground relative flex items-center justify-center px-4 py-12">
      <PageHexGlow />

      <div className="relative z-[1] w-full max-w-md text-center">
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
        <p className="text-xs text-muted-foreground tracking-[0.25em] uppercase mb-8">
          Contractor Command Platform
        </p>

        {/* Role Selection */}
        <div className="glass-card rounded-2xl p-6 animated-silver-border">
          <h2 className="text-lg font-bold text-foreground mb-1">Welcome Back</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Select your role to sign in
          </p>

          <div className="grid grid-cols-1 gap-3">
            {roles.map((role) => {
              const RoleIcon = role.Icon;
              const isLoading = loading === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => handleRoleSignIn(role.id)}
                  disabled={loading !== null}
                  className="shimmer-card group relative w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all duration-300 disabled:opacity-50"
                >
                  <div className="shimmer-icon-container w-11 h-11 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    ) : (
                      <RoleIcon className="w-5 h-5 shimmer-icon metallic-silver-icon" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-foreground">
                      {role.label}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                      {role.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground/40 mt-8 tracking-wider">
          XTREME POLISHING SYSTEMS &bull; PROPRIETARY &amp; CONFIDENTIAL
        </p>
      </div>
    </div>
  );
}