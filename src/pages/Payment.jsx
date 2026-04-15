import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import PageHexGlow from "../components/PageHexGlow";
import LandingNav from "../components/landing/LandingNav";
import { Check, Zap, Shield, Cpu, Loader2 } from "lucide-react";

const plans = [
  {
    id: "starter",
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
    cta: "Get Started Free",
    highlight: false,
  },
  {
    id: "professional",
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
    id: "enterprise",
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
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [isAuthed, setIsAuthed] = useState(false);
  const navigate = useNavigate();

  // Check if user is already authenticated
  useEffect(() => {
    (async () => {
      const authed = await base44.auth.isAuthenticated();
      setIsAuthed(authed);
    })();
  }, []);

  const handleSelectPlan = (planId) => {
    sessionStorage.setItem("xps-selected-plan", planId);
    setLoadingPlan(planId);

    if (isAuthed) {
      // Already logged in — SmartRedirect will check profile and route accordingly
      navigate("/redirect");
    } else {
      // Not logged in — Base44 auth creates account, then "/redirect" triggers SmartRedirect
      // which sends to onboarding if no profile, or dashboard if profile exists
      base44.auth.redirectToLogin("/redirect");
    }
  };

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
            Pick a plan, create your account, and you're in. Takes less than 2 minutes.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-5xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const PlanIcon = plan.Icon;
            const isLoading = loadingPlan === plan.id;
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

                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={!!loadingPlan}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-base transition-all duration-300 disabled:opacity-50 ${
                    plan.highlight
                      ? "metallic-gold-bg text-background hover:brightness-110"
                      : "border border-border text-foreground hover:bg-secondary"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    plan.cta
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Already have an account */}
        <div className="text-center pb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={() => navigate("/signin")}
              className="sign-in-pill inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-white text-sm font-semibold transition-all duration-300 hover:scale-105"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/signin")}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-sm font-semibold transition-all duration-300 hover:scale-105 hover:bg-primary/20"
            >
              <img src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg" alt="XPS" className="w-5 h-5 object-contain" />
              Company Log In
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground/40 tracking-wider">
            XTREME POLISHING SYSTEMS &bull; PROPRIETARY &amp; CONFIDENTIAL
          </p>
        </div>
      </div>
    </div>
  );
}