import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import PageHexGlow from "../components/PageHexGlow";
import { Loader2, LogIn, UserPlus, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const roles = [
  { id: "owner", label: "Owner" },
  { id: "admin", label: "Admin" },
  { id: "manager", label: "Manager" },
  { id: "team_member", label: "Team Member" },
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
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams(window.location.search);
    const isAuthCallback = params.get("from") === "auth";

    (async () => {
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
          // New user
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

  const handleSignIn = () => {
    if (!role) return;
    setLoading("signin");
    sessionStorage.setItem("xps-login-role", role);
    base44.auth.redirectToLogin("/signin?from=auth");
  };

  const handleSignUp = () => {
    if (!role) return;
    setLoading("signup");
    sessionStorage.setItem("xps-login-role", role);
    navigate("/register");
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

        {/* Sign In Card */}
        <div className="glass-card rounded-2xl p-8 animated-silver-border">
          <h2 className="text-lg font-bold text-foreground mb-1">Welcome</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Select your role to get started
          </p>

          {/* Role Dropdown */}
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-full h-12 text-base bg-secondary border-border">
              <SelectValue placeholder="Select your role..." />
            </SelectTrigger>
            <SelectContent>
              {roles.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Buttons */}
          <div className="flex flex-col gap-3 mt-6">
            <button
              onClick={handleSignIn}
              disabled={!role || loading !== null}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-base metallic-gold-bg text-background hover:brightness-110 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading === "signin" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <LogIn className="w-5 h-5" />
              )}
              {loading === "signin" ? "Redirecting..." : "Sign In"}
            </button>

            <button
              onClick={handleSignUp}
              disabled={!role || loading !== null}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-base border border-border text-foreground hover:bg-secondary transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading === "signup" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <UserPlus className="w-5 h-5" />
              )}
              {loading === "signup" ? "Redirecting..." : "Sign Up"}
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground mt-6">
            Contact your administrator for access.
          </p>
        </div>

        <p className="text-[10px] text-muted-foreground/40 mt-8 tracking-wider">
          XTREME POLISHING SYSTEMS &bull; PROPRIETARY &amp; CONFIDENTIAL
        </p>
      </div>
    </div>
  );
}