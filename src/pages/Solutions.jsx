import { Crosshair, FileText, Send, PhoneCall, Radar, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import LandingNav from "../components/landing/LandingNav";
import PageHexGlow from "../components/PageHexGlow";

const solutions = [
  {
    icon: Crosshair,
    title: "Lead Intelligence & Scoring",
    desc: "AI analyzes square footage, vertical (retail, warehouse, healthcare, automotive), location density, and buying signals to score and prioritize every lead across 60+ territories.",
    stats: "50K+ leads scored",
  },
  {
    icon: FileText,
    title: "Proposal & Invoice Automation",
    desc: "Generate professional proposals in seconds — AI selects the right epoxy systems, polyaspartic coatings, or polished concrete specs, with optimized per-sqft pricing and material costs.",
    stats: "3x faster proposals",
  },
  {
    icon: Send,
    title: "Smart Outreach Engine",
    desc: "AI-crafted email and SMS sequences personalized to each prospect's industry vertical, floor condition, project scope, and XPS product recommendations.",
    stats: "42% open rate",
  },
  {
    icon: PhoneCall,
    title: "AI-Powered Discovery Calls",
    desc: "Automated outbound calls trained on flooring terminology — polyaspartic, metallic epoxy, diamond grinding, moisture testing — to qualify leads and schedule site visits.",
    stats: "24/7 availability",
  },
  {
    icon: Radar,
    title: "Competitive Intelligence",
    desc: "Real-time web research on competitor pricing, project wins, Google review sentiment, and market positioning across your XPS territory.",
    stats: "Live market data",
  },
  {
    icon: TrendingUp,
    title: "Revenue Forecasting",
    desc: "ML-powered pipeline predictions with territory-level breakdowns, seasonal demand curves, and product-mix revenue optimization across coating types.",
    stats: "92% accuracy",
  },
];

export default function Solutions() {
  return (
    <div className="hex-bg min-h-screen bg-background text-foreground relative">
      <PageHexGlow />
      <div className="relative z-[1]">
      <LandingNav />

      <div className="flex flex-col items-center text-center px-6 pt-14 md:pt-24 pb-8">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-none max-w-4xl transition-all duration-500 hover:scale-105" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          <span className="xps-gold-slow-shimmer">AI SOLUTIONS</span>
          <br />
          <span className="text-foreground">THAT CLOSE DEALS</span>
        </h1>
        <p className="mt-6 text-sm md:text-base text-foreground max-w-2xl leading-relaxed transition-all duration-500 hover:scale-[1.02]">
          From first contact to signed contract — every tool your XPS sales team needs, powered by AI that understands epoxy coatings, polished concrete, and the contractor business.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-20 space-y-5">
        {solutions.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.title} className="shimmer-card flex flex-col md:flex-row items-start gap-6 bg-card border border-border rounded-2xl p-6 md:p-8 cursor-default">
              <div className="shimmer-icon-container w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 transition-all duration-300">
                <Icon className="w-6 h-6 metallic-gold-icon shimmer-icon" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-base font-bold text-foreground">{s.title}</h3>
                  <span className="text-[10px] font-semibold metallic-gold px-2 py-0.5 rounded-full border border-primary/30 bg-primary/5">{s.stats}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center pb-20">
        <Link to="/signin" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg metallic-gold-bg text-background font-semibold hover:brightness-110 transition-all duration-300 hover:scale-110">
          See It In Action <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      </div>
    </div>
  );
}