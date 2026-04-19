import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Loader2, Star, Pencil, Check, X } from "lucide-react";
import HexPatternBanner from "../shared/HexPatternBanner";
import DashboardToolCard from "./DashboardToolCard";
import DashboardCardEditModal from "./DashboardCardEditModal";
import { DEFAULT_TOOLS } from "./dashboardDefaults";

const DEFAULT_GREETING = "";
const DEFAULT_SUBTITLE = "Here's your sales intelligence briefing for today.";

export default function DashboardHub({ onOpenTool }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Editable greeting
  const [greeting, setGreeting] = useState("");
  const [subtitle, setSubtitle] = useState(DEFAULT_SUBTITLE);
  const [editingGreeting, setEditingGreeting] = useState(false);
  const [greetingDraft, setGreetingDraft] = useState("");
  const [subtitleDraft, setSubtitleDraft] = useState("");

  // Dashboard config
  const [tools, setTools] = useState(DEFAULT_TOOLS);
  const [starredIds, setStarredIds] = useState([]);
  const [allOrder, setAllOrder] = useState(DEFAULT_TOOLS.map(t => t.id));
  const [editingCard, setEditingCard] = useState(null);

  useEffect(() => { loadData(); }, []);

  const autoGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const loadData = async () => {
    const me = await base44.auth.me().catch(() => null);
    setUser(me);

    if (me?.dashboard_config) {
      try {
        const cfg = typeof me.dashboard_config === "string" ? JSON.parse(me.dashboard_config) : me.dashboard_config;
        if (cfg.starred) setStarredIds(cfg.starred);
        if (cfg.order) setAllOrder(cfg.order);
        if (cfg.greeting !== undefined) setGreeting(cfg.greeting);
        if (cfg.subtitle) setSubtitle(cfg.subtitle);
        if (cfg.customizations) {
          setTools(DEFAULT_TOOLS.map(t => {
            const custom = cfg.customizations[t.id];
            return custom ? { ...t, ...custom } : t;
          }));
        }
      } catch {}
    }
    setLoading(false);
  };

  const saveConfig = useCallback(async (overrides = {}) => {
    const currentTools = overrides.tools || tools;
    const currentStarred = overrides.starred || starredIds;
    const currentOrder = overrides.order || allOrder;
    const currentGreeting = overrides.greeting !== undefined ? overrides.greeting : greeting;
    const currentSubtitle = overrides.subtitle !== undefined ? overrides.subtitle : subtitle;

    const customizations = {};
    currentTools.forEach(t => {
      const def = DEFAULT_TOOLS.find(d => d.id === t.id);
      if (def && (t.label !== def.label || t.desc !== def.desc || t.iconName !== def.iconName || t.color !== def.color)) {
        customizations[t.id] = { label: t.label, desc: t.desc, iconName: t.iconName, color: t.color };
      }
    });
    const cfg = { starred: currentStarred, order: currentOrder, customizations, greeting: currentGreeting, subtitle: currentSubtitle };
    await base44.auth.updateMe({ dashboard_config: JSON.stringify(cfg) }).catch(() => {});
  }, [tools, starredIds, allOrder, greeting, subtitle]);

  const toggleStar = (id) => {
    const newStarred = starredIds.includes(id)
      ? starredIds.filter(s => s !== id)
      : [...starredIds, id];
    setStarredIds(newStarred);
    saveConfig({ starred: newStarred });
  };

  const handleEditSave = (updatedCard) => {
    const newTools = tools.map(t => t.id === updatedCard.id ? updatedCard : t);
    setTools(newTools);
    saveConfig({ tools: newTools });
  };

  const saveGreeting = () => {
    setGreeting(greetingDraft);
    setSubtitle(subtitleDraft);
    setEditingGreeting(false);
    saveConfig({ greeting: greetingDraft, subtitle: subtitleDraft });
  };

  const startEditGreeting = () => {
    setGreetingDraft(greeting);
    setSubtitleDraft(subtitle);
    setEditingGreeting(true);
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const srcZone = source.droppableId;
    const dstZone = destination.droppableId;

    if (srcZone === "favorites" && dstZone === "favorites") {
      const newStarred = [...starredIds];
      const [moved] = newStarred.splice(source.index, 1);
      newStarred.splice(destination.index, 0, moved);
      setStarredIds(newStarred);
      saveConfig({ starred: newStarred });
    } else if (srcZone === "all" && dstZone === "all") {
      const nonStarred = allOrder.filter(id => !starredIds.includes(id));
      const [moved] = nonStarred.splice(source.index, 1);
      nonStarred.splice(destination.index, 0, moved);
      const newOrder = [...starredIds, ...nonStarred];
      setAllOrder(newOrder);
      saveConfig({ order: newOrder });
    } else if (srcZone === "all" && dstZone === "favorites") {
      const nonStarred = allOrder.filter(id => !starredIds.includes(id));
      const draggedId = nonStarred[source.index];
      if (draggedId && !starredIds.includes(draggedId)) {
        const newStarred = [...starredIds];
        newStarred.splice(destination.index, 0, draggedId);
        setStarredIds(newStarred);
        saveConfig({ starred: newStarred });
      }
    } else if (srcZone === "favorites" && dstZone === "all") {
      const draggedId = starredIds[source.index];
      const newStarred = starredIds.filter(s => s !== draggedId);
      setStarredIds(newStarred);
      saveConfig({ starred: newStarred });
    }
  };

  const displayGreeting = greeting || `${autoGreeting()}${user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}`;

  const toolMap = Object.fromEntries(tools.map(t => [t.id, t]));
  const favTools = starredIds.map(id => toolMap[id]).filter(Boolean);
  const nonStarredIds = allOrder.filter(id => !starredIds.includes(id) && toolMap[id]);
  const allToolIds = tools.map(t => t.id);
  const missingIds = allToolIds.filter(id => !allOrder.includes(id));
  const gridIds = [...nonStarredIds, ...missingIds].filter(id => !starredIds.includes(id));

  if (loading) {
    return (
      <div className="max-w-[1100px] mx-auto">
        <HexPatternBanner />
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto">
      <HexPatternBanner />
      <div className="px-6 pb-8 -mt-4">

        {/* Editable Greeting */}
        <div className="mb-6 group/greet">
          {editingGreeting ? (
            <div className="space-y-2">
              <input
                value={greetingDraft}
                onChange={e => setGreetingDraft(e.target.value)}
                placeholder={`${autoGreeting()}, ${user?.full_name?.split(" ")[0] || "there"}`}
                className="text-3xl font-extrabold text-foreground tracking-tight bg-transparent border-b-2 border-primary/40 outline-none w-full pb-1 placeholder:text-muted-foreground/40"
                autoFocus
              />
              <input
                value={subtitleDraft}
                onChange={e => setSubtitleDraft(e.target.value)}
                placeholder="Subtitle text..."
                className="text-sm text-muted-foreground bg-transparent border-b border-border outline-none w-full pb-1 placeholder:text-muted-foreground/30"
              />
              <div className="flex gap-2 pt-1">
                <button onClick={saveGreeting} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium">
                  <Check className="w-3.5 h-3.5" /> Save
                </button>
                <button onClick={() => setEditingGreeting(false)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
                {greeting && (
                  <button onClick={() => { setGreetingDraft(""); setSubtitleDraft(DEFAULT_SUBTITLE); }} className="text-xs text-muted-foreground hover:text-foreground ml-2">
                    Reset to default
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="relative">
              <h1 className="text-[32px] font-extrabold metallic-gold tracking-tight">
                {displayGreeting}
              </h1>
              <p className="text-[15px] text-white mt-1">{subtitle}</p>
              <button
                onClick={startEditGreeting}
                className="absolute -right-1 top-0 p-1.5 rounded-lg hover:bg-secondary opacity-0 group-hover/greet:opacity-100 transition-opacity"
                title="Edit greeting"
              >
                <Pencil className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          )}
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          {/* Favorites Section — replaces old stat cards */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <h2 className="text-[15px] font-bold text-white">Favorites</h2>
              <span className="text-[13px] text-white/40">
                {favTools.length === 0 ? "— star cards or drag them here" : `${favTools.length} pinned`}
              </span>
            </div>
            <Droppable droppableId="favorites" direction="horizontal">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 min-h-[90px] rounded-xl border-2 border-dashed p-3 transition-colors ${
                    snapshot.isDraggingOver ? "border-yellow-400/40 bg-yellow-400/5" : "border-border/50 bg-transparent"
                  }`}
                >
                  {favTools.length === 0 && !snapshot.isDraggingOver && (
                    <div className="col-span-full flex items-center justify-center py-6 text-xs text-muted-foreground">
                      <Star className="w-3.5 h-3.5 mr-1.5 text-muted-foreground/50" />
                      Click the ★ on any card below or drag cards here to pin your favorites
                    </div>
                  )}
                  {favTools.map((tool, index) => (
                    <Draggable key={tool.id} draggableId={`fav-${tool.id}`} index={index}>
                      {(prov) => (
                        <div ref={prov.innerRef} {...prov.draggableProps}>
                          <DashboardToolCard
                            tool={tool}
                            starred
                            index={index}
                            onOpen={onOpenTool}
                            onToggleStar={toggleStar}
                            onEdit={setEditingCard}
                            dragHandleProps={prov.dragHandleProps}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>

          {/* All Tools Grid */}
          <div>
            <h2 className="text-[15px] font-bold text-white mb-3">All Tools</h2>
            <Droppable droppableId="all" direction="horizontal">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 rounded-xl p-1 transition-colors ${
                    snapshot.isDraggingOver ? "bg-primary/5" : ""
                  }`}
                >
                  {gridIds.map((id, index) => {
                    const tool = toolMap[id];
                    if (!tool) return null;
                    // Global numbering: favorites count + grid index
                    const globalIndex = favTools.length + index;
                    return (
                      <Draggable key={tool.id} draggableId={`all-${tool.id}`} index={index}>
                        {(prov) => (
                          <div ref={prov.innerRef} {...prov.draggableProps}>
                            <DashboardToolCard
                              tool={tool}
                              starred={false}
                              index={globalIndex}
                              onOpen={onOpenTool}
                              onToggleStar={toggleStar}
                              onEdit={setEditingCard}
                              dragHandleProps={prov.dragHandleProps}
                            />
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </DragDropContext>
      </div>

      {editingCard && (
        <DashboardCardEditModal
          card={editingCard}
          onSave={handleEditSave}
          onClose={() => setEditingCard(null)}
        />
      )}
    </div>
  );
}