import { Megaphone, Sparkles } from "lucide-react";
import NavIcon from "../shared/NavIcon";

export default function GetWorkView() {
  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <NavIcon id="get_work" size="lg" active />
        <div>
          <h1 className="text-lg md:text-xl font-bold xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>GET WORK</h1>
          <p className="text-xs text-muted-foreground">Outreach, communication & booking — now merged into Phase 1</p>
        </div>
      </div>
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
        <Sparkles className="w-6 h-6 metallic-gold-icon mx-auto mb-3" />
        <h2 className="text-sm font-bold text-foreground mb-2">Tools Consolidated</h2>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          All 15 Get Work tools — email, calls, SMS, social media, follow-ups, scheduling, and pipeline management — are now in <strong className="text-primary">Phase 1: Find Work</strong> for a streamlined workflow. Navigate there to access the complete 15-tool suite.
        </p>
      </div>
    </div>
  );
}