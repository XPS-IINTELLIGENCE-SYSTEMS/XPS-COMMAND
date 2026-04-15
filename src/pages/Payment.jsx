import { Link } from "react-router-dom";
import PageHexGlow from "../components/PageHexGlow";
import LandingNav from "../components/landing/LandingNav";
import { Check, Zap, Shield, Cpu } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    desc: "For individual contractors getting started",
    Icon: Zap,
    features: [
      "AI Lead Scoring",
      "Basic CRM Dashboard",
      "Up to 50 Leads / month",
      "Email Support",
    ],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "Professional",
    price: "$99",
    period: "/mo",
    desc: "For growing teams and serious contractors",
    Icon: Shield,
    features: [
      "Everything in Starter",
      "Unlimited Leads",
      "AI Proposal Generator",
      "Email & SMS Outreach",
      "Pipeline Analytics",
      "Priority Support",
    ],
    cta: "Start Free Trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For multi-location operations and franchises",
    Icon: Cpu,
    features: [
      "Everything in Professional",
      "Multi-Location Management",
      "Autonomous AI Agents",
      "Custom Integrations",
      "Dedicated Account Manager",
      "24/7 AI Support",
    ],
    cta: "Contact Sales",
    highlight: false,
  },
];

export default function Payment() {
  return (
    <div className="hex-bg min-h-screen bg-background text-foreground relative">
      <PageHexGlow />
      <div className="relative z-[1]">
        <LandingNav />

        {/* Hero */}
        <div className="text-center px-6 pt-16 md:pt-24 pb-12">
          <h1
            className="text-3xl md:text-5xl font-black tracking-wider"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            <span className="metallic-gold-silver-text">Choose Your Plan</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mt-4 max-w-xl mx-auto">
            Scale your contracting business with AI-powered tools built for the flooring industry.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-5xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const PlanIcon = plan.Icon;
            return (
              <div
                key={plan.name}
                className={`shimmer-card glass-card rounded-2xl p-6 flex flex-col ${
                  plan.highlight
                    ? "animated-silver-border ring-1 ring-primary/30"
                    : ""
                }`}
              >
                {plan.highlight && (
                  <div className="text-[10px] font-bold tracking-widest uppercase metallic-gold-bg text-background px-3 py-1 rounded-full self-start mb-4">
                    Most Popular
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <PlanIcon className="w-5 h-5 metallic-gold-icon shimmer-icon" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground">{plan.desc}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-extrabold metallic-gold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  )}
                </div>

                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground/80">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/signin"
                  className={`w-full flex items-center justify-center px-6 py-3 rounded-xl font-bold text-base transition-all duration-300 ${
                    plan.highlight
                      ? "metallic-gold-bg text-background hover:brightness-110"
                      : "border border-border text-foreground hover:bg-secondary"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center pb-12">
          <p className="text-[10px] text-muted-foreground/40 tracking-wider">
            XTREME POLISHING SYSTEMS &bull; PROPRIETARY &amp; CONFIDENTIAL
          </p>
        </div>
      </div>
    </div>
  );
}