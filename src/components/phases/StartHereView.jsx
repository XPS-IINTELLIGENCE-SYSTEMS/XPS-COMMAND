import { ChevronRight, CheckCircle2, Compass, UserCircle, Link2, UserPlus, Send, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { title: "Set Up Your Profile", desc: "Company name, logo, contact info, and service areas", icon: UserCircle, done: false },
  { title: "Connect Your Tools", desc: "Link Gmail, Calendar, Drive, and other integrations", icon: Link2, done: false },
  { title: "Add Your First Lead", desc: "Import or create a prospect to get your pipeline started", icon: UserPlus, done: false },
  { title: "Send Your First Outreach", desc: "Let AI draft and send a personalized email or text", icon: Send, done: false },
  { title: "Generate a Proposal", desc: "Create a professional quote with AI in under 60 seconds", icon: FileText, done: false },
];

export default function StartHereView() {
  return (
    <div className="h-full overflow-y-auto p-6 md:p-10">
      <div className="max-w-2xl mx-auto">
        {/* Hero - Silver themed */}
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
            Five steps to go from zero to fully operational. Your AI business engine boots up in under 10 minutes.
          </p>
        </div>

        {/* Zig-zag Steps */}
        <div className="relative">
          {/* Vertical connecting line */}
          <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-white/15 to-transparent pointer-events-none hidden md:block" />

          <div className="space-y-4 md:space-y-0">
            {steps.map((step, i) => {
              const StepIcon = step.icon;
              const isLeft = i % 2 === 0;

              return (
                <div key={i} className="relative">
                  {/* Mobile layout */}
                  <div className="md:hidden shimmer-card flex items-center gap-4 p-5 rounded-xl bg-card/60 border border-white/10 hover:border-primary/30 transition-all cursor-pointer">
                    <div className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0",
                      step.done ? "bg-green-500/20" : "bg-gradient-to-br from-white/10 to-white/5 border border-white/10"
                    )}>
                      {step.done ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <StepIcon className="w-5 h-5 metallic-silver-icon" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-mono font-bold text-primary/70">0{i + 1}</span>
                        <span className="text-sm font-semibold text-white">{step.title}</span>
                      </div>
                      <p className="text-[11px] text-white/50 leading-relaxed">{step.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/30 flex-shrink-0" />
                  </div>

                  {/* Desktop zig-zag layout */}
                  <div className={cn(
                    "hidden md:flex items-center py-4",
                    isLeft ? "flex-row" : "flex-row-reverse"
                  )}>
                    {/* Card */}
                    <div className={cn(
                      "w-[45%] shimmer-card rounded-2xl bg-card/60 border border-white/10 hover:border-primary/30 transition-all cursor-pointer p-6 group",
                      isLeft ? "text-right" : "text-left"
                    )}>
                      <div className={cn("flex items-center gap-3 mb-2", isLeft ? "justify-end" : "justify-start")}>
                        <span className="text-[10px] font-mono font-bold text-primary/70 order-first">0{i + 1}</span>
                        <span className="text-base font-semibold text-white">{step.title}</span>
                      </div>
                      <p className="text-xs text-white/50 leading-relaxed">{step.desc}</p>
                    </div>

                    {/* Center node */}
                    <div className="w-[10%] flex justify-center relative z-10">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                        step.done
                          ? "bg-green-500/20 border border-green-500/30"
                          : "bg-gradient-to-br from-white/10 to-white/5 border border-white/15 group-hover:border-primary/30"
                      )}>
                        {step.done ? <CheckCircle2 className="w-6 h-6 text-green-400" /> : <StepIcon className="w-6 h-6 metallic-silver-icon" />}
                      </div>
                    </div>

                    {/* Empty space */}
                    <div className="w-[45%]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}