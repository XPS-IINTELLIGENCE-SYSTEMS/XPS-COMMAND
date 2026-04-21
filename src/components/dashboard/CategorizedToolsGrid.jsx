import { TOOL_CATEGORIES } from "./toolCategories";
import DashboardToolCard from "./DashboardToolCard";

export default function CategorizedToolsGrid({ tools, starredIds, onOpen, onToggleStar, onEdit, getDisplayNumber }) {
  const toolMap = Object.fromEntries(tools.map(t => [t.id, t]));

  return (
    <div className="space-y-10">
      {TOOL_CATEGORIES.map(cat => {
        const catTools = cat.toolIds.map(id => toolMap[id]).filter(Boolean);
        if (catTools.length === 0) return null;

        return (
          <div key={cat.id}>
            {/* Category header */}
            <div className="mb-4 px-1">
              <h3 className="text-[15px] sm:text-[17px] font-bold text-foreground tracking-tight">
                {cat.label}
              </h3>
              <p className="text-[11px] sm:text-[12px] text-muted-foreground mt-0.5">
                {cat.desc}
              </p>
            </div>

            {/* Tool cards grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {catTools.map((tool, index) => (
                <DashboardToolCard
                  key={tool.id}
                  tool={tool}
                  starred={starredIds.includes(tool.id)}
                  displayNumber={getDisplayNumber?.(tool.id, index)}
                  onOpen={onOpen}
                  onToggleStar={onToggleStar}
                  onEdit={onEdit}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Uncategorized tools (custom tools, etc.) */}
      {(() => {
        const categorizedIds = new Set(TOOL_CATEGORIES.flatMap(c => c.toolIds));
        const uncategorized = tools.filter(t => !categorizedIds.has(t.id));
        if (uncategorized.length === 0) return null;
        return (
          <div>
            <div className="mb-4 px-1">
              <h3 className="text-[15px] sm:text-[17px] font-bold text-foreground tracking-tight">Other Tools</h3>
              <p className="text-[11px] sm:text-[12px] text-muted-foreground mt-0.5">Custom & additional tools</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {uncategorized.map((tool, index) => (
                <DashboardToolCard
                  key={tool.id}
                  tool={tool}
                  starred={starredIds.includes(tool.id)}
                  displayNumber={getDisplayNumber?.(tool.id, index)}
                  onOpen={onOpen}
                  onToggleStar={onToggleStar}
                  onEdit={onEdit}
                />
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}