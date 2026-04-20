import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronLeft, ChevronRight, X, Clock, Zap, GitBranch, Bot, Calendar } from "lucide-react";
import { format, startOfWeek, addDays, isSameDay, isToday, addWeeks, subWeeks } from "date-fns";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Map automation schedules to day-of-week presence
function getAutomationDays(automation) {
  if (automation.repeat_unit === "hours" || automation.repeat_unit === "minutes") {
    return [0, 1, 2, 3, 4, 5, 6]; // every day
  }
  if (automation.repeat_on_days) {
    // repeat_on_days uses 0=Sun, we need 0=Mon
    return automation.repeat_on_days.map(d => (d + 6) % 7);
  }
  if (automation.repeat_unit === "days" && automation.repeat_interval === 1) {
    return [0, 1, 2, 3, 4, 5, 6]; // daily
  }
  if (automation.repeat_unit === "weeks") {
    return [0]; // Mon default
  }
  return [0, 1, 2, 3, 4, 5, 6]; // assume daily
}

function getTimeLabel(a) {
  if (a.start_time) return a.start_time;
  if (a.repeat_unit === "hours") return `Every ${a.repeat_interval}h`;
  if (a.repeat_unit === "minutes") return `Every ${a.repeat_interval}m`;
  return "";
}

const TYPE_COLORS = {
  scheduled: "#d4af37",
  entity: "#22c55e",
  connector: "#06b6d4",
};

export default function WeeklyCalendarCard({ automations, expanded, onToggleExpand }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(null);

  const weekStart = startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Map automations to each day
  const dayEvents = days.map((date, dayIdx) => {
    return automations
      .filter(a => a.is_active && !a.is_archived)
      .filter(a => getAutomationDays(a).includes(dayIdx))
      .map(a => ({
        id: a.id,
        name: a.name,
        time: getTimeLabel(a),
        type: a.automation_type,
        functionName: a.function_name,
        description: a.description,
        color: TYPE_COLORS[a.automation_type] || "#d4af37",
      }));
  });

  const selectedDayIdx = selectedDay !== null ? selectedDay : days.findIndex(d => isToday(d));
  const activeEvents = dayEvents[selectedDayIdx >= 0 ? selectedDayIdx : 0] || [];

  // Collapsed: compact week strip
  if (!expanded) {
    return (
      <button
        onClick={onToggleExpand}
        className="w-full glass-card rounded-xl p-3 text-left hover:border-primary/20 transition-all"
      >
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 metallic-gold-icon" />
          <span className="text-xs font-bold metallic-gold">This Week</span>
          <span className="text-[10px] text-muted-foreground ml-auto">
            {format(days[0], "MMM d")} – {format(days[6], "MMM d")}
          </span>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, i) => {
            const count = dayEvents[i].length;
            const today = isToday(date);
            return (
              <div key={i} className="text-center">
                <div className={`text-[9px] font-medium ${today ? "text-primary" : "text-muted-foreground"}`}>
                  {DAY_NAMES[i]}
                </div>
                <div className={`text-[11px] font-bold mt-0.5 w-7 h-7 rounded-full flex items-center justify-center mx-auto ${
                  today ? "metallic-gold-bg text-background" : "text-foreground"
                }`}>
                  {format(date, "d")}
                </div>
                {count > 0 && (
                  <div className="flex justify-center mt-0.5 gap-0.5">
                    {count <= 3 ? (
                      dayEvents[i].slice(0, 3).map((e, j) => (
                        <div key={j} className="w-1 h-1 rounded-full" style={{ backgroundColor: e.color }} />
                      ))
                    ) : (
                      <span className="text-[8px] text-primary font-bold">{count}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </button>
    );
  }

  // Expanded: full-page calendar
  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center pt-4 sm:pt-10">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onToggleExpand} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 metallic-gold-icon" />
            <h3 className="text-base font-bold metallic-gold">Weekly Schedule</h3>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setWeekOffset(w => w - 1)} className="p-1.5 rounded-lg hover:bg-secondary">
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <button onClick={() => setWeekOffset(0)} className="text-[10px] text-muted-foreground hover:text-foreground px-2">
              Today
            </button>
            <button onClick={() => setWeekOffset(w => w + 1)} className="p-1.5 rounded-lg hover:bg-secondary">
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            <button onClick={onToggleExpand} className="p-1.5 rounded-lg hover:bg-secondary ml-2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="p-5">
          {/* Week header */}
          <div className="text-xs text-muted-foreground mb-3">
            {format(days[0], "MMMM d")} – {format(days[6], "MMMM d, yyyy")}
          </div>

          {/* Day columns */}
          <div className="grid grid-cols-7 gap-2 mb-6">
            {days.map((date, i) => {
              const today = isToday(date);
              const selected = i === selectedDayIdx;
              const count = dayEvents[i].length;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDay(i)}
                  className={`rounded-xl p-2 text-center transition-all ${
                    selected ? "glass-card-active ring-1 ring-primary/30" : "glass-card hover:border-primary/20"
                  }`}
                >
                  <div className={`text-[10px] font-medium ${today ? "text-primary" : "text-muted-foreground"}`}>
                    {DAY_NAMES[i]}
                  </div>
                  <div className={`text-lg font-bold mt-1 ${today ? "metallic-gold" : "text-foreground"}`}>
                    {format(date, "d")}
                  </div>
                  <div className="text-[9px] text-muted-foreground mt-1">
                    {count === 0 ? "—" : `${count} task${count > 1 ? "s" : ""}`}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected day detail */}
          <div>
            <h4 className="text-sm font-bold text-foreground mb-3">
              {format(days[selectedDayIdx >= 0 ? selectedDayIdx : 0], "EEEE, MMMM d")}
              {isToday(days[selectedDayIdx >= 0 ? selectedDayIdx : 0]) && (
                <span className="text-xs text-primary ml-2">(Today)</span>
              )}
            </h4>
            {activeEvents.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">No scheduled tasks for this day</div>
            ) : (
              <div className="space-y-2">
                {activeEvents.map(event => (
                  <div key={event.id} className="flex items-start gap-3 p-3 rounded-xl glass-card">
                    <div className="w-1 h-10 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: event.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground truncate">{event.name}</span>
                        {event.time && (
                          <span className="text-[9px] text-muted-foreground flex items-center gap-0.5 flex-shrink-0">
                            <Clock className="w-2.5 h-2.5" /> {event.time}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{event.description}</div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-secondary text-muted-foreground">{event.type}</span>
                        <span className="text-[9px] text-muted-foreground/60">{event.functionName}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}