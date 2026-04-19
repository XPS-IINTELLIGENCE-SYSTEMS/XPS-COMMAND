import { useState } from "react";
import { Bot, Brain, Save, Loader2, ArrowLeft, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { BRAIN_MODELS } from "./agentBuilderConfig";
import AgentBuilderCapabilities from "./AgentBuilderCapabilities";
import AgentToolAccess from "./AgentToolAccess";
import AgentBuilderApiKeys from "./AgentBuilderApiKeys";
import AgentLogoCreator from "./AgentLogoCreator";

export default function AgentBuilder({ existingAgent, onSave, onCancel }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(() => {
    if (existingAgent) {
      return {
        name: existingAgent.name || "",
        description: existingAgent.description || "",
        brain_model: existingAgent.brain_model || "gpt_5_mini",
        instructions: existingAgent.instructions || "",
        avatar_url: existingAgent.avatar_url || "",
        capabilities: safeJson(existingAgent.capabilities, []),
        tool_access: safeJson(existingAgent.tool_access, []),
        api_keys: existingAgent.api_keys || "{}",
        autonomy_level: existingAgent.autonomy_level || "chatbot",
        memory_enabled: existingAgent.memory_enabled !== false,
        parallel_enabled: existingAgent.parallel_enabled || false,
        async_enabled: existingAgent.async_enabled || false,
        fleet_priority: existingAgent.fleet_priority || 5,
      };
    }
    return {
      name: "", description: "", brain_model: "gpt_5_mini", instructions: "",
      avatar_url: "", capabilities: [], tool_access: [], api_keys: "{}",
      autonomy_level: "chatbot", memory_enabled: true, parallel_enabled: false,
      async_enabled: false, fleet_priority: 5,
    };
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);

    const payload = {
      name: form.name,
      description: form.description,
      brain_model: form.brain_model,
      instructions: form.instructions,
      avatar_url: form.avatar_url,
      capabilities: JSON.stringify(form.capabilities),
      tool_access: JSON.stringify(form.tool_access),
      api_keys: form.api_keys,
      autonomy_level: form.autonomy_level,
      memory_enabled: form.memory_enabled,
      parallel_enabled: form.parallel_enabled,
      async_enabled: form.async_enabled,
      fleet_priority: form.fleet_priority,
      status: "draft",
    };

    if (existingAgent) {
      await base44.entities.CustomAgent.update(existingAgent.id, payload);
    } else {
      await base44.entities.CustomAgent.create(payload);
    }
    setSaving(false);
    onSave();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onCancel} className="p-2 rounded-lg hover:bg-secondary"><ArrowLeft className="w-4 h-4" /></button>
        <Bot className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-extrabold text-foreground">{existingAgent ? "Edit Agent" : "Build New Agent"}</h2>
      </div>

      {/* Name & Description */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">Agent Name *</label>
          <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Lead Hunter" className="h-9" />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">Description</label>
          <Input value={form.description} onChange={e => set("description", e.target.value)} placeholder="What does this agent do?" className="h-9" />
        </div>
      </div>

      {/* Logo */}
      <AgentLogoCreator agentName={form.name} avatarUrl={form.avatar_url} onGenerated={url => set("avatar_url", url)} />

      {/* Brain Model */}
      <div>
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-2">
          <Brain className="w-4 h-4 text-primary" /> Brain (LLM Model)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {BRAIN_MODELS.map(m => (
            <button
              key={m.id}
              onClick={() => set("brain_model", m.id)}
              className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                form.brain_model === m.id ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <div className="font-semibold">{m.label}</div>
              <div className="text-[10px] text-muted-foreground">{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Autonomy Level */}
      <div>
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-primary" /> Autonomy Level
        </h3>
        <div className="flex gap-2">
          {[
            { id: "full_autonomous", label: "Full Autonomous", desc: "No approvals needed" },
            { id: "semi_autonomous", label: "Semi-Autonomous", desc: "Checkpoint approvals" },
            { id: "chatbot", label: "Chatbot", desc: "Conversational only" },
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => set("autonomy_level", opt.id)}
              className={`flex-1 p-3 rounded-lg border text-left text-xs transition-all ${
                form.autonomy_level === opt.id ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <div className="font-semibold">{opt.label}</div>
              <div className="text-[10px] text-muted-foreground">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Toggles */}
      <div className="flex flex-wrap gap-3">
        {[
          { key: "memory_enabled", label: "Persistent Memory" },
          { key: "parallel_enabled", label: "Parallel Execution" },
          { key: "async_enabled", label: "Async Operations" },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => set(t.key, !form[t.key])}
            className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
              form[t.key] ? "border-primary bg-primary/10 text-foreground" : "border-border bg-card text-muted-foreground"
            }`}
          >
            {form[t.key] ? "✓ " : ""}{t.label}
          </button>
        ))}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Fleet Priority:</span>
          <Input
            type="number" min={1} max={10}
            value={form.fleet_priority}
            onChange={e => set("fleet_priority", parseInt(e.target.value) || 5)}
            className="w-16 h-8 text-xs text-center"
          />
        </div>
      </div>

      {/* Capabilities */}
      <AgentBuilderCapabilities selected={form.capabilities} onChange={v => set("capabilities", v)} />

      {/* Tool Access */}
      <AgentToolAccess selected={form.tool_access} onChange={v => set("tool_access", v)} />

      {/* API Keys */}
      <AgentBuilderApiKeys keys={form.api_keys} onChange={v => set("api_keys", v)} />

      {/* Instructions */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1 block">System Instructions</label>
        <textarea
          value={form.instructions}
          onChange={e => set("instructions", e.target.value)}
          placeholder="Custom system prompt or behavioral instructions for this agent..."
          className="w-full h-28 rounded-lg border border-border bg-card p-3 text-sm text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Save */}
      <div className="flex gap-3 pt-2">
        <Button onClick={handleSave} disabled={saving || !form.name.trim()}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
          {existingAgent ? "Update Agent" : "Create Agent & Add to Fleet"}
        </Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

function safeJson(val, fallback) {
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val || "[]"); } catch { return fallback; }
}