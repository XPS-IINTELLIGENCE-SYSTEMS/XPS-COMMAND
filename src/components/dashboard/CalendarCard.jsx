import { useState } from "react";
import {
  ChevronLeft, ChevronRight, X, Clock, Calendar,
} from "lucide-react";
import {
  format, startOfWeek, addDays, isSameDay, isToday,
  addWeeks, subWeeks, addMonths, subMonths,
  startOfMonth, endOfMonth, eachDayOfInterval, getDay,
} from "date-fns";

const DAY_NAMES_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const VIEW_MODES = ["daily", "weekly", "monthly"];

function getAutomationDays(a) {
  if (a.repeat_unit === "hours" || a.repeat_unit === "minutes") return [0,1,2,3,4,5,6];
  if (a.repeat_on_days) return a.repeat_on_days.map(d => (d + 6) % 7);
  if (a.repeat_unit === "days" && a.repeat_interval === 1) return [0,1,2,3,4,5,6];
  if (a.repeat_unit === "weeks") return [0];
  return [0,1,2,3,4,5,6];
}

function getTimeLabel(a) {
  if (a.start_time) return a.start_time;
  if (a.repeat_unit === "hours") return `Every ${a.repeat_interval}h`;
  if (a.repeat_unit === "minutes") return `Every ${a.repeat_interval}m`;
  return "";
}

const TYPE_COLORS = { scheduled: "#d4af37", entity: "#22c55e", connector: "#06b6d4" };

function EventCard({ event }) {
  return (
    <div className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
      <div className="w-1 h-8 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: event.color }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-white truncate">{event.name}</span>
          {event.time && (
            <span className="text-[9px] text-muted-foreground flex items-center gap-0.5 flex-shrink-0">
              <Clock className="w-2.5 h-2.5" /> {event.time}
            </span>
          )}
        </div>
        <div className="text-[9px] text-muted-foreground/70 mt-0.5 truncate">{event.description}</div>
      </div>
    </div>
  );
}

