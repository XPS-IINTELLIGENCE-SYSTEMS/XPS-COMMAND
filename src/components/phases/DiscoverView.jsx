import { useState, useEffect, useCallback } from "react";
import { Search, MapPin, Users, Target, TrendingUp, Database, Mail, Send, Phone, MessageSquare, Share2, Clock, ListChecks, CalendarCheck, GitBranch, Loader2, Package, Hammer } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getIconColor } from "@/lib/iconColors";
import HScrollRow from "../shared/HScrollRow";
import HCard from "../shared/HCard";
import NavIcon from "../shared/NavIcon";

const WORKFLOW_ID = "find_work";

const TOOLS = [
  { id: "territory", label: "AI Territory Analyzer", Icon: MapPin },
  { id: "scraper", label: "AI Lead Scraper", Icon: Search },
  { id: "enricher", label: "AI Contact Enricher", Icon: Users },
  { id: "research", label: "AI Deep Research", Icon: Target },
  { id: "scorer", label: "AI Lead Scorer", Icon: TrendingUp },
  { id: "autoentry", label: "AI Auto-Entry", Icon: Database },
  { id: "email", label: "AI Email Writer", Icon: Mail },
  { id: "send", label: "AI Auto-Send", Icon: Send },
  { id: "call", label: "AI Call Prep", Icon: Phone },
  { id: "sms", label: "AI SMS Outreach", Icon: MessageSquare },
  { id: "content", label: "AI Content Creator", Icon: Share2 },
  { id: "followup_contact", label: "AI Follow-Up", Icon: Clock },
  { id: "logger", label: "AI Conversation Log", Icon: ListChecks },
  { id: "scheduler", label: "AI Scheduler", Icon: CalendarCheck },
  { id: "pipeline", label: "AI Pipeline Manager", Icon: GitBranch },
];

export default function DiscoverView({ onChatCommand, onOpenTool }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const color = getIconColor(WORKFLOW_ID);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await base44.entities.Lead.list("-created_date", 200);
    setLeads(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const xpressIncoming = leads.filter(l => l.lead_type === "XPress" && l.pipeline_status === "Incoming");
  const jobsIncoming = leads.filter(l => l.lead_type === "Jobs" && l.pipeline_status === "Incoming");
  const recentLeads = leads.slice(0, 20);

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 md:p-8 space-y-12">
        <div className="text-center pt-2 pb-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-4">
            <NavIcon id={WORKFLOW_ID} size="sm" active />
            <span className="text-xs font-semibold text-white">DISCOVERY · {TOOLS.length} TOOLS</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>DISCOVER</h1>
          <p className="mt-2 text-xs text-white/40">Find leads, research prospects, build pipeline — all AI-powered</p>
        </div>

        <HScrollRow title="AI DISCOVERY TOOLS" subtitle="Click to open tool" icon={Search} count={TOOLS.length}>
          {TOOLS.map(t => (
            <HCard key={t.id} title={t.label} icon={t.Icon} iconColor={color} onClick={() => onOpenTool?.(t.id, WORKFLOW_ID)}>
              <div className="text-[9px] opacity-0 group-hover:opacity-100 transition-opacity mt-1" style={{ color }}>Open tool →</div>
            </HCard>
          ))}
        </HScrollRow>

        {loading ? (
          <div className="flex items-center gap-2 px-2 py-4 text-xs text-muted-foreground"><Loader2 className="w-3 h-3 animate-spin" /> Loading pipeline data...</div>
        ) : (
          <>
            <HScrollRow title="XPRESS PIPELINE — INCOMING" subtitle="Latest contractor leads" icon={Package} count={xpressIncoming.length}>
              {xpressIncoming.slice(0, 15).map(l => (
                <HCard key={l.id} title={l.company} subtitle={`${l.city || ""}, ${l.state || "AZ"} · ${l.source || ""}`} meta={l.score ? `Score: ${l.score}` : null} icon={Package} iconColor={getIconColor("xpress_leads")} />
              ))}
              {xpressIncoming.length === 0 && <EmptyCard text="No XPress leads incoming" />}
            </HScrollRow>

            <HScrollRow title="JOBS PIPELINE — INCOMING" subtitle="Latest project leads" icon={Hammer} count={jobsIncoming.length}>
              {jobsIncoming.slice(0, 15).map(l => (
                <HCard key={l.id} title={l.company} subtitle={`${l.vertical || ""} · ${l.city || ""}`} meta={l.estimated_value ? `$${l.estimated_value.toLocaleString()}` : null} icon={Hammer} iconColor={getIconColor("job_leads")} />
              ))}
              {jobsIncoming.length === 0 && <EmptyCard text="No Jobs leads incoming" />}
            </HScrollRow>

            <HScrollRow title="RECENT RESULTS" subtitle="All recent lead activity" icon={TrendingUp} count={recentLeads.length}>
              {recentLeads.map(l => (
                <HCard key={l.id} title={l.company} subtitle={`${l.lead_type} · ${l.pipeline_status || l.stage}`} meta={l.score ? `Score: ${l.score}` : null} icon={l.lead_type === "XPress" ? Package : Hammer} iconColor={getIconColor(l.lead_type === "XPress" ? "xpress_leads" : "job_leads")} />
              ))}
            </HScrollRow>
          </>
        )}
      </div>
    </div>
  );
}

function EmptyCard({ text }) {
  return (
    <div className="flex-shrink-0 w-[240px] rounded-xl p-4 bg-black/60 border border-white/[0.06] flex items-center justify-center">
      <span className="text-[11px] text-muted-foreground/50">{text}</span>
    </div>
  );
}