import { useState, useEffect, useRef, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft, ChevronRight, Plus, Calendar, Sparkles,
} from "lucide-react";
import {
  format, startOfWeek, addDays, addWeeks, subWeeks, isToday,
  isSameDay, parseISO,
} from "date-fns";
import CalendarTimeGrid from "./CalendarTimeGrid";
import CalendarEventBlock from "./CalendarEventBlock";
import CalendarEventModal from "./CalendarEventModal";
import CalendarAIPanel from "./CalendarAIPanel";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const SLOT_HEIGHT = 16; // px per 15-min slot
const HOUR_HEIGHT = SLOT_HEIGHT * 4;
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function timeToSlot(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 4 + Math.floor(m / 15);
}

function slotToTime(slot) {
  const h = Math.floor(slot / 4);
  const m = (slot % 4) * 15;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export default function WeeklyCalendarView() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [modal, setModal] = useState(null); // { date, startTime, endTime, event? }
  const [showAI, setShowAI] = useState(false);
  const scrollRef = useRef(null);
  const queryClient = useQueryClient();

  const weekStart = startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekStartStr = format(days[0], "yyyy-MM-dd");
  const weekEndStr = format(days[6], "yyyy-MM-dd");

  const { data: events = [] } = useQuery({
    queryKey: ["calendar-events", weekStartStr, weekEndStr],
    queryFn: async () => {
      const all = await base44.entities.CalendarEvent.list("-date", 200);
      return all.filter(e => e.date >= weekStartStr && e.date <= weekEndStr);
    },
  });

  const createMut = useMutation({
    mutationFn: (data) => base44.entities.CalendarEvent.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["calendar-events"] }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CalendarEvent.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["calendar-events"] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.CalendarEvent.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["calendar-events"] }),
  });

  // Scroll to 7am on mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 7 * HOUR_HEIGHT;
    }
  }, []);

  // Click on empty slot → open create modal
  const handleSlotClick = (dayIndex, slotIndex) => {
    const date = format(days[dayIndex], "yyyy-MM-dd");
    const startTime = slotToTime(slotIndex);
    const endTime = slotToTime(slotIndex + 4); // default 1 hour
    setModal({ date, startTime, endTime });
  };

  // Click existing event → open edit modal
  const handleEventClick = (event) => {
    setModal({
      date: event.date,
      startTime: event.start_time,
      endTime: event.end_time,
      event,
    });
  };

  const handleSave = async (data) => {
    if (modal?.event) {
      await updateMut.mutateAsync({ id: modal.event.id, data });
    } else {
      await createMut.mutateAsync(data);
    }
    setModal(null);
  };

  const handleDelete = async (id) => {
    await deleteMut.mutateAsync(id);
    setModal(null);
  };

  const handleAICreate = async (newEvents) => {
    for (const e of newEvents) {
      await createMut.mutateAsync(e);
    }
    setShowAI(false);
  };

  // Group events by day
  const eventsByDay = useMemo(() => {
    const map = {};
    days.forEach((d, i) => { map[i] = []; });
    events.forEach(e => {
      const idx = days.findIndex(d => isSameDay(d, parseISO(e.date)));
      if (idx >= 0) map[idx].push(e);
    });
    return map;
  }, [events, days]);

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 metallic-gold-icon" />
          <h3 className="text-sm font-bold metallic-gold">Calendar</h3>
          <span className="text-[11px] text-muted-foreground">
            {format(days[0], "MMM d")} – {format(days[6], "MMM d, yyyy")}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowAI(!showAI)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all mr-2 ${showAI ? "metallic-gold-bg text-background" : "glass-card text-muted-foreground hover:text-foreground"}`}
          >
            <Sparkles className="w-3.5 h-3.5" /> AI
          </button>
          <button onClick={() => setWeekOffset(w => w - 1)} className="p-1.5 rounded-lg hover:bg-secondary">
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <button onClick={() => setWeekOffset(0)} className="text-[10px] text-muted-foreground hover:text-foreground px-2">
            Today
          </button>
          <button onClick={() => setWeekOffset(w => w + 1)} className="p-1.5 rounded-lg hover:bg-secondary">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {showAI && (
        <CalendarAIPanel
          weekStart={weekStart}
          days={days}
          existingEvents={events}
          onCreateEvents={handleAICreate}
          onClose={() => setShowAI(false)}
        />
      )}

      {/* Day headers */}
      <div className="flex border-b border-border/30">
        <div className="w-14 flex-shrink-0" />
        {days.map((d, i) => (
          <div
            key={i}
            className={`flex-1 text-center py-2 border-l border-border/20 ${isToday(d) ? "bg-primary/5" : ""}`}
          >
            <div className={`text-[10px] font-medium ${isToday(d) ? "text-primary" : "text-muted-foreground"}`}>
              {DAY_NAMES[i]}
            </div>
            <div className={`text-lg font-bold ${isToday(d) ? "metallic-gold" : "text-foreground"}`}>
              {format(d, "d")}
            </div>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div ref={scrollRef} className="overflow-y-auto max-h-[500px] relative">
        <div className="flex" style={{ height: HOURS.length * HOUR_HEIGHT }}>
          {/* Time labels */}
          <div className="w-14 flex-shrink-0 relative">
            {HOURS.map(h => (
              <div
                key={h}
                className="absolute w-full text-right pr-2 text-[10px] text-muted-foreground"
                style={{ top: h * HOUR_HEIGHT - 6 }}
              >
                {h === 0 ? "" : format(new Date(2000, 0, 1, h), "h a")}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((d, dayIdx) => (
            <div
              key={dayIdx}
              className={`flex-1 relative border-l border-border/20 ${isToday(d) ? "bg-primary/[0.02]" : ""}`}
            >
              {/* Hour lines */}
              {HOURS.map(h => (
                <div
                  key={h}
                  className="absolute w-full border-t border-border/15"
                  style={{ top: h * HOUR_HEIGHT }}
                />
              ))}

              {/* Clickable 15-min slots */}
              <CalendarTimeGrid
                hourHeight={HOUR_HEIGHT}
                slotHeight={SLOT_HEIGHT}
                totalSlots={96}
                dayIndex={dayIdx}
                onSlotClick={handleSlotClick}
              />

              {/* Rendered events */}
              {eventsByDay[dayIdx]?.map(ev => (
                <CalendarEventBlock
                  key={ev.id}
                  event={ev}
                  slotHeight={SLOT_HEIGHT}
                  onClick={() => handleEventClick(ev)}
                />
              ))}

              {/* Current time indicator */}
              {isToday(d) && <CurrentTimeLine hourHeight={HOUR_HEIGHT} />}
            </div>
          ))}
        </div>
      </div>

      {/* Event modal */}
      {modal && (
        <CalendarEventModal
          date={modal.date}
          startTime={modal.startTime}
          endTime={modal.endTime}
          event={modal.event}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

function CurrentTimeLine({ hourHeight }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);
  const top = (now.getHours() + now.getMinutes() / 60) * hourHeight;
  return (
    <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top }}>
      <div className="flex items-center">
        <div className="w-2 h-2 rounded-full bg-red-500 -ml-1" />
        <div className="flex-1 h-[2px] bg-red-500" />
      </div>
    </div>
  );
}