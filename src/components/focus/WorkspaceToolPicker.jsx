import { X, Mail, FileText, Calendar, Database, Search, Send, Bot, Globe, Wrench, Brain, BarChart3, Users, Building2, Briefcase, GitBranch, Shield } from "lucide-react";

const ALL_TOOLS = [
  { id: "notes", label: "Quick Notes", icon: FileText, color: "#d4af37" },
  { id: "email", label: "Email Tool", icon: Mail, color: "#ec4899" },
  { id: "proposal", label: "Proposal Writer", icon: FileText, color: "#22c55e" },
  { id: "calendar", label: "Calendar", icon: Calendar, color: "#6366f1" },
  { id: "scraper", label: "Web Scraper", icon: Globe, color: "#ef4444" },
  { id: "database", label: "Database Pull", icon: Database, color: "#06b6d4" },
  { id: "research", label: "AI Research", icon: Search, color: "#8b5cf6" },
  { id: "ai_assistant", label: "AI Assistant", icon: Bot, color: "#d4af37" },
  { id: "outreach", label: "Outreach", icon: Send, color: "#f97316" },
];

export default function WorkspaceToolPicker({ activeTools, onAdd, onClose }) {
  const available = ALL_TOOLS.filter(t => !activeTools.includes(t.id));

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-sm font-bold text-foreground">Add Tool to Workspace</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <div className="p-4 space-y-1.5 max-h-[60vh] overflow-y-auto">
          {available.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">All tools already added</p>}
          {available.map(tool => (
            <button
              key={tool.id}
              onClick={() => onAdd(tool.id)}
              className="w-full flex items-center gap-3 p-3 rounded-xl glass-card hover:bg-white/[0.06] transition-all text-left"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${tool.color}18` }}>
                <tool.icon className="w-4 h-4" style={{ color: tool.color }} />
              </div>
              <span className="text-xs font-bold text-foreground">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}