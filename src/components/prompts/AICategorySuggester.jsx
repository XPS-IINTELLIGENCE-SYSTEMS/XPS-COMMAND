import { useState } from "react";
import { Sparkles, Check, X, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { CATEGORY_TREE, CATEGORY_KEYS } from "./categoryConfig";

export default function AICategorySuggester({ prompt, onApply }) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const getSuggestion = async () => {
    setLoading(true);
    setSuggestion(null);

    const categoryList = CATEGORY_KEYS.map(k => {
      const subs = CATEGORY_TREE[k].subcategories.join(', ');
      return `${k} (${CATEGORY_TREE[k].label})${subs ? ` → subcategories: ${subs}` : ''}`;
    }).join('\n');

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a prompt categorization expert. Given the following prompt, suggest the best category and subcategory from the options below.

PROMPT TITLE: ${prompt.title}
PROMPT TEXT: ${prompt.prompt_text?.slice(0, 600)}
CURRENT CATEGORY: ${prompt.category || 'none'}
CURRENT SUBCATEGORY: ${prompt.subcategory || 'none'}

AVAILABLE CATEGORIES AND THEIR SUBCATEGORIES:
${categoryList}

Return JSON with:
- category: one of the category keys exactly as listed
- subcategory: one of the subcategory strings for that category (or a new one if none fit well, max 3 words)
- confidence: 0-100
- reasoning: 1 sentence explanation`,
      response_json_schema: {
        type: "object",
        properties: {
          category: { type: "string" },
          subcategory: { type: "string" },
          confidence: { type: "number" },
          reasoning: { type: "string" }
        }
      }
    }).catch(() => null);

    setSuggestion(result);
    setLoading(false);
  };

  const handleApply = async () => {
    if (!suggestion) return;
    setApplying(true);
    await base44.entities.PromptLibrary.update(prompt.id, {
      category: suggestion.category,
      subcategory: suggestion.subcategory
    });
    setApplied(true);
    setApplying(false);
    onApply?.({ category: suggestion.category, subcategory: suggestion.subcategory });
  };

  const confidenceColor = suggestion?.confidence >= 80 ? "text-green-400" : suggestion?.confidence >= 50 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="border border-border rounded-lg p-3 space-y-3 bg-card/50">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          AI Category Suggestion
        </span>
        {!applied && (
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={getSuggestion} disabled={loading}>
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {loading ? "Analyzing..." : suggestion ? "Re-analyze" : "Suggest"}
          </Button>
        )}
      </div>

      {suggestion && !applied && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
              {CATEGORY_TREE[suggestion.category]?.label || suggestion.category}
            </span>
            {suggestion.subcategory && (
              <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                {suggestion.subcategory}
              </span>
            )}
            <span className={`text-xs font-bold ml-auto ${confidenceColor}`}>
              {suggestion.confidence}% confident
            </span>
          </div>
          {suggestion.reasoning && (
            <p className="text-xs text-muted-foreground italic">{suggestion.reasoning}</p>
          )}
          <div className="flex gap-2">
            <Button size="sm" className="h-7 text-xs gap-1 flex-1" onClick={handleApply} disabled={applying}>
              <Check className="w-3 h-3" />
              {applying ? "Applying..." : "Apply Suggestion"}
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setSuggestion(null)}>
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      {applied && (
        <div className="flex items-center gap-2 text-xs text-green-400">
          <Check className="w-3 h-3" />
          Category updated successfully
        </div>
      )}
    </div>
  );
}