import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import PageHexGlow from "../components/PageHexGlow";
import { Loader2 } from "lucide-react";
import GlobalNav from "../components/navigation/GlobalNav";

const stats = [
  { value: "60+", label: "LOCATIONS" },
  { value: "200+", label: "SALES STAFF" },
  { value: "50K+", label: "LEADS" },
  { value: "24/7", label: "AI SUPPORT" },
];

export default function SignInPortal() {
  const [loading, setLoading] = useState(false);

  const handleSignIn = () => {
    setLoading(true);
    // After Base44 auth completes, user returns to "/" which SmartRedirect
    // will route to the correct dashboard based on role/profile
    base44.auth.redirectToLogin("/redirect");
  };

  return (
    <div className="hex-bg min-h-screen bg-background text-foreground relative">
      <PageHexGlow />

      <div className="relative z-[1] min-h-screen flex flex-col">
        <GlobalNav />
        <div className="flex-1 flex flex-col md:flex-row">
        {/* Left panel — branding */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 md:py-0">
          <img
            src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg"
            alt="XPS"
            className="w-24 h-24 md:w-28 md:h-28 object-contain drop-shadow-lg mb-6"
          />
          <h1
            className="text-2xl md:text-4xl font-black tracking-wider text-center"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            <span className="metallic-gold-silver-text">XPS Intelligence</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground text-center mt-3 max-w-xs leading-relaxed">
            AI-Powered Sales Command Center for Xtreme Polishing Systems
          </p>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 mt-10 w-full max-w-[280px]">
            {stats.map((s) => (
              <div key={s.label} className="glass-card rounded-xl px-4 py-3 text-center">
                <div className="text-xl md:text-2xl font-extrabold metallic-gold">{s.value}</div>
                <div className="text-[10px] text-muted-foreground tracking-widest font-medium mt-0.5">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel — sign in form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 md:py-0 safe-bottom">
          <div className="w-full max-w-sm">
            <h2 className="text-2xl font-bold text-foreground mb-1">Welcome back</h2>
            <p className="text-sm text-muted-foreground mb-8">
              Sign in to your XPS Intelligence account
            </p>

            {/* Sign In Button */}
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-base metallic-gold-bg text-background hover:brightness-110 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>

            <p className="text-sm text-muted-foreground mt-6 text-center">
              Don't have an account?{" "}
              <Link to="/payment" className="text-primary hover:underline font-medium">
                Get Started
              </Link>
            </p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}