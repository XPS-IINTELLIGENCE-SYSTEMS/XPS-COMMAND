import { ShieldCheck, Cpu, BarChart3, Sparkles, Lock, Radar, Database, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import GlobalNav from "../components/navigation/GlobalNav";
import PageHexGlow from "../components/PageHexGlow";

const features = [
  { icon: Cpu, title: "Autonomous AI Agents", desc: "Purpose-built agents handle lead scoring, proposal generation, follow-up sequencing, and competitive research around the clock — trained on flooring industry data." },
  { icon: Radar, title: "Market Intelligence", desc: "Real-time web scraping and competitive analysis surfaces pricing trends, project wins, and market opportunities across all 60+ XPS territories." },
  { icon: BarChart3, title: "Revenue Command Center", desc: "Track $120M+ in pipeline across locations with territory-level KPIs, conversion funnels, and seasonal trend forecasting." },
  { icon: Sparkles, title: "Proposal Automation", desc: "AI generates professional proposals with optimized pricing for epoxy coatings, polished concrete, metallic floors, and industrial applications in seconds." },
  { icon: Lock, title: "Enterprise-Grade Security", desc: "Role-based access control, audit logging, and encrypted storage designed for multi-location franchise operations from HQ in Pompano Beach." },
  { icon: ShieldCheck, title: "Contractor Enablement", desc: "Integrated training resources, certification tracking, marketing services, and financing guidance — the full XPS contractor toolkit." },
  { icon: Database, title: "Unified CRM", desc: "Every lead, proposal, invoice, and communication across the Epoxy Network — from Shopify catalog to signed contract — in one system." },
  { icon: Building2, title: "60+ Location Management", desc: "Manage franchise territories nationwide with location-level analytics, team performance tracking, and centralized brand compliance." },
];

export default function Platform() {
  return (
    <div className="hex-bg min-h-screen bg-background text-foreground relative">
      <PageHexGlow />
      <div className="relative z-[1]">
      <GlobalNav />

      <div className="flex flex-col items-center text-center px-6 pt-16 md:pt-28 pb-12">
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-primary/30 bg-primary/5 mb-10 shimmer-card">
          <Cpu className="w-5 h-5 metallic-gold-icon animate-pulse shimmer-icon" />
          <span className="text-sm md:text-base font-semibold xps-silver-subtle-gold">The Complete Intelligence Platform</span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold leading-none max-w-5xl transition-all duration-500 hover:scale-105" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          <span className="xps-gold-slow-shimmer">BUILT FOR</span>
          <br />
          <span className="text-white">THE POLISHING INDUSTRY</span>
        </h1>

        <p className="mt-8 text-base md:text-lg text-white/90 max-w-3xl leading-relaxed transition-all duration-500 hover:scale-[1.02]">
          XPS Intelligence combines autonomous AI agents, predictive analytics, and industry-specific CRM into one platform — purpose-built for Xtreme Polishing Systems' network of epoxy and polished concrete contractors.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 pb-24 flex flex-wrap justify-center gap-6 md:gap-8">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="shimmer-card bg-card border border-border rounded-2xl p-8 md:p-10 cursor-default flex flex-col items-center text-center w-full md:w-[calc(50%-16px)] lg:w-[calc(25%-24px)]">
              <div className="shimmer-icon-container w-14 h-14 md:w-16 md:h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-5 transition-all duration-300">
                <Icon className="w-7 h-7 md:w-8 md:h-8 metallic-gold-icon shimmer-icon" />
              </div>
              <h3 className="text-base md:text-lg font-bold text-white mb-3">{f.title}</h3>
              <p className="text-sm text-white/70 leading-relaxed">{f.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center pb-20">
        <Link to="/signin" className="inline-flex items-center gap-3 px-8 py-4 rounded-xl metallic-gold-bg text-background text-lg font-bold hover:brightness-110 transition-all duration-300 hover:scale-110">
          See It In Action
        </Link>
      </div>
      </div>
    </div>
  );
}