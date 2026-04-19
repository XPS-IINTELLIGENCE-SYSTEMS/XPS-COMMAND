import { useState } from "react";
import { Bot, Save, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const AI_MODES = ["Fully Autonomous", "Semi-Autonomous", "Basic Chat"];

export default function AccountAgentSection({ profile, saveField, saveBatch }) {
  const [memory, setMemory] = useState(profile?.ai_memory || "");
  const [personalization, setPersonalization] = useState(profile?.agent_personalization || "");
  const [preferences, setPreferences] = useState(profile?.ai_preferences || "");
  const [personaName, setPersonaName] = useState(profile?.ai_persona_name || "");
  const [dirty, setDirty] = useState(false);

  const handleSave = () => {
    saveBatch({
      ai_memory: memory,
      agent_personalization: personalization,
      ai_preferences: preferences,
      ai_persona_name: personaName,
    });
    setDirty(false);
  };

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-base font-bold xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>AI AGENT</h3>
          <p className="text-[11px] text-white/50">Memory, personalization, and behavior</p>
        </div>
        {dirty && (
          <Button size="sm" onClick={handleSave} className="ml-auto gap-1.5 metallic-gold-bg text-black text-xs">
            <Save className="w-3.5 h-3.5" /> Save
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {/* AI Mode */}
        <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.03] border border-border/30">
          <span className="text-sm text-white">AI Autonomy Mode</span>
          <select
            value={profile?.ai_mode || "Basic Chat"}
            onChange={e => saveField("ai_mode", e.target.value)}
            className="text-sm bg-transparent border border-border rounded-lg px-2 py-1 text-white"
          >
            {AI_MODES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {/* Persona Name */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-border/30">
          <span className="text-xs text-white/50 w-28 shrink-0">Agent Name</span>
          <Input
            value={personaName}
            onChange={e => { setPersonaName(e.target.value); setDirty(true); }}
            placeholder="e.g. XPS Agent"
            className="h-8 text-sm bg-transparent border-0 shadow-none focus-visible:ring-0 px-0 text-white"
          />
        </div>

        {/* Agent Memory */}
        <div className="px-3 py-2 rounded-lg bg-white/[0.03] border border-border/30">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs text-white/50">Agent Memory</span>
          </div>
          <textarea
            value={memory}
            onChange={e => { setMemory(e.target.value); setDirty(true); }}
            placeholder="Things the agent should remember about you..."
            rows={3}
            className="w-full bg-transparent text-sm text-white resize-none outline-none placeholder:text-white/20"
          />
        </div>

        {/* Agent Personalization */}
        <div className="px-3 py-2 rounded-lg bg-white/[0.03] border border-border/30">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Bot className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs text-white/50">Agent Personalization</span>
          </div>
          <textarea
            value={personalization}
            onChange={e => { setPersonalization(e.target.value); setDirty(true); }}
            placeholder="Tone, style, focus areas, industry-specific knowledge..."
            rows={3}
            className="w-full bg-transparent text-sm text-white resize-none outline-none placeholder:text-white/20"
          />
        </div>

        {/* Preferences */}
        <div className="px-3 py-2 rounded-lg bg-white/[0.03] border border-border/30">
          <span className="text-xs text-white/50 block mb-1.5">AI Preferences</span>
          <textarea
            value={preferences}
            onChange={e => { setPreferences(e.target.value); setDirty(true); }}
            placeholder="Response length, technical detail, communication style..."
            rows={2}
            className="w-full bg-transparent text-sm text-white resize-none outline-none placeholder:text-white/20"
          />
        </div>

        {/* Stats */}
        <div className="flex gap-4 px-3 py-2 text-xs text-white/40">
          <span>Total interactions: <strong className="text-white">{profile?.total_ai_interactions || 0}</strong></span>
          {profile?.ai_last_active && (
            <span>Last active: <strong className="text-white">{new Date(profile.ai_last_active).toLocaleDateString()}</strong></span>
          )}
        </div>
      </div>
    </div>
  );
}