/**
 * Psychology-Based Icon Color System with Live Override Support
 * =============================================================
 * Colors are persisted in localStorage so user/AI overrides survive refresh.
 */

const DEFAULTS = {
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

const STORAGE_KEY = "xps-icon-color-overrides";

function loadOverrides() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch { return {}; }
}

let overrides = loadOverrides();
let listeners = [];

export function getIconColor(id) {
  return overrides[id] || DEFAULTS[id] || "#d4af37";
}

export function setIconColor(id, color) {
  overrides[id] = color;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  listeners.forEach(fn => fn(id, color));
}

export function resetIconColor(id) {
  delete overrides[id];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  listeners.forEach(fn => fn(id, DEFAULTS[id] || "#d4af37"));
}

export function resetAllColors() {
  overrides = {};
  localStorage.removeItem(STORAGE_KEY);
  listeners.forEach(fn => fn(null, null));
}

export function getDefaultColor(id) {
  return DEFAULTS[id] || "#d4af37";
}

/** Subscribe to color changes. Returns unsubscribe function. */
export function subscribeColors(fn) {
  listeners.push(fn);
  return () => { listeners = listeners.filter(l => l !== fn); };
}

export const CRM_COLORS = {
  contact_first:  "#f97316",
  follow_up_crm:  "#f59e0b",
  in_pipeline:    "#10b981",
};

/** Curated palette for the color picker — psychology-driven presets */
export const COLOR_PALETTE = [
  { hex: "#d4af37", name: "Gold", meaning: "Authority & Leadership" },
  { hex: "#c9a227", name: "Warm Gold", meaning: "Trust & Relationships" },
  { hex: "#b8860b", name: "Dark Gold", meaning: "Governance & Control" },
  { hex: "#f59e0b", name: "Amber", meaning: "Energy & Momentum" },
  { hex: "#f97316", name: "Orange", meaning: "Urgency & Action" },
  { hex: "#ef4444", name: "Ruby", meaning: "Power & Conversion" },
  { hex: "#ec4899", name: "Pink", meaning: "Warmth & Empathy" },
  { hex: "#d946ef", name: "Magenta", meaning: "Innovation & AI" },
  { hex: "#8b5cf6", name: "Violet", meaning: "Intelligence & Insight" },
  { hex: "#6366f1", name: "Indigo", meaning: "Organization & Control" },
  { hex: "#3b82f6", name: "Blue", meaning: "Trust & Communication" },
  { hex: "#06b6d4", name: "Cyan", meaning: "Knowledge & Clarity" },
  { hex: "#2dd4bf", name: "Teal", meaning: "Fresh Start & Guidance" },
  { hex: "#10b981", name: "Emerald", meaning: "Wealth & Reward" },
  { hex: "#34d399", name: "Green", meaning: "Growth & Opportunity" },
  { hex: "#cd7f32", name: "Bronze", meaning: "Craftsmanship & Reliability" },
  { hex: "#94a3b8", name: "Steel", meaning: "Precision & Dependability" },
  { hex: "#64748b", name: "Slate", meaning: "Neutral & Utilitarian" },
  { hex: "#e2e8f0", name: "Silver", meaning: "Clean & Modern" },
  { hex: "#ffffff", name: "White", meaning: "Purity & Simplicity" },
];

export default DEFAULTS;