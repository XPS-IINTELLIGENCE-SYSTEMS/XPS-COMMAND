import { Rocket, ChevronRight, Play, BookOpen, Zap, CheckCircle2 } from "lucide-react";

const steps = [
  { title: "Set Up Your Profile", desc: "Company name, logo, contact info, and service areas", icon: BookOpen, done: false },
  { title: "Connect Your Tools", desc: "Link Gmail, Calendar, Drive, and other integrations", icon: Zap, done: false },
  { title: "Add Your First Lead", desc: "Import or create a prospect to get your pipeline started", icon: Play, done: false },
  { title: "Send Your First Outreach", desc: "Let AI draft and send a personalized email or text", icon: ChevronRight, done: false },
  { title: "Generate a Proposal", desc: "Create a professional quote with AI in under 60 seconds", icon: Rocket, done: false },
];

export default function StartHereView() {
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 shimmer-card">
            <Rocket className="w-8 h-8 metallic-gold-icon shimmer-icon" />
          </div>
          <h1 className="text-2xl font-extrabold xps-gold-slow-shimmer mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>Welcome to XPS Intelligence</h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">Follow these steps to get your AI-powered business engine up and running in minutes.</p>
        </div>

        <div className="space-y-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="shimmer-card flex items-center gap-4 p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-all cursor-pointer">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-sm font-bold text-muted-foreground">
                  {step.done ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : i + 1}
                </div>
                <div className="shimmer-icon-container w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 shimmer-icon metallic-silver-icon" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-foreground">{step.title}</div>
                  <div className="text-[11px] text-muted-foreground">{step.desc}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}