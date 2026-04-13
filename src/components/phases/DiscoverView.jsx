import { useState, useEffect, useCallback } from "react";
import { Search, MapPin, Users, Target, TrendingUp, Database, Mail, Send, Phone, MessageSquare, Share2, Clock, ListChecks, CalendarCheck, GitBranch, Loader2, Package, Hammer } from "lucide-react";
import { base44 } from "@/api/base44Client";
import HScrollRow from "../shared/HScrollRow";
import HCard from "../shared/HCard";
import NavIcon from "../shared/NavIcon";

const TOOLS = [
  { id: "territory", num: "1.1", label: "AI Territory Analyzer", Icon: MapPin, badge: "Intel", cmd: "Analyze the territory for Phoenix metro — find high-value commercial areas" },
  { id: "scraper", num: "1.2", label: "AI Lead Scraper", Icon: Search, badge: "Active", cmd: "Find me 25 leads in Phoenix metro" },
  { id: "enricher", num: "1.3", label: "AI Contact Enricher", Icon: Users, badge: "Enrich", cmd: "Enrich my top 10 leads with contact details" },
  { id: "research", num: "1.4", label: "AI Deep Research", Icon: Target, badge: "Research", cmd: "Do deep research on my highest scored lead" },
  { id: "scorer", num: "1.5", label: "AI Lead Scorer", Icon: TrendingUp, badge: "Score", cmd: "Score all my leads" },
  { id: "autoentry", num: "1.6", label: "AI Auto-Entry", Icon: Database, badge: "Auto", cmd: "Show me all leads sorted by score" },
  { id: "email", num: "1.7", label: "AI Email Writer", Icon: Mail, badge: "Content", cmd: "Write an outreach email for my top lead" },
  { id: "autosend", num: "1.8", label: "AI Auto-Send", Icon: Send, badge: "Send", cmd: "Send outreach emails to my top 5 leads" },
  { id: "callprep", num: "1.9", label: "AI Call Prep", Icon: Phone, badge: "Voice", cmd: "Prepare a call script for my highest scored lead" },
  { id: "sms", num: "1.10", label: "AI SMS Outreach", Icon: MessageSquare, badge: "SMS", cmd: "Send a follow-up SMS to my most recent lead" },
  { id: "content", num: "1.11", label: "AI Content Creator", Icon: Share2, badge: "Social", cmd: "Create a social media post about our epoxy services" },
  { id: "followup", num: "1.12", label: "AI Follow-Up", Icon: Clock, badge: "Auto", cmd: "Set up follow-up sequences for all contacted leads" },
  { id: "logger", num: "1.13", label: "AI Conversation Log", Icon: ListChecks, badge: "Track", cmd: "Show conversation history for my top lead" },
  { id: "scheduler", num: "1.14", label: "AI Scheduler", Icon: CalendarCheck, badge: "Book", cmd: "Schedule a meeting with my highest scored lead" },
  { id: "pipeline", num: "1.15", label: "AI Pipeline Manager", Icon: GitBranch, badge: "CRM", cmd: "Show my pipeline status and recommendations" },
];

export default function DiscoverView({ onChatCommand }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await base44.entities.Lead.list("-created_date", 200);
    setLeads(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const fire = (cmd) => { if (onChatCommand) onChatCommand(cmd); };

  const xpressIncoming = leads.filter(l => l.lead_type === "XPress" && l.pipeline_status === "Incoming");
  const jobsIncoming = leads.filter(l => l.lead_type === "Jobs" && l.pipeline_status === "Incoming");
  const recentLeads = leads.slice(0, 20);

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="text-center pt-2 pb-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-4">
            <NavIcon id="find_work" size="sm" active />
            <span className="text-xs font-semibold text-foreground">DISCOVERY · 15 TOOLS</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>DISCOVER</h1>
          <p className="mt-2 text-xs text-muted-foreground">Find leads, research prospects, build pipeline — all AI-powered</p>
        </div>

        {/* Tools Row — Horizontal */}
        <HScrollRow title="AI DISCOVERY TOOLS" subtitle="Click to run via chat" icon={Search} count={TOOLS.length}>
          {TOOLS.map(t => (
            <HCard key={t.id} title={t.label} subtitle={t.badge} icon={t.Icon} onClick={() => fire(t.cmd)}>
              <div className="text-[9px] text-primary opacity-0 group-hover:opacity-100 transition-opacity mt-1">Run tool →</div>
            </HCard>
          ))}
        </HScrollRow>

        {/* XPress Results */}
        {loading ? (
          <div className="flex items-center gap-2 px-2 py-4 text-xs text-muted-foreground"><Loader2 className="w-3 h-3 animate-spin" /> Loading pipeline data...</div>
        ) : (
          <>
            <HScrollRow title="XPRESS INCOMING" subtitle="Latest contractor leads from scraper" icon={Package} count={xpressIncoming.length} accentColor="text-amber-400">
              {xpressIncoming.slice(0, 15).map(l => (
                <HCard key={l.id} title={l.company} subtitle={`${l.city || ""}, ${l.state || "AZ"} · ${l.source || ""}`} meta={l.score ? `Score: ${l.score}` : null} icon={Package} />
              ))}
              {xpressIncoming.length === 0 && <EmptyCard text="No XPress leads incoming" />}
            </HScrollRow>

            <HScrollRow title="JOBS INCOMING" subtitle="Latest end-buyer project leads" icon={Hammer} count={jobsIncoming.length} accentColor="text-blue-400">
              {jobsIncoming.slice(0, 15).map(l => (
                <HCard key={l.id} title={l.company} subtitle={`${l.vertical || ""} · ${l.city || ""}`} meta={l.estimated_value ? `$${l.estimated_value.toLocaleString()}` : null} icon={Hammer} />
              ))}
              {jobsIncoming.length === 0 && <EmptyCard text="No Jobs leads incoming" />}
            </HScrollRow>

            <HScrollRow title="RECENT RESULTS" subtitle="All recent lead activity" icon={TrendingUp} count={recentLeads.length}>
              {recentLeads.map(l => (
                <HCard key={l.id} title={l.company} subtitle={`${l.lead_type} · ${l.pipeline_status || l.stage}`} meta={l.score ? `Score: ${l.score}` : null} icon={l.lead_type === "XPress" ? Package : Hammer} />
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
    <div className="flex-shrink-0 w-[240px] rounded-xl p-4 bg-white/[0.02] border border-white/[0.06] flex items-center justify-center">
      <span className="text-[11px] text-muted-foreground/50">{text}</span>
    </div>
  );
}