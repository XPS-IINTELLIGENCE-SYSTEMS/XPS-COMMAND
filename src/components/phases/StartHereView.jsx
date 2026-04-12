import { useState, useEffect } from "react";
import { ChevronRight, CheckCircle2, Compass, UserCircle, Link2, UserPlus, Send, FileText, Loader2 } from "lucide-react";
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

  useEffect(() => {
    checkProgress();
  }, []);

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
      integrations: false, // no way to check programmatically right now
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
    <div className="h-full overflow-y-auto p-6 md:p-10">
      <div className="max-w-2xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12 pt-6">
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-white/5 blur-xl scale-150" />
            <div className="relative w-20 h-20 rounded-2xl metallic-silver-bg flex items-center justify-center rotate-3 hover:rotate-0 transition-transform duration-500">
              <Compass className="w-10 h-10 text-background" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold metallic-silver mb-3" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            START HERE
          </h1>
          <p className="text-sm md:text-base text-white/50 max-w-md mx-auto leading-relaxed">
            Five steps to go from zero to fully operational.
          </p>
          {!loading && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <div className="h-2 w-48 rounded-full bg-secondary overflow-hidden">
                <div className="h-full metallic-gold-bg rounded-full transition-all duration-500" style={{ width: `${(completedCount / 5) * 100}%` }} />
              </div>
              <span className="text-xs font-bold text-primary">{completedCount}/5</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
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
                    "shimmer-card w-full flex items-center gap-4 p-5 rounded-xl border transition-all text-left",
                    isDone
                      ? "border-green-500/30 bg-green-500/5"
                      : "border-white/10 bg-card/60 hover:border-primary/30"
                  )}
                >
                  <div className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0",
                    isDone ? "bg-green-500/20" : "bg-gradient-to-br from-white/10 to-white/5 border border-white/10"
                  )}>
                    {isDone ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <StepIcon className="w-5 h-5 metallic-silver-icon" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-mono font-bold text-primary/70">0{i + 1}</span>
                      <span className={cn("text-sm font-semibold", isDone ? "text-green-400" : "text-white")}>{step.title}</span>
                      {isDone && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">DONE</span>}
                    </div>
                    <p className="text-[11px] text-white/50 leading-relaxed">{step.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/30 flex-shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}