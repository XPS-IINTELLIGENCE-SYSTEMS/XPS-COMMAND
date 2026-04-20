import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Mail, Loader2, Play, Pause, BarChart3, Clock, Send, CheckCircle2, Eye, MessageSquare } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

const STAGE_CONFIG = [
  { stage: 0, label: "Initial Outreach", dayOffset: 0, desc: "Introduction & bid list request" },
  { stage: 1, label: "Follow-Up #1", dayOffset: 3, desc: "Gentle check-in (Day 3)" },
  { stage: 2, label: "Follow-Up #2", dayOffset: 7, desc: "Value proposition (Day 7)" },
  { stage: 3, label: "Follow-Up #3", dayOffset: 14, desc: "Case study / social proof (Day 14)" },
  { stage: 4, label: "Final Follow-Up", dayOffset: 30, desc: "Last touch — breakup email (Day 30)" },
];

const STAGE_TEMPLATES = [
  {
    subjectFn: (gc) => `Flooring Subcontractor — ${gc.company_name} Bid List Request`,
    bodyFn: (gc) => `Hi ${gc.preconstruction_contact_name || "Preconstruction Team"},\n\nMy name is Jeremy with Xtreme Polishing Systems. We're a national flooring subcontractor specializing in epoxy, polished concrete, and high-performance coatings for ${gc.project_types ? JSON.parse(gc.project_types).slice(0,3).join(", ") : "commercial"} projects.\n\nWe'd love to be added to your bid list for upcoming projects${gc.state ? ` in ${gc.state}` : ""}. We're pre-qualified, carry full insurance, and can handle projects from 5,000 to 500,000+ SF.\n\nWould you be open to adding us?\n\nBest regards,\nJeremy\nXtreme Polishing Systems`,
  },
  {
    subjectFn: (gc) => `Quick follow-up — XPS bid list for ${gc.company_name}`,
    bodyFn: (gc) => `Hi ${gc.preconstruction_contact_name || "there"},\n\nJust following up on my note from a few days ago about getting on ${gc.company_name}'s bid list. We've completed 500+ commercial flooring projects nationwide and would love to bid on your upcoming work.\n\nHappy to send our qualifications package if helpful.\n\nBest,\nJeremy`,
  },
  {
    subjectFn: (gc) => `Why GCs choose XPS — ${gc.company_name}`,
    bodyFn: (gc) => `Hi ${gc.preconstruction_contact_name || "there"},\n\nWanted to share a quick snapshot of why GCs partner with us:\n\n• 98% on-time completion rate\n• In-house crews — no sub-sub surprises\n• National reach with local execution\n• Avg bid turnaround: 48 hours\n\nWe'd love to earn a shot at your next flooring scope. Can I send over our capabilities deck?\n\nBest,\nJeremy`,
  },
  {
    subjectFn: (gc) => `Case study: 200K SF warehouse — ${gc.state || "your region"}`,
    bodyFn: (gc) => `Hi ${gc.preconstruction_contact_name || "there"},\n\nI wanted to share a relevant project: we recently completed a 200,000 SF polished concrete install for a national GC — delivered 2 days early and $15K under budget.\n\nWe'd love to bring that same execution to ${gc.company_name}'s projects. Would a 10-minute call this week work?\n\nBest,\nJeremy`,
  },
  {
    subjectFn: (gc) => `Closing the loop — XPS + ${gc.company_name}`,
    bodyFn: (gc) => `Hi ${gc.preconstruction_contact_name || "there"},\n\nI've reached out a few times about getting on ${gc.company_name}'s bid list. I know timing may not be right — no worries.\n\nIf a flooring scope does come across your desk, I'd love to be considered. I'll keep your info on file and check back in a few months.\n\nAll the best,\nJeremy\nXtreme Polishing Systems`,
  },
];

