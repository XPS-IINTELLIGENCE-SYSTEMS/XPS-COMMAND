import { useEffect, useRef, useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

export default function VerticalScrollTool() {
  const [scrollPercent, setScrollPercent] = useState(0);
  const mainRef = useRef(null);

  useEffect(() => {
    const handleScroll = (e) => {
      const elem = e.target;
      const scrolled = elem.scrollTop;
      const height = elem.scrollHeight - elem.clientHeight;
      setScrollPercent(height > 0 ? (scrolled / height) * 100 : 0);
    };

    const main = document.querySelector("main");
    if (main) {
      main.addEventListener("scroll", handleScroll);
      return () => main.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const scrollToTop = () => {
    document.querySelector("main")?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    const main = document.querySelector("main");
    if (main) {
      main.scrollTo({ top: main.scrollHeight, behavior: "smooth" });
    }
  };

  return (
    <div className="fixed right-4 bottom-20 lg:bottom-4 z-40 flex flex-col items-center gap-2 p-2 rounded-xl glass-card border border-white/[0.06]">
      {/* Up arrow */}
      <button
        onClick={scrollToTop}
        className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
        title="Scroll to top"
      >
        <ChevronUp className="w-4 h-4" />
      </button>

      {/* Scroll indicator */}
      <div className="w-1 h-20 rounded-full bg-white/10 relative overflow-hidden">
        <div
          className="w-full bg-primary/60 rounded-full transition-all"
          style={{ height: `${Math.max(10, scrollPercent)}%`, marginTop: `${scrollPercent * 0.8}%` }}
        />
      </div>

      {/* Down arrow */}
      <button
        onClick={scrollToBottom}
        className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
        title="Scroll to bottom"
      >
        <ChevronDown className="w-4 h-4" />
      </button>
    </div>
  );
}