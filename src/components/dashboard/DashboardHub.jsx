import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Users, Loader2, TrendingUp, DollarSign, FileText, Star
} from "lucide-react";
import HexPatternBanner from "../shared/HexPatternBanner";
import DashboardToolCard from "./DashboardToolCard";
import DashboardCardEditModal from "./DashboardCardEditModal";
import { DEFAULT_TOOLS } from "./dashboardDefaults";

export default function DashboardHub({ onOpenTool }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Dashboard config persisted on user profile
  const [tools, setTools] = useState(DEFAULT_TOOLS);
  const [starredIds, setStarredIds] = useState([]);
  const [allOrder, setAllOrder] = useState(DEFAULT_TOOLS.map(t => t.id));
  const [editingCard, setEditingCard] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [leads, proposals, invoices, me] = await Promise.all([
      base44.entities.Lead.list("-created_date", 500),
      base44.entities.Proposal.list("-created_date", 200),
      base44.entities.Invoice.list("-created_date", 200),
      base44.auth.me().catch(() => null),
    ]);

    const active = leads.filter(l => !["Won", "Lost"].includes(l.stage)).length;
    const pipeline = leads.filter(l => !["Won", "Lost"].includes(l.stage)).reduce((s, l) => s + (l.estimated_value || 0), 0);
    const proposalsSent = proposals.filter(p => ["Sent", "Viewed"].includes(p.status)).length;
    const closeRate = leads.length > 0
      ? Math.round((leads.filter(l => l.stage === "Won").length / Math.max(leads.filter(l => ["Won", "Lost"].includes(l.stage)).length, 1)) * 100 * 10) / 10
      : 0;

    setStats({ active, pipeline, proposalsSent, closeRate });
    setUser(me);

    // Load saved dashboard config
    if (me?.dashboard_config) {
      try {
        const cfg = typeof me.dashboard_config === "string" ? JSON.parse(me.dashboard_config) : me.dashboard_config;
        if (cfg.starred) setStarredIds(cfg.starred);
        if (cfg.order) setAllOrder(cfg.order);
        if (cfg.customizations) {
          // Merge saved customizations over defaults
          setTools(DEFAULT_TOOLS.map(t => {
            const custom = cfg.customizations[t.id];
            return custom ? { ...t, ...custom } : t;
          }));
        }
      } catch {}
    }
    setLoading(false);
  };

  // Persist config
  const saveConfig = useCallback(async (newStarred, newOrder, newTools) => {
    const customizations = {};
    newTools.forEach(t => {
      const def = DEFAULT_TOOLS.find(d => d.id === t.id);
      if (def && (t.label !== def.label || t.desc !== def.desc || t.iconName !== def.iconName || t.color !== def.color)) {
        customizations[t.id] = { label: t.label, desc: t.desc, iconName: t.iconName, color: t.color };
      }
    });
    const cfg = { starred: newStarred, order: newOrder, customizations };
    await base44.auth.updateMe({ dashboard_config: JSON.stringify(cfg) }).catch(() => {});
  }, []);

  const toggleStar = (id) => {
    const newStarred = starredIds.includes(id)
      ? starredIds.filter(s => s !== id)
      : [...starredIds, id];
    setStarredIds(newStarred);
    saveConfig(newStarred, allOrder, tools);
  };

  const handleEditSave = (updatedCard) => {
    const newTools = tools.map(t => t.id === updatedCard.id ? updatedCard : t);
    setTools(newTools);
    saveConfig(starredIds, allOrder, newTools);
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const srcZone = source.droppableId;
    const dstZone = destination.droppableId;

    if (srcZone === "favorites" && dstZone === "favorites") {
      // Reorder within favorites
      const newStarred = [...starredIds];
      const [moved] = newStarred.splice(source.index, 1);
      newStarred.splice(destination.index, 0, moved);
      setStarredIds(newStarred);
      saveConfig(newStarred, allOrder, tools);
    } else if (srcZone === "all" && dstZone === "all") {
      // Reorder within main grid
      const nonStarred = allOrder.filter(id => !starredIds.includes(id));
      const [moved] = nonStarred.splice(source.index, 1);
      nonStarred.splice(destination.index, 0, moved);
      // Rebuild full order: starred first, then non-starred in new order
      const newOrder = [...starredIds, ...nonStarred];
      setAllOrder(newOrder);
      saveConfig(starredIds, newOrder, tools);
    } else if (srcZone === "all" && dstZone === "favorites") {
      // Star a card by dragging into favorites
      const nonStarred = allOrder.filter(id => !starredIds.includes(id));
      const draggedId = nonStarred[source.index];
      if (draggedId && !starredIds.includes(draggedId)) {
        const newStarred = [...starredIds];
        newStarred.splice(destination.index, 0, draggedId);
        setStarredIds(newStarred);
        saveConfig(newStarred, allOrder, tools);
      }
    } else if (srcZone === "favorites" && dstZone === "all") {
      // Unstar by dragging out of favorites
      const draggedId = starredIds[source.index];
      const newStarred = starredIds.filter(s => s !== draggedId);
      setStarredIds(newStarred);
      saveConfig(newStarred, allOrder, tools);
    }
  };

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  const toolMap = Object.fromEntries(tools.map(t => [t.id, t]));
  const favTools = starredIds.map(id => toolMap[id]).filter(Boolean);
  const nonStarredIds = allOrder.filter(id => !starredIds.includes(id) && toolMap[id]);
  // Ensure any tools not in allOrder are appended
  const allToolIds = tools.map(t => t.id);
  const missingIds = allToolIds.filter(id => !allOrder.includes(id));
  const gridIds = [...nonStarredIds, ...missingIds].filter(id => !starredIds.includes(id));

  return (
    <div className="max-w-[1100px] mx-auto">
      <HexPatternBanner />
      <div className="px-6 pb-8 -mt-4">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            {greeting}{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Here's your sales intelligence briefing for today.</p>
        </div>

        {/* Stat Cards */}
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              <StatCard icon={Users} label="Active Leads" value={stats.active} change="+12.4%" positive />
              <StatCard icon={DollarSign} label="Pipeline Value" value={`$${(stats.pipeline / 1000000).toFixed(1)}M`} change="+8.7%" positive />
              <StatCard icon={FileText} label="Proposals Sent" value={stats.proposalsSent} change="+23.1%" positive />
              <StatCard icon={TrendingUp} label="Close Rate" value={`${stats.closeRate}%`} change="-1.3%" positive={false} />
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
              {/* Favorites Section */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <h2 className="text-sm font-bold text-foreground">Favorites</h2>
                  <span className="text-xs text-muted-foreground">
                    {favTools.length === 0 ? "— star cards or drag them here" : `${favTools.length} pinned`}
                  </span>
                </div>
                <Droppable droppableId="favorites" direction="horizontal">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 min-h-[80px] rounded-xl border-2 border-dashed p-3 transition-colors ${
                        snapshot.isDraggingOver ? "border-yellow-400/40 bg-yellow-400/5" : "border-border/50 bg-transparent"
                      }`}
                    >
                      {favTools.length === 0 && !snapshot.isDraggingOver && (
                        <div className="col-span-full flex items-center justify-center py-4 text-xs text-muted-foreground">
                          <Star className="w-3.5 h-3.5 mr-1.5 text-muted-foreground/50" />
                          Click the star on any card or drag cards here
                        </div>
                      )}
                      {favTools.map((tool, index) => (
                        <Draggable key={tool.id} draggableId={`fav-${tool.id}`} index={index}>
                          {(prov, snap) => (
                            <div ref={prov.innerRef} {...prov.draggableProps}>
                              <DashboardToolCard
                                tool={tool}
                                starred
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
                <h2 className="text-sm font-bold text-foreground mb-3">All Tools</h2>
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
                        return (
                          <Draggable key={tool.id} draggableId={`all-${tool.id}`} index={index}>
                            {(prov) => (
                              <div ref={prov.innerRef} {...prov.draggableProps}>
                                <DashboardToolCard
                                  tool={tool}
                                  starred={false}
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
          </>
        )}
      </div>

      {/* Edit Modal */}
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

function StatCard({ icon: Icon, label, value, change, positive }) {
  return (
    <div className="rounded-xl p-4 glass-card">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      </div>
      <div className="text-2xl font-extrabold text-foreground">{value}</div>
      <div className={`text-xs font-medium mt-1 ${positive ? "text-green-400" : "text-red-400"}`}>
        ↗ {change} <span className="text-muted-foreground font-normal">vs last month</span>
      </div>
    </div>
  );
}