export default function SniperCampaignManager({ gcs, onRefresh }) {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    base44.entities.OutreachEmail.list("-created_date", 500)
      .then(setEmails)
      .catch(() => setEmails([]))
      .finally(() => setLoading(false));
  }, []);

  // Analytics
  const analytics = useMemo(() => {
    const byStage = STAGE_CONFIG.map(s => {
      const stageEmails = emails.filter(e => (e.campaign_stage || 0) === s.stage);
      const sent = stageEmails.filter(e => ["Sent", "Opened", "Replied"].includes(e.status)).length;
      const opened = stageEmails.filter(e => ["Opened", "Replied"].includes(e.status)).length;
      const replied = stageEmails.filter(e => e.status === "Replied").length;
      return {
        ...s,
        sent,
        opened,
        replied,
        openRate: sent > 0 ? ((opened / sent) * 100).toFixed(1) : "0",
        replyRate: sent > 0 ? ((replied / sent) * 100).toFixed(1) : "0",
      };
    });

    const totalSent = emails.filter(e => ["Sent", "Opened", "Replied"].includes(e.status)).length;
    const totalOpened = emails.filter(e => ["Opened", "Replied"].includes(e.status)).length;
    const totalReplied = emails.filter(e => e.status === "Replied").length;

    // Chart data
    const chartData = byStage.filter(s => s.sent > 0).map(s => ({
      name: s.label.replace("Follow-Up ", "FU"),
      Sent: s.sent,
      Opened: s.opened,
      Replied: s.replied,
    }));

    // Best performing stage
    const bestStage = byStage.reduce((best, s) => {
      const rate = parseFloat(s.replyRate);
      return rate > parseFloat(best.replyRate) ? s : best;
    }, byStage[0]);

    return { byStage, totalSent, totalOpened, totalReplied, chartData, bestStage };
  }, [emails]);

  // Run campaign: find eligible GCs and send next stage
  const runCampaign = async () => {
    setRunning(true);
    let sentCount = 0;

    // Get GCs that were contacted but haven't replied
    const eligibleGCs = gcs.filter(gc => {
      if (gc.bid_list_status === "not_contacted") return false;
      if (["active", "approved", "rejected"].includes(gc.bid_list_status)) return false;
      return true;
    });

    for (const gc of eligibleGCs.slice(0, 20)) {
      // Find their latest campaign email
      const gcEmails = emails.filter(e => e.gc_id === gc.id && e.campaign_stage !== undefined);
      const latestStage = gcEmails.length > 0
        ? Math.max(...gcEmails.map(e => e.campaign_stage || 0))
        : -1;

      // Check if replied — stop sequence
      if (gcEmails.some(e => e.status === "Replied")) continue;

      const nextStage = latestStage + 1;
      if (nextStage > 4) continue;

      // Check timing: last email must be old enough
      const lastEmail = gcEmails.sort((a, b) => new Date(b.sent_at || b.created_date) - new Date(a.sent_at || a.created_date))[0];
      if (lastEmail) {
        const daysSince = (Date.now() - new Date(lastEmail.sent_at || lastEmail.created_date)) / (1000 * 60 * 60 * 24);
        const requiredDays = STAGE_CONFIG[nextStage]?.dayOffset - (STAGE_CONFIG[latestStage]?.dayOffset || 0);
        if (daysSince < requiredDays) continue;
      }

      const template = STAGE_TEMPLATES[nextStage];
      if (!template) continue;

      const toEmail = gc.preconstruction_email || gc.email;
      if (!toEmail) continue;

      const subject = template.subjectFn(gc);
      const body = template.bodyFn(gc);

      // Send email
      await base44.integrations.Core.SendEmail({
        to: toEmail,
        subject,
        body,
        from_name: "Jeremy — XPS"
      }).catch(() => {});

      // Log it
      await base44.entities.OutreachEmail.create({
        to_email: toEmail,
        to_name: gc.preconstruction_contact_name || gc.company_name,
        subject,
        body,
        status: "Sent",
        email_type: nextStage === 0 ? "Initial Outreach" : "Follow-Up",
        gc_id: gc.id,
        campaign_stage: nextStage,
        sent_at: new Date().toISOString(),
      });

      // Update GC follow-up stage
      await base44.entities.ContractorCompany.update(gc.id, {
        follow_up_stage: nextStage,
        last_follow_up_date: new Date().toISOString(),
      });

      sentCount++;
    }

    // Refresh data
    const updated = await base44.entities.OutreachEmail.list("-created_date", 500).catch(() => []);
    setEmails(updated);
    setRunning(false);
    onRefresh?.();
    alert(`Campaign run complete: ${sentCount} emails sent`);
  };

  if (loading) return <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-primary" /></div>;

  return (
    <div className="glass-card rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 metallic-gold-icon" />
          <span className="text-xs font-bold metallic-gold">Email Campaign Manager</span>
        </div>
        <Button size="sm" onClick={runCampaign} disabled={running} className="text-xs h-7 metallic-gold-bg text-background">
          {running ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Play className="w-3 h-3 mr-1" />}
          {running ? "Running..." : "Run Campaign Cycle"}
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <CampaignKPI icon={Send} label="Total Sent" value={analytics.totalSent} color="#d4af37" />
        <CampaignKPI icon={Eye} label="Opened" value={`${analytics.totalOpened} (${analytics.totalSent > 0 ? ((analytics.totalOpened/analytics.totalSent)*100).toFixed(0) : 0}%)`} color="#06b6d4" />
        <CampaignKPI icon={MessageSquare} label="Replied" value={`${analytics.totalReplied} (${analytics.totalSent > 0 ? ((analytics.totalReplied/analytics.totalSent)*100).toFixed(0) : 0}%)`} color="#22c55e" />
        <CampaignKPI icon={BarChart3} label="Best Stage" value={analytics.bestStage?.label || "—"} color="#8b5cf6" />
      </div>

      {/* Stage funnel */}
      <div className="space-y-1.5">
        <h3 className="text-[11px] font-bold text-foreground">Campaign Stages</h3>
        {analytics.byStage.map(s => (
          <div key={s.stage} className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0">{s.stage}</div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-medium text-foreground">{s.label}</div>
              <div className="text-[9px] text-muted-foreground">{s.desc} — Day {s.dayOffset}</div>
            </div>
            <div className="flex gap-3 text-[10px] flex-shrink-0">
              <span className="text-muted-foreground">{s.sent} sent</span>
              <span className="text-cyan-400">{s.openRate}% open</span>
              <span className="text-green-400">{s.replyRate}% reply</span>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Chart */}
      {analytics.chartData.length > 0 && (
        <div>
          <h3 className="text-[11px] font-bold text-foreground mb-2">Stage Performance</h3>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.chartData} barGap={2}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#888" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#888" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "hsl(240 8% 7%)", border: "1px solid hsl(240 6% 14%)", borderRadius: 8, fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="Sent" fill="#64748b" radius={[3,3,0,0]} />
                <Bar dataKey="Opened" fill="#06b6d4" radius={[3,3,0,0]} />
                <Bar dataKey="Replied" fill="#22c55e" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div>
        <h3 className="text-[11px] font-bold text-foreground mb-2">Recent Campaign Activity</h3>
        <div className="max-h-[160px] overflow-y-auto space-y-1">
          {emails.slice(0, 20).map(e => (
            <div key={e.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.03] text-[10px]">
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                e.status === "Replied" ? "bg-green-500/20 text-green-400" :
                e.status === "Opened" ? "bg-cyan-500/20 text-cyan-400" :
                e.status === "Sent" ? "bg-primary/20 text-primary" :
                "bg-secondary text-muted-foreground"
              }`}>{e.status}</span>
              {e.campaign_stage !== undefined && (
                <span className="text-[8px] text-muted-foreground bg-secondary px-1 rounded">S{e.campaign_stage}</span>
              )}
              <span className="text-foreground font-medium truncate flex-1">{e.to_name || e.to_email}</span>
              <span className="text-muted-foreground/60 flex-shrink-0">{e.sent_at ? new Date(e.sent_at).toLocaleDateString() : "—"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CampaignKPI({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2.5 text-center">
      <Icon className="w-3.5 h-3.5 mx-auto mb-1" style={{ color }} />
      <div className="text-sm font-bold text-foreground">{value}</div>
      <div className="text-[9px] text-muted-foreground">{label}</div>
    </div>
  );
}