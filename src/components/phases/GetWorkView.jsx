import { Megaphone, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import NavIcon from "../shared/NavIcon";

export default function GetWorkView() {
  return (
    <div className="h-full overflow-y-auto p-4 md:p-8">
      <div className="text-center pt-4 md:pt-8 pb-8 md:pb-12">
        <div className="shimmer-card inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-primary/30 bg-primary/5 mb-6">
          <NavIcon id="get_work" size="sm" active />
          <span className="text-sm font-semibold text-white">Consolidated into Phase 1</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold leading-none xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          GET WORK
        </h1>
        <p className="mt-4 text-sm md:text-base text-white/60 max-w-xl mx-auto leading-relaxed">
          All outreach, communication, and booking tools have been consolidated into Phase 1 for a streamlined workflow.
        </p>
      </div>

      <div className="max-w-lg mx-auto">
        <div className="shimmer-card rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
          <Megaphone className="w-10 h-10 metallic-silver-icon mx-auto mb-4" />
          <h2 className="text-base font-bold text-white mb-2">Tools Consolidated</h2>
          <p className="text-sm text-white/60 leading-relaxed mb-6">
            All 15 Get Work tools — email, calls, SMS, social media, follow-ups, scheduling, and pipeline management — are now in Phase 1: Find Work.
          </p>
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
            Navigate to Find Work <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}