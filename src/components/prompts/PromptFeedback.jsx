import { useState } from "react";
import { ThumbsUp, ThumbsDown, MessageSquare, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

export default function PromptFeedback({ prompt, onFeedbackSubmitted }) {
  const [selected, setSelected] = useState(null); // 'positive' | 'negative'
  const [comment, setComment] = useState("");
  const [showComment, setShowComment] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const successScore = prompt.success_score || 0;
  const feedbackCount = prompt.feedback_count || 0;
  const positive = prompt.positive_feedback || 0;
  const negative = prompt.negative_feedback || 0;

  const scoreColor = successScore >= 70 ? "text-green-400" : successScore >= 40 ? "text-yellow-400" : "text-red-400";
  const scoreBg = successScore >= 70 ? "bg-green-400/10 border-green-400/20" : successScore >= 40 ? "bg-yellow-400/10 border-yellow-400/20" : "bg-red-400/10 border-red-400/20";

  const handleSubmit = async () => {
    if (!selected) return;
    setSubmitting(true);

    const isPositive = selected === 'positive';
    const newPositive = positive + (isPositive ? 1 : 0);
    const newNegative = negative + (isPositive ? 0 : 1);
    const newCount = feedbackCount + 1;
    const newScore = newCount > 0 ? Math.round((newPositive / newCount) * 100) : 0;

    const existingLog = (() => {
      try { return JSON.parse(prompt.feedback_log || '[]'); } catch { return []; }
    })();

    const newEntry = {
      rating: isPositive ? 'positive' : 'negative',
      comment: comment.trim() || null,
      submitted_at: new Date().toISOString()
    };

    await base44.entities.PromptLibrary.update(prompt.id, {
      positive_feedback: newPositive,
      negative_feedback: newNegative,
      feedback_count: newCount,
      success_score: newScore,
      feedback_log: JSON.stringify([newEntry, ...existingLog].slice(0, 100)) // keep last 100
    });

    setSubmitting(false);
    setSubmitted(true);
    onFeedbackSubmitted?.();
  };

  return (
    <div className="border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Star className="w-4 h-4 text-primary" />
          Success Score & Feedback
        </h3>
        {feedbackCount > 0 && (
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-bold ${scoreBg} ${scoreColor}`}>
            {successScore}%
            <span className="text-xs font-normal text-muted-foreground">({feedbackCount} ratings)</span>
          </div>
        )}
      </div>

      {/* Score Bar */}
      {feedbackCount > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="text-green-400">👍 {positive} positive</span>
            <span className="text-red-400">{negative} negative 👎</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-green-400 rounded-full transition-all"
              style={{ width: `${feedbackCount > 0 ? (positive / feedbackCount) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Feedback Input */}
      {!submitted ? (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Was this prompt useful?</p>
          <div className="flex gap-3">
            <button
              onClick={() => setSelected('positive')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all ${
                selected === 'positive'
                  ? 'bg-green-500/20 border-green-500 text-green-400'
                  : 'border-border hover:border-green-500/50'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              Useful
            </button>
            <button
              onClick={() => setSelected('negative')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all ${
                selected === 'negative'
                  ? 'bg-red-500/20 border-red-500 text-red-400'
                  : 'border-border hover:border-red-500/50'
              }`}
            >
              <ThumbsDown className="w-4 h-4" />
              Not Useful
            </button>
            <button
              onClick={() => setShowComment(!showComment)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>
          {showComment && (
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Optional: tell us more..."
              className="w-full text-xs p-3 rounded-lg bg-secondary border border-border resize-none h-20 focus:outline-none focus:border-primary"
            />
          )}
          {selected && (
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full"
            >
              {submitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          )}
        </div>
      ) : (
        <div className="text-center py-2 text-sm text-green-400">
          ✓ Thanks for your feedback!
        </div>
      )}
    </div>
  );
}