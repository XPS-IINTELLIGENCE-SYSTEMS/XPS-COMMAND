import { ArrowRight, ShieldCheck, Download } from "lucide-react";
import { Link } from "react-router-dom";
import LandingNav from "../components/landing/LandingNav";
import PageHexGlow from "../components/PageHexGlow";
import FloatingDownloadBtn from "../components/landing/FloatingDownloadBtn";

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

      {/* Floating Download Button - mobile only */}
      <FloatingDownloadBtn />

      {/* Hero */}
      <div className="flex flex-col items-center text-center px-6 pt-16 md:pt-28 pb-20">
        <div className="shimmer-card inline-flex items-center gap-3 px-5 py-2 rounded-full border border-primary/30 bg-primary/5 mb-10">
          <ShieldCheck className="w-5 h-5 metallic-gold-icon animate-pulse shimmer-icon" />
          <span className="text-base md:text-lg font-semibold xps-silver-subtle-gold">AI-Powered Xtreme Intelligence System</span>
        </div>

        <h1 className="text-4xl md:text-7xl lg:text-8xl font-extrabold leading-none max-w-5xl px-2 transition-all duration-500 hover:scale-105" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          <span className="xps-gold-slow-shimmer">XPS INTELLIGENCE</span>
        </h1>
        <div className="text-lg md:text-2xl lg:text-3xl tracking-[0.35em] font-bold text-white mt-3 transition-all duration-500 hover:scale-105">CONTRACTOR ASSIST</div>

        <p className="mt-8 text-lg md:text-xl text-white/90 max-w-3xl leading-relaxed transition-all duration-500 hover:scale-[1.02]">
          XPS Intelligence empowers 60+ locations and 200+ xtreme
          professionals with AI-driven CRM, lead intelligence, proposal automation,
          and competitive insights — built for the polishing industry.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-14">
          <Link
            to="/payment"
            className="inline-flex items-center gap-2 px-6 py-3 md:px-10 md:py-5 rounded-lg md:rounded-xl metallic-gold-bg text-background text-base md:text-xl font-bold hover:brightness-110 transition-all duration-300 hover:scale-110"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/signin"
            className="sign-in-pill inline-flex items-center gap-2 px-6 py-3 md:px-8 md:py-4 rounded-full text-white text-sm md:text-base font-semibold transition-all duration-300 hover:scale-105"
          >
            Sign In
          </Link>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-10 md:gap-20 mt-24">
          {stats.map((s) => (
            <div key={s.label} className="shimmer-card text-center cursor-default p-5 rounded-xl">
              <div className="text-4xl md:text-6xl font-extrabold metallic-gold shimmer-icon">{s.value}</div>
              <div className="text-sm md:text-base text-white/70 tracking-widest mt-2 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}