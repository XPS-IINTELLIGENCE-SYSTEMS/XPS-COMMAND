import { ChevronLeft, ChevronRight } from "lucide-react";

// Navigation history for back/forward in center UI
const history = { stack: [], index: -1 };

export function pushView(viewId) {
  if (history.stack[history.index] === viewId) return;
  history.stack = history.stack.slice(0, history.index + 1);
  history.stack.push(viewId);
  history.index = history.stack.length - 1;
}

export function canGoBack() { return history.index > 0; }
export function canGoForward() { return history.index < history.stack.length - 1; }
export function goBack() { if (canGoBack()) { history.index--; return history.stack[history.index]; } return null; }
export function goForward() { if (canGoForward()) { history.index++; return history.stack[history.index]; } return null; }

export default function NavButtons({ onNavigate }) {
  const back = () => {
    const v = goBack();
    if (v && onNavigate) onNavigate(v, true);
  };
  const forward = () => {
    const v = goForward();
    if (v && onNavigate) onNavigate(v, true);
  };

  return (
    <>
      <button
        onClick={back}
        disabled={!canGoBack()}
        className="absolute top-3 left-3 z-20 p-1.5 rounded-lg glass-card hover:bg-white/10 disabled:opacity-20 disabled:pointer-events-none transition-all"
        title="Go back"
      >
        <ChevronLeft className="w-4 h-4 text-muted-foreground" />
      </button>
      <button
        onClick={forward}
        disabled={!canGoForward()}
        className="absolute top-3 right-3 z-20 p-1.5 rounded-lg glass-card hover:bg-white/10 disabled:opacity-20 disabled:pointer-events-none transition-all"
        title="Go forward"
      >
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </button>
    </>
  );
}