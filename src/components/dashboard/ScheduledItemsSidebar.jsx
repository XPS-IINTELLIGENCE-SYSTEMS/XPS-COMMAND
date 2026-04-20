import { useState } from "react";
import { Clock, Zap, GitBranch, Bot, ChevronDown, ChevronRight, GripVertical, Calendar } from "lucide-react";
import { ICON_MAP } from "./dashboardDefaults";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "automations", label: "Automations", icon: Zap, color: "#d4af37" },
  { id: "tools", label: "Tools", icon: Bot, color: "#6366f1" },
  { id: "workflows", label: "Workflows", icon: GitBranch, color: "#22c55e" },
];

export default function ScheduledItemsSidebar({ automations, tools, onDragToCalendar }) {
  const [expandedCats, setExpandedCats] = useState(["automations"]);
  const [draggingItem, setDraggingItem] = useState(null);

  const toggleCat = (id) => {
    setExpandedCats(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  // Group automations by type
  const scheduledAutos = automations.filter(a => a.automation_type === "scheduled" && a.is_active);
  const entityAutos = automations.filter(a => a.automation_type === "entity" && a.is_active);
  const connectorAutos = automations.filter(a => a.automation_type === "connector" && a.is_active);

  const handleDragStart = (e, item) => {
    setDraggingItem(item);
    e.dataTransfer.setData("text/plain", JSON.stringify(item));
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragEnd = () => {
    setDraggingItem(null);
  };

  return (
    <div className="glass-card rounded-xl p-3 h-full overflow-y-auto">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 metallic-gold-icon" />
        <span className="text-xs font-bold metallic-gold">Available Items</span>
      </div>
      <p className="text-[9px] text-muted-foreground mb-3">Drag items to your calendar or tap to view details</p>

      {/* Automations */}
      <CategorySection
        label="Scheduled Automations"
        icon={Clock}
        color="#d4af37"
        count={scheduledAutos.length}
        expanded={expandedCats.includes("scheduled")}
        onToggle={() => toggleCat("scheduled")}
      >
        {scheduledAutos.map(a => (
          <DraggableItem
            key={a.id}
            item={{ id: a.id, name: a.name, type: "automation", subtype: "scheduled", time: a.start_time || `${a.repeat_interval}${a.repeat_unit?.[0]}` }}
            color="#d4af37"
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          />
        ))}
      </CategorySection>

      <CategorySection
        label="Entity Triggers"
        icon={Zap}
        color="#22c55e"
        count={entityAutos.length}
        expanded={expandedCats.includes("entity")}
        onToggle={() => toggleCat("entity")}
      >
        {entityAutos.map(a => (
          <DraggableItem
            key={a.id}
            item={{ id: a.id, name: a.name, type: "automation", subtype: "entity", trigger: a.entity_name }}
            color="#22c55e"
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          />
        ))}
      </CategorySection>

      {connectorAutos.length > 0 && (
        <CategorySection
          label="Connector Webhooks"
          icon={GitBranch}
          color="#06b6d4"
          count={connectorAutos.length}
          expanded={expandedCats.includes("connector")}
          onToggle={() => toggleCat("connector")}
        >
          {connectorAutos.map(a => (
            <DraggableItem
              key={a.id}
              item={{ id: a.id, name: a.name, type: "automation", subtype: "connector" }}
              color="#06b6d4"
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />
          ))}
        </CategorySection>
      )}

      {/* Tools */}
      <CategorySection
        label="Dashboard Tools"
        icon={Bot}
        color="#6366f1"
        count={tools.length}
        expanded={expandedCats.includes("tools")}
        onToggle={() => toggleCat("tools")}
      >
        {tools.slice(0, 15).map(t => {
          const TIcon = ICON_MAP[t.iconName] || ICON_MAP["Bot"];
          return (
            <DraggableItem
              key={t.id}
              item={{ id: t.id, name: t.label, type: "tool", desc: t.desc }}
              color={t.color}
              customIcon={TIcon}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />
          );
        })}
        {tools.length > 15 && (
          <div className="text-[9px] text-muted-foreground text-center py-1">+{tools.length - 15} more tools</div>
        )}
      </CategorySection>
    </div>
  );
}

function CategorySection({ label, icon: Icon, color, count, expanded, onToggle, children }) {
  return (
    <div className="mb-2">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-secondary/50 transition-colors"
      >
        {expanded ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
        <Icon className="w-3 h-3" style={{ color }} />
        <span className="text-[10px] font-semibold text-foreground flex-1 text-left">{label}</span>
        <span className="text-[9px] text-muted-foreground">{count}</span>
      </button>
      {expanded && (
        <div className="pl-2 space-y-0.5 mt-0.5">
          {children}
        </div>
      )}
    </div>
  );
}

function DraggableItem({ item, color, customIcon: CustomIcon, onDragStart, onDragEnd }) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, item)}
      onDragEnd={onDragEnd}
      className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-secondary/40 cursor-grab active:cursor-grabbing transition-colors group"
    >
      <GripVertical className="w-2.5 h-2.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors flex-shrink-0" />
      <div className="w-1.5 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-medium text-foreground truncate">{item.name}</div>
        {item.time && <div className="text-[8px] text-muted-foreground">{item.time}</div>}
        {item.trigger && <div className="text-[8px] text-muted-foreground">on: {item.trigger}</div>}
      </div>
    </div>
  );
}