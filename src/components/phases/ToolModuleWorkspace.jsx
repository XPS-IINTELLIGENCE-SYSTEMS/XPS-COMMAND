import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { ArrowLeft, Play, Loader2, CheckCircle2 } from "lucide-react";
import ToolModuleCard from "./ToolModuleCard";
import ToolExecutionResult from "./ToolExecutionResult";
import { base44 } from "@/api/base44Client";

// Map tool IDs to actual backend function names
const TOOL_FUNCTION_MAP = {
  territory_analyzer: "territoryAnalyzer",
  lead_scraper: "leadScraper",
  contact_enricher: "contactEnricher",
  deep_research: "deepResearch",
  lead_scorer: "leadScorer",
  email_writer: null, // uses InvokeLLM
  auto_send: "sendOutreachEmail",
  call_prep: null, // uses InvokeLLM
  sms_outreach: "sendSms",
  content_creator: null, // uses InvokeLLM
  followup_engine: null, // uses InvokeLLM
  bid_calculator: null, // uses InvokeLLM
  proposal_generator: "generateProposal",
  negotiation_coach: null, // uses InvokeLLM
  measurement_assist: null, // uses InvokeLLM
  material_calculator: null, // uses InvokeLLM
  final_invoice: "generateInvoice",
  seo_analyze: "seoAnalyze",
};

