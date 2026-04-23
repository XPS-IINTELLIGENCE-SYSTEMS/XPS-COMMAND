import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Wand2, Loader2, ChevronDown, ChevronUp, Check, ArrowRight, Zap, ListOrdered, Layers, Hash, AlertTriangle, TrendingUp } from "lucide-react";

const TECHNIQUE_ICONS = {
  "Chain-of-Thought": <ListOrdered className="w-4 h-4 text-blue-400" />,
  "Token Optimization": <Hash className="w-4 h-4 text-yellow-400" />,
  "Instruction Hierarchy": <Layers className="w-4 h-4 text-purple-400" />,
  "Role Framing": <Zap className="w-4 h-4 text-orange-400" />,
  "Output Constraints": <AlertTriangle className="w-4 h-4 text-red-400" />,
  "Few-Shot Examples": <TrendingUp className="w-4 h-4 text-green-400" />,
};

const TECHNIQUE_COLORS = {
  "Chain-of-Thought": "border-blue-500/30 bg-blue-500/5",
  "Token Optimization": "border-yellow-500/30 bg-yellow-500/5",
  "Instruction Hierarchy": "border-purple-500/30 bg-purple-500/5",
  "Role Framing": "border-orange-500/30 bg-orange-500/5",
  "Output Constraints": "border-red-500/30 bg-red-500/5",
  "Few-Shot Examples": "border-green-500/30 bg-green-500/5",
};

