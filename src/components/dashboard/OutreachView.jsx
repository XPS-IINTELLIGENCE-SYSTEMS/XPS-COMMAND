import { Mail, MessageSquare, Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

const templates = [
  { name: "Initial Outreach — Polishing", type: "Email", status: "Active", uses: 342, lastUsed: "Today" },
  { name: "Follow-Up — No Response (7 day)", type: "Email", status: "Active", uses: 218, lastUsed: "Yesterday" },
  { name: "Proposal Follow-Up", type: "Email", status: "Active", uses: 156, lastUsed: "2 days ago" },
  { name: "Promo Code — Seasonal Offer", type: "Email", status: "Draft", uses: 0, lastUsed: "N/A" },
  { name: "Post-Sale Thank You", type: "Email", status: "Active", uses: 89, lastUsed: "3 days ago" },
  { name: "Appointment Confirmation", type: "SMS", status: "Active", uses: 412, lastUsed: "Today" },
  { name: "Quick Check-In", type: "SMS", status: "Active", uses: 267, lastUsed: "Today" },
  { name: "Reactivation — Dormant Lead", type: "Email", status: "Active", uses: 74, lastUsed: "1 week ago" },
];

export default function OutreachView() {
  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-foreground">Outreach Center</h1>
          <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">Email and SMS templates</p>
        </div>
        <Button size="sm" className="text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-3 h-3" /> <span className="hidden md:inline">New Template</span><span className="md:hidden">New</span>
        </Button>
      </div>

      {/* Mobile: Card layout */}
      <div className="md:hidden space-y-2">
        {templates.map((t) => (
          <div key={t.name} className="bg-card rounded-lg border border-border p-3 active:bg-secondary/30 cursor-pointer">
            <div className="flex items-start justify-between mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                {t.type === "Email" ? <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <MessageSquare className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                <span className="text-sm font-medium text-primary truncate">{t.name}</span>
              </div>
              <Pencil className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 ml-2" />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="bg-secondary px-1.5 py-0.5 rounded text-[10px]">{t.type}</span>
                <span className={t.status === "Active" ? "text-xps-green" : ""}>{t.status}</span>
              </div>
              <span>{t.uses} uses · {t.lastUsed}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Table layout */}
      <div className="hidden md:block bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2.5">Template</th>
              <th className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2.5">Type</th>
              <th className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2.5">Status</th>
              <th className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2.5">Uses</th>
              <th className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2.5">Last Used</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {templates.map((t) => (
              <tr key={t.name} className="border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    {t.type === "Email" ? <Mail className="w-4 h-4 text-muted-foreground" /> : <MessageSquare className="w-4 h-4 text-muted-foreground" />}
                    <span className="text-xs font-medium text-primary">{t.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-xs text-muted-foreground">{t.type}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-[10px] font-medium ${t.status === "Active" ? "text-xps-green" : "text-muted-foreground"}`}>{t.status}</span>
                </td>
                <td className="px-4 py-3 text-center text-xs text-foreground">{t.uses}</td>
                <td className="px-4 py-3 text-center text-xs text-muted-foreground">{t.lastUsed}</td>
                <td className="px-4 py-3">
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground cursor-pointer" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}