// Build LLM prompt for tools without a dedicated backend function
function buildLLMPrompt(tool, params) {
  const paramStr = Object.entries(params)
    .filter(([_, v]) => v && v.toString().trim())
    .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`)
    .join("\n");

  const prompts = {
    email_writer: `You are an expert B2B email copywriter for XPS Xtreme Polishing Systems, a nationwide epoxy/concrete flooring company. Write a professional, personalized cold outreach email.\n\nParameters:\n${paramStr}\n\nWrite a compelling subject line and full email body. Make it personal, reference their industry, and include a clear CTA. Keep it under 200 words.`,
    call_prep: `You are an XPS sales coach. Create a call preparation script for a sales call.\n\nParameters:\n${paramStr}\n\nInclude: Opening hook, key talking points, questions to ask, how to handle common objections (price, timing, "we have a guy"), and a closing strategy. Format with clear headers.`,
    content_creator: `You are a social media content strategist for XPS Xtreme Polishing Systems. Create engaging content.\n\nParameters:\n${paramStr}\n\nInclude: Post copy, relevant hashtags, suggested image description, best posting time. Make it engaging and industry-specific.`,
    followup_engine: `You are an XPS sales operations manager. Create a 5-step follow-up sequence.\n\nParameters:\n${paramStr}\n\nFor each step include: timing (Day 1, Day 3, etc.), channel (email/text/call), message content, and goal. Make each touchpoint unique and escalating in urgency.`,
    bid_calculator: `You are an XPS pricing expert. Calculate a detailed bid based on these parameters:\n${paramStr}\n\nXPS Pricing Matrix:\n- Standard Epoxy: $3-8/sqft\n- Polished Concrete: $3-12/sqft\n- Decorative Epoxy: $5-12/sqft\n- Industrial Epoxy: $4-10/sqft\n- Metallic Epoxy: $6-15/sqft\n- Garage Coating: $3-6/sqft\n\nProvide: Material cost breakdown, labor estimate, total bid price, recommended markup, profit margin, and timeline.`,
    negotiation_coach: `You are an expert sales negotiation coach for XPS. The client raised this objection:\n${paramStr}\n\nProvide: 3 specific response strategies, value justification talking points, and a recommended counter-offer approach. Be specific to the epoxy/flooring industry.`,
    measurement_assist: `You are an XPS project estimator. Calculate measurements based on:\n${paramStr}\n\nProvide: Total square footage, waste factor calculation, usable area, recommended material quantities, and edge/transition considerations.`,
    material_calculator: `You are an XPS materials specialist. Calculate required materials based on:\n${paramStr}\n\nProvide: Product list with quantities, coverage rates, number of coats needed, primer requirements, and total material cost estimate using XPS pricing.`,
    condition_checklist: `You are an XPS flooring inspector. Generate a comprehensive site condition checklist for evaluation.\n\nProvide a numbered checklist with categories: Surface Condition (cracks, spalling, moisture), Existing Coatings (type, adhesion, thickness), Environmental (temperature, humidity, ventilation), Access (loading dock, elevator, clearance), and Prep Requirements (grinding, shot blasting, patching).`,
    client_updates: `You are an XPS project manager. Draft a professional client progress update.\n\nParameters:\n${paramStr}\n\nInclude: Work completed today, percentage complete, upcoming milestones, any issues/changes, and expected completion date. Keep it professional and reassuring.`,
  };

  return prompts[tool.id] || `You are an XPS Xtreme Polishing Systems AI assistant. Execute the following tool: ${tool.label}\n\nParameters:\n${paramStr}\n\nProvide detailed, actionable results.`;
}

export default function ToolModuleWorkspace({ tools, onBack, onExecute }) {
  const [toolParams, setToolParams] = useState(() => {
    const map = {};
    tools.forEach((t) => { map[t.id] = { ...t.defaultParams }; });
    return map;
  });
  const [activeTools, setActiveTools] = useState(tools.map((t) => t.id));
  const [executing, setExecuting] = useState(false);
  const [results, setResults] = useState({}); // { toolId: { status, data, error } }
  const [showResults, setShowResults] = useState(false);

  const handleParamChange = (toolId, params) => {
    setToolParams((prev) => ({ ...prev, [toolId]: params }));
  };

  const handleRemove = (toolId) => {
    setActiveTools((prev) => prev.filter((id) => id !== toolId));
  };

  const executeTools = async () => {
    setExecuting(true);
    setShowResults(true);

    const toolsToRun = activeTools.map(id => tools.find(t => t.id === id)).filter(Boolean);

    // Mark all as running
    const initialResults = {};
    toolsToRun.forEach(t => { initialResults[t.id] = { status: "running" }; });
    setResults(initialResults);

    // Execute each tool
    for (const tool of toolsToRun) {
      const params = toolParams[tool.id] || {};
      const funcName = TOOL_FUNCTION_MAP[tool.id];

      try {
        let data;
        if (funcName) {
          // Call actual backend function
          const response = await base44.functions.invoke(funcName, params);
          data = response.data;
        } else {
          // Use InvokeLLM for tools without dedicated functions
          const prompt = buildLLMPrompt(tool, params);
          data = await base44.integrations.Core.InvokeLLM({ prompt });
        }
        setResults(prev => ({ ...prev, [tool.id]: { status: "success", data } }));
      } catch (err) {
        setResults(prev => ({ ...prev, [tool.id]: { status: "error", error: err?.message || "Execution failed" } }));
      }
    }

    setExecuting(false);
  };

  // Also fire the command to chat for agent awareness
  const handleExecute = async () => {
    await executeTools();
    // Optionally also send to chat
    if (onExecute) {
      const payload = activeTools.map((id) => {
        const tool = tools.find((t) => t.id === id);
        return { id, label: tool?.label, params: toolParams[id] || {} };
      });
      // Don't await — fire and forget to chat
      onExecute(payload);
    }
  };

  const visibleTools = tools.filter((t) => activeTools.includes(t.id));
  const completedCount = Object.values(results).filter(r => r.status === "success").length;
  const totalCount = visibleTools.length;

  return (
    <div className="h-full flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-black/30 backdrop-blur-sm flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to tools
        </button>
        <div className="flex-1" />
        {showResults && completedCount > 0 && (
          <div className="flex items-center gap-1.5 text-[10px] text-green-400">
            <CheckCircle2 className="w-3 h-3" />
            {completedCount}/{totalCount} complete
          </div>
        )}
        <span className="text-[10px] text-white/30">{visibleTools.length} module{visibleTools.length !== 1 ? "s" : ""} loaded</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-3xl mx-auto space-y-3">
          {!showResults ? (
            // Configuration mode — show param inputs
            visibleTools.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-sm text-white/40">All modules removed.</p>
                <button onClick={onBack} className="mt-3 text-xs text-primary hover:underline">
                  Go back to select tools
                </button>
              </div>
            ) : (
              visibleTools.map((tool) => (
                <ToolModuleCard
                  key={tool.id}
                  tool={tool}
                  onRemove={handleRemove}
                  onParamChange={handleParamChange}
                />
              ))
            )
          ) : (
            // Results mode — show execution results
            visibleTools.map((tool) => (
              <ToolExecutionResult
                key={tool.id}
                tool={tool}
                result={results[tool.id] || { status: "pending" }}
              />
            ))
          )}
        </div>
      </div>

      {/* Execute / Reset Bar */}
      {visibleTools.length > 0 && (
        <div className="flex-shrink-0 p-4 border-t border-white/10 bg-black/40 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto">
            {!showResults || executing ? (
              <button
                onClick={handleExecute}
                disabled={executing}
                className={cn(
                  "w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-bold text-base transition-all duration-300",
                  executing
                    ? "bg-white/10 text-white/50 cursor-wait"
                    : "metallic-gold-bg text-background hover:brightness-110 shadow-[0_0_30px_rgba(212,175,55,0.15)]"
                )}
              >
                {executing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Executing {totalCount} tool{totalCount !== 1 ? "s" : ""}...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    <span>Execute {visibleTools.length} Tool{visibleTools.length !== 1 ? "s" : ""}</span>
                  </>
                )}
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowResults(false); setResults({}); }}
                  className="flex-1 py-3.5 rounded-2xl border border-white/15 text-white/70 font-bold text-base hover:bg-white/5 transition-all"
                >
                  Modify & Re-run
                </button>
                <button
                  onClick={onBack}
                  className="flex-1 py-3.5 rounded-2xl metallic-gold-bg text-background font-bold text-base hover:brightness-110 transition-all"
                >
                  Done — Pick More Tools
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}