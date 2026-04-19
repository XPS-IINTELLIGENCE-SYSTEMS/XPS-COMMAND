import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Check, User, Briefcase, Cpu, Bot, Building2, Zap, ShieldCheck, MessageCircle } from "lucide-react";
import PageHexGlow from "../components/PageHexGlow";
import GlobalNav from "../components/navigation/GlobalNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";

const titleOptions = [
  "Owner",
  "Admin",
  "Manager",
  "Sales / Marketing",
  "Contractor",
  "Operator",
];

const aiTools = [
  { id: "lead_management", label: "Lead Management", desc: "AI-scored leads & pipeline" },
  { id: "proposals", label: "Proposal Generator", desc: "Auto-create professional proposals" },
  { id: "email_outreach", label: "Email Outreach", desc: "AI-written personalized emails" },
  { id: "sms", label: "AI SMS", desc: "Smart text message campaigns" },
  { id: "ai_calls", label: "AI Phone Calls", desc: "Automated voice outreach" },
  { id: "web_research", label: "Web Research", desc: "Company & competitor intel" },
  { id: "invoicing", label: "Invoicing", desc: "Generate & send invoices" },
  { id: "workflows", label: "AI Workflows", desc: "Autonomous task pipelines" },
  { id: "business_plans", label: "Business Plans", desc: "AI-generated business plans" },
  { id: "analytics", label: "Analytics", desc: "Revenue & performance dashboards" },
];

const aiModes = [
  { id: "Fully Autonomous", label: "Fully Autonomous", desc: "AI takes action on its own — sends emails, creates proposals, follows up automatically.", Icon: Zap },
  { id: "Semi-Autonomous", label: "Semi-Autonomous", desc: "AI drafts and suggests, you approve before anything is sent or created.", Icon: ShieldCheck },
  { id: "Basic Chat", label: "Basic Chat", desc: "AI only responds when you ask — no proactive actions.", Icon: MessageCircle },
];

