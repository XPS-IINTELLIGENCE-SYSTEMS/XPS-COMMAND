import { useMasterDashboard } from "@/hooks/useMasterDashboard";
import { Users, Phone, Mail, TrendingUp, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function CRMIntegrated() {
  const { filteredLeads, selectedLead, data, actions, stats } = useMasterDashboard();
  const [editingLead, setEditingLead] = useState(null);
  const [updating, setUpdating] = useState(false);

  const handleSelectLead = (lead) => {
    actions.selectLead(lead);
  };

  const handleUpdateStage = async (leadId, newStage) => {
    setUpdating(true);
    await actions.updateLead(leadId, { stage: newStage });
    setUpdating(false);
  };

  const handleQualify = async (lead) => {
    await actions.updateLead(lead.id, { stage: "Qualified" });
  };

  const handleCallLead = (lead) => {
    actions.selectLead(lead);
    // This will auto-advance to call_center phase
  };

  const stages = ["Incoming", "Validated", "Qualified", "Contacted", "Proposal", "Negotiation", "Won", "Lost"];

  return (
    <div className="space-y-4">
      {/* Lead Stats Overview */}
      <div className="grid grid-cols-4 gap-2">
        <div className="glass-card rounded-lg p-3 text-center">
          <div className="text-2xl font-black text-primary">{stats.leads}</div>
          <div className="text-[9px] text-muted-foreground">Total Leads</div>
        </div>
        <div className="glass-card rounded-lg p-3 text-center">
          <div className="text-2xl font-black text-blue-400">{filteredLeads.filter(l => l.score > 70).length}</div>
          <div className="text-[9px] text-muted-foreground">Hot (70+)</div>
        </div>
        <div className="glass-card rounded-lg p-3 text-center">
          <div className="text-2xl font-black text-green-400">{data.callLogs.length}</div>
          <div className="text-[9px] text-muted-foreground">Called</div>
        </div>
        <div className="glass-card rounded-lg p-3 text-center">
          <div className="text-2xl font-black text-yellow-400">{filteredLeads.filter(l => l.stage === "Qualified").length}</div>
          <div className="text-[9px] text-muted-foreground">Qualified</div>
        </div>
      </div>

      {/* Selected Lead Detail View */}
      {selectedLead && (
        <div className="glass-card rounded-xl p-4 border border-primary/30 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-black text-lg text-foreground">{selectedLead.company}</h3>
              <p className="text-sm text-muted-foreground">{selectedLead.contact_name}</p>
            </div>
            <span className={`text-[9px] px-3 py-1 rounded-full font-bold ${
              selectedLead.score > 70 ? "bg-green-500/20 text-green-400" :
              selectedLead.score > 40 ? "bg-yellow-500/20 text-yellow-400" :
              "bg-red-500/20 text-red-400"
            }`}>
              Score: {selectedLead.score}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div>
              <span className="text-muted-foreground">Email:</span>
              <p className="font-mono text-foreground">{selectedLead.email || "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Phone:</span>
              <p className="font-mono text-foreground">{selectedLead.phone || "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Stage:</span>
              <p className="font-bold text-foreground">{selectedLead.stage}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Vertical:</span>
              <p className="font-bold text-foreground">{selectedLead.vertical || "—"}</p>
            </div>
          </div>

          {/* Stage progression */}
          <div>
            <p className="text-[9px] font-bold text-muted-foreground uppercase mb-2">Stage Progression</p>
            <div className="flex gap-1 overflow-x-auto">
              {stages.map((s, i) => (
                <button
                  key={s}
                  onClick={() => handleUpdateStage(selectedLead.id, s)}
                  disabled={updating}
                  className={`px-2 py-1 rounded-lg text-[9px] font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                    selectedLead.stage === s
                      ? "metallic-gold-bg text-background"
                      : "glass-card hover:bg-secondary"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={() => handleCallLead(selectedLead)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
              size="sm"
            >
              <Phone className="w-3.5 h-3.5" /> Call Now
            </Button>
            {selectedLead.stage !== "Qualified" && (
              <Button
                onClick={() => handleQualify(selectedLead)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
                size="sm"
              >
                <TrendingUp className="w-3.5 h-3.5" /> Qualify
              </Button>
            )}
          </div>

          {/* AI Insight */}
          {selectedLead.ai_insight && (
            <div className="border-t border-border pt-3">
              <p className="text-[9px] font-bold text-muted-foreground mb-1">🤖 AI Insight</p>
              <p className="text-[10px] text-muted-foreground">{selectedLead.ai_insight}</p>
            </div>
          )}
        </div>
      )}

      {/* Leads List */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">All Leads ({filteredLeads.length})</h3>
        {filteredLeads.slice(0, 10).map((lead, i) => (
          <button
            key={i}
            onClick={() => handleSelectLead(lead)}
            className={`w-full glass-card rounded-lg p-3 text-left transition-all ${
              selectedLead?.id === lead.id ? "border border-primary bg-primary/10" : "hover:bg-secondary"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div>
                <p className="text-sm font-bold text-foreground">{lead.company}</p>
                <p className="text-[9px] text-muted-foreground">{lead.contact_name}</p>
              </div>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                lead.score > 70 ? "bg-green-500/20 text-green-400" :
                lead.score > 40 ? "bg-yellow-500/20 text-yellow-400" :
                "bg-red-500/20 text-red-400"
              }`}>{lead.score}</span>
            </div>
            <div className="flex items-center gap-2 text-[8px]">
              <span className="px-1.5 py-0.5 rounded-full bg-secondary">{lead.stage}</span>
              {lead.phone && <Phone className="w-3 h-3 text-muted-foreground" />}
              {lead.email && <Mail className="w-3 h-3 text-muted-foreground" />}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}