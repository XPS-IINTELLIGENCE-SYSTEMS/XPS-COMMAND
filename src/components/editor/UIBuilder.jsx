import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { Wand2, Plus, Trash2, Move, Type, Image, Square, Loader2, Copy, LayoutGrid } from "lucide-react";

const defaultComponents = [
  { id: 1, type: "heading", content: "Welcome to XPS Intelligence", style: "text-2xl font-bold text-foreground" },
  { id: 2, type: "text", content: "AI-Powered Sales Command Center for Xtreme Polishing Systems", style: "text-sm text-muted-foreground" },
  { id: 3, type: "button", content: "Get Started", style: "bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium" },
];

const componentPalette = [
  { type: "heading", label: "Heading", icon: Type },
  { type: "text", label: "Text", icon: Type },
  { type: "button", label: "Button", icon: Square },
  { type: "image", label: "Image", icon: Image },
  { type: "card", label: "Card", icon: Square },
  { type: "grid", label: "Grid", icon: LayoutGrid },
];

export default function UIBuilder({ onCommand }) {
  const [components, setComponents] = useState(defaultComponents);
  const [selected, setSelected] = useState(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [nextId, setNextId] = useState(4);

  const addComponent = (type) => {
    const defaults = {
      heading: { content: "New Heading", style: "text-xl font-bold text-foreground" },
      text: { content: "New text paragraph", style: "text-sm text-muted-foreground" },
      button: { content: "Button", style: "bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm" },
      image: { content: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400", style: "rounded-lg w-full max-w-md" },
      card: { content: "Card Title|Card content goes here", style: "bg-card border border-border rounded-lg p-4" },
      grid: { content: "Grid Item 1|Grid Item 2|Grid Item 3", style: "grid grid-cols-3 gap-3" },
    };
    const def = defaults[type] || defaults.text;
    setComponents(prev => [...prev, { id: nextId, type, ...def }]);
    setNextId(n => n + 1);
  };

  const removeComponent = (id) => {
    setComponents(prev => prev.filter(c => c.id !== id));
    if (selected === id) setSelected(null);
  };

  const updateComponent = (id, field, value) => {
    setComponents(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a UI component generator. Based on this request, generate an array of UI components.
Request: "${aiPrompt}"
Return JSON with this schema: {"components": [{"type": "heading|text|button|image|card", "content": "text content", "style": "tailwind classes"}]}
Generate 2-5 components that fulfill the request. Use dark theme classes (text-foreground, bg-card, border-border, text-primary for accents).`,
        response_json_schema: {
          type: "object",
          properties: {
            components: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  content: { type: "string" },
                  style: { type: "string" },
                },
              },
            },
          },
        },
      });
      if (result?.components) {
        const newComps = result.components.map((c, i) => ({ ...c, id: nextId + i }));
        setComponents(prev => [...prev, ...newComps]);
        setNextId(n => n + result.components.length);
      }
    } catch (err) {
      console.error("AI generation failed:", err);
    } finally {
      setGenerating(false);
      setAiPrompt("");
    }
  };

  const renderComponent = (comp) => {
    const isSelected = selected === comp.id;
    const wrapper = `relative cursor-pointer transition-all ${isSelected ? "ring-2 ring-primary/50 rounded-lg" : "hover:ring-1 hover:ring-border rounded-lg"}`;
    
    switch (comp.type) {
      case "heading":
        return <div className={wrapper} onClick={() => setSelected(comp.id)}><h2 className={comp.style}>{comp.content}</h2></div>;
      case "text":
        return <div className={wrapper} onClick={() => setSelected(comp.id)}><p className={comp.style}>{comp.content}</p></div>;
      case "button":
        return <div className={wrapper} onClick={() => setSelected(comp.id)}><button className={comp.style}>{comp.content}</button></div>;
      case "image":
        return <div className={wrapper} onClick={() => setSelected(comp.id)}><img src={comp.content} className={comp.style} alt="UI element" /></div>;
      case "card":
        const [title, body] = comp.content.split("|");
        return (
          <div className={`${wrapper}`} onClick={() => setSelected(comp.id)}>
            <div className={comp.style}>
              <div className="text-sm font-semibold text-foreground">{title}</div>
              <div className="text-xs text-muted-foreground mt-1">{body}</div>
            </div>
          </div>
        );
      case "grid":
        const items = comp.content.split("|");
        return (
          <div className={wrapper} onClick={() => setSelected(comp.id)}>
            <div className={comp.style}>
              {items.map((item, i) => (
                <div key={i} className="bg-card border border-border rounded-lg p-3 text-xs text-foreground">{item}</div>
              ))}
            </div>
          </div>
        );
      default:
        return <div className={wrapper} onClick={() => setSelected(comp.id)}><p className={comp.style}>{comp.content}</p></div>;
    }
  };

  return (
    <div className="flex gap-4 h-full">
      {/* Component Palette */}
      <div className="w-48 flex-shrink-0 space-y-3">
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Components</div>
        <div className="grid grid-cols-2 gap-1.5">
          {componentPalette.map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.type}
                onClick={() => addComponent(p.type)}
                className="flex flex-col items-center gap-1 p-2 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors"
              >
                <Icon className="w-4 h-4 text-primary/70" />
                <span className="text-[9px] text-muted-foreground">{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* AI Generate */}
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-4">AI Generate</div>
        <div className="space-y-2">
          <Input
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Describe what to create..."
            className="text-xs h-8 bg-secondary/50"
            onKeyDown={(e) => e.key === "Enter" && handleAIGenerate()}
          />
          <Button onClick={handleAIGenerate} disabled={generating} className="w-full text-xs h-7 gap-1.5 bg-primary text-primary-foreground">
            {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
            Generate
          </Button>
        </div>

        {/* Selected properties */}
        {selected && (
          <div className="space-y-2 mt-4">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Properties</div>
            <Input
              value={components.find(c => c.id === selected)?.content || ""}
              onChange={(e) => updateComponent(selected, "content", e.target.value)}
              className="text-xs h-7 bg-secondary/50"
              placeholder="Content"
            />
            <Input
              value={components.find(c => c.id === selected)?.style || ""}
              onChange={(e) => updateComponent(selected, "style", e.target.value)}
              className="text-xs h-7 bg-secondary/50"
              placeholder="Tailwind classes"
            />
            <Button variant="destructive" size="sm" className="w-full text-xs h-7 gap-1" onClick={() => removeComponent(selected)}>
              <Trash2 className="w-3 h-3" /> Remove
            </Button>
          </div>
        )}
      </div>

      {/* Canvas */}
      <div className="flex-1 bg-card/50 rounded-lg border border-border p-6 overflow-y-auto space-y-3">
        {components.map((comp) => (
          <div key={comp.id}>{renderComponent(comp)}</div>
        ))}
        {components.length === 0 && (
          <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
            Add components from the palette or use AI to generate UI
          </div>
        )}
      </div>
    </div>
  );
}