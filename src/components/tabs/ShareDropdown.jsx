import { useState } from "react";
import { Share2, ChevronDown, MessageCircle, Share, Users, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ShareDropdown({ tab, onShare }) {
  const [open, setOpen] = useState(false);
  const [sharing, setSharing] = useState(false);

  const handleShare = async (destination) => {
    setSharing(true);
    try {
      switch (destination) {
        case "sms":
          // Share via SMS
          const smsMessage = `Check out my dashboard: ${tab.name} - ${window.location.href}`;
          window.open(`sms:?body=${encodeURIComponent(smsMessage)}`);
          alert("SMS share ready ✓");
          break;

        case "social":
          // Share to social media
          const socialMessage = `I created a dashboard: ${tab.name}`;
          const encodedMsg = encodeURIComponent(socialMessage);
          const url = encodeURIComponent(window.location.href);
          window.open(`https://twitter.com/intent/tweet?text=${encodedMsg}&url=${url}`, "_blank");
          alert("Social media share ready ✓");
          break;

        case "agent":
          // Share to agent
          await base44.functions.invoke("shareToAgent", {
            tabId: tab.id,
            tabName: tab.name,
            url: window.location.href,
          });
          alert("Shared to Agent ✓");
          break;

        case "project":
          // Share to project
          await base44.functions.invoke("shareToProject", {
            tabId: tab.id,
            tabName: tab.name,
            projectId: tab.projectId,
          });
          alert("Shared to Project ✓");
          break;
      }

      onShare?.(destination);
      setOpen(false);
    } catch (error) {
      alert(`Share failed: ${error.message}`);
    }
    setSharing(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={sharing}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all text-xs font-medium glass-card hover:scale-105 text-muted-foreground hover:text-foreground disabled:opacity-50"
        style={{ borderColor: "#6366f1" }}
      >
        <Share2 className="w-3.5 h-3.5" />
        Share
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="absolute top-full left-0 mt-2 w-48 z-50 glass-card rounded-lg border border-white/[0.06] overflow-hidden shadow-xl">
            <button
              onClick={() => handleShare("sms")}
              disabled={sharing}
              className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-white/10 text-[11px] font-medium text-foreground transition-colors text-left"
            >
              <MessageCircle className="w-3.5 h-3.5 text-blue-400" /> Text Message
            </button>
            <button
              onClick={() => handleShare("social")}
              disabled={sharing}
              className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-white/10 text-[11px] font-medium text-foreground transition-colors text-left border-t border-white/[0.06]"
            >
              <Share className="w-3.5 h-3.5 text-pink-400" /> Social Media
            </button>
            <button
              onClick={() => handleShare("agent")}
              disabled={sharing}
              className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-white/10 text-[11px] font-medium text-foreground transition-colors text-left border-t border-white/[0.06]"
            >
              <Zap className="w-3.5 h-3.5 text-primary" /> Share to Agent
            </button>
            <button
              onClick={() => handleShare("project")}
              disabled={sharing}
              className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-white/10 text-[11px] font-medium text-foreground transition-colors text-left border-t border-white/[0.06]"
            >
              <Users className="w-3.5 h-3.5 text-accent" /> Share to Project
            </button>
          </div>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
        </>
      )}
    </div>
  );
}