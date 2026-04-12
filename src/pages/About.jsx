import { Crown, Rocket, Users, GraduationCap, ArrowRight, Globe, Gem, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import LandingNav from "../components/landing/LandingNav";
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
      <LandingNav />

      <div className="flex flex-col items-center text-center px-6 pt-14 md:pt-24 pb-8">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-none max-w-4xl transition-all duration-500 hover:scale-105" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          <span className="xps-gold-slow-shimmer">THE XTREME</span>
          <br />
          <span className="text-foreground">STORY</span>
        </h1>
        <p className="mt-6 text-sm md:text-base text-foreground max-w-2xl leading-relaxed transition-all duration-500 hover:scale-[1.02]">
          From a single crew in Pompano Beach to 60+ locations nationwide — XPS Xpress is redefining what's possible in the polished concrete and epoxy flooring industry through technology, training, and relentless execution.
        </p>
      </div>

      {/* Values */}
      <div className="max-w-5xl mx-auto px-6 pb-12 flex flex-wrap justify-center gap-5">
        {values.map((v) => {
          const Icon = v.icon;
          return (
            <div key={v.title} className="shimmer-card bg-card border border-border rounded-2xl p-6 cursor-default flex flex-col items-center text-center w-full md:w-[calc(50%-10px)]">
              <div className="shimmer-icon-container w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center transition-all duration-300 mb-3">
                <Icon className="w-5 h-5 metallic-gold-icon shimmer-icon" />
              </div>
              <h3 className="text-sm font-bold text-foreground mb-2">{v.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Timeline */}
      <div className="max-w-3xl mx-auto px-6 pb-20">
        <h2 className="text-center text-lg font-bold text-foreground mb-8 transition-all duration-500 hover:scale-105">
          <span className="metallic-gold">Our Journey</span>
        </h2>
        <div className="space-y-4">
          {milestones.map((m) => (
            <div key={m.year} className="shimmer-card flex flex-col items-center text-center cursor-default p-4 rounded-xl">
              <span className="text-sm font-bold metallic-gold shimmer-icon mb-1">{m.year}</span>
              <div className="w-8 h-px bg-primary/30 mb-2" />
              <p className="text-sm text-muted-foreground leading-relaxed">{m.event}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center pb-20">
        <Link to="/signin" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg metallic-gold-bg text-background font-semibold hover:brightness-110 transition-all duration-300 hover:scale-110">
          Join The Team <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      </div>
    </div>
  );
}