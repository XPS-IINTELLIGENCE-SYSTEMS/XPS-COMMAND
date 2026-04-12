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
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Proposal Engine</h1>
          <p className="text-xs text-muted-foreground mt-0.5">AI powered proposals, estimates, and invoices</p>
        </div>
        <Button size="sm" className="text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-3 h-3" /> Create Proposal
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-card rounded-lg border border-border p-4 hover:border-primary/20 transition-colors">
              <Icon className="w-5 h-5 text-primary/70 mb-3" />
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
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