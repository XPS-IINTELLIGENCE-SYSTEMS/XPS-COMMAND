import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Users, Trophy } from "lucide-react";

export default function TeamScoreboard() {
  const [reps, setReps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const [leads, emails, proposals] = await Promise.all([
      base44.entities.Lead.list("-created_date", 1000),
      base44.entities.OutreachEmail.list("-created_date", 500),
      base44.entities.Proposal.list("-created_date", 500),
    ]);

    // Group by created_by (rep email)
    const repMap = {};
    const addRep = (email) => {
      if (!email) return;
      if (!repMap[email]) repMap[email] = { email, leads: 0, emails: 0, proposals: 0, won: 0, pipeline: 0 };
    };

    leads.forEach(l => {
      addRep(l.created_by);
      if (l.created_by && repMap[l.created_by]) {
        repMap[l.created_by].leads++;
        repMap[l.created_by].pipeline += (l.estimated_value || 0);
        if (l.stage === "Won") repMap[l.created_by].won++;
      }
    });
    emails.forEach(e => {
      addRep(e.created_by);
      if (e.created_by && repMap[e.created_by] && e.status === "Sent") repMap[e.created_by].emails++;
    });
    proposals.forEach(p => {
      addRep(p.created_by);
      if (p.created_by && repMap[p.created_by]) repMap[p.created_by].proposals++;
    });

    setReps(Object.values(repMap).sort((a, b) => b.pipeline - a.pipeline));
    setLoading(false);
  };

  if (loading) return <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>;

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-primary" />
        <h3 className="text-base font-bold text-foreground">Team Scoreboard</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left py-2 px-2">#</th>
              <th className="text-left py-2 px-2">Rep</th>
              <th className="text-right py-2 px-2">Leads</th>
              <th className="text-right py-2 px-2">Emails</th>
              <th className="text-right py-2 px-2">Proposals</th>
              <th className="text-right py-2 px-2">Won</th>
              <th className="text-right py-2 px-2">Pipeline</th>
            </tr>
          </thead>
          <tbody>
            {reps.map((r, i) => (
              <tr key={r.email} className="border-b border-border/30">
                <td className="py-2 px-2 font-bold text-primary">{i + 1}</td>
                <td className="py-2 px-2 font-medium text-foreground truncate max-w-[120px]">{r.email.split("@")[0]}</td>
                <td className="py-2 px-2 text-right">{r.leads}</td>
                <td className="py-2 px-2 text-right">{r.emails}</td>
                <td className="py-2 px-2 text-right">{r.proposals}</td>
                <td className="py-2 px-2 text-right text-green-400 font-semibold">{r.won}</td>
                <td className="py-2 px-2 text-right text-primary font-semibold">${(r.pipeline / 1000).toFixed(0)}k</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {reps.length === 0 && <p className="text-center text-xs text-muted-foreground py-4">No team activity yet</p>}
    </div>
  );
}