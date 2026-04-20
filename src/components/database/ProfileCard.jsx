import { useState } from "react";
import { Building2, User, Briefcase, MapPin, Phone, Mail, Globe, ChevronDown, ChevronUp, Star, AlertTriangle, CheckCircle2, Shield, TrendingUp, Users, FileText, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const SECTION_ICONS = {
  company_overview: Building2,
  site_information: MapPin,
  financial_profile: TrendingUp,
  operational_details: Briefcase,
  competitive_landscape: Shield,
  decision_makers: Users,
  previous_projects: FileText,
  technology_digital: Globe,
  xps_opportunity: Star,
  risk_assessment: AlertTriangle,
};

const SECTION_LABELS = {
  company_overview: "Company Overview",
  site_information: "Site / Facility Info",
  financial_profile: "Financial Profile",
  operational_details: "Operations & Capabilities",
  competitive_landscape: "Competitive Landscape",
  decision_makers: "Decision Makers",
  previous_projects: "Project History",
  technology_digital: "Tech & Digital Presence",
  xps_opportunity: "XPS Opportunity Analysis",
  risk_assessment: "Risk Assessment",
};

export default function ProfileCard({ record, entityType, onRefresh, refreshing }) {
  const [expanded, setExpanded] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  // Parse profile data
  let profile = null;
  try {
    if (entityType === "Lead" && record.profile_data) {
      profile = typeof record.profile_data === "string" ? JSON.parse(record.profile_data) : record.profile_data;
    } else if (entityType === "ContractorCompany" && record.notes?.startsWith("PROFILE:")) {
      // Contractor profiles are stored in notes
      profile = null; // Will show raw notes
    } else if (entityType === "CommercialJob" && record.notes?.startsWith("FULL PROFILE:")) {
      profile = JSON.parse(record.notes.replace("FULL PROFILE: ", ""));
    }
  } catch {}

  const name = record.company || record.company_name || record.job_name || "Unknown";
  const location = [record.city, record.state].filter(Boolean).join(", ");
  const email = record.email || record.gc_email || record.owner_email || "";
  const phone = record.phone || record.gc_phone || record.owner_phone || "";
  const website = record.website || "";
  const score = record.score || record.lead_score || profile?.overall_score || 0;

  const typeColors = {
    Lead: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    ContractorCompany: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    CommercialJob: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  };

  const typeLabels = {
    Lead: "Company / Lead",
    ContractorCompany: "General Contractor",
    CommercialJob: "Commercial Job",
  };

  const toggleSection = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const hasProfile = !!profile;
  const contacts = profile?.contact_directory || [];
  const recommendations = profile?.recommendations || [];
  const missingFlags = profile?.missing_data_flags || [];

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <Badge className={`text-[9px] border ${typeColors[entityType]}`}>
                {typeLabels[entityType]}
              </Badge>
              {score > 0 && (
                <Badge variant="outline" className={`text-[9px] ${score >= 80 ? 'text-green-400 border-green-500/30' : score >= 50 ? 'text-yellow-400 border-yellow-500/30' : 'text-red-400 border-red-500/30'}`}>
                  Score: {score}
                </Badge>
              )}
              {hasProfile && (
                <Badge className="text-[9px] bg-primary/20 text-primary border-primary/30 border">
                  <CheckCircle2 className="w-2.5 h-2.5 mr-1" /> Profiled
                </Badge>
              )}
              {!hasProfile && (
                <Badge variant="outline" className="text-[9px] text-muted-foreground">
                  Awaiting Profile
                </Badge>
              )}
            </div>
            <h3 className="text-sm font-bold text-foreground truncate">{name}</h3>
            <div className="flex flex-wrap items-center gap-3 mt-1.5">
              {location && (
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <MapPin className="w-3 h-3" /> {location}
                </span>
              )}
              {email && (
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Mail className="w-3 h-3" /> {email}
                </span>
              )}
              {phone && (
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Phone className="w-3 h-3" /> {phone}
                </span>
              )}
              {website && (
                <span className="flex items-center gap-1 text-[10px] text-primary">
                  <Globe className="w-3 h-3" /> {website}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); onRefresh?.(); }} disabled={refreshing}>
              {refreshing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Star className="w-3.5 h-3.5 text-primary" />}
            </Button>
            {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </div>

        {/* Quick summary line */}
        {profile?.summary && (
          <p className="text-[10px] text-muted-foreground mt-2 line-clamp-2">{profile.summary}</p>
        )}
        {record.ai_insight && !profile?.summary && (
          <p className="text-[10px] text-muted-foreground mt-2 line-clamp-2">{record.ai_insight}</p>
        )}
      </div>

      {/* Expanded profile */}
      {expanded && (
        <div className="border-t border-border px-4 pb-4 space-y-3">
          {/* Contact Directory */}
          {contacts.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center gap-2 mb-2 cursor-pointer" onClick={() => toggleSection("contacts")}>
                <Users className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-bold text-foreground">Contact Directory ({contacts.length})</span>
                {expandedSections.contacts ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
              </div>
              {expandedSections.contacts && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {contacts.map((c, i) => (
                    <div key={i} className="bg-secondary/50 rounded-lg p-2.5">
                      <div className="text-[11px] font-semibold text-foreground">{c.name || 'Unknown'}</div>
                      <div className="text-[9px] text-primary">{c.title || ''}</div>
                      {c.email && <div className="text-[9px] text-muted-foreground flex items-center gap-1 mt-0.5"><Mail className="w-2.5 h-2.5" />{c.email}</div>}
                      {c.phone && <div className="text-[9px] text-muted-foreground flex items-center gap-1"><Phone className="w-2.5 h-2.5" />{c.phone}</div>}
                      {c.role_in_decision && <div className="text-[9px] text-amber-400 mt-0.5">Role: {c.role_in_decision}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Profile Sections */}
          {Object.entries(SECTION_LABELS).map(([key, label]) => {
            const content = profile?.[key];
            if (!content) return null;
            const Icon = SECTION_ICONS[key] || FileText;
            const isOpen = expandedSections[key];
            return (
              <div key={key}>
                <div className="flex items-center gap-2 cursor-pointer py-1" onClick={() => toggleSection(key)}>
                  <Icon className={`w-3.5 h-3.5 ${key === 'xps_opportunity' ? 'text-primary' : key === 'risk_assessment' ? 'text-red-400' : 'text-muted-foreground'}`} />
                  <span className="text-xs font-bold text-foreground">{label}</span>
                  {isOpen ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
                </div>
                {isOpen && (
                  <p className="text-[10px] text-muted-foreground leading-relaxed ml-5 whitespace-pre-wrap">{content}</p>
                )}
              </div>
            );
          })}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2 cursor-pointer" onClick={() => toggleSection("recs")}>
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                <span className="text-xs font-bold text-foreground">Recommendations ({recommendations.length})</span>
                {expandedSections.recs ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
              </div>
              {expandedSections.recs && (
                <div className="space-y-1.5 ml-5">
                  {recommendations.map((r, i) => (
                    <div key={i} className="bg-secondary/50 rounded-lg p-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-[8px] ${r.urgency?.toLowerCase() === 'high' ? 'text-red-400 border-red-500/30' : r.urgency?.toLowerCase() === 'medium' ? 'text-yellow-400 border-yellow-500/30' : 'text-green-400 border-green-500/30'}`}>
                          {r.urgency || 'Normal'}
                        </Badge>
                        <span className="text-[10px] font-semibold text-foreground">{r.action}</span>
                      </div>
                      {r.expected_outcome && <p className="text-[9px] text-muted-foreground mt-0.5">{r.expected_outcome}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Missing Data Flags */}
          {missingFlags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              {missingFlags.map((flag, i) => (
                <Badge key={i} variant="outline" className="text-[8px] text-amber-400 border-amber-500/30">{flag}</Badge>
              ))}
            </div>
          )}

          {/* Refresh button */}
          <div className="pt-2 flex justify-end">
            <Button size="sm" variant="outline" className="text-[10px] h-7 gap-1.5" onClick={onRefresh} disabled={refreshing}>
              {refreshing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Star className="w-3 h-3" />}
              {hasProfile ? "Refresh Profile" : "Generate Profile"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}