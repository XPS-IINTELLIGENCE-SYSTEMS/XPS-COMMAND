import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const stats = [
  { value: "60+", label: "LOCATIONS" },
  { value: "200+", label: "XTREME TEAM" },
  { value: "50K+", label: "LEADS" },
  { value: "24/7", label: "AI SUPPORT" },
];

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = (e) => {
    e.preventDefault();
    // No auth required — just go to onboarding
    navigate("/onboarding");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center px-12">
        <img
          src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg"
          alt="XPS"
          className="w-20 h-20 object-contain mb-6"
        />
        <h2 className="text-3xl font-bold metallic-gold tracking-wider text-center">XPS Xpress</h2>
        <p className="text-sm text-muted-foreground mt-2 text-center max-w-xs">
          Contractor Assist — AI-Powered Sales Command Center
        </p>
        <div className="grid grid-cols-2 gap-3 mt-10 w-full max-w-xs">
          {stats.map((s) => (
            <div key={s.label} className="border border-border rounded-xl p-4 text-center">
              <div className="text-xl font-bold metallic-gold">{s.value}</div>
              <div className="text-[10px] text-muted-foreground tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - Sign In */}
      <div className="flex-1 flex items-center justify-center px-6 md:px-16">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your XPS Intelligence account</p>

          <form onSubmit={handleSignIn} className="mt-8 space-y-5">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Email</label>
              <Input
                type="email"
                placeholder="you@xpsxpress.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-right mt-2">
                <span className="text-xs text-primary cursor-pointer hover:underline">Forgot password?</span>
              </div>
            </div>

            <Button type="submit" className="w-full h-11 metallic-gold-bg text-background font-semibold text-sm hover:brightness-110">
              Sign In
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            Don't have an account?{" "}
            <span onClick={() => navigate("/onboarding")} className="text-primary cursor-pointer hover:underline">Sign up</span>
          </p>
        </div>
      </div>
    </div>
  );
}