import { Mail, MessageSquare, Plus, Send, Users, ArrowUpRight, Phone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useState } from "react";
import { toast } from "sonner";
import QuickSmsModal from "../outreach/QuickSmsModal";
import QuickCallModal from "../outreach/QuickCallModal";

const stats = [
  { label: "Emails Sent", value: "4,218", sub: "This month" },
  { label: "Open Rate", value: "34%", sub: "+2.1% vs last" },
  { label: "Response Rate", value: "13%", sub: "+3.4% vs last" },
  { label: "Meetings Booked", value: "89", sub: "From outreach" },
];

const templates = [
  { name: "Initial Outreach — Epoxy Flooring", type: "Email", status: "Active", uses: 342, lastUsed: "Today" },
  { name: "Follow-Up — No Response (7 day)", type: "Email", status: "Active", uses: 218, lastUsed: "Yesterday" },
  { name: "Proposal Follow-Up", type: "Email", status: "Active", uses: 156, lastUsed: "2 days ago" },
  { name: "Appointment Confirmation", type: "SMS", status: "Active", uses: 412, lastUsed: "Today" },
  { name: "Quick Check-In", type: "SMS", status: "Active", uses: 267, lastUsed: "Today" },
  { name: "Reactivation — Dormant Lead", type: "Email", status: "Active", uses: 74, lastUsed: "1 week ago" },
];

export default function OutreachView() {
  const [smsOpen, setSmsOpen] = useState(false);
  const [callOpen, setCallOpen] = useState(false);

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-5 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-foreground">Outreach</h1>
          <p className="text-[11px] text-muted-foreground">AI-powered email & SMS campaigns</p>
        </div>
        <Button size="sm" className="h-9 text-xs gap-1.5 rounded-xl bg-primary text-primary-foreground">
          <Plus className="w-3.5 h-3.5" /> New Template
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card rounded-2xl border border-border p-3 md:p-4">
            <div className="text-[11px] text-muted-foreground">{stat.label}</div>
            <div className="text-xl font-bold text-foreground mt-1">{stat.value}</div>
            <div className="text-[11px] text-primary/80 mt-0.5">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <button onClick={() => setSmsOpen(true)} className="flex items-center gap-3 p-4 bg-primary/10 rounded-2xl border border-primary/20 active:scale-[0.98] transition-transform">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-foreground">AI SMS</div>
            <div className="text-[11px] text-muted-foreground">Send smart text</div>
          </div>
        </button>
        <button onClick={() => setCallOpen(true)} className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border active:scale-[0.98] transition-transform">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
            <Phone className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-foreground">AI Call</div>
            <div className="text-[11px] text-muted-foreground">AI voice outreach</div>
          </div>
        </button>
        <button className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border active:scale-[0.98] transition-transform">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
            <Send className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-foreground">AI Mass Email</div>
            <div className="text-[11px] text-muted-foreground">Send to leads</div>
          </div>
        </button>
        <button className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border active:scale-[0.98] transition-transform">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
            <Users className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-foreground">AI Sequence</div>
            <div className="text-[11px] text-muted-foreground">Multi-step drip</div>
          </div>
        </button>
      </div>

      {smsOpen && <QuickSmsModal onClose={() => setSmsOpen(false)} />}
      {callOpen && <QuickCallModal onClose={() => setCallOpen(false)} />}

      {/* Templates */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Templates</h3>
        <div className="space-y-2">
          {templates.map((t) => (
            <div key={t.name} className="bg-card rounded-2xl border border-border p-3 md:p-4 flex items-center gap-3 cursor-pointer hover:border-primary/20 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                {t.type === "Email" ? <Mail className="w-4 h-4 text-muted-foreground" /> : <MessageSquare className="w-4 h-4 text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">{t.name}</div>
                <div className="text-[11px] text-muted-foreground">{t.type} · {t.uses} uses · {t.lastUsed}</div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}