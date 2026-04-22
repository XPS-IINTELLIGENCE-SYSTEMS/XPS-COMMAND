import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Loader2, Star, Pencil, Check, X, Settings2, Plus, Unlock, Lock } from "lucide-react";
import HexPatternBanner from "../shared/HexPatternBanner";
import DashboardToolCard from "./DashboardToolCard";
import DashboardCardEditModal from "./DashboardCardEditModal";
import ToolCardManager from "./ToolCardManager";
import CalendarCard from "./CalendarCard";
import PipelineBanner from "./PipelineBanner";
import DailySummaryCard from "./DailySummaryCard";
import ScheduledItemsSidebar from "./ScheduledItemsSidebar";
import DashboardSection from "./DashboardSection";
import AddSectionModal from "./AddSectionModal";
import NotesWidget from "./NotesWidget";
import QuickLinksWidget from "./QuickLinksWidget";
import ActivityStream from "./ActivityStream";
import CommandNotepad from "./CommandNotepad";
import QuickWorkflowBar from "./QuickWorkflowBar";
import SystemGuardianDashboard from "../guardian/SystemGuardianDashboard";
import FinancialSandboxView from "../financial/FinancialSandboxView";
import OrchestratorDashboard from "../orchestrator/OrchestratorDashboard";
import FocusDashboard from "../focus/FocusDashboard";
import FocusToolbar from "../focus/FocusToolbar";
import CallCenterWidget from "./CallCenterWidget";
import { DEFAULT_TOOLS } from "./dashboardDefaults";
import ToolCategoryGrid from "./ToolCategoryGrid";
import DashboardWorkflowCreator from "./DashboardWorkflowCreator";
import AutoDashboardConfigurator from "./AutoDashboardConfigurator";
import AutoWorkflowEngine from "./AutoWorkflowEngine";

const DEFAULT_GREETING = "";
const DEFAULT_SUBTITLE = "Here's your sales intelligence briefing for today.";

const DEFAULT_SECTIONS = [
  { id: "sec_callcenter", type: "callcenter", title: "Call Center — Operations Hub", size: "full", collapsed: false, pinned: true },
  { id: "sec_greeting", type: "greeting", title: "Greeting", size: "full", collapsed: false },
  { id: "sec_notepad", type: "command_notepad", title: "Command Notepad", size: "half", collapsed: false },
  { id: "sec_workflow", type: "quick_workflow", title: "Quick Workflow", size: "half", collapsed: false },
  { id: "sec_pipeline", type: "pipeline", title: "Pipeline", size: "full", collapsed: false },
  { id: "sec_calendar", type: "calendar", title: "Calendar", size: "full", collapsed: false },
  { id: "sec_summary", type: "summary", title: "Daily Summary", size: "half", collapsed: false },
  { id: "sec_sidebar", type: "sidebar", title: "Scheduled Items", size: "half", collapsed: false },
  { id: "sec_activity", type: "activity", title: "Activity Stream", size: "full", collapsed: false },
  { id: "sec_favorites", type: "favorites", title: "Favorites", size: "full", collapsed: false },
  { id: "sec_tools", type: "tools", title: "All Tools", size: "full", collapsed: false },
];

