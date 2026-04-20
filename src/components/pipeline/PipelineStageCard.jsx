import {
  Building2, Briefcase, Swords, Send, Clock, Sparkles, Shield,
  FileText, Users, Target, AlertTriangle, Inbox, PhoneCall,
  Heart, Gift, Camera, CheckCircle, Mail, Scale, Layout,
  ListChecks, CalendarCheck,
} from "lucide-react";
import { Zap, User } from "lucide-react";

const ICON_MAP = {
  Building2, Briefcase, Swords, Send, Clock, Sparkles, Shield,
  FileText, Users, Target, AlertTriangle, Inbox, PhoneCall,
  Heart, Gift, Camera, CheckCircle, Mail, Scale, Layout,
  ListChecks, CalendarCheck,
};

const STATUS_STYLES = {
  active: { badge: "metallic-gold-bg text-background", dot: "bg-green-400 animate-pulse" },
  idle: { badge: "bg-secondary text-muted-foreground", dot: "bg-muted-foreground/40" },
  complete: { badge: "bg-green-500/20 text-green-400", dot: "bg-green-400" },
};

export default function PipelineStageCard({ stage, compact = false, onClick }) {
  const Icon = ICON_MAP[stage.icon] || Sparkles;
  const statusStyle = STATUS_STYLES[stage.status] || STATUS_STYLES.idle;

  if (compact) {
    return (
      <button onClick={() => onClick?.(stage)} className="flex items-center gap-2 p-2 rounded-lg glass-card hover:border-primary/20 transition-all w-full text-left group">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: stage.color + "20" }}>
          <Icon className="w-3.5 h-3.5" style={{ color: stage.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold text-white truncate">{stage.name}</div>
          <div className="text-[9px] text-gray-400 truncate">{stage.description}</div>
        </div>
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusStyle.dot}`} />
      </button>
    );
  }

  return (
    <button onClick={() => onClick?.(stage)}
      className="glass-card rounded-xl p-3 hover:border-primary/20 transition-all text-left w-full group min-w-[200px]">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: stage.color + "20" }}>
          <Icon className="w-4 h-4" style={{ color: stage.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold text-white truncate">{stage.name}</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${statusStyle.badge}`}>
              {stage.status.toUpperCase()}
            </span>
            {stage.type === "automated" && <Zap className="w-2.5 h-2.5 text-yellow-400" />}
            {stage.type === "manual" && <User className="w-2.5 h-2.5 text-blue-400" />}
          </div>
        </div>
      </div>
      <p className="text-[9px] text-gray-400 line-clamp-2 leading-relaxed">{stage.description}</p>
      {stage.frequency && (
        <div className="flex items-center gap-1 mt-2 text-[8px] text-muted-foreground">
          <Clock className="w-2.5 h-2.5" /> {stage.frequency}
        </div>
      )}
    </button>
  );
}