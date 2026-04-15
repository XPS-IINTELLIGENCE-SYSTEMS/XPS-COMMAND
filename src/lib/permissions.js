// XPS Role-Based Access Control System
// 4 roles: owner, admin, manager, team_member

const OWNER_EMAIL = "j.xpsxpress@gmail.com";

const ROLE_HIERARCHY = {
  owner: 4,
  admin: 3,
  manager: 2,
  team_member: 1,
};

const ROLE_LIMITS = {
  owner: 1,
  admin: 1,
  manager: 2,
  team_member: 50,
};

// Pages accessible by each role (minimum role level)
const PAGE_ACCESS = {
  "/owner": "owner",
  "/admin-panel": "admin",
  "/manager": "manager",
  "/dashboard": "team_member",
};

// Feature flags per role
const FEATURES = {
  owner: [
    "market_simulation", "production_simulation", "competitive_intelligence_full",
    "strategic_analytics", "executive_briefings", "system_config_full",
    "user_management", "api_management", "audit_log", "data_export",
    "team_analytics", "territory_intelligence", "competitor_analysis",
    "pipeline_management", "communication_analytics",
    "view_all_leads", "view_all_analytics", "view_all_settings",
  ],
  admin: [
    "user_management", "api_management", "system_config_full",
    "audit_log", "data_export", "ai_prompt_management",
    "team_analytics", "territory_intelligence", "competitor_analysis",
    "pipeline_management", "communication_analytics",
    "view_all_leads", "view_all_analytics", "view_all_settings",
  ],
  manager: [
    "team_analytics", "territory_intelligence", "competitor_analysis",
    "pipeline_management", "communication_analytics",
    "view_team_leads", "view_team_analytics",
  ],
  team_member: [
    "view_own_leads", "personal_ai_assistant", "own_tasks",
    "own_calendar", "communication_tools", "knowledge_base",
  ],
};

export function isOwner(user) {
  if (!user) return false;
  if (user.email === OWNER_EMAIL) return true;
  if (user.role === "owner" || user.role === "admin") return true;
  // Check xps_role from UserProfile (set during onboarding)
  if (user.xps_role === "owner") return true;
  return false;
}

export function getRoleLevel(role) {
  return ROLE_HIERARCHY[role] || 0;
}

// Get the effective XPS role (merging Base44 role + UserProfile xps_role)
export function getXpsRole(user) {
  if (!user) return null;
  if (user.email === OWNER_EMAIL) return "owner";
  // xps_role is set from UserProfile during session
  if (user.xps_role) return user.xps_role;
  // Fall back to Base44 role mapping
  if (user.role === "admin") return "owner";
  return "team_member";
}

export function hasMinRole(user, minRole) {
  if (!user) return false;
  if (isOwner(user)) return true;
  const effectiveRole = getXpsRole(user);
  return getRoleLevel(effectiveRole) >= getRoleLevel(minRole);
}

export function canAccessPage(user, path) {
  const requiredRole = PAGE_ACCESS[path];
  if (!requiredRole) return true; // Public or unprotected
  return hasMinRole(user, requiredRole);
}

export function hasFeature(user, feature) {
  if (!user) return false;
  if (isOwner(user)) return true;
  const role = user.role || "team_member";
  return FEATURES[role]?.includes(feature) || false;
}

export function getEffectiveRole(user) {
  if (!user) return null;
  return getXpsRole(user);
}

export function getRoleLabel(role) {
  const labels = { owner: "Owner", admin: "Admin", manager: "Manager", team_member: "Team Member" };
  return labels[role] || "Team Member";
}

export function getRoleColor(role) {
  const colors = { owner: "#d4af37", admin: "#c0c0c0", manager: "#60a5fa", team_member: "#a78bfa" };
  return colors[role] || "#a78bfa";
}

export { OWNER_EMAIL, ROLE_LIMITS, FEATURES, ROLE_HIERARCHY };