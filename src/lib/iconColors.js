/**
 * Psychology-Based Icon Color System
 * ===================================
 * Each color is chosen based on color psychology, marketing/sales funnel theory,
 * and UX best practices to subconsciously guide user behavior.
 *
 * COLOR RATIONALE:
 * ─────────────────────────────────────────────────────────────────
 * command      → Gold (#d4af37)        — Authority, premium, leadership. The command center demands presence.
 * crm          → Warm Gold (#c9a227)   — Relationship warmth, trust, long-term value. CRM = people relationships.
 * start_here   → Teal (#2dd4bf)        — Fresh start, clarity, welcoming. Invites new users in without pressure.
 * find_work    → Emerald (#34d399)     — Growth, opportunity, abundance. Discovery = finding green pastures.
 * xpress_leads → Amber (#f59e0b)       — Energy, urgency, momentum. Pipeline leads need forward motion.
 * job_leads    → Bronze (#cd7f32)      — Craftsmanship, hands-on reliability. Jobs = real-world execution.
 * get_work     → Electric Blue (#3b82f6) — Trust, communication, professionalism. Outreach must feel credible.
 * follow_up    → Orange (#f97316)      — Urgency, persistence, warmth. Follow-ups require action without aggression.
 * win_work     → Ruby Red (#ef4444)    — Power, passion, conversion. Closing deals = high stakes, high reward.
 * do_work      → Steel (#94a3b8)       — Precision, dependability, work ethic. Execution = steady and reliable.
 * get_paid     → Money Green (#10b981) — Wealth, success, reward. Collection = the payoff moment.
 * analytics    → Violet (#8b5cf6)      — Intelligence, insight, depth. Analytics = wisdom from data.
 * tips         → Cyan (#06b6d4)        — Knowledge, learning, freshness. Tips = quick, clear insights.
 * agents       → Magenta (#d946ef)     — AI, innovation, futuristic. Agents = cutting-edge tech.
 * task_scheduler → Indigo (#6366f1)    — Organization, control, structure. Scheduling = systematic discipline.
 * settings     → Cool Gray (#64748b)   — Neutral, utilitarian. Settings = background infrastructure.
 * admin        → Dark Gold (#b8860b)   — Governance, authority, control. Admin = elevated access.
 * ─────────────────────────────────────────────────────────────────
 */

const ICON_COLORS = {
  command:        "#d4af37",  // Gold — Authority & Leadership
  crm:            "#c9a227",  // Warm Gold — Relationships & Trust
  start_here:     "#2dd4bf",  // Teal — Fresh Start & Guidance
  find_work:      "#34d399",  // Emerald — Growth & Opportunity
  xpress_leads:   "#f59e0b",  // Amber — Energy & Momentum
  job_leads:      "#cd7f32",  // Bronze — Craftsmanship & Reliability
  get_work:       "#3b82f6",  // Electric Blue — Trust & Communication
  follow_up:      "#f97316",  // Orange — Urgency & Persistence
  win_work:       "#ef4444",  // Ruby Red — Power & Conversion
  do_work:        "#94a3b8",  // Steel — Precision & Dependability
  get_paid:       "#10b981",  // Money Green — Wealth & Reward
  analytics:      "#8b5cf6",  // Violet — Intelligence & Insight
  tips:           "#06b6d4",  // Cyan — Knowledge & Learning
  agents:         "#d946ef",  // Magenta — AI & Innovation
  task_scheduler: "#6366f1",  // Indigo — Organization & Control
  settings:       "#64748b",  // Cool Gray — Neutral & Utilitarian
  admin:          "#b8860b",  // Dark Gold — Governance & Authority
};

/**
 * CRM-specific action colors (for CRM top cards)
 * These follow sales psychology:
 *   Contact First = Red-Orange (urgency to act NOW)
 *   Follow Up = Amber (persistent but patient)
 *   In Pipeline = Green (healthy, growing, on-track)
 */
export const CRM_COLORS = {
  contact_first:  "#f97316",  // Orange — Act now, highest priority
  follow_up_crm:  "#f59e0b",  // Amber — Patience with urgency
  in_pipeline:    "#10b981",  // Green — Healthy pipeline, growth
};

/**
 * Get the icon color for a given phase/section ID.
 * Falls back to gold if the ID is not mapped.
 */
export function getIconColor(id) {
  return ICON_COLORS[id] || "#d4af37";
}

export default ICON_COLORS;