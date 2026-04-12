import { Shield, GitBranch, Bot, MapPin, Zap, Users, Mail, Key, Database, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const activities = [
  { action: "Updated RBAC policy for Manager role", type: "security", user: "Marcus R.", time: "2 min ago", icon: Shield },
  { action: "Auto-deployed v2.4.1 from main branch", type: "deploy", user: "System", time: "1 hour ago", icon: GitBranch },
  { action: "AI model fine-tuning completed — accuracy +2.3%", type: "ai", user: "System", time: "2 hours ago", icon: Bot },
  { action: "Added new franchise location: Nashville, TN", type: "location", user: "Admin", time: "3 hours ago", icon: MapPin },
  { action: "Bulk email campaign sent to 342 leads", type: "outreach", user: "Open Claw", time: "5 hours ago", icon: Mail },
  { action: "New user onboarded: Jessica Martinez (Sales Rep)", type: "users", user: "Marcus R.", time: "6 hours ago", icon: Users },
  { action: "API key rotated for HubSpot integration", type: "security", user: "System", time: "8 hours ago", icon: Key },
  { action: "Database backup completed — 2.4 TB", type: "system", user: "System", time: "12 hours ago", icon: Database },
  { action: "Workflow 'Lead Nurture Sequence' activated", type: "automation", user: "Marcus R.", time: "Yesterday", icon: Zap },
  { action: "Competitor watch alert: FloorPro reduced pricing by 8%", type: "ai", user: "Open Claw", time: "Yesterday", icon: Bot },
  { action: "Proposal P-0341 auto-sent to Ace Hardware", type: "outreach", user: "Open Claw", time: "Yesterday", icon: Mail },
  { action: "New locations bulk imported: 5 Southeast territories", type: "location", user: "Admin", time: "2 days ago", icon: MapPin },
];

export default function AdminActivityLog() {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search activity log..." className="pl-10 h-10 text-sm bg-card border-border rounded-xl" />
      </div>

      <div className="space-y-1.5">
        {activities.map((entry, i) => {
          const Icon = entry.icon;
          return (
            <div key={i} className="bg-card rounded-2xl border border-border p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-foreground">{entry.action}</div>
                <div className="text-[10px] text-muted-foreground">{entry.user} · {entry.time}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}