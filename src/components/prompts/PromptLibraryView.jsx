import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Star, Copy, BarChart3, BookOpen, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import PromptDetailModal from "./PromptDetailModal";
import PromptAnalyticsDashboard from "./PromptAnalyticsDashboard";
import { CATEGORY_TREE, CATEGORIES } from "./categoryConfig";

const LIBRARY_TYPES = {
  xps_operations: "XPS Operations",
  autonomous_ai_systems: "Autonomous AI Systems",
};

export default function PromptLibraryView() {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLibrary, setSelectedLibrary] = useState("xps_operations");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);
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
    if (selectedSubcategory && p.subcategory !== selectedSubcategory) return false;
    if (searchTerm && !p.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !p.prompt_text.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !(p.subcategory || '').toLowerCase().includes(searchTerm.toLowerCase())) return false;
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
    prompts.filter(p => p.library_type === selectedLibrary).map(p => p.category).filter(Boolean)
  )];

  // Build subcategory counts per category
  const subcategoryCounts = {};
  prompts.filter(p => p.library_type === selectedLibrary).forEach(p => {
    if (p.category && p.subcategory) {
      const key = `${p.category}::${p.subcategory}`;
      subcategoryCounts[key] = (subcategoryCounts[key] || 0) + 1;
    }
  });

  const handleSelectCategory = (cat) => {
    if (selectedCategory === cat) {
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      setExpandedCategory(null);
    } else {
      setSelectedCategory(cat);
      setSelectedSubcategory(null);
      setExpandedCategory(cat);
    }
  };

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

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search prompts, subcategories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Nested Category Filter */}
        <div className="flex gap-6 flex-col lg:flex-row">
          {/* Sidebar category tree */}
          <div className="lg:w-52 flex-shrink-0 space-y-1">
            <button
              onClick={() => { setSelectedCategory(null); setSelectedSubcategory(null); setExpandedCategory(null); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all font-medium ${
                selectedCategory === null ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              All Categories
              <span className="ml-2 text-xs opacity-60">({prompts.filter(p => p.library_type === selectedLibrary).length})</span>
            </button>

            {categoriesInLibrary.map(cat => {
              const catConfig = CATEGORY_TREE[cat];
              const catCount = prompts.filter(p => p.library_type === selectedLibrary && p.category === cat).length;
              const isExpanded = expandedCategory === cat;
              const isSelected = selectedCategory === cat;

              // Subcategories that actually exist in the data
              const usedSubs = [...new Set(
                prompts.filter(p => p.library_type === selectedLibrary && p.category === cat && p.subcategory).map(p => p.subcategory)
              )];
              // Also include defined subcategories from config that have prompts
              const allSubs = [...new Set([...usedSubs])];

              return (
                <div key={cat}>
                  <button
                    onClick={() => handleSelectCategory(cat)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between group ${
                      isSelected ? "bg-primary/10 text-primary font-medium border border-primary/20" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {allSubs.length > 0 && (
                        isExpanded
                          ? <ChevronDown className="w-3 h-3 flex-shrink-0" />
                          : <ChevronRight className="w-3 h-3 flex-shrink-0" />
                      )}
                      <span className="truncate">{catConfig?.label || cat}</span>
                    </span>
                    <span className="text-xs opacity-50 flex-shrink-0">{catCount}</span>
                  </button>

                  {/* Subcategories */}
                  {isExpanded && allSubs.length > 0 && (
                    <div className="ml-4 mt-0.5 space-y-0.5">
                      <button
                        onClick={() => setSelectedSubcategory(null)}
                        className={`w-full text-left px-3 py-1.5 rounded-md text-xs transition-all ${
                          !selectedSubcategory ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                        }`}
                      >
                        All ({catCount})
                      </button>
                      {allSubs.map(sub => {
                        const subCount = subcategoryCounts[`${cat}::${sub}`] || 0;
                        return (
                          <button
                            key={sub}
                            onClick={() => setSelectedSubcategory(selectedSubcategory === sub ? null : sub)}
                            className={`w-full text-left px-3 py-1.5 rounded-md text-xs transition-all flex justify-between ${
                              selectedSubcategory === sub
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                            }`}
                          >
                            <span className="truncate">{sub}</span>
                            <span className="opacity-50 flex-shrink-0 ml-1">{subCount}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-4">

          {/* Results Count */}
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            {filteredPrompts.length} prompt{filteredPrompts.length !== 1 ? 's' : ''} found
            {selectedSubcategory && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {selectedSubcategory}
                <button className="ml-1 hover:text-primary/60" onClick={() => setSelectedSubcategory(null)}>×</button>
              </span>
            )}
          </div>

          {/* Prompts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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

          </div> {/* end main content */}
        </div> {/* end flex row */}

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