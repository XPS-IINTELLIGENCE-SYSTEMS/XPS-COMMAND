import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHexGlow from "../components/PageHexGlow";
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
    <div className="hex-bg min-h-screen bg-background flex items-center justify-center relative">
      <PageHexGlow />
      <div className="relative z-[1] flex flex-col items-center text-center px-6">
        <img
          src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg"
          alt="XPS"
          className="w-16 h-16 object-contain mb-6"
        />
        <h2 className="text-2xl font-bold metallic-gold tracking-wider">XPS Intelligence</h2>
        <p className="text-sm text-muted-foreground mt-3">Redirecting to sign in...</p>
        <div className="mt-6">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
        </div>
        <button
          onClick={() => base44.auth.redirectToLogin("/dashboard")}
          className="mt-8 px-6 py-3 rounded-xl metallic-gold-bg text-background text-sm font-bold hover:brightness-110 transition-all"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}