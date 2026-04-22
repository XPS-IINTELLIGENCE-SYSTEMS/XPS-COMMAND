import { X, Copy, Star, ChevronRight, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const CATEGORIES = {
  leads_intelligence: "Leads & Intelligence",
  outreach_campaigns: "Outreach Campaigns",
  bid_pricing: "Bid & Pricing",
  competitor_research: "Competitor Research",
  content_creation: "Content Creation",
  agent_building: "Agent Building",
  automation_workflows: "Automation Workflows",
  financial_ai: "Financial AI",
  autonomous_systems: "Autonomous Systems",
  wealth_creation: "Wealth Creation",
  trading_systems: "Trading Systems",
  simulation_systems: "Simulation Systems",
  prediction_systems: "Prediction Systems",
  recommendation_systems: "Recommendations",
  scraping_harvesting: "Scraping & Harvesting",
  system_cloning: "System Cloning",
  invention_systems: "Invention Systems",
  meta_systems: "Meta-Systems",
  open_source_integration: "Open Source",
  system_refactoring: "Refactoring",
  recursive_building: "Recursive Building",
  millionaire_paths: "Millionaire Paths",
  pass_through_systems: "Pass-Through Systems",
  consulting_systems: "Consulting Systems",
  ai_architecture: "AI Architecture",
  idea_generation: "Idea Generation",
  custom: "Custom",
};

export default function PromptDetailModal({ prompt, onClose, onCopy, isFavorite, onToggleFavorite }) {
  const [copied, setCopied] = useState(false);
  const variables = prompt.variables ? JSON.parse(prompt.variables || '[]') : [];

  const handleCopy = () => {
    onCopy(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-background border border-border rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border p-6 flex justify-between items-start gap-4">
          <div className="flex-1 space-y-2">
            <h2 className="text-2xl font-bold text-foreground">{prompt.title}</h2>
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                {CATEGORIES[prompt.category] || prompt.category}
              </span>
              {prompt.library_type === 'autonomous_ai_systems' && (
                <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-600">
                  Autonomous AI
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Use Case */}
          {prompt.use_case && (
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-primary" />
                Use Case
              </h3>
              <p className="text-sm text-foreground">{prompt.use_case}</p>
            </div>
          )}

          {/* Prompt Text */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Code2 className="w-4 h-4 text-primary" />
              Prompt
            </h3>
            <div className="bg-card border border-border rounded-lg p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap break-words max-h-64 overflow-y-auto">
              {prompt.prompt_text}
            </div>
          </div>

          {/* Variables */}
          {variables.length > 0 && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-sm">Variables to Customize</h3>
              <div className="grid grid-cols-2 gap-2">
                {variables.map((v, i) => (
                  <div key={i} className="text-xs bg-background rounded px-2 py-1 border border-border">
                    <code className="text-primary">{`{{${v}}}`}</code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {prompt.tags && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Tags</h3>
              <div className="flex gap-2 flex-wrap">
                {prompt.tags.split(', ').map((tag, i) => (
                  <span key={i} className="text-xs px-3 py-1 rounded-full bg-secondary text-secondary-foreground">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border text-xs text-muted-foreground">
            <div>
              <span className="block font-semibold text-foreground mb-1">{prompt.usage_count || 0}</span>
              Times Used
            </div>
            <div>
              <span className="block font-semibold text-foreground mb-1">{prompt.library_type === 'xps_operations' ? 'XPS Ops' : 'Autonomous AI'}</span>
              Library Type
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-background border-t border-border p-6 flex gap-3">
          <Button
            onClick={() => onToggleFavorite(prompt)}
            variant="outline"
            className="gap-2"
          >
            <Star className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} />
            {isFavorite ? "Saved" : "Save"}
          </Button>
          <Button
            onClick={handleCopy}
            className="flex-1 gap-2 bg-primary hover:bg-primary/90"
          >
            <Copy className="w-4 h-4" />
            {copied ? "Copied!" : "Copy Prompt"}
          </Button>
        </div>
      </div>
    </div>
  );
}