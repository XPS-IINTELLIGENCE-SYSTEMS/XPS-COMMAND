import { useState } from "react";
import { Search, Zap, FileText, Send, Mail, DollarSign, HardHat, CheckCircle2, ArrowRight, Database, BookOpen, Link2 } from "lucide-react";

const WORKFLOW_STEPS = [
  { id: 1, icon: Search, label: "Job Discovery", desc: "Scrape SAM.gov, Dodge, permits, bid boards", color: "#3b82f6", status: "active" },
  { id: 2, icon: Database, label: "Ingest to CRM", desc: "Auto-create CommercialJob records", color: "#06b6d4", status: "active" },
  { id: 3, icon: Zap, label: "AI Takeoff", desc: "Zone breakdown, materials, labor, pricing", color: "#f59e0b", status: "active" },
  { id: 4, icon: BookOpen, label: "Competitive Pricing", desc: "Scrape competitor pricing intelligence", color: "#8b5cf6", status: "active" },
  { id: 5, icon: FileText, label: "Generate Bid Package", desc: "Full proposal with credentials & scope", color: "#ec4899", status: "active" },
  { id: 6, icon: Send, label: "Send to Contractor", desc: "Email bid package to GC/Owner", color: "#10b981", status: "active" },
  { id: 7, icon: Mail, label: "Follow-Up System", desc: "Auto follow-up emails at 3, 7, 14 days", color: "#f97316", status: "active" },
  { id: 8, icon: CheckCircle2, label: "Win → Contract", desc: "AI contract + DocuSign integration", color: "#22c55e", status: "planned" },
  { id: 9, icon: DollarSign, label: "Invoice & Payment", desc: "Branded AI invoice, deposit tracking", color: "#d4af37", status: "planned" },
  { id: 10, icon: HardHat, label: "Job Operations", desc: "Photos, notes, crew management", color: "#ef4444", status: "active" },
];

const CONNECTORS = [
  { label: "Email (SendGrid)", status: "connected", color: "#10b981" },
  { label: "Google Drive", status: "connected", color: "#10b981" },
  { label: "Google Sheets", status: "connected", color: "#10b981" },
  { label: "Gmail", status: "connected", color: "#10b981" },
  { label: "HubSpot CRM", status: "available", color: "#f59e0b" },
  { label: "DocuSign", status: "planned", color: "#94a3b8" },
  { label: "SAM.gov API", status: "active", color: "#10b981" },
  { label: "Dodge Data", status: "planned", color: "#94a3b8" },
  { label: "ConstructConnect", status: "planned", color: "#94a3b8" },
];

export default function BidWorkflowTab() {
  const [selectedStep, setSelectedStep] = useState(null);

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-1">Bid Automation Workflow</h2>
      <p className="text-xs text-muted-foreground mb-6">End-to-end autonomous bidding pipeline — from discovery to payment.</p>

      {/* Visual Workflow */}
      <div className="glass-card rounded-xl p-6 mb-6">
        <div className="flex flex-wrap items-center gap-2 justify-center">
          {WORKFLOW_STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedStep(selectedStep === step.id ? null : step.id)}
                  className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all min-w-[90px] ${
                    selectedStep === step.id ? "border-primary bg-primary/10 scale-105" : "border-border hover:border-primary/30 bg-card/50"
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-1" style={{ backgroundColor: `${step.color}20` }}>
                    <Icon className="w-5 h-5" style={{ color: step.color }} />
                  </div>
                  <span className="text-[10px] font-bold text-foreground text-center leading-tight">{step.label}</span>
                  <span className={`text-[8px] mt-0.5 font-medium ${step.status === "active" ? "text-green-400" : "text-muted-foreground"}`}>
                    {step.status === "active" ? "● Active" : "○ Planned"}
                  </span>
                </button>
                {i < WORKFLOW_STEPS.length - 1 && <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
              </div>
            );
          })}
        </div>

        {selectedStep && (
          <div className="mt-4 p-4 rounded-lg bg-card border border-border">
            {(() => {
              const step = WORKFLOW_STEPS.find(s => s.id === selectedStep);
              const Icon = step.icon;
              return (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${step.color}20` }}>
                    <Icon className="w-5 h-5" style={{ color: step.color }} />
                  </div>
                  <div>
                    <div className="font-bold text-foreground">{step.label}</div>
                    <p className="text-xs text-muted-foreground mt-1">{step.desc}</p>
                    <span className={`text-[10px] mt-1 inline-block ${step.status === "active" ? "text-green-400" : "text-muted-foreground"}`}>
                      Status: {step.status === "active" ? "Fully Operational" : "Coming Soon"}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Connectors */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Link2 className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-foreground">Connected Services</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CONNECTORS.map(c => (
            <div key={c.label} className="flex items-center gap-2 p-2.5 rounded-lg bg-card/50 border border-border">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
              <span className="text-xs text-foreground font-medium">{c.label}</span>
              <span className="text-[9px] text-muted-foreground ml-auto">{c.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}