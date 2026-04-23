import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Star, Copy, Filter, BarChart3, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import PromptDetailModal from "./PromptDetailModal";
import PromptAnalyticsDashboard from "./PromptAnalyticsDashboard";

const LIBRARY_TYPES = {
  xps_operations: "XPS Operations (100 Prompts)",
  autonomous_ai_systems: "Autonomous AI Systems",
};

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

export default function PromptLibraryView() {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLibrary, setSelectedLibrary] = useState("xps_operations");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [activeView, setActiveView] = useState("library"); // library | analytics

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    const data = await base44.entities.PromptLibrary.list('-created_date', 200).catch(() => []);
    setPrompts(data);
    setLoading(false);
  };

  const filteredPrompts = prompts.filter(p => {
    if (p.library_type !== selectedLibrary) return false;
    if (selectedCategory && p.category !== selectedCategory) return false;
    if (searchTerm && !p.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !p.prompt_text.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleCopyPrompt = async (prompt) => {
    let text = prompt.prompt_text;
    if (prompt.variables) {
      const vars = JSON.parse(prompt.variables || '[]');
      vars.forEach(v => {
        text = text.replace(new RegExp(`{{${v}}}`, 'g'), `[${v.toUpperCase()}]`);
      });
    }
    await navigator.clipboard.writeText(text);
  };

  const handleToggleFavorite = async (prompt) => {
    if (favorites.includes(prompt.id)) {
      setFavorites(favorites.filter(id => id !== prompt.id));
    } else {
      setFavorites([...favorites, prompt.id]);
    }
    if (prompt.id) {
      await base44.entities.PromptLibrary.update(prompt.id, { 
        is_favorite: !prompt.is_favorite 
      }).catch(() => {});
    }
  };

  const categoriesInLibrary = [...new Set(
    prompts.filter(p => p.library_type === selectedLibrary).map(p => p.category)
  )];

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin w-6 h-6 border-2 border-primary rounded-full" /></div>;
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold metallic-gold">Prompt Library</h1>
            <p className="text-muted-foreground text-sm">200+ curated prompts for system building, AI automation, and wealth creation</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={activeView === 'library' ? 'default' : 'outline'}
              size="sm"
              className="gap-2"
              onClick={() => setActiveView('library')}
            >
              <BookOpen className="w-4 h-4" /> Library
            </Button>
            <Button
              variant={activeView === 'analytics' ? 'default' : 'outline'}
              size="sm"
              className="gap-2"
              onClick={() => setActiveView('analytics')}
            >
              <BarChart3 className="w-4 h-4" /> Analytics
            </Button>
          </div>
        </div>

        {/* Analytics View */}
        {activeView === 'analytics' && (
          <PromptAnalyticsDashboard prompts={prompts} />
        )}

        {activeView === 'library' && <>

        {/* Library Selection */}
        <div className="flex gap-2 flex-wrap">
          {Object.entries(LIBRARY_TYPES).map(([key, label]) => (
            <button
              key={key}
              onClick={() => {
                setSelectedLibrary(key);
                setSelectedCategory(null);
              }}
              className={`px-4 py-2 rounded-lg border transition-all ${
                selectedLibrary === key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:border-primary bg-card"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex gap-4 flex-col sm:flex-row">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search prompts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1 rounded-full text-sm transition-all ${
              selectedCategory === null
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            All Categories
          </button>
          {categoriesInLibrary.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-sm transition-all ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {CATEGORIES[cat] || cat}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          {filteredPrompts.length} prompt{filteredPrompts.length !== 1 ? 's' : ''} found
        </div>

        {/* Prompts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPrompts.map((prompt) => (
            <Card
              key={prompt.id}
              className="p-4 hover:shadow-lg transition-shadow cursor-pointer group border-border hover:border-primary/50"
              onClick={() => {
                setSelectedPrompt(prompt);
                setShowDetail(true);
              }}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-semibold text-sm group-hover:text-primary transition-colors flex-1">
                    {prompt.title}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(prompt);
                    }}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Star
                      className="w-4 h-4"
                      fill={favorites.includes(prompt.id) ? "currentColor" : "none"}
                    />
                  </button>
                </div>

                {/* Category Badge */}
                <div className="flex gap-2 flex-wrap">
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {CATEGORIES[prompt.category] || prompt.category}
                  </span>
                  {prompt.subcategory && (
                    <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                      {prompt.subcategory}
                    </span>
                  )}
                </div>

                {/* Preview */}
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {prompt.prompt_text}
                </p>

                {/* Use Case */}
                {prompt.use_case && (
                  <div className="text-xs bg-card p-2 rounded border border-border">
                    <span className="font-semibold text-foreground">Use Case: </span>
                    <span className="text-muted-foreground">{prompt.use_case}</span>
                  </div>
                )}

                {/* Tags */}
                {prompt.tags && (
                  <div className="flex gap-1 flex-wrap">
                    {prompt.tags.split(', ').slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                  <span>Used {prompt.usage_count || 0} times</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyPrompt(prompt);
                    }}
                    className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredPrompts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No prompts found. Try adjusting your filters.</p>
          </div>
        )}

        </> /* end library view */}
      </div>

      {/* Detail Modal */}
      {showDetail && selectedPrompt && (
        <PromptDetailModal
          prompt={selectedPrompt}
          onClose={() => setShowDetail(false)}
          onCopy={handleCopyPrompt}
          isFavorite={favorites.includes(selectedPrompt.id)}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </div>
  );
}