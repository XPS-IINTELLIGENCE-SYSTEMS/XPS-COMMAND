import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";

import OrchestratorHeader from "./OrchestratorHeader";
import CeoBriefing from "./CeoBriefing";
import AgentActionsFeed from "./AgentActionsFeed";
import StrategicDecisions from "./StrategicDecisions";
import CycleHistory from "./CycleHistory";

export default function OrchestratorDashboard() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [cycleType, setCycleType] = useState('on_demand');
  const [latestResult, setLatestResult] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const data = await base44.entities.OrchestratorLog.list('-created_date', 30).catch(() => []);
    setLogs(data);
    setLoading(false);
  };

  const runCycle = async () => {
    setRunning(true);
    setLatestResult(null);
    const res = await base44.functions.invoke('orchestratorEngine', { cycle_type: cycleType }).catch(e => ({ data: { error: e.message } }));
    setLatestResult(res.data);
    await loadData();
    setRunning(false);
  };

  const lastComplete = logs.find(l => l.status === 'complete');
  const healthScore = latestResult?.health_score || lastComplete?.health_score || 0;

  // Parse latest log for display if no live result
  let displayActions = latestResult?.actions_executed || [];
  let displayDecisions = latestResult?.strategic_decisions || [];
  let displayImprovements = latestResult?.improvements || [];
  let displayScheduled = latestResult?.scheduled_next || [];
  let displayRisks = latestResult?.risk_alerts || [];
  let displaySummary = latestResult?.summary || '';

  if (!latestResult && lastComplete) {
    try { displayActions = JSON.parse(lastComplete.actions_taken || '[]'); } catch {}
    try { displayDecisions = JSON.parse(lastComplete.decisions_made || '[]'); } catch {}
    try { displayImprovements = JSON.parse(lastComplete.improvements_made || '[]'); } catch {}
    try { displayScheduled = JSON.parse(lastComplete.next_scheduled_actions || '[]'); } catch {}
    displaySummary = lastComplete.summary || '';
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4 p-4 sm:p-6 max-w-[1200px] mx-auto">
      <OrchestratorHeader
        healthScore={healthScore}
        lastCycle={lastComplete}
        running={running}
        cycleType={cycleType}
        onCycleChange={setCycleType}
        onRun={runCycle}
      />

      {/* CEO Briefing */}
      <CeoBriefing summary={displaySummary} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AgentActionsFeed actions={displayActions} />
        <StrategicDecisions
          decisions={displayDecisions}
          improvements={displayImprovements}
          scheduled={displayScheduled}
          risks={displayRisks}
        />
      </div>

      {/* History */}
      <CycleHistory logs={logs} />
    </div>
  );
}