import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function OperatorSignIn() {
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = () => {
    base44.auth.redirectToLogin("/admin-panel");
  };

  return (
    <div className="h-[100dvh] w-screen flex items-center justify-center bg-background hex-bg">
      <div className="relative z-10 w-full max-w-sm mx-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-card border border-border flex items-center justify-center">
            <Lock className="w-8 h-8 metallic-gold-icon" />
          </div>
          <h1 className="text-xl font-extrabold xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>OPERATOR ACCESS</h1>
          <p className="text-xs text-muted-foreground mt-1">XPS Intelligence — Restricted Area</p>
        </div>

        <button
          onClick={handleSignIn}
          className="w-full py-3 rounded-xl metallic-gold-bg text-background text-sm font-bold hover:brightness-110 transition-all"
        >
          Sign In as Operator
        </button>

        <p className="text-center text-[10px] text-muted-foreground/40 mt-6">
          Authorized personnel only. All access is logged.
        </p>
      </div>
    </div>
  );
}