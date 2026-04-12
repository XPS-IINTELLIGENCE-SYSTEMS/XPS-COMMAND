import { Bot, Brain, BarChart3, Zap, Shield, Globe, Database, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import LandingNav from "../components/landing/LandingNav";

const features = [
  { icon: Bot, title: "AI Agent Engine", desc: "Autonomous agents handle lead scoring, proposal drafting, follow-ups, and competitive research — 24/7 without supervision." },
  { icon: Brain, title: "Xtreme Intelligence", desc: "Machine learning models trained on flooring industry data to predict deal outcomes and optimize pricing strategies." },
  { icon: BarChart3, title: "Revenue Analytics", desc: "Real-time dashboards tracking pipeline health, conversion rates, and territory performance across all locations." },
  { icon: Zap, title: "Workflow Automation", desc: "Build custom multi-step workflows that chain AI actions — from lead capture to signed proposal in minutes." },
  { icon: Shield, title: "Enterprise Security", desc: "Role-based access, audit logging, and encrypted data storage designed for multi-location franchise operations." },
  { icon: Globe, title: "Web Research", desc: "AI-powered web scraping and competitive intelligence that surfaces market opportunities in real time." },
  { icon: Database, title: "Unified CRM", desc: "Every lead, proposal, invoice, and communication in one system — no more switching between tools." },
  { icon: Layers, title: "Multi-Location", desc: "Manage 60+ franchise locations from a single dashboard with territory-level insights and permissions." },
];

export default function Platform() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNav />

      <div className="flex flex-col items-center text-center px-6 pt-14 md:pt-24 pb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-8 transition-all duration-500 hover:scale-105">
          <Layers className="w-3.5 h-3.5 metallic-gold-icon animate-pulse" />
          <span className="text-xs font-medium xps-silver-subtle-gold">The Complete Intelligence Platform</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold leading-none max-w-4xl transition-all duration-500 hover:scale-105" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          <span className="xps-gold-slow-shimmer">BUILT FOR</span>
          <br />
          <span className="text-foreground">THE POLISHING INDUSTRY</span>
        </h1>

        <p className="mt-6 text-sm md:text-base text-foreground max-w-2xl leading-relaxed transition-all duration-500 hover:scale-[1.02]">
          XPS Intelligence combines autonomous AI agents, predictive analytics, and industry-specific CRM into one platform — purpose-built for epoxy and polished concrete contractors.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="bg-card border border-border rounded-2xl p-6 transition-all duration-500 hover:scale-105 cursor-default">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 metallic-gold-icon" />
              </div>
              <h3 className="text-sm font-bold text-foreground mb-2">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center pb-20">
        <Link to="/signin" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg metallic-gold-bg text-background font-semibold hover:brightness-110 transition-all duration-300 hover:scale-110">
          See It In Action
        </Link>
      </div>
    </div>
  );
}