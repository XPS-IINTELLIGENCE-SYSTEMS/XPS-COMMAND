import { FileText, DollarSign, CheckCircle, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { label: "Total Proposals", value: "342", icon: FileText },
  { label: "Pipeline Value", value: "$2.1M", icon: DollarSign },
  { label: "Approval Rate", value: "68%", icon: CheckCircle },
  { label: "Avg Response", value: "2.4 days", icon: Clock },
];

const proposals = [
  { id: "P-2024-0342", client: "Gulf Coast Logistics", service: "Industrial Epoxy", value: "$120,000", status: "Sent", date: "Mar 15, 2026", statusColor: "text-xps-blue" },
  { id: "P-2024-0341", client: "Ace Hardware Distribution", service: "Polished Concrete", value: "$45,000", status: "Viewed", date: "Mar 14, 2026", statusColor: "text-xps-purple" },
  { id: "P-2024-0340", client: "Tampa Bay Brewing Co.", service: "Decorative Epoxy", value: "$28,000", status: "Sent", date: "Mar 13, 2026", statusColor: "text-xps-blue" },
  { id: "P-2024-0339", client: "Palm Medical Center", service: "Healthcare Flooring", value: "$85,000", status: "Approved", date: "Mar 12, 2026", statusColor: "text-xps-green" },
  { id: "P-2024-0338", client: "Sunshine Auto Group", service: "Garage Floor Coating", value: "$62,000", status: "Sent", date: "Mar 11, 2026", statusColor: "text-xps-blue" },
  { id: "P-2024-0337", client: "Metro Fitness Chain", service: "Rubber Flooring Prep", value: "$34,000", status: "Draft", date: "Mar 10, 2026", statusColor: "text-muted-foreground" },
];

export default function ProposalsView() {
  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-foreground">Proposal Engine</h1>
          <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">AI powered proposals & estimates</p>
        </div>
        <Button size="sm" className="text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-3 h-3" /> <span className="hidden md:inline">Create Proposal</span><span className="md:hidden">New</span>
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-card rounded-lg border border-border p-3 md:p-4 hover:border-primary/20 transition-colors">
              <Icon className="w-5 h-5 text-primary/70 mb-2 md:mb-3" />
              <div className="text-lg md:text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Mobile: Card layout */}
      <div className="md:hidden space-y-2">
        {proposals.map((p) => (
          <div key={p.id} className="bg-card rounded-lg border border-border p-3 active:bg-secondary/30 cursor-pointer">
            <div className="flex items-start justify-between mb-1.5">
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground truncate">{p.client}</div>
                <div className="text-xs text-muted-foreground">{p.service}</div>
              </div>
              <span className="text-sm font-bold text-foreground flex-shrink-0 ml-2">{p.value}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{p.id} · {p.date}</span>
              <span className={`font-medium ${p.statusColor}`}>{p.status}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Table layout */}
      <div className="hidden md:block bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2.5">Proposal ID</th>
              <th className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2.5">Client</th>
              <th className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2.5">Service</th>
              <th className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2.5">Value</th>
              <th className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2.5">Status</th>
              <th className="text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2.5">Date</th>
            </tr>
          </thead>
          <tbody>
            {proposals.map((p) => (
              <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer">
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{p.id}</td>
                <td className="px-4 py-3 text-xs font-medium text-foreground">{p.client}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{p.service}</td>
                <td className="px-4 py-3 text-center text-xs font-semibold text-foreground">{p.value}</td>
                <td className={`px-4 py-3 text-center text-xs font-medium ${p.statusColor}`}>{p.status}</td>
                <td className="px-4 py-3 text-right text-xs text-muted-foreground">{p.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}