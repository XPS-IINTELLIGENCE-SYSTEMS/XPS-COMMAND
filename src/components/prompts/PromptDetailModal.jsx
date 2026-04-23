import { X, Copy, Star, ChevronRight, Code2, Edit2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { base44 } from "@/api/base44Client";
import PromptVersionHistory from "./PromptVersionHistory";
import PromptFeedback from "./PromptFeedback";
import AICategorySuggester from "./AICategorySuggester";
import { CATEGORY_TREE } from "./categoryConfig";

// Use CATEGORY_TREE from config
const CATEGORIES = Object.fromEntries(Object.entries(CATEGORY_TREE).map(([k, v]) => [k, v.label]));

export default function PromptDetailModal({ prompt: initialPrompt, onClose, onCopy, isFavorite, onToggleFavorite }) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(prompt.prompt_text);
  const [changeNote, setChangeNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("prompt"); // prompt | history | feedback

  const variables = prompt.variables ? JSON.parse(prompt.variables || '[]') : [];

  const handleCopy = async () => {
    onCopy(prompt);
    setCopied(true);
    // Track usage
    await base44.entities.PromptLibrary.update(prompt.id, {
      usage_count: (prompt.usage_count || 0) + 1,
      last_used: new Date().toISOString()
    }).catch(() => {});
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = async () => {
    if (!editText.trim() || editText === prompt.prompt_text) {
      setEditing(false);
      return;
    }
    setSaving(true);

    const currentVersion = prompt.version || 1;
    const existingHistory = (() => {
      try { return JSON.parse(prompt.version_history || '[]'); } catch { return []; }
    })();

    // Push current version into history
    const newHistoryEntry = {
      version: currentVersion,
      prompt_text: prompt.prompt_text,
      title: prompt.title,
      edited_at: new Date().toISOString(),
      edited_by: "user",
      change_note: changeNote.trim() || `Edited version ${currentVersion}`
    };

    const updatedHistory = [newHistoryEntry, ...existingHistory];
    const newVersion = currentVersion + 1;

    await base44.entities.PromptLibrary.update(prompt.id, {
      prompt_text: editText,
      version: newVersion,
      version_history: JSON.stringify(updatedHistory)
    });

    setPrompt(prev => ({
      ...prev,
      prompt_text: editText,
      version: newVersion,
      version_history: JSON.stringify(updatedHistory)
    }));

    setSaving(false);
    setEditing(false);
    setChangeNote("");
  };

  const handleReverted = async () => {
    // Reload the prompt
    const updated = await base44.entities.PromptLibrary.filter({ id: prompt.id }).catch(() => []);
    if (updated[0]) setPrompt(updated[0]);
  };

  const tabs = [
    { id: "prompt", label: "Prompt" },
    { id: "history", label: `History${(prompt.version || 1) > 1 ? ` (v${prompt.version})` : ''}` },
    { id: "feedback", label: `Feedback${prompt.feedback_count > 0 ? ` (${prompt.feedback_count})` : ''}` },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-background border border-border rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border p-5 flex justify-between items-start gap-4">
          <div className="flex-1 space-y-2">
            <h2 className="text-xl font-bold text-foreground">{prompt.title}</h2>
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                {CATEGORIES[prompt.category] || prompt.category}
              </span>
              {prompt.library_type === 'autonomous_ai_systems' && (
                <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-600">
                  Autonomous AI
                </span>
              )}
              {prompt.subcategory && (
                <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                  {prompt.subcategory}
                </span>
              )}
              <span className="text-xs px-2 py-1 rounded-full bg-secondary/50 text-muted-foreground">
                v{prompt.version || 1}
              </span>
              {prompt.success_score > 0 && (
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400">
                  ★ {prompt.success_score}% score
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">

          {activeTab === "prompt" && (
            <>
              {prompt.use_case && (
                <div className="bg-card border border-border rounded-lg p-3">
                  <h3 className="font-semibold text-xs mb-1 flex items-center gap-2 text-muted-foreground uppercase tracking-wide">
                    <ChevronRight className="w-3 h-3 text-primary" /> Use Case
                  </h3>
                  <p className="text-sm text-foreground">{prompt.use_case}</p>
                </div>
              )}

              {/* AI Category Suggester */}
              <AICategorySuggester
                prompt={prompt}
                onApply={(updates) => setPrompt(prev => ({ ...prev, ...updates }))}
              />

              {/* Prompt Text — Editable */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-primary" />
                    Prompt Text
                  </h3>
                  {!editing ? (
                    <button
                      onClick={() => { setEditText(prompt.prompt_text); setEditing(true); }}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditing(false)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
                {editing ? (
                  <div className="space-y-2">
                    <textarea
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      className="w-full font-mono text-xs p-3 rounded-lg bg-secondary border border-border resize-none focus:outline-none focus:border-primary leading-relaxed"
                      rows={12}
                    />
                    <input
                      value={changeNote}
                      onChange={e => setChangeNote(e.target.value)}
                      placeholder="Change note (optional)..."
                      className="w-full text-xs p-2 rounded-lg bg-secondary border border-border focus:outline-none focus:border-primary"
                    />
                    <Button size="sm" onClick={handleSaveEdit} disabled={saving} className="gap-1">
                      <Check className="w-3 h-3" />
                      {saving ? "Saving..." : "Save New Version"}
                    </Button>
                  </div>
                ) : (
                  <div className="bg-card border border-border rounded-lg p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap break-words max-h-64 overflow-y-auto">
                    {prompt.prompt_text}
                  </div>
                )}
              </div>

              {variables.length > 0 && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 space-y-2">
                  <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">Variables to Customize</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {variables.map((v, i) => (
                      <div key={i} className="text-xs bg-background rounded px-2 py-1 border border-border">
                        <code className="text-primary">{`{{${v}}}`}</code>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {prompt.tags && (
                <div className="flex gap-2 flex-wrap">
                  {prompt.tags.split(', ').map((tag, i) => (
                    <span key={i} className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border text-xs text-muted-foreground">
                <div>
                  <span className="block font-semibold text-foreground">{prompt.usage_count || 0}</span>
                  Times Used
                </div>
                <div>
                  <span className="block font-semibold text-foreground">v{prompt.version || 1}</span>
                  Current Version
                </div>
                <div>
                  <span className="block font-semibold text-foreground">{prompt.success_score || 0}%</span>
                  Success Score
                </div>
              </div>
            </>
          )}

          {activeTab === "history" && (
            <PromptVersionHistory prompt={prompt} onReverted={handleReverted} />
          )}

          {activeTab === "feedback" && (
            <PromptFeedback prompt={prompt} onFeedbackSubmitted={handleReverted} />
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-background border-t border-border p-4 flex gap-3">
          <Button onClick={() => onToggleFavorite(prompt)} variant="outline" className="gap-2">
            <Star className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} />
            {isFavorite ? "Saved" : "Save"}
          </Button>
          <Button onClick={handleCopy} className="flex-1 gap-2 bg-primary hover:bg-primary/90">
            <Copy className="w-4 h-4" />
            {copied ? "Copied!" : "Copy Prompt"}
          </Button>
        </div>
      </div>
    </div>
  );
}