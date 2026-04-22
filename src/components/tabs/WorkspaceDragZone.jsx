import { Droppable } from "@hello-pangea/dnd";

export default function WorkspaceDragZone({ children }) {
  return (
    <Droppable droppableId="workspace-drop-zone">
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`relative w-full transition-all ${
            snapshot.isDraggingOver ? "ring-2 ring-primary ring-inset rounded-xl" : ""
          }`}
        >
          {snapshot.isDraggingOver && (
            <div className="absolute inset-0 bg-primary/10 rounded-xl pointer-events-none flex items-center justify-center">
              <span className="text-sm font-bold text-primary">Drop tool here</span>
            </div>
          )}
          {children}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}