import { ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import LandingNav from "../components/landing/LandingNav";
import PageHexGlow from "../components/PageHexGlow";

const stats = [
  { value: "60+", label: "LOCATIONS" },
  { value: "200+", label: "XTREME TEAM" },
  { value: "50K+", label: "LEADS MANAGED" },
  { value: "$120M+", label: "REVENUE TRACKED" },
];

export default function Landing() {
  return (
    <div className="hex-bg min-h-screen bg-background text-foreground relative">
      <PageHexGlow />
      <div className="relative z-[1]">
      <LandingNav />

      {/* Hero */}
      <div className="flex flex-col items-center text-center px-6 pt-16 md:pt-28 pb-20">
        <div className="shimmer-card inline-flex items-center gap-3 px-5 py-2 rounded-full border border-primary/30 bg-primary/5 mb-10">
          <ShieldCheck className="w-5 h-5 metallic-gold-icon animate-pulse shimmer-icon" />
          <span className="text-sm md:text-base font-semibold xps-silver-subtle-gold">AI-Powered Xtreme Intelligence System</span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold leading-none max-w-5xl transition-all duration-500 hover:scale-105" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          <span className="xps-gold-slow-shimmer">XPS INTELLIGENCE</span>
        </h1>
        <div className="text-base md:text-xl lg:text-2xl tracking-[0.35em] font-bold text-white mt-3 transition-all duration-500 hover:scale-105">CONTRACTOR ASSIST</div>

        <p className="mt-8 text-base md:text-lg text-white/90 max-w-3xl leading-relaxed transition-all duration-500 hover:scale-[1.02]">
          XPS Intelligence empowers 60+ locations and 200+ xtreme
          professionals with AI-driven CRM, lead intelligence, proposal automation,
          and competitive insights — built for the polishing industry.
        </p>

        <div className="flex items-center gap-4 mt-14">
          <Link
            to="/signin"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl metallic-gold-bg text-background text-lg font-bold hover:brightness-110 transition-all duration-300 hover:scale-110"
          >
            See It In Action <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-10 md:gap-20 mt-24">
          {stats.map((s) => (
            <div key={s.label} className="shimmer-card text-center cursor-default p-5 rounded-xl">
              <div className="text-3xl md:text-5xl font-extrabold metallic-gold shimmer-icon">{s.value}</div>
              <div className="text-xs md:text-sm text-white/70 tracking-widest mt-2 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}