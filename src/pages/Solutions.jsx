import { UserSearch, FileText, Send, Phone, Globe, BarChart3, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import LandingNav from "../components/landing/LandingNav";

const solutions = [
  {
    icon: UserSearch,
    title: "Lead Intelligence",
    desc: "AI scores and prioritizes every lead with industry-specific signals — square footage, vertical, location, and buying intent.",
    stats: "50K+ leads scored",
  },
  {
    icon: FileText,
    title: "Proposal Automation",
    desc: "Generate professional proposals in seconds with AI-optimized pricing, scope of work, and materials selection.",
    stats: "3x faster proposals",
  },
  {
    icon: Send,
    title: "Smart Outreach",
    desc: "AI-crafted emails and SMS sequences personalized to each prospect's industry, pain points, and project needs.",
    stats: "42% open rate",
  },
  {
    icon: Phone,
    title: "AI Phone Calls",
    desc: "Automated discovery calls and follow-ups powered by conversational AI trained on flooring industry terminology.",
    stats: "24/7 availability",
  },
  {
    icon: Globe,
    title: "Competitive Research",
    desc: "Real-time web intelligence on competitor pricing, project wins, and market positioning across your territories.",
    stats: "Live market data",
  },
  {
    icon: BarChart3,
    title: "Revenue Forecasting",
    desc: "ML-powered pipeline predictions with territory-level breakdowns and seasonal trend analysis.",
    stats: "92% accuracy",
  },
];

export default function Solutions() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNav />

      <div className="flex flex-col items-center text-center px-6 pt-14 md:pt-24 pb-8">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-none max-w-4xl transition-all duration-500 hover:scale-105" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          <span className="xps-gold-slow-shimmer">AI SOLUTIONS</span>
          <br />
          <span className="text-foreground">THAT CLOSE DEALS</span>
        </h1>
        <p className="mt-6 text-sm md:text-base text-foreground max-w-2xl leading-relaxed transition-all duration-500 hover:scale-[1.02]">
          Every tool your sales team needs — from first contact to signed contract — powered by AI that understands the polishing industry.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-20 space-y-5">
        {solutions.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.title} className="flex flex-col md:flex-row items-start gap-6 bg-card border border-border rounded-2xl p-6 md:p-8 transition-all duration-500 hover:scale-[1.02] cursor-default">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-6 h-6 metallic-gold-icon" />
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
  );
}