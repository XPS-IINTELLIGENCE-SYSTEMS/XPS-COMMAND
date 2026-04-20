import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical, Settings2, Trash2, Copy, Maximize2, Minimize2 } from "lucide-react";
import WidgetRenderer from "./WidgetRenderer";
import { getWidgetDef } from "./WidgetRegistry";

export default function LayoutCanvas({ widgets, onReorder, onRemove, onDuplicate, onConfigure, onResize, editMode }) {
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    onReorder(result.source.index, result.destination.index);
  };

  if (!widgets || widgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
          <Maximize2 className="w-7 h-7 text-muted-foreground/50" />
        </div>
        <p className="text-sm font-semibold text-muted-foreground mb-1">Empty Canvas</p>
        <p className="text-[11px] text-muted-foreground/70">Add widgets from the palette on the left</p>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="canvas">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
            {widgets.map((widget, index) => {
              const def = getWidgetDef(widget.widgetType);
              const Icon = def?.icon;
              const isWide = (widget.w || 12) > 6;

              return (
                <Draggable key={widget.id} draggableId={widget.id} index={index} isDragDisabled={!editMode}>
                  {(prov, snap) => (
                    <div
                      ref={prov.innerRef}
                      {...prov.draggableProps}
                      className={`bg-card border rounded-xl overflow-hidden transition-all ${
                        snap.isDragging ? "shadow-2xl border-primary" : "border-border"
                      } ${editMode ? "ring-1 ring-primary/10" : ""}`}
                    >
                      {editMode && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-secondary/30 border-b border-border">
                          <div {...prov.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                            <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                          {Icon && <Icon className="w-3 h-3 text-primary" />}
                          <span className="text-[10px] font-semibold text-foreground flex-1">{def?.label || widget.widgetType}</span>
                          <button onClick={() => onResize(widget.id)} className="p-1 rounded hover:bg-secondary" title={isWide ? "Half width" : "Full width"}>
                            {isWide ? <Minimize2 className="w-3 h-3 text-muted-foreground" /> : <Maximize2 className="w-3 h-3 text-muted-foreground" />}
                          </button>
                          <button onClick={() => onDuplicate(widget.id)} className="p-1 rounded hover:bg-secondary" title="Duplicate">
                            <Copy className="w-3 h-3 text-muted-foreground" />
                          </button>
                          <button onClick={() => onConfigure(widget)} className="p-1 rounded hover:bg-secondary" title="Configure">
                            <Settings2 className="w-3 h-3 text-muted-foreground" />
                          </button>
                          <button onClick={() => onRemove(widget.id)} className="p-1 rounded hover:bg-secondary" title="Remove">
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </button>
                        </div>
                      )}
                      <div className="p-4">
                        <WidgetRenderer widgetType={widget.widgetType} config={widget.config || {}} />
                      </div>
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}