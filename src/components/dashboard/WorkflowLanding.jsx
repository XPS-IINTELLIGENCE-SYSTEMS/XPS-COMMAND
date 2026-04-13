import { Compass, Search, Package, Hammer, Phone, Clock, Trophy, HardHat, DollarSign, BarChart3, Lightbulb, Bot, CalendarClock, Settings, Users, ArrowRight } from "lucide-react";

const WORKFLOW_STEPS = [
  { id: "start_here", label: "Get Started", desc: "Set up your account and learn the basics", icon: Compass, group: "Setup" },
  { id: "find_work", label: "Discover Leads", desc: "AI-powered prospecting and research", icon: Search, group: "Prospecting" },
  { id: "xpress_leads", label: "XPress Pipeline", desc: "Manage contractor & operator leads", icon: Package, group: "Prospecting" },
  { id: "job_leads", label: "Jobs Pipeline", desc: "End-buyer project lead pipeline", icon: Hammer, group: "Prospecting" },
  { id: "crm", label: "CRM Board", desc: "Full deal tracking and management", icon: Users, group: "Prospecting" },
  { id: "get_work", label: "Contact & Outreach", desc: "Email, SMS, calls — reach your leads", icon: Phone, group: "Outreach" },
  { id: "follow_up", label: "Follow-Up", desc: "Automated drip sequences and reminders", icon: Clock, group: "Outreach" },
  { id: "win_work", label: "Close Deals", desc: "Proposals, bids, and negotiations", icon: Trophy, group: "Closing" },
  { id: "do_work", label: "Execute Jobs", desc: "Scheduling, crews, and tracking", icon: HardHat, group: "Execution" },
  { id: "get_paid", label: "Collect Payment", desc: "Invoicing and payment collection", icon: DollarSign, group: "Revenue" },
  { id: "analytics", label: "Analytics", desc: "Charts, KPIs, and revenue insights", icon: BarChart3, group: "Insights" },
  { id: "tips", label: "Tips & Tricks", desc: "Pro knowledge for every stage", icon: Lightbulb, group: "Insights" },
  { id: "agents", label: "AI Agents", desc: "Your fleet of AI assistants", icon: Bot, group: "System" },
  { id: "task_scheduler", label: "Task Scheduler", desc: "Automate scraping and workflows", icon: CalendarClock, group: "System" },
  { id: "settings", label: "Settings", desc: "Account and app preferences", icon: Settings, group: "System" },
];

const GROUP_ORDER = ["Setup", "Prospecting", "Outreach", "Closing", "Execution", "Revenue", "Insights", "System"];

export default function WorkflowLanding({ onSelect }) {
  const grouped = {};
  WORKFLOW_STEPS.forEach(s => {
    if (!grouped[s.group]) grouped[s.group] = [];
    grouped[s.group].push(s);
  });

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl overflow-y-auto safe-top safe-bottom">
      <div className="min-h-full flex flex-col items-center justify-start px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <img
            src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg"
            alt="XPS"
            className="w-14 h-14 object-contain mx-auto mb-4"
          />
          <h1
            className="text-2xl md:text-4xl font-extrabold xps-gold-slow-shimmer tracking-tight"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            WHERE DO YOU WANT TO START?
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            Choose your priority — you can always switch between any section at any time
          </p>
        </div>

        {/* Workflow groups */}
        <div className="w-full max-w-4xl space-y-6 md:space-y-8">
          {GROUP_ORDER.map(group => {
            const items = grouped[group];
            if (!items) return null;
            return (
              <div key={group}>
                <div className="text-xs font-bold tracking-widest text-muted-foreground/60 uppercase mb-3 px-1">
                  {group}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map(step => {
                    const Icon = step.icon;
                    return (
                      <button
                        key={step.id}
                        onClick={() => onSelect(step.id)}
                        className="group flex items-center gap-4 p-4 rounded-2xl bg-white/[0.04] backdrop-blur-xl border animated-silver-border hover:border-primary/40 hover:bg-white/[0.08] transition-all duration-200 text-left active:scale-[0.97]"
                      >
                        <div className="w-11 h-11 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0 group-hover:border-primary/30 transition-colors">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-foreground">{step.label}</div>
                          <div className="text-[11px] text-muted-foreground leading-snug mt-0.5">{step.desc}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Skip / go to command center */}
        <button
          onClick={() => onSelect("command")}
          className="mt-8 mb-4 text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
        >
          Skip — go to Command Center
        </button>
      </div>
    </div>
  );
}