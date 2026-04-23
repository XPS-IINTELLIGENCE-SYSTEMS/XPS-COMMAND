import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MobileSelect from "@/components/mobile/MobileSelect";
import { BarChart3, Send } from "lucide-react";

export default function InvestorOutreachDashboard() {
  const [investor, setInvestor] = useState("");
  const [stage, setStage] = useState("lead");
  const [message, setMessage] = useState("");
  const [outreaches, setOutreaches] = useState([]);

  const stageOptions = [
    { value: "lead", label: "Lead" },
    { value: "prospect", label: "Prospect" },
    { value: "negotiation", label: "Negotiation" },
    { value: "committed", label: "Committed" }
  ];

  const sendOutreach = () => {
    if (!investor.trim() || !message.trim()) return;
    const newOutreach = { id: Date.now(), investor, stage, message, sent: new Date() };
    setOutreaches([...outreaches, newOutreach]);
    setInvestor("");
    setMessage("");
  };

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-bold">Investor Outreach</h3>
      </div>

      <div className="space-y-3 bg-card border rounded-lg p-4">
        <Input
          value={investor}
          onChange={e => setInvestor(e.target.value)}
          placeholder="Investor name or fund..."
          className="text-sm"
        />

        <MobileSelect
          value={stage}
          onChange={setStage}
          options={stageOptions}
          placeholder="Pipeline Stage"
        />

        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Outreach message..."
          className="w-full px-3 py-2 rounded-lg bg-background border border-border text-xs text-foreground min-h-20"
        />

        <Button onClick={sendOutreach} className="w-full gap-2">
          <Send className="w-4 h-4" />
          Send Outreach
        </Button>
      </div>

      {outreaches.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground">Recent ({outreaches.length})</h4>
          {outreaches.map(reach => (
            <div key={reach.id} className="p-3 bg-card border rounded-lg">
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-xs font-semibold text-foreground">{reach.investor}</span>
                <span className="text-[9px] text-muted-foreground">{reach.stage}</span>
              </div>
              <p className="text-[10px] text-muted-foreground line-clamp-2">{reach.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}