const industryOptions = [
  "Epoxy Flooring",
  "Polished Concrete",
  "General Contracting",
  "Commercial Cleaning",
  "Industrial Coatings",
  "Decorative Concrete",
  "Residential Renovation",
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [selectedTools, setSelectedTools] = useState([]);
  const [aiMode, setAiMode] = useState("");
  const [industry, setIndustry] = useState("");
  const [customIndustry, setCustomIndustry] = useState("");
  const [saving, setSaving] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();

  // Load user info — auth is already guaranteed by App.jsx routing
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user = await base44.auth.me();
        if (!cancelled && user.full_name) setName(user.full_name);
        // Check if already onboarded — redirect to dashboard
        const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
        if (profiles.length > 0) {
          if (!cancelled) navigate("/redirect", { replace: true });
          return;
        }
      } catch {
        // New user — proceed with onboarding
      }
      if (!cancelled) setAuthChecked(true);
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  const toggleTool = (id) => {
    setSelectedTools((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const canNext = () => {
    if (step === 0) return name.trim().length > 0;
    if (step === 1) return title || customTitle.trim();
    if (step === 2) return selectedTools.length > 0;
    if (step === 3) return aiMode;
    if (step === 4) return industry || customIndustry.trim();
    return false;
  };

  const handleFinish = async () => {
    setSaving(true);
    const finalTitle = title === "Other" ? customTitle : title;
    const finalIndustry = industry === "Other" ? customIndustry : industry;
    const user = await base44.auth.me();
    
    // Check for existing profile first — prevent duplicates
    const existing = await base44.entities.UserProfile.filter({ user_email: user.email });
    const profileData = {
      user_email: user.email,
      full_name: name,
      title: finalTitle,
      preferred_tools: selectedTools.join(", "),
      ai_mode: aiMode,
      industry: finalIndustry,
    };
    
    if (existing.length > 0) {
      // Update existing profile instead of creating duplicate
      await base44.entities.UserProfile.update(existing[0].id, profileData);
    } else {
      await base44.entities.UserProfile.create(profileData);
    }
    
    sessionStorage.removeItem("xps-selected-plan");
    navigate("/redirect");
  };

  const questions = [
    // Step 0: Name
    <div key="name" className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">What's your name?</h2>
          <p className="text-sm text-muted-foreground">Let's personalize your experience</p>
        </div>
      </div>
      <Input
        placeholder="Enter your full name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="h-12 text-base"
        autoFocus
      />
    </div>,

    // Step 1: Title
    <div key="title" className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Briefcase className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">What's your role?</h2>
          <p className="text-sm text-muted-foreground">This helps us tailor the AI to your workflow</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {titleOptions.map((t) => (
          <button
            key={t}
            onClick={() => { setTitle(t); setCustomTitle(""); }}
            className={`p-3 rounded-xl border text-sm font-medium text-left transition-all ${
              title === t
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-foreground hover:border-primary/30"
            }`}
          >
            {t}
          </button>
        ))}
        <button
          onClick={() => setTitle("Other")}
          className={`p-3 rounded-xl border text-sm font-medium text-left transition-all ${
            title === "Other"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-card text-foreground hover:border-primary/30"
          }`}
        >
          Other
        </button>
      </div>
      {title === "Other" && (
        <Input
          placeholder="Type your title..."
          value={customTitle}
          onChange={(e) => setCustomTitle(e.target.value)}
          className="h-11"
          autoFocus
        />
      )}
    </div>,

    // Step 2: AI Tools
    <div key="tools" className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Cpu className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Which AI tools will you use most?</h2>
          <p className="text-sm text-muted-foreground">Select all that apply — we'll prioritize them for you</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 max-h-[350px] overflow-y-auto pr-1">
        {aiTools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => toggleTool(tool.id)}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedTools.includes(tool.id)
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-primary/30"
            }`}
          >
            <div className="flex items-center gap-2">
              {selectedTools.includes(tool.id) && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
              <span className={`text-sm font-medium ${selectedTools.includes(tool.id) ? "text-primary" : "text-foreground"}`}>
                {tool.label}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">{tool.desc}</p>
          </button>
        ))}
      </div>
    </div>,

    // Step 3: AI Mode
    <div key="mode" className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">How autonomous should the AI be?</h2>
          <p className="text-sm text-muted-foreground">You can change this anytime in settings</p>
        </div>
      </div>
      <div className="space-y-3">
        {aiModes.map((mode) => {
          const ModeIcon = mode.Icon;
          return (
            <button
              key={mode.id}
              onClick={() => setAiMode(mode.id)}
              className={`shimmer-card w-full p-4 rounded-xl border text-left transition-all ${
                aiMode === mode.id
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`shimmer-icon-container w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  aiMode === mode.id ? "bg-primary/15" : "bg-secondary"
                }`}>
                  <ModeIcon className={`w-5 h-5 shimmer-icon ${
                    aiMode === mode.id ? "metallic-gold-icon" : "metallic-silver-icon"
                  }`} />
                </div>
                <div>
                  <div className={`text-sm font-semibold ${aiMode === mode.id ? "text-primary" : "text-foreground"}`}>
                    {mode.label}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{mode.desc}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>,

    // Step 4: Industry
    <div key="industry" className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">What's your primary industry?</h2>
          <p className="text-sm text-muted-foreground">We'll customize AI insights for your market</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {industryOptions.map((ind) => (
          <button
            key={ind}
            onClick={() => { setIndustry(ind); setCustomIndustry(""); }}
            className={`p-3 rounded-xl border text-sm font-medium text-left transition-all ${
              industry === ind
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-foreground hover:border-primary/30"
            }`}
          >
            {ind}
          </button>
        ))}
        <button
          onClick={() => setIndustry("Other")}
          className={`p-3 rounded-xl border text-sm font-medium text-left transition-all ${
            industry === "Other"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-card text-foreground hover:border-primary/30"
          }`}
        >
          Other
        </button>
      </div>
      {industry === "Other" && (
        <Input
          placeholder="Type your industry..."
          value={customIndustry}
          onChange={(e) => setCustomIndustry(e.target.value)}
          className="h-11"
          autoFocus
        />
      )}
    </div>,
  ];

  if (!authChecked) {
    return (
      <div className="hex-bg min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <div className="w-6 h-6 border-2 border-white/10 border-t-primary rounded-full animate-spin" />
        <p className="text-xs text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="hex-bg min-h-screen bg-background flex flex-col relative">
      <PageHexGlow />
      <div className="relative z-[1]">
        <GlobalNav />
      </div>
      <div className="relative z-[1] flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <img
            src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg"
            alt="XPS"
            className="w-10 h-10 object-contain"
          />
          <div>
            <div className="text-base font-bold metallic-gold tracking-wider">XPS INTELLIGENCE</div>
            <div className="text-[9px] text-muted-foreground tracking-widest">CONTRACTOR ASSIST</div>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-1.5 mb-8">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                i <= step ? "metallic-gold-bg" : "bg-border"
              }`}
            />
          ))}
        </div>

        <div className="text-[11px] text-muted-foreground mb-4">
          Step {step + 1} of 5
        </div>

        {/* Question */}
        <div className="bg-card border border-border rounded-2xl p-6">
          {questions[step]}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="ghost"
            onClick={() => setStep(step - 1)}
            disabled={step === 0}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>

          {step < 4 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canNext()}
              className="gap-2 metallic-gold-bg text-background hover:brightness-110"
            >
              Next <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleFinish}
              disabled={!canNext() || saving}
              className="gap-2 metallic-gold-bg text-background hover:brightness-110"
            >
              {saving ? "Setting up..." : "Launch Contractor Assist"} <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}