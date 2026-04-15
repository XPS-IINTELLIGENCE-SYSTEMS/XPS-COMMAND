import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import PageHexGlow from "../components/PageHexGlow";
import { Loader2, ArrowLeft, UserPlus, Crown, Shield, Users, Briefcase, User } from "lucide-react";

const ROLES = [
  { id: "user", label: "User", desc: "Standard access to the platform", icon: User },
  { id: "team_member", label: "Team Member", desc: "Collaborate with your team on projects", icon: Users },
  { id: "manager", label: "Manager", desc: "Manage teams and oversee operations", icon: Briefcase },
  { id: "admin", label: "Admin", desc: "Full system administration access", icon: Shield },
  { id: "owner", label: "Owner", desc: "Executive access with full control", icon: Crown },
];

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();

  const handleCreateAccount = () => {
    if (!selectedRole) return;
    sessionStorage.setItem("xps-login-role", selectedRole);
    setLoading(true);
    base44.auth.redirectToLogin("/onboarding");
  };

  return (
    <div className="hex-bg min-h-screen bg-background text-foreground relative flex items-center justify-center px-4 py-12">
      <PageHexGlow />

      <div className="relative z-[1] w-full max-w-md text-center">
        {/* Brand */}
        <img
          src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg"
          alt="XPS"
          className="w-16 h-16 mx-auto mb-4 object-contain drop-shadow-lg"
        />
        <h1
          className="text-xl md:text-2xl font-black metallic-gold-silver-text tracking-widest mb-1"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          JOIN XPS INTELLIGENCE
        </h1>
        <p className="text-xs text-muted-foreground tracking-[0.2em] uppercase mb-8">
          Select your role to get started
        </p>

        {/* Role Selection */}
        <div className="space-y-2.5 mb-6">
          {ROLES.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl text-left transition-all duration-300 ${
                  isSelected
                    ? "glass-card-active border border-primary/30 scale-[1.02]"
                    : "glass-card hover:scale-[1.01]"
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isSelected ? "metallic-gold-bg" : "bg-secondary"
                }`}>
                  <Icon className={`w-5 h-5 ${isSelected ? "text-background" : "text-muted-foreground"}`} />
                </div>
                <div className="min-w-0">
                  <div className={`text-sm font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>
                    {role.label}
                  </div>
                  <div className="text-xs text-muted-foreground leading-snug">{role.desc}</div>
                </div>
                {isSelected && (
                  <div className="ml-auto w-2.5 h-2.5 rounded-full metallic-gold-bg flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Create Account */}
        <button
          onClick={handleCreateAccount}
          disabled={loading || !selectedRole}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-base metallic-gold-bg text-background hover:brightness-110 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
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
          Already have an account? Sign In
        </button>

        <p className="text-[10px] text-muted-foreground/40 mt-8 tracking-wider">
          XTREME POLISHING SYSTEMS &bull; PROPRIETARY &amp; CONFIDENTIAL
        </p>
      </div>
    </div>
  );
}