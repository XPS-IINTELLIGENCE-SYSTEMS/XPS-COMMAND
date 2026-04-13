import { useState, useEffect } from "react";
import { ChevronRight, CheckCircle2, Compass, UserCircle, Link2, UserPlus, Send, FileText, Loader2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { base44 } from "@/api/base44Client";

const STEP_DEFS = [
  { id: "profile", title: "Set Up Your Profile", desc: "Check your company name, contact info, and preferences", icon: UserCircle, nav: "settings" },
  { id: "integrations", title: "Connect Your Tools", desc: "Link Gmail, Calendar, Drive, and other integrations", icon: Link2, nav: "settings" },
  { id: "first_lead", title: "Add Your First Lead", desc: "Import or create a prospect to get your pipeline started", icon: UserPlus, nav: "find_work" },
  { id: "first_outreach", title: "Send Your First Outreach", desc: "Let AI draft and send a personalized email or text", icon: Send, nav: "get_work" },
  { id: "first_proposal", title: "Generate a Proposal", desc: "Create a professional quote with AI in under 60 seconds", icon: FileText, nav: "win_work" },
];

export default function StartHereView({ onNavigate }) {
  const [done, setDone] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { checkProgress(); }, []);

  const checkProgress = async () => {
    setLoading(true);
    const [leads, emails, proposals, user] = await Promise.all([
      base44.entities.Lead.list("-created_date", 1),
      base44.entities.OutreachEmail.list("-created_date", 1),
      base44.entities.Proposal.list("-created_date", 1),
      base44.auth.me(),
    ]);

    setDone({
      profile: !!user?.full_name,
      integrations: false,
      first_lead: leads.length > 0,
      first_outreach: emails.length > 0,
      first_proposal: proposals.length > 0,
    });
    setLoading(false);
  };

  const completedCount = Object.values(done).filter(Boolean).length;

  const handleClick = (step) => {
    if (onNavigate) onNavigate(step.nav);
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Hero */}
      <div className="relative px-6 pt-8 pb-10 md:pt-14 md:pb-16">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-6">
            <ShieldCheck className="w-4 h-4 metallic-gold-icon" />
            <span className="text-xs font-semibold xps-silver-subtle-gold">GETTING STARTED</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            <span className="xps-gold-slow-shimmer">START HERE</span>
          </h1>
          <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
            Five steps to go from zero to fully operational.
          </p>

          {!loading && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <div className="h-2.5 w-56 rounded-full bg-secondary overflow-hidden">
                <div className="h-full metallic-gold-bg rounded-full transition-all duration-700 ease-out" style={{ width: `${(completedCount / 5) * 100}%` }} />
              </div>
              <span className="text-sm font-bold text-primary">{completedCount}/5</span>
            </div>
          )}
        </div>
      </div>

      {/* Steps */}
      <div className="px-6 pb-10 max-w-2xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">Checking your progress...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {STEP_DEFS.map((step, i) => {
              const StepIcon = step.icon;
              const isDone = done[step.id];
              return (
                <button
                  key={step.id}
                  onClick={() => handleClick(step)}
                  className={cn(
                    "shimmer-card w-full flex items-center gap-4 p-5 rounded-xl transition-all text-left group",
                    isDone
                      ? "glass-card border-primary/30"
                      : "glass-card"
                  )}
                >
                  <div className={cn(
                    "shimmer-icon-container w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300",
                    isDone ? "bg-primary/15" : "bg-secondary"
                  )}>
                    {isDone ? (
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                    ) : (
                      <StepIcon className="w-6 h-6 shimmer-icon metallic-silver-icon" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-mono font-bold text-primary/70">0{i + 1}</span>
                      <span className={cn("text-sm font-semibold", isDone ? "text-primary" : "text-foreground")}>{step.title}</span>
                      {isDone && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary">DONE</span>}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary transition-colors flex-shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}