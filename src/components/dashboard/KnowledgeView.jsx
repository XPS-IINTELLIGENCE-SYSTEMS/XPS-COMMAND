import { FileText, BookOpen, Target, Presentation, Package, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const categories = [
  { name: "SOPs & Procedures", description: "Standard operating procedures for sales, operations, and support", docs: 42, icon: FileText, color: "bg-secondary" },
  { name: "Playbooks", description: "Sales playbooks for polishing, epoxy, decorative, and industrial verticals", docs: 18, icon: BookOpen, color: "bg-xps-orange/10" },
  { name: "Battle Cards", description: "Competitive battle cards and objection handling guides", docs: 24, icon: Target, color: "bg-xps-purple/10" },
  { name: "Training Modules", description: "Onboarding and certification training for all roles", docs: 12, icon: Presentation, color: "bg-xps-blue/10" },
  { name: "Proposal Examples", description: "Template proposals organized by service type and project size", docs: 36, icon: FileText, color: "bg-xps-green/10" },
  { name: "Product Catalog", description: "Materials, equipment, and service line documentation", docs: 58, icon: Package, color: "bg-primary/10" },
];

const recentDocs = [
  { title: "Epoxy Floor Coating — Residential Sales Playbook", type: "Playbooks", time: "2 days ago" },
  { title: "Objection: 'Your price is too high'", type: "Battle Cards", time: "3 days ago" },
  { title: "Metallic Epoxy Application SOP v3.2", type: "SOPs", time: "1 week ago" },
];

export default function KnowledgeView() {
  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 overflow-y-auto h-full">
      <div>
        <h1 className="text-xl font-bold text-foreground">Knowledge Base</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Enterprise knowledge, training, and reference materials</p>
      </div>

      <div className="relative max-w-lg">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input placeholder="Search knowledge base..." className="pl-8 h-9 text-xs bg-secondary/50 border-border" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div key={cat.name} className={`${cat.color} rounded-lg border border-border p-4 hover:border-primary/30 transition-colors cursor-pointer`}>
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-5 h-5 text-primary/70" />
                <span className="text-[10px] text-muted-foreground">{cat.docs} docs</span>
              </div>
              <div className="text-sm font-semibold text-foreground">{cat.name}</div>
              <p className="text-[10px] text-muted-foreground mt-1">{cat.description}</p>
            </div>
          );
        })}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Recently Updated</h3>
        <div className="space-y-2">
          {recentDocs.map((doc) => (
            <div key={doc.title} className="bg-card rounded-lg border border-border p-3 hover:border-primary/20 transition-colors cursor-pointer">
              <div className="text-xs font-medium text-primary">{doc.title}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{doc.type} · {doc.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}