export default function CalendarCard({ automations = [], expanded, onToggleExpand }) {
  const [viewMode, setViewMode] = useState("weekly");
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [dayOffset, setDayOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(null);

  const activeAutos = automations.filter(a => a.is_active && !a.is_archived);

  const mapEvents = (date, dayIdx) =>
    activeAutos.filter(a => getAutomationDays(a).includes(dayIdx)).map(a => ({
      id: a.id, name: a.name, time: getTimeLabel(a), type: a.automation_type,
      functionName: a.function_name, description: a.description,
      color: TYPE_COLORS[a.automation_type] || "#d4af37",
    }));

  // Navigation handlers
  const nav = (dir) => {
    if (viewMode === "daily") setDayOffset(d => d + dir);
    else if (viewMode === "weekly") setWeekOffset(w => w + dir);
    else setMonthOffset(m => m + dir);
  };
  const goToday = () => { setDayOffset(0); setWeekOffset(0); setMonthOffset(0); setSelectedDay(null); };

  // === DAILY VIEW ===
  const renderDaily = () => {
    const date = addDays(new Date(), dayOffset);
    const dayIdx = (getDay(date) + 6) % 7; // Mon=0
    const events = mapEvents(date, dayIdx);
    return (
      <div>
        <div className="text-sm font-bold text-white mb-3">{format(date, "EEEE, MMMM d, yyyy")}{isToday(date) && <span className="text-primary ml-2 text-xs">(Today)</span>}</div>
        {events.length === 0
          ? <div className="text-center py-6 text-xs text-muted-foreground">No scheduled tasks</div>
          : <div className="space-y-2">{events.map(e => <EventCard key={e.id} event={e} />)}</div>
        }
      </div>
    );
  };

  // === WEEKLY VIEW ===
  const renderWeekly = () => {
    const weekStart = startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 });
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const dayEvents = days.map((d, i) => mapEvents(d, i));
    const selIdx = selectedDay ?? days.findIndex(d => isToday(d));
    const activeEvents = dayEvents[selIdx >= 0 ? selIdx : 0] || [];

    return (
      <div>
        <div className="text-xs text-muted-foreground mb-3">{format(days[0], "MMMM d")} – {format(days[6], "MMMM d, yyyy")}</div>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {days.map((date, i) => {
            const today = isToday(date);
            const selected = i === selIdx;
            const count = dayEvents[i].length;
            return (
              <button key={i} onClick={() => setSelectedDay(i)}
                className={`rounded-xl p-2 text-center transition-all ${selected ? "glass-card-active ring-1 ring-primary/30" : "hover:bg-white/5"}`}>
                <div className={`text-[10px] font-medium ${today ? "text-primary" : "text-muted-foreground"}`}>{DAY_NAMES_SHORT[i]}</div>
                <div className={`text-lg font-bold mt-1 ${today ? "metallic-gold" : "text-white"}`}>{format(date, "d")}</div>
                <div className="text-[9px] text-muted-foreground mt-0.5">{count === 0 ? "—" : `${count}`}</div>
              </button>
            );
          })}
        </div>
        <h4 className="text-sm font-bold text-white mb-2">{format(days[selIdx >= 0 ? selIdx : 0], "EEEE, MMMM d")}</h4>
        {activeEvents.length === 0
          ? <div className="text-center py-4 text-xs text-muted-foreground">No scheduled tasks</div>
          : <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{activeEvents.map(e => <EventCard key={e.id} event={e} />)}</div>
        }
      </div>
    );
  };

  // === MONTHLY VIEW ===
  const renderMonthly = () => {
    const current = addMonths(new Date(), monthOffset);
    const monthStart = startOfMonth(current);
    const monthEnd = endOfMonth(current);
    const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const firstDayIdx = (getDay(monthStart) + 6) % 7; // Mon=0
    const blanks = Array(firstDayIdx).fill(null);
    const cells = [...blanks, ...allDays];

    return (
      <div>
        <div className="text-sm font-bold text-white mb-3">{format(current, "MMMM yyyy")}</div>
        <div className="grid grid-cols-7 gap-px">
          {DAY_NAMES_SHORT.map(d => <div key={d} className="text-[9px] text-center text-muted-foreground font-medium py-1">{d}</div>)}
          {cells.map((date, i) => {
            if (!date) return <div key={`b-${i}`} className="h-9" />;
            const dayIdx = (getDay(date) + 6) % 7;
            const events = mapEvents(date, dayIdx);
            const today = isToday(date);
            return (
              <button key={i} onClick={() => { setSelectedDay(dayIdx); setDayOffset(Math.round((date - new Date()) / 86400000)); setViewMode("daily"); }}
                className={`h-9 rounded-md text-center text-xs font-medium transition-all relative ${today ? "metallic-gold-bg text-background font-bold" : events.length > 0 ? "text-white hover:bg-white/10" : "text-white/40 hover:bg-white/5"}`}>
                {format(date, "d")}
                {events.length > 0 && !today && (
                  <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                    {events.slice(0, 3).map((e, j) => <div key={j} className="w-1 h-1 rounded-full" style={{ backgroundColor: e.color }} />)}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // === COLLAPSED VIEW ===
  if (!expanded) {
    return (
      <button onClick={onToggleExpand} className="w-full glass-card rounded-xl p-4 text-left hover:border-primary/20 transition-all">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 metallic-gold-icon" />
          <span className="text-xs font-bold metallic-gold">Calendar</span>
          <div className="ml-auto flex gap-1">
            {VIEW_MODES.map(m => (
              <span key={m} className={`text-[9px] px-1.5 py-0.5 rounded ${viewMode === m ? "metallic-gold-bg text-background" : "text-muted-foreground"}`}>
                {m[0].toUpperCase() + m.slice(1)}
              </span>
            ))}
          </div>
        </div>
        <div className="text-[10px] text-muted-foreground">Click to expand</div>
      </button>
    );
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 metallic-gold-icon" />
          <h3 className="text-sm font-bold metallic-gold">Calendar</h3>
        </div>
        <div className="flex items-center gap-1">
          {/* View mode toggle */}
          <div className="flex bg-secondary/50 rounded-lg p-0.5 mr-2">
            {VIEW_MODES.map(m => (
              <button key={m} onClick={() => { setViewMode(m); setSelectedDay(null); }}
                className={`text-[10px] px-2 py-1 rounded-md font-medium transition-all ${viewMode === m ? "metallic-gold-bg text-background" : "text-muted-foreground hover:text-white"}`}>
                {m[0].toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
          <button onClick={() => nav(-1)} className="p-1.5 rounded-lg hover:bg-secondary"><ChevronLeft className="w-4 h-4 text-muted-foreground" /></button>
          <button onClick={goToday} className="text-[10px] text-muted-foreground hover:text-white px-2">Today</button>
          <button onClick={() => nav(1)} className="p-1.5 rounded-lg hover:bg-secondary"><ChevronRight className="w-4 h-4 text-muted-foreground" /></button>
          <button onClick={onToggleExpand} className="p-1.5 rounded-lg hover:bg-secondary ml-2"><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
      </div>
      <div className="p-4">
        {viewMode === "daily" && renderDaily()}
        {viewMode === "weekly" && renderWeekly()}
        {viewMode === "monthly" && renderMonthly()}
      </div>
    </div>
  );
}