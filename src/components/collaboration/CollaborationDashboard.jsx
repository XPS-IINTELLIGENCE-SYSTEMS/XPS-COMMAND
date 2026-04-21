import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, RefreshCw, Brain, Users, Sparkles, Wrench, Play, GitBranch, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AgentPerformanceGrid from "./AgentPerformanceGrid";
import ReflectionFeed from "./ReflectionFeed";
import DelegationTimeline from "./DelegationTimeline";

const AGENT_TYPES = ["All", "Coordinator", "Research", "Scraper", "Writer", "Analyst", "Coder", "Outreach", "Proposal", "SEO", "Content", "Scheduler"];

export default function CollaborationDashboard() {
  const [tab, setTab] = useState("overview");
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Collaboration form
  const [goal, setGoal] = useState("");
  const [collaborating, setCollaborating] = useState(false);
  const [collabResult, setCollabResult] = useState(null);

  // Reflection form
  const [reflectAgent, setReflectAgent] = useState("All");
  const [reflecting, setReflecting] = useState(false);

  const loadDashboard = useCallback(async () => {
    const res = await base44.functions.invoke("multiAgentCollaboration", { action: "dashboard" });
    setDashData(res.data);
    setLoading(false);
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const handleCollaborate = async () => {
    if (!goal.trim()) return;
    setCollaborating(true);
    setCollabResult(null);
    const res = await base44.functions.invoke("multiAgentCollaboration", { action: "collaborate", goal: goal.trim() });
    setCollabResult(res.data);
    setCollaborating(false);
    loadDashboard();
  };

  const handleReflect = async () => {
    setReflecting(true);
    await base44.functions.invoke("multiAgentCollaboration", {
      action: "reflect",
      agent_type: reflectAgent === "All" ? null : reflectAgent,
      trigger: "manual",
    });
    setReflecting(false);
    loadDashboard();
  };

  if (loading && !dashData) return <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  const totalCorrections = dashData?.total_self_corrections || 0;
  const activeCollabs = dashData?.active_collaborations?.length || 0;
  const reflectionCount = dashData?.recent_reflections?.length || 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl metallic-gold-bg flex items-center justify-center">
            <Users className="w-5 h-5 text-background" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold metallic-gold">Multi-Agent Collaboration</h2>
            <p className="text-[10px] text-muted-foreground">Autonomous coordination • Dynamic delegation • Self-reflection • Skill upgrades</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="text-[9px] bg-primary/10 text-primary">{totalCorrections} Self-Corrections</Badge>
          <Badge className="text-[9px] bg-green-500/10 text-green-400">{activeCollabs} Active</Badge>
          <Badge className="text-[9px] bg-purple-500/10 text-purple-400">{reflectionCount} Reflections</Badge>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setLoading(true); loadDashboard(); }}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-secondary/50 p-0.5 h-auto flex-wrap justify-start">
          <TabsTrigger value="overview" className="text-[10px] px-3 py-1.5 gap-1.5"><TrendingUp className="w-3 h-3" /> Overview</TabsTrigger>
          <TabsTrigger value="collaborate" className="text-[10px] px-3 py-1.5 gap-1.5"><Zap className="w-3 h-3" /> Collaborate</TabsTrigger>
          <TabsTrigger value="reflections" className="text-[10px] px-3 py-1.5 gap-1.5"><Brain className="w-3 h-3" /> Reflections</TabsTrigger>
          <TabsTrigger value="delegations" className="text-[10px] px-3 py-1.5 gap-1.5"><GitBranch className="w-3 h-3" /> Delegations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-3 space-y-4">
          <AgentPerformanceGrid agentPerformance={dashData?.agent_performance} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="glass-card rounded-xl p-4">
              <h3 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5"><Brain className="w-3.5 h-3.5 text-primary" /> Latest Reflections</h3>
              <ReflectionFeed reflections={(dashData?.recent_reflections || []).slice(0, 3)} />
            </div>
            <div className="glass-card rounded-xl p-4">
              <h3 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5"><GitBranch className="w-3.5 h-3.5 text-primary" /> Recent Delegations</h3>
              <DelegationTimeline delegations={(dashData?.recent_delegations || []).slice(0, 8)} />
            </div>
          </div>
        </TabsContent>

        {/* Collaborate Tab */}
        <TabsContent value="collaborate" className="mt-3 space-y-3">
          <div className="glass-card rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Launch Multi-Agent Collaboration</h3>
            </div>
            <p className="text-[10px] text-muted-foreground">Describe a complex goal — the AI will plan phases, assign agents, coordinate data passing, self-correct low-quality output, and run a post-collaboration reflection.</p>
            <Textarea value={goal} onChange={e => setGoal(e.target.value)} placeholder="e.g. Research 50 warehouse facilities in Texas, score them, write personalized outreach for the top 10, and create proposals for the top 3..." rows={3} className="text-xs resize-none" />
            <Button onClick={handleCollaborate} disabled={collaborating || !goal.trim()} className="w-full metallic-gold-bg text-background font-bold">
              {collaborating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {collaborating ? "Agents Collaborating..." : "Launch Collaboration"}
            </Button>

            {collabResult && !collabResult.error && (
              <div className="space-y-2 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="text-[8px] bg-green-500/10 text-green-400">Complete</Badge>
                  <span className="text-[9px] text-muted-foreground">{collabResult.total_agents} agents • {collabResult.phases?.length} phases • {collabResult.self_corrections} self-corrections</span>
                </div>
                {collabResult.phases?.map((phase, pi) => (
                  <div key={pi} className="ml-2 border-l-2 border-primary/20 pl-2">
                    <p className="text-[9px] font-bold text-foreground">Phase {phase.phase}: {phase.name}</p>
                    {phase.results?.map((r, ri) => (
                      <div key={ri} className="flex items-start gap-1.5 mt-1">
                        <Badge className="text-[7px] px-1 py-0 flex-shrink-0">{r.agent}</Badge>
                        <p className="text-[9px] text-muted-foreground">{r.summary}</p>
                        {r.self_corrected && <Badge className="text-[7px] px-1 py-0 bg-yellow-500/10 text-yellow-400 flex-shrink-0">Fixed</Badge>}
                      </div>
                    ))}
                  </div>
                ))}
                {collabResult.reflection && (
                  <div className="mt-2 p-2 rounded-lg bg-purple-500/5 border border-purple-500/20">
                    <p className="text-[9px] font-bold text-purple-400 mb-1">Post-Collaboration Reflection (Score: {collabResult.reflection.collaboration_score}/100)</p>
                    <p className="text-[9px] text-muted-foreground">{collabResult.reflection.full_review}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Reflections Tab */}
        <TabsContent value="reflections" className="mt-3 space-y-3">
          <div className="glass-card rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Trigger Self-Reflection</h3>
              </div>
              <div className="flex items-center gap-2">
                <Select value={reflectAgent} onValueChange={setReflectAgent}>
                  <SelectTrigger className="h-7 text-[10px] w-28"><SelectValue /></SelectTrigger>
                  <SelectContent>{AGENT_TYPES.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                </Select>
                <Button onClick={handleReflect} disabled={reflecting} size="sm" className="h-7 text-[10px] metallic-gold-bg text-background">
                  {reflecting ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Brain className="w-3 h-3 mr-1" />}
                  Reflect
                </Button>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">Agents analyze their recent performance, identify weaknesses, recommend skill upgrades, and suggest prompt optimizations.</p>
          </div>
          <ReflectionFeed reflections={dashData?.recent_reflections} />
        </TabsContent>

        {/* Delegations Tab */}
        <TabsContent value="delegations" className="mt-3">
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <GitBranch className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Delegation History</h3>
              <span className="text-[9px] text-muted-foreground">{dashData?.recent_delegations?.length || 0} delegations tracked</span>
            </div>
            <DelegationTimeline delegations={dashData?.recent_delegations} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}