export default function DashboardHub({ onOpenTool }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);

  // Editable greeting
  const [greeting, setGreeting] = useState("");
  const [subtitle, setSubtitle] = useState(DEFAULT_SUBTITLE);
  const [editingGreeting, setEditingGreeting] = useState(false);
  const [greetingDraft, setGreetingDraft] = useState("");
  const [subtitleDraft, setSubtitleDraft] = useState("");

  // Dashboard config
  const [tools, setTools] = useState(DEFAULT_TOOLS);
  const [starredIds, setStarredIds] = useState(["master_database"]);
  const [allOrder, setAllOrder] = useState(DEFAULT_TOOLS.map(t => t.id));
  const [editingCard, setEditingCard] = useState(null);
  const [showManager, setShowManager] = useState(false);
  const [showNumbers, setShowNumbers] = useState(true);
  const [customNumbers, setCustomNumbers] = useState({});
  const [hiddenIds, setHiddenIds] = useState([]);
  const [customTools, setCustomTools] = useState([]);
  const [automations, setAutomations] = useState([]);
  const [calendarExpanded, setCalendarExpanded] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  // Section layout
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [widgetData, setWidgetData] = useState({}); // { sectionId: { notes: "...", links: [...] } }

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
        if (cfg.showNumbers !== undefined) setShowNumbers(cfg.showNumbers);
        if (cfg.customNumbers) setCustomNumbers(cfg.customNumbers);
        if (cfg.hiddenIds) setHiddenIds(cfg.hiddenIds);
        if (cfg.customTools) setCustomTools(cfg.customTools);
        if (cfg.sections) setSections(cfg.sections);
        if (cfg.widgetData) setWidgetData(cfg.widgetData);
        if (cfg.customizations) {
          const base = DEFAULT_TOOLS.filter(t => !(cfg.hiddenIds || []).includes(t.id)).map(t => {
            const custom = cfg.customizations[t.id];
            return custom ? { ...t, ...custom } : t;
          });
          setTools([...base, ...(cfg.customTools || [])]);
        } else {
          setTools([...DEFAULT_TOOLS.filter(t => !(cfg.hiddenIds || []).includes(t.id)), ...(cfg.customTools || [])]);
        }
      } catch {}
    }
    try {
      const res = await base44.functions.invoke("getAutomations", {});
      setAutomations(res?.data?.automations || []);
    } catch {
      setAutomations([]);
    }
    setLoading(false);
  };

  const saveConfig = useCallback(async (overrides = {}) => {
    const currentTools = overrides.tools || tools;
    const currentStarred = overrides.starred || starredIds;
    const currentOrder = overrides.order || allOrder;
    const currentGreeting = overrides.greeting !== undefined ? overrides.greeting : greeting;
    const currentSubtitle = overrides.subtitle !== undefined ? overrides.subtitle : subtitle;
    const currentShowNumbers = overrides.showNumbers !== undefined ? overrides.showNumbers : showNumbers;
    const currentCustomNumbers = overrides.customNumbers || customNumbers;
    const currentSections = overrides.sections || sections;
    const currentWidgetData = overrides.widgetData || widgetData;

    const customizations = {};
    currentTools.forEach(t => {
      const def = DEFAULT_TOOLS.find(d => d.id === t.id);
      if (def && (t.label !== def.label || t.desc !== def.desc || t.iconName !== def.iconName || t.color !== def.color)) {
        customizations[t.id] = { label: t.label, desc: t.desc, iconName: t.iconName, color: t.color };
      }
    });
    const currentHidden = overrides.hiddenIds || hiddenIds;
    const currentCustomTools = overrides.customTools || customTools;
    const cfg = {
      starred: currentStarred, order: currentOrder, customizations,
      greeting: currentGreeting, subtitle: currentSubtitle,
      showNumbers: currentShowNumbers, customNumbers: currentCustomNumbers,
      hiddenIds: currentHidden, customTools: currentCustomTools,
      sections: currentSections, widgetData: currentWidgetData,
    };
    await base44.auth.updateMe({ dashboard_config: JSON.stringify(cfg) }).catch(() => {});
  }, [tools, starredIds, allOrder, greeting, subtitle, showNumbers, customNumbers, hiddenIds, customTools, sections, widgetData]);

  // --- Section management ---
  const updateSection = (sectionId, updates) => {
    const updated = sections.map(s => s.id === sectionId ? { ...s, ...updates } : s);
    setSections(updated);
    saveConfig({ sections: updated });
  };

  const removeSection = (sectionId) => {
    const updated = sections.filter(s => s.id !== sectionId);
    setSections(updated);
    saveConfig({ sections: updated });
  };

  const addSection = (type) => {
    const id = `sec_${type}_${Date.now()}`;
    const titles = { calendar: "Weekly Calendar", summary: "Daily Summary", favorites: "Favorites", tools: "All Tools", sidebar: "Scheduled Items", notes: "Quick Notes", quicklinks: "Quick Links", activity: "Activity Stream", command_notepad: "Command Notepad", quick_workflow: "Quick Workflow", create_workflow: "Create Workflow", system_guardian: "System Guardian", financial_sandbox: "Financial Sandbox", orchestrator: "Orchestrator", focus_dashboard: "Focus Dashboard", auto_dashboard: "Auto Dashboard Configurator", auto_workflow_engine: "Auto Workflow Engine", callcenter: "Call Center — Operations Hub" };
    const newSec = { id, type, title: titles[type] || type, size: ["calendar", "favorites", "tools", "callcenter"].includes(type) ? "full" : "half", collapsed: false };
    const updated = [...sections, newSec];
    setSections(updated);
    saveConfig({ sections: updated });
  };

  const onSectionDragEnd = (result) => {
    if (!result.destination) return;
    if (result.type === "SECTION") {
      const reordered = [...sections];
      const [moved] = reordered.splice(result.source.index, 1);
      reordered.splice(result.destination.index, 0, moved);
      setSections(reordered);
      saveConfig({ sections: reordered });
      return;
    }
    // Tool card drag
    handleToolDragEnd(result);
  };

  const updateWidgetData = (sectionId, data) => {
    const updated = { ...widgetData, [sectionId]: data };
    setWidgetData(updated);
    saveConfig({ widgetData: updated });
  };

  // --- Tool management (same as before) ---
  const toggleStar = (id) => {
    const newStarred = starredIds.includes(id) ? starredIds.filter(s => s !== id) : [...starredIds, id];
    setStarredIds(newStarred);
    saveConfig({ starred: newStarred });
  };

  const handleEditSave = (updatedCard) => {
    const newTools = tools.map(t => t.id === updatedCard.id ? updatedCard : t);
    setTools(newTools);
    const newCustomTools = customTools.map(t => t.id === updatedCard.id ? updatedCard : t);
    setCustomTools(newCustomTools);
    saveConfig({ tools: newTools, customTools: newCustomTools });
  };

  const handleAddTool = (newTool) => {
    const newTools = [...tools, newTool];
    const newCustomTools = [...customTools, newTool];
    const newOrder = [...allOrder, newTool.id];
    setTools(newTools);
    setCustomTools(newCustomTools);
    setAllOrder(newOrder);
    saveConfig({ tools: newTools, customTools: newCustomTools, order: newOrder });
  };

  const handleDeleteTool = (toolId) => {
    const isCustomTool = toolId.startsWith("custom_");
    if (isCustomTool) {
      const newTools = tools.filter(t => t.id !== toolId);
      const newCustomTools = customTools.filter(t => t.id !== toolId);
      const newStarred = starredIds.filter(id => id !== toolId);
      const newOrder = allOrder.filter(id => id !== toolId);
      setTools(newTools); setCustomTools(newCustomTools); setStarredIds(newStarred); setAllOrder(newOrder);
      saveConfig({ tools: newTools, customTools: newCustomTools, starred: newStarred, order: newOrder });
    } else {
      const newHidden = [...hiddenIds, toolId];
      const newTools = tools.filter(t => t.id !== toolId);
      const newStarred = starredIds.filter(id => id !== toolId);
      setHiddenIds(newHidden); setTools(newTools); setStarredIds(newStarred);
      saveConfig({ tools: newTools, hiddenIds: newHidden, starred: newStarred });
    }
  };

  const handleToggleNumbers = (val) => { setShowNumbers(val); saveConfig({ showNumbers: val }); };
  const handleSetCustomNumber = (toolId, val) => {
    const updated = { ...customNumbers };
    if (val === null) delete updated[toolId]; else updated[toolId] = val;
    setCustomNumbers(updated);
    saveConfig({ customNumbers: updated });
  };
  const getDisplayNumber = (toolId, autoIndex) => {
    if (!showNumbers) return null;
    if (customNumbers[toolId] != null) return customNumbers[toolId];
    return autoIndex + 1;
  };

  const saveGreeting = () => {
    setGreeting(greetingDraft); setSubtitle(subtitleDraft); setEditingGreeting(false);
    saveConfig({ greeting: greetingDraft, subtitle: subtitleDraft });
  };
  const startEditGreeting = () => { setGreetingDraft(greeting); setSubtitleDraft(subtitle); setEditingGreeting(true); };

  const handleToolDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    const srcZone = source.droppableId;
    const dstZone = destination.droppableId;

    if (srcZone === "favorites" && dstZone === "favorites") {
      const newStarred = [...starredIds];
      const [moved] = newStarred.splice(source.index, 1);
      newStarred.splice(destination.index, 0, moved);
      setStarredIds(newStarred); saveConfig({ starred: newStarred });
    } else if (srcZone === "all" && dstZone === "all") {
      const nonStarred = allOrder.filter(id => !starredIds.includes(id));
      const [moved] = nonStarred.splice(source.index, 1);
      nonStarred.splice(destination.index, 0, moved);
      const newOrder = [...starredIds, ...nonStarred];
      setAllOrder(newOrder); saveConfig({ order: newOrder });
    } else if (srcZone === "all" && dstZone === "favorites") {
      const nonStarred = allOrder.filter(id => !starredIds.includes(id));
      const draggedId = nonStarred[source.index];
      if (draggedId && !starredIds.includes(draggedId)) {
        const newStarred = [...starredIds];
        newStarred.splice(destination.index, 0, draggedId);
        setStarredIds(newStarred); saveConfig({ starred: newStarred });
      }
    } else if (srcZone === "favorites" && dstZone === "all") {
      const draggedId = starredIds[source.index];
      const newStarred = starredIds.filter(s => s !== draggedId);
      setStarredIds(newStarred); saveConfig({ starred: newStarred });
    }
  };

  const displayGreeting = greeting || `${autoGreeting()}${user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}`;
  const toolMap = Object.fromEntries(tools.map(t => [t.id, t]));
  const favTools = starredIds.map(id => toolMap[id]).filter(Boolean);
  const nonStarredIds = allOrder.filter(id => !starredIds.includes(id) && toolMap[id]);
  const allToolIds = tools.map(t => t.id);
  const missingIds = allToolIds.filter(id => !allOrder.includes(id));
  const gridIds = [...nonStarredIds, ...missingIds].filter(id => !starredIds.includes(id));

  // --- Render each section ---
  const renderSectionContent = (section) => {
    switch (section.type) {
      case "greeting":
        return <FocusToolbar user={user} />;

      case "pipeline":
        return <PipelineBanner onOpenFull={() => onOpenTool?.("master_pipeline")} />;

      case "calendar":
        return <CalendarCard automations={automations} expanded={calendarExpanded} onToggleExpand={() => setCalendarExpanded(!calendarExpanded)} />;

      case "summary":
        return <DailySummaryCard expanded={summaryExpanded} onToggleExpand={() => setSummaryExpanded(!summaryExpanded)} />;

      case "sidebar":
        return <ScheduledItemsSidebar automations={automations} tools={tools} />;

      case "favorites":
        return (
          <div>
            <div className="flex items-center gap-2 mb-2 sm:mb-3 px-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <h2 className="text-[13px] sm:text-[15px] font-bold text-white">Favorites</h2>
              <span className="text-[11px] sm:text-[13px] text-white/60">{favTools.length === 0 ? "— tap ★ to pin" : `${favTools.length} pinned`}</span>
            </div>
            <Droppable droppableId="favorites">
              {(provided, snapshot) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 min-h-[180px] rounded-xl border-2 border-dashed p-3 transition-colors ${snapshot.isDraggingOver ? "border-yellow-400/40 bg-yellow-400/5" : "border-border/50 bg-transparent"}`}>
                  {favTools.length === 0 && !snapshot.isDraggingOver && (
                    <div className="col-span-full flex items-center justify-center py-4 sm:py-6 text-[11px] sm:text-xs text-white/50">
                      <Star className="w-3.5 h-3.5 mr-1.5 text-muted-foreground/50" />
                      <span className="hidden sm:inline">Click ★ or drag cards here</span>
                      <span className="sm:hidden">Tap ★ to pin</span>
                    </div>
                  )}
                  {favTools.map((tool, index) => (
                    <Draggable key={tool.id} draggableId={`fav-${tool.id}`} index={index}>
                      {(prov) => (
                        <div ref={prov.innerRef} {...prov.draggableProps}>
                          <DashboardToolCard tool={tool} starred displayNumber={getDisplayNumber(tool.id, index)} onOpen={onOpenTool} onToggleStar={toggleStar} onEdit={setEditingCard} dragHandleProps={prov.dragHandleProps} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        );

      case "tools":
        return (
          <div>
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-[15px] font-bold text-white">All Tools</h2>
              <button onClick={() => setShowManager(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-card text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors">
                <Settings2 className="w-3.5 h-3.5" /> Manage
              </button>
            </div>
            <Droppable droppableId="all">
              {(provided, snapshot) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className={`rounded-xl p-1 transition-colors ${snapshot.isDraggingOver ? "bg-primary/5" : ""}`}>
                  <ToolCategoryGrid
                    gridIds={gridIds}
                    toolMap={toolMap}
                    favToolsCount={favTools.length}
                    starredIds={starredIds}
                    getDisplayNumber={getDisplayNumber}
                    onOpenTool={onOpenTool}
                    onToggleStar={toggleStar}
                    onEditCard={setEditingCard}
                  />
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        );

      case "command_notepad":
        return <CommandNotepad onOpenTool={onOpenTool} />;

      case "quick_workflow":
        return <QuickWorkflowBar onOpenTool={onOpenTool} />;

      case "create_workflow":
        return <DashboardWorkflowCreator onOpenTool={onOpenTool} />;

      case "notes":
        return <NotesWidget content={widgetData[section.id]?.notes || ""} onChange={(val) => updateWidgetData(section.id, { ...widgetData[section.id], notes: val })} />;

      case "quicklinks":
        return <QuickLinksWidget links={widgetData[section.id]?.links || []} onChange={(val) => updateWidgetData(section.id, { ...widgetData[section.id], links: val })} />;

      case "system_guardian":
        return <SystemGuardianDashboard />;

      case "financial_sandbox":
        return <FinancialSandboxView />;

      case "orchestrator":
        return <OrchestratorDashboard />;

      case "focus_dashboard":
        return <FocusDashboard onOpenTool={onOpenTool} compact />;

      case "activity":
        return <ActivityStream />;

      case "auto_dashboard":
        return <AutoDashboardConfigurator onApply={loadData} />;

      case "auto_workflow_engine":
        return <AutoWorkflowEngine onOpenTool={onOpenTool} />;

      case "callcenter":
        return <CallCenterWidget />;

      default:
        return <div className="text-xs text-muted-foreground p-4 text-center">Unknown section</div>;
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1100px] mx-auto">
        <HexPatternBanner />
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      </div>
    );
  }

  // Group consecutive half-width sections into rows
  const buildLayout = () => {
    const rows = [];
    let i = 0;
    while (i < sections.length) {
      const sec = sections[i];
      if (sec.size === "half" && i + 1 < sections.length && sections[i + 1].size === "half") {
        rows.push({ type: "pair", indices: [i, i + 1] });
        i += 2;
      } else {
        rows.push({ type: "single", indices: [i] });
        i += 1;
      }
    }
    return rows;
  };

  return (
    <div className="max-w-[1100px] mx-auto">
      <HexPatternBanner />
      <div className="px-3 sm:px-6 pb-12 -mt-4">

        {/* Edit mode toggle */}
        <div className="flex items-center justify-end gap-2 mb-3">
          <button
            onClick={() => setEditMode(!editMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
              editMode
                ? "metallic-gold-bg text-background shadow-lg"
                : "glass-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {editMode ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            {editMode ? "Editing — Drag & Drop On" : "Edit Layout"}
          </button>
          {editMode && (
            <button
              onClick={() => setShowAddSection(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-card text-[11px] font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Section
            </button>
          )}
        </div>

        <DragDropContext onDragEnd={onSectionDragEnd}>
          <Droppable droppableId="sections" type="SECTION">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-6">
                {sections.map((section, index) => (
                  <Draggable key={section.id} draggableId={section.id} index={index} isDragDisabled={!editMode}>
                    {(prov, snap) => (
                      <div
                        ref={prov.innerRef}
                        {...prov.draggableProps}
                        className={snap.isDragging ? "opacity-90 shadow-2xl" : ""}
                      >
                        <DashboardSection
                          section={section}
                          editMode={editMode}
                          dragHandleProps={prov.dragHandleProps}
                          onRemove={() => removeSection(section.id)}
                          onToggleCollapse={() => updateSection(section.id, { collapsed: !section.collapsed })}
                          onToggleSize={() => updateSection(section.id, { size: section.size === "full" ? "half" : "full" })}
                          onRename={(name) => updateSection(section.id, { title: name })}
                        >
                          {renderSectionContent(section)}
                        </DashboardSection>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {editMode && sections.length === 0 && (
          <div className="text-center py-16">
            <p className="text-sm text-muted-foreground mb-3">Dashboard is empty</p>
            <button onClick={() => setShowAddSection(true)} className="px-4 py-2 rounded-xl metallic-gold-bg text-background text-sm font-bold">
              <Plus className="w-4 h-4 inline mr-1" /> Add Your First Section
            </button>
          </div>
        )}
      </div>

      {showAddSection && <AddSectionModal existingSections={sections} onAdd={addSection} onClose={() => setShowAddSection(false)} />}
      {showManager && <ToolCardManager tools={tools} onAddTool={handleAddTool} onDeleteTool={handleDeleteTool} onEditTool={handleEditSave} onClose={() => setShowManager(false)} />}
      {editingCard && <DashboardCardEditModal card={editingCard} onSave={handleEditSave} onClose={() => setEditingCard(null)} showNumbers={showNumbers} customNumber={customNumbers[editingCard.id] ?? ""} onToggleNumbers={handleToggleNumbers} onSetCustomNumber={handleSetCustomNumber} />}
    </div>
  );
}