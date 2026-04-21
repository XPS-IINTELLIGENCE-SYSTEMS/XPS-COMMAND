import { Draggable } from "@hello-pangea/dnd";
import DashboardToolCard from "./DashboardToolCard";
import { TOOL_CATEGORIES } from "./dashboardDefaults";

export default function ToolCategoryGrid({ gridIds, toolMap, favToolsCount, starredIds, getDisplayNumber, onOpenTool, onToggleStar, onEditCard }) {
  // Build categorized view
  const assignedIds = new Set(TOOL_CATEGORIES.flatMap(c => c.toolIds));
  const uncategorized = gridIds.filter(id => !assignedIds.has(id));

  // Track draggable index across categories for the "all" droppable
  let draggableIndex = 0;

  return (
    <div className="space-y-6">
      {TOOL_CATEGORIES.map((cat) => {
        // Only show tools that exist in gridIds (not starred/hidden)
        const catToolIds = cat.toolIds.filter(id => gridIds.includes(id));
        if (catToolIds.length === 0) return null;

        return (
          <div key={cat.id}>
            {/* Category Header */}
            <div className="mb-3 px-1">
              <h3 className="text-[16px] sm:text-[18px] font-extrabold metallic-gold tracking-tight leading-tight">
                {cat.title}
              </h3>
              <p className="text-[11px] sm:text-[12px] text-white/50 mt-0.5 leading-snug max-w-xl">
                {cat.desc}
              </p>
            </div>

            {/* Category Tool Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {catToolIds.map((id) => {
                const tool = toolMap[id];
                if (!tool) return null;
                const realIndex = gridIds.indexOf(id);
                const globalIndex = favToolsCount + realIndex;
                const currentDragIndex = realIndex;

                return (
                  <Draggable key={tool.id} draggableId={`all-${tool.id}`} index={currentDragIndex}>
                    {(prov) => (
                      <div ref={prov.innerRef} {...prov.draggableProps}>
                        <DashboardToolCard
                          tool={tool}
                          starred={false}
                          displayNumber={getDisplayNumber(tool.id, globalIndex)}
                          onOpen={onOpenTool}
                          onToggleStar={onToggleStar}
                          onEdit={onEditCard}
                          dragHandleProps={prov.dragHandleProps}
                        />
                      </div>
                    )}
                  </Draggable>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Uncategorized tools */}
      {uncategorized.length > 0 && (
        <div>
          <div className="mb-3 px-1">
            <h3 className="text-[16px] sm:text-[18px] font-extrabold metallic-gold tracking-tight leading-tight">
              Other Tools
            </h3>
            <p className="text-[11px] sm:text-[12px] text-white/50 mt-0.5 leading-snug max-w-xl">
              Custom and uncategorized tools.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {uncategorized.map((id) => {
              const tool = toolMap[id];
              if (!tool) return null;
              const realIndex = gridIds.indexOf(id);
              const globalIndex = favToolsCount + realIndex;

              return (
                <Draggable key={tool.id} draggableId={`all-${tool.id}`} index={realIndex}>
                  {(prov) => (
                    <div ref={prov.innerRef} {...prov.draggableProps}>
                      <DashboardToolCard
                        tool={tool}
                        starred={false}
                        displayNumber={getDisplayNumber(tool.id, globalIndex)}
                        onOpen={onOpenTool}
                        onToggleStar={onToggleStar}
                        onEdit={onEditCard}
                        dragHandleProps={prov.dragHandleProps}
                      />
                    </div>
                  )}
                </Draggable>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}