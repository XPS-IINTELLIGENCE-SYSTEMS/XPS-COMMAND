import { Crown, Rocket, Users, GraduationCap, ArrowRight, Globe, Gem, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import GlobalNav from "../components/navigation/GlobalNav";
import PageHexGlow from "../components/PageHexGlow";

const values = [
  { icon: Crown, title: "Industry Pioneer", desc: "Founded in 2010 in Pompano Beach, Florida — XPS has grown from a single crew to the nation's leading vertically integrated epoxy and polished concrete platform." },
  { icon: Rocket, title: "AI-First Innovation", desc: "We invest heavily in artificial intelligence to give our contractors and sales teams an unfair competitive advantage — from autonomous lead scoring to AI-generated proposals." },
  { icon: Users, title: "200+ Xtreme Professionals", desc: "Our team of certified installers, sales pros, and support staff are equipped with cutting-edge tools, XPS training programs, and the Contractor Assist AI platform." },
  { icon: GraduationCap, title: "Training & Certification", desc: "Comprehensive hands-on training programs at our Pompano Beach campus covering epoxy application, diamond grinding, polyaspartic coatings, and business operations." },
  { icon: Globe, title: "Epoxy Network Marketplace", desc: "Our contractor discovery platform connects homeowners and businesses directly with XPS-certified installers — generating qualified leads across all 60+ territories." },
  { icon: Gem, title: "Premium Product Ecosystem", desc: "A full Shopify-based catalog of professional-grade equipment, coatings, tooling, metallic pigments, flakes, quartz, and consumables — everything contractors need." },
  { icon: ShieldCheck, title: "Contractor Enablement", desc: "Beyond products — XPS provides marketing services, financing guidance, branded materials, and ongoing support to help every franchise location thrive." },
  { icon: Rocket, title: "The XPS Vision", desc: "Building the world's first AI-native operating system for the flooring industry — where every contractor has access to enterprise-grade intelligence tools." },
];

const milestones = [
  { year: "2010", event: "XPS Xtreme Polishing Systems incorporated in Pompano Beach, Florida" },
  { year: "2014", event: "Launched Shopify-based equipment & coatings catalog for contractors" },
  { year: "2017", event: "Expanded to 20+ XPS Xpress franchise locations across the Southeast" },
  { year: "2019", event: "Launched the Epoxy Network — contractor discovery marketplace for homeowners" },
  { year: "2021", event: "Reached 40+ locations with integrated training & certification programs" },
  { year: "2023", event: "Began AI integration — lead scoring, automated proposals, competitive research" },
  { year: "2024", event: "Launched XPS Intelligence — Contractor Assist autonomous AI platform" },
  { year: "2025", event: "60+ locations, 200+ team members, $120M+ revenue tracked through AI CRM" },
];

export default function About() {
  return (
    <div className="hex-bg min-h-screen bg-background text-foreground relative">
      <PageHexGlow />
      <div className="relative z-[1]">
      <GlobalNav />

      <div className="flex flex-col items-center text-center px-6 pt-16 md:pt-28 pb-12">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold leading-none max-w-5xl transition-all duration-500 hover:scale-105" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          <span className="xps-gold-slow-shimmer">THE XTREME</span>
          <br />
          <span className="text-white">STORY</span>
        </h1>
        <p className="mt-8 text-base md:text-lg text-white/90 max-w-3xl leading-relaxed transition-all duration-500 hover:scale-[1.02]">
          From a single crew in Pompano Beach to 60+ locations nationwide — XPS Xpress is redefining what's possible in the polished concrete and epoxy flooring industry through technology, training, and relentless execution.
        </p>
      </div>

      {/* Values */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 pb-16 flex flex-wrap justify-center gap-6 md:gap-8">
        {values.map((v) => {
          const Icon = v.icon;
          return (
            <div key={v.title} className="shimmer-card bg-card border border-border rounded-2xl p-8 md:p-10 cursor-default flex flex-col items-center text-center w-full md:w-[calc(50%-16px)]">
              <div className="shimmer-icon-container w-14 h-14 md:w-16 md:h-16 rounded-xl bg-primary/10 flex items-center justify-center transition-all duration-300 mb-5">
                <Icon className="w-7 h-7 md:w-8 md:h-8 metallic-gold-icon shimmer-icon" />
              </div>
              <h3 className="text-base md:text-lg font-bold text-white mb-3">{v.title}</h3>
              <p className="text-sm text-white/70 leading-relaxed">{v.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Timeline */}
      <div className="max-w-4xl mx-auto px-6 md:px-10 pb-24">
        <h2 className="text-center text-2xl md:text-3xl font-bold text-white mb-10 transition-all duration-500 hover:scale-105">
          <span className="metallic-gold">Our Journey</span>
        </h2>
        <div className="space-y-4">
          {milestones.map((m) => (
            <div key={m.year} className="shimmer-card flex flex-col items-center text-center cursor-default p-5 md:p-6 rounded-xl">
              <span className="text-base md:text-lg font-bold metallic-gold shimmer-icon mb-2">{m.year}</span>
              <div className="w-12 h-px bg-primary/30 mb-3" />
              <p className="text-sm md:text-base text-white/70 leading-relaxed">{m.event}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center pb-20">
        <Link to="/signin" className="inline-flex items-center gap-3 px-8 py-4 rounded-xl metallic-gold-bg text-background text-lg font-bold hover:brightness-110 transition-all duration-300 hover:scale-110">
          Join The Team <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
      </div>
    </div>
  );
}