import { Shield, Target, Users, Gem, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import LandingNav from "../components/landing/LandingNav";

const values = [
  { icon: Shield, title: "Xtreme Quality", desc: "We don't cut corners. Every floor, every location, every interaction reflects our commitment to the highest standards in the industry." },
  { icon: Target, title: "AI-First Innovation", desc: "We invest heavily in artificial intelligence to give our contractors and sales teams an unfair advantage over the competition." },
  { icon: Users, title: "Team Empowerment", desc: "200+ xtreme professionals equipped with cutting-edge tools, training, and support to deliver exceptional results." },
  { icon: Gem, title: "Industry Leadership", desc: "Pioneering the integration of AI into the polished concrete and epoxy flooring industry since day one." },
];

const milestones = [
  { year: "2015", event: "XPS Xpress founded with a vision to revolutionize the flooring industry" },
  { year: "2018", event: "Expanded to 20+ locations across the Southeast" },
  { year: "2020", event: "Launched AI-powered lead scoring and proposal automation" },
  { year: "2022", event: "Reached 50+ locations with nationwide coverage" },
  { year: "2024", event: "Introduced XPS Intelligence — Contractor Assist platform" },
  { year: "2025", event: "60+ locations, 200+ team members, $120M+ revenue tracked" },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNav />

      <div className="flex flex-col items-center text-center px-6 pt-14 md:pt-24 pb-8">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-none max-w-4xl transition-all duration-500 hover:scale-105" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          <span className="xps-gold-slow-shimmer">THE XTREME</span>
          <br />
          <span className="text-foreground">STORY</span>
        </h1>
        <p className="mt-6 text-sm md:text-base text-foreground max-w-2xl leading-relaxed transition-all duration-500 hover:scale-[1.02]">
          From a single crew to 60+ locations nationwide — XPS Xpress is redefining what's possible in the polished concrete and epoxy flooring industry through technology and relentless execution.
        </p>
      </div>

      {/* Values */}
      <div className="max-w-5xl mx-auto px-6 pb-12 grid grid-cols-1 md:grid-cols-2 gap-5">
        {values.map((v) => {
          const Icon = v.icon;
          return (
            <div key={v.title} className="bg-card border border-border rounded-2xl p-6 transition-all duration-500 hover:scale-105 cursor-default">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 metallic-gold-icon" />
                </div>
                <h3 className="text-sm font-bold text-foreground">{v.title}</h3>
              </div>
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
            <div key={m.year} className="flex items-start gap-4 transition-all duration-500 hover:scale-[1.02] cursor-default">
              <div className="w-16 flex-shrink-0 text-right">
                <span className="text-sm font-bold metallic-gold">{m.year}</span>
              </div>
              <div className="w-px bg-primary/30 flex-shrink-0 self-stretch" />
              <p className="text-sm text-muted-foreground leading-relaxed pb-2">{m.event}</p>
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
  );
}