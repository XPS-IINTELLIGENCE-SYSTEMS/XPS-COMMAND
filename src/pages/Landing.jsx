import { ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import LandingNav from "../components/landing/LandingNav";

const stats = [
  { value: "60+", label: "LOCATIONS" },
  { value: "200+", label: "XTREME TEAM" },
  { value: "50K+", label: "LEADS MANAGED" },
  { value: "$120M+", label: "REVENUE TRACKED" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNav />

      {/* Hero */}
      <div className="flex flex-col items-center text-center px-6 pt-14 md:pt-24 pb-16">
        <div className="shimmer-card inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-8">
          <ShieldCheck className="w-3.5 h-3.5 metallic-gold-icon animate-pulse shimmer-icon" />
          <span className="text-xs font-medium xps-silver-subtle-gold">AI-Powered Xtreme Intelligence System</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-none max-w-4xl transition-all duration-500 hover:scale-105" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          <span className="xps-gold-slow-shimmer">XPS INTELLIGENCE</span>
        </h1>
        <div className="text-sm md:text-lg tracking-[0.35em] font-semibold text-white/90 mt-2 transition-all duration-500 hover:scale-105">CONTRACTOR ASSIST</div>

        <p className="mt-6 text-sm md:text-base text-foreground max-w-2xl leading-relaxed transition-all duration-500 hover:scale-[1.02]">
          XPS Intelligence — Contractor Assist empowers 60+ locations and 200+ xtreme
          professionals with AI-driven CRM, lead intelligence, proposal automation,
          and competitive insights — built for the polishing industry.
        </p>

        <div className="flex items-center gap-4 mt-10">
          <Link
            to="/signin"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg metallic-gold-bg text-background font-semibold hover:brightness-110 transition-all duration-300 hover:scale-110"
          >
            See It In Action <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 mt-20">
          {stats.map((s) => (
            <div key={s.label} className="shimmer-card text-center cursor-default p-3 rounded-xl">
              <div className="text-2xl md:text-3xl font-bold metallic-gold shimmer-icon">{s.value}</div>
              <div className="text-[10px] md:text-xs text-muted-foreground tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}