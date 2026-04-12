import { FileText, Plus, ArrowUpRight, Sparkles, CheckCircle2, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { label: "Total Proposals", value: "342", sub: "All time" },
  { label: "Pipeline Value", value: "$2.1M", sub: "Outstanding" },
  { label: "Approval Rate", value: "68%", sub: "+4% vs last Q" },
  { label: "Avg Response", value: "2.4 days", sub: "Time to sign" },
];

const proposals = [
  { id: "P-0342", client: "Gulf Coast Logistics", service: "Industrial Epoxy — 45K sqft", value: "$120,000", status: "Sent", date: "Mar 15", icon: Send },
  { id: "P-0341", client: "Ace Hardware Distribution", service: "Polished Concrete — 12K sqft", value: "$45,000", status: "Viewed", date: "Mar 14", icon: CheckCircle2 },
  { id: "P-0340", client: "Tampa Bay Brewing Co.", service: "Decorative Epoxy — 4.5K sqft", value: "$28,000", status: "Sent", date: "Mar 13", icon: Send },
  { id: "P-0339", client: "Palm Medical Center", service: "Healthcare Flooring — 22K sqft", value: "$85,000", status: "Approved", date: "Mar 12", icon: CheckCircle2 },
  { id: "P-0338", client: "Sunshine Auto Group", service: "Garage Coating — 8K sqft", value: "$62,000", status: "Sent", date: "Mar 11", icon: Send },
  { id: "P-0337", client: "Metro Fitness Chain", service: "Rubber Floor Prep — 6K sqft", value: "$34,000", status: "Draft", date: "Mar 10", icon: Clock },
];

export default function ProposalsView() {
  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-5 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-foreground">Proposals</h1>
          <p className="text-[11px] text-muted-foreground">AI-generated quotes & estimates</p>
        </div>
        <Button size="sm" className="h-9 text-xs gap-1.5 rounded-xl bg-primary text-primary-foreground">
          <Plus className="w-3.5 h-3.5" /> <span className="hidden md:inline">Create Proposal</span><span className="md:hidden">New</span>
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card rounded-2xl border border-border p-3 md:p-4">
            <div className="text-[11px] text-muted-foreground">{stat.label}</div>
            <div className="text-xl font-bold text-foreground mt-1">{stat.value}</div>
            <div className="text-[11px] text-primary/80 mt-0.5">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick action */}
      <button className="w-full flex items-center gap-3 p-4 bg-primary/10 rounded-2xl border border-primary/20 active:scale-[0.98] transition-transform">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div className="text-left flex-1">
          <div className="text-sm font-semibold text-foreground">AI Generate Proposal</div>
          <div className="text-[11px] text-muted-foreground">Create a professional estimate from lead data in seconds</div>
        </div>
        <ArrowUpRight className="w-4 h-4 text-primary flex-shrink-0" />
      </button>

      {/* Proposal list */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Recent Proposals</h3>
        <div className="space-y-2">
          {proposals.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.id} className="bg-card rounded-2xl border border-border p-3 md:p-4 flex items-center gap-3 cursor-pointer hover:border-primary/20 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{p.client}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{p.service} · {p.date}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-foreground">{p.value}</div>
                  <div className="text-[10px] text-muted-foreground">{p.status}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}