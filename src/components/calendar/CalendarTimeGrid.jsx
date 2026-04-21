export default function CalendarTimeGrid({ hourHeight, slotHeight, totalSlots, dayIndex, onSlotClick }) {
  return (
    <div className="absolute inset-0 z-10">
      {Array.from({ length: totalSlots }, (_, i) => (
        <div
          key={i}
          onClick={() => onSlotClick(dayIndex, i)}
          className="absolute w-full cursor-pointer hover:bg-primary/10 transition-colors"
          style={{ top: i * slotHeight, height: slotHeight }}
        />
      ))}
    </div>
  );
}