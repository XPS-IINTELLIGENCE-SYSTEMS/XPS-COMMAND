import { ArrowRight, Play, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  { value: "60+", label: "LOCATIONS" },
  { value: "200+", label: "SALES STAFF" },
  { value: "50K+", label: "LEADS MANAGED" },
  { value: "$120M+", label: "REVENUE TRACKED" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <img
            src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg"
            alt="XPS"
            className="w-8 h-8 object-contain"
          />
          <div>
            <div className="text-sm font-bold metallic-gold tracking-wider">XPS INTELLIGENCE</div>
            <div className="text-[9px] text-muted-foreground tracking-widest uppercase">Xtreme Polishing Systems</div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <span className="hover:text-foreground cursor-pointer transition-colors">Platform</span>
          <span className="hover:text-foreground cursor-pointer transition-colors">Solutions</span>
          <span className="hover:text-foreground cursor-pointer transition-colors">Coverage</span>
          <span className="hover:text-foreground cursor-pointer transition-colors">About</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/signin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Sign In
          </Link>
          <Link
            to="/signin"
            className="px-4 py-2 rounded-lg metallic-gold-bg text-background text-sm font-semibold hover:brightness-110 transition-all"
          >
            Request Demo
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex flex-col items-center text-center px-6 pt-14 md:pt-24 pb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-8">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">AI-Powered Sales Intelligence Platform</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-none max-w-4xl" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          <span className="xps-solid-gold">XPS INTE</span><span className="xps-gold-slow-shimmer">LLIGENCE</span>
        </h1>
        <div className="text-sm md:text-lg tracking-[0.35em] font-semibold metallic-silver mt-2">CONTRACTOR ASSIST</div>

        <p className="mt-6 text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
          XPS Intelligence — Contractor Assist empowers 60+ locations and 200+ sales
          professionals with AI-driven CRM, lead intelligence, proposal automation,
          and competitive insights — built for the polishing industry.
        </p>

        <div className="flex items-center gap-4 mt-10">
          <Link
            to="/signin"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg metallic-gold-bg text-background font-semibold hover:brightness-110 transition-all"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
          <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-foreground hover:bg-secondary/50 transition-colors">
            <Play className="w-4 h-4" /> Watch Demo
          </button>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 mt-20">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold metallic-gold">{s.value}</div>
              <div className="text-[10px] md:text-xs text-muted-foreground tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}