export default function PromptRefactoringTool({ prompt, onApplyRefactor }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [expandedSuggestion, setExpandedSuggestion] = useState(null);
  const [applying, setApplying] = useState(null);
  const [applied, setApplied] = useState({});

  const runAnalysis = async () => {
    setLoading(true);
    setAnalysis(null);
    setApplied({});

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert prompt engineer. Analyze the following AI prompt and provide structured refactoring suggestions to improve its effectiveness and success rate.

PROMPT TITLE: ${prompt.title}
USE CASE: ${prompt.use_case || "Not specified"}
PROMPT TEXT:
${prompt.prompt_text}

Analyze the prompt for:
1. Structure & clarity issues
2. Missing reasoning frameworks (Chain-of-Thought, etc.)
3. Token inefficiency (redundancy, verbosity)
4. Instruction hierarchy (role, context, task, format)
5. Missing output constraints
6. Opportunities for few-shot examples

Return a JSON object with:
{
  "complexity_score": <0-100 integer, current complexity/quality>,
  "projected_score": <0-100 integer, projected score after improvements>,
  "word_count": <integer>,
  "issues": ["issue1", "issue2", ...],  // 2-4 specific problems found
  "suggestions": [
    {
      "technique": <one of: "Chain-of-Thought" | "Token Optimization" | "Instruction Hierarchy" | "Role Framing" | "Output Constraints" | "Few-Shot Examples">,
      "impact": <"High" | "Medium" | "Low">,
      "problem": <one sentence describing the specific issue in this prompt>,
      "solution": <one sentence describing exactly what to change>,
      "refactored_snippet": <a short improved version of the most relevant section, max 80 words>,
      "score_boost": <estimated integer 1-20 boost to success score>
    }
  ]
}
Return 2-4 suggestions, ordered by impact. Return only valid JSON.`,
      response_json_schema: {
        type: "object",
        properties: {
          complexity_score: { type: "number" },
          projected_score: { type: "number" },
          word_count: { type: "number" },
          issues: { type: "array", items: { type: "string" } },
          suggestions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                technique: { type: "string" },
                impact: { type: "string" },
                problem: { type: "string" },
                solution: { type: "string" },
                refactored_snippet: { type: "string" },
                score_boost: { type: "number" }
              }
            }
          }
        }
      }
    });

    setAnalysis(result);
    setLoading(false);
  };

  const applyRefactor = async (suggestion, idx) => {
    setApplying(idx);

    // Build a full refactored prompt incorporating the suggestion
    const refactored = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert prompt engineer. Apply the following improvement to this prompt:

TECHNIQUE: ${suggestion.technique}
IMPROVEMENT: ${suggestion.solution}

ORIGINAL PROMPT:
${prompt.prompt_text}

Return ONLY the fully rewritten prompt text with the improvement applied. Do not add any explanation or metadata. Keep all original intent and variables intact (like {{variable_name}} placeholders).`,
    });

    const newText = typeof refactored === "string" ? refactored : refactored?.text || refactored?.result || "";

    if (newText && onApplyRefactor) {
      onApplyRefactor(newText.trim(), `Applied: ${suggestion.technique}`);
    }

    setApplied(prev => ({ ...prev, [idx]: true }));
    setApplying(null);
  };

  const scoreColor = (score) => {
    if (score >= 75) return "text-green-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  const impactBadge = (impact) => {
    const map = {
      High: "bg-red-500/15 text-red-400 border border-red-500/30",
      Medium: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
      Low: "bg-green-500/15 text-green-400 border border-green-500/30",
    };
    return map[impact] || map.Medium;
  };

  return (
    <div className="space-y-4">
      {/* Header CTA */}
      {!analysis && !loading && (
        <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-5 flex flex-col items-center gap-3 text-center">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Wand2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">AI Prompt Refactoring</p>
            <p className="text-xs text-muted-foreground mt-1">
              Analyze structure, detect inefficiencies, and get actionable improvements like Chain-of-Thought, token optimization, and clearer instruction hierarchy.
            </p>
          </div>
          <Button onClick={runAnalysis} className="gap-2 bg-primary text-primary-foreground">
            <Wand2 className="w-4 h-4" /> Analyze & Refactor
          </Button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Analyzing prompt structure…</p>
        </div>
      )}

      {/* Results */}
      {analysis && !loading && (
        <div className="space-y-4">
          {/* Score Bar */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Quality Analysis</span>
              <button onClick={runAnalysis} className="text-xs text-muted-foreground hover:text-primary transition-colors">Re-analyze</button>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className={`text-3xl font-bold ${scoreColor(analysis.complexity_score)}`}>{analysis.complexity_score}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Current</div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div className="text-center">
                <div className={`text-3xl font-bold ${scoreColor(analysis.projected_score)}`}>{analysis.projected_score}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Projected</div>
              </div>
              <div className="flex-1 ml-2">
                <div className="text-xs text-muted-foreground mb-1">{analysis.word_count} words</div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${analysis.complexity_score}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Issues */}
            {analysis.issues?.length > 0 && (
              <div className="space-y-1 pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Issues Found</p>
                {analysis.issues.map((issue, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-foreground">
                    <span className="text-red-400 mt-0.5 flex-shrink-0">•</span>
                    {issue}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Suggestions */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Refactoring Suggestions</p>
            {analysis.suggestions?.map((s, idx) => (
              <div
                key={idx}
                className={`rounded-xl border p-4 space-y-2 transition-all ${TECHNIQUE_COLORS[s.technique] || "border-border bg-card"}`}
              >
                {/* Suggestion Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {TECHNIQUE_ICONS[s.technique] || <Wand2 className="w-4 h-4 text-primary" />}
                    <span className="text-sm font-semibold text-foreground">{s.technique}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${impactBadge(s.impact)}`}>{s.impact}</span>
                    <span className="text-xs text-green-400 font-semibold">+{s.score_boost} pts</span>
                  </div>
                  <button
                    onClick={() => setExpandedSuggestion(expandedSuggestion === idx ? null : idx)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {expandedSuggestion === idx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Problem */}
                <p className="text-xs text-muted-foreground">{s.problem}</p>

                {/* Expanded: solution + snippet */}
                {expandedSuggestion === idx && (
                  <div className="space-y-3 pt-2 border-t border-white/10">
                    <div>
                      <p className="text-xs font-semibold text-foreground mb-1">Recommended Fix</p>
                      <p className="text-xs text-foreground/80">{s.solution}</p>
                    </div>
                    {s.refactored_snippet && (
                      <div>
                        <p className="text-xs font-semibold text-foreground mb-1">Improved Snippet</p>
                        <div className="bg-background/60 border border-border rounded-lg p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap text-foreground/90">
                          {s.refactored_snippet}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Apply button */}
                <div className="pt-1">
                  {applied[idx] ? (
                    <span className="flex items-center gap-1 text-xs text-green-400 font-medium">
                      <Check className="w-3.5 h-3.5" /> Applied & saved as new version
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1 border-white/20 hover:border-primary"
                      disabled={applying === idx}
                      onClick={() => applyRefactor(s, idx)}
                    >
                      {applying === idx ? (
                        <><Loader2 className="w-3 h-3 animate-spin" /> Applying…</>
                      ) : (
                        <><Wand2 className="w-3 h-3" /> Apply This Fix</>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}