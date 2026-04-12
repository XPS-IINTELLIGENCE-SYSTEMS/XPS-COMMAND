import { FileText, BookOpen, Target, Package, Search, ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/input";

const categories = [
  { name: "SOPs & Procedures", description: "Standard operating procedures", docs: 42, icon: FileText },
  { name: "Sales Playbooks", description: "Playbooks by vertical and service", docs: 18, icon: BookOpen },
  { name: "Battle Cards", description: "Competitive objection handling", docs: 24, icon: Target },
  { name: "Product Catalog", description: "Materials, equipment, services", docs: 58, icon: Package },
];

const recentDocs = [
  { title: "Epoxy Floor Coating — Residential Sales Playbook", type: "Playbooks", time: "2 days ago" },
  { title: "Objection: 'Your price is too high'", type: "Battle Cards", time: "3 days ago" },
  { title: "Metallic Epoxy Application SOP v3.2", type: "SOPs", time: "1 week ago" },
];

export default function KnowledgeView() {
  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-5 overflow-y-auto h-full">
      <div>
        <h1 className="text-lg md:text-xl font-bold text-foreground">Knowledge Base</h1>
        <p className="text-[11px] text-muted-foreground">Training, playbooks, and reference materials</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search knowledge base..." className="pl-10 h-10 text-sm bg-card border-border rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div key={cat.name} className="bg-card rounded-2xl border border-border p-4 hover:border-primary/20 transition-colors cursor-pointer flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">{cat.name}</div>
                <div className="text-[11px] text-muted-foreground">{cat.description} · {cat.docs} docs</div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </div>
          );
        })}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Recently Updated</h3>
        <div className="space-y-2">
          {recentDocs.map((doc) => (
            <div key={doc.title} className="bg-card rounded-2xl border border-border p-3 hover:border-primary/20 transition-colors cursor-pointer">
              <div className="text-sm font-medium text-foreground">{doc.title}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{doc.type} · {doc.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}