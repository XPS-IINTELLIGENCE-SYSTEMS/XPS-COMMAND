import {
  BarChart3, Users, FileText, Brain, Database,
  Activity, MapPin, Calendar, Clock, Sparkles, Target,
  TrendingUp, Send, Search, Bot, Wrench, Globe
} from "lucide-react";

const WIDGET_REGISTRY = [
  { id: "stat_card", label: "Stat Card", desc: "Single KPI with trend", icon: TrendingUp, category: "Data", defaultConfig: { title: "Metric", entity: "Lead", field: "count", color: "#d4af37" } },
  { id: "entity_table", label: "Data Table", desc: "Sortable entity table", icon: Database, category: "Data", defaultConfig: { entity: "Lead", columns: ["company", "contact_name", "stage", "score"], limit: 20 } },
  { id: "chart_bar", label: "Bar Chart", desc: "Bar chart from entity data", icon: BarChart3, category: "Charts", defaultConfig: { entity: "Lead", groupBy: "stage", metric: "count", color: "#6366f1" } },
  { id: "chart_pie", label: "Pie Chart", desc: "Distribution breakdown", icon: Activity, category: "Charts", defaultConfig: { entity: "Lead", groupBy: "vertical", metric: "count" } },
  { id: "chart_line", label: "Line Chart", desc: "Trend over time", icon: TrendingUp, category: "Charts", defaultConfig: { entity: "Lead", dateField: "created_date", metric: "count", period: "daily" } },
  { id: "tool_embed", label: "Tool Embed", desc: "Embed any tool card view", icon: Wrench, category: "Tools", defaultConfig: { toolId: "analytics" } },
  { id: "quick_actions", label: "Quick Actions", desc: "Custom action buttons", icon: Sparkles, category: "Tools", defaultConfig: { actions: [] } },
  { id: "agent_chat", label: "Agent Chat", desc: "Embedded AI agent", icon: Bot, category: "AI", defaultConfig: { agentName: "xps_assistant" } },
  { id: "text_block", label: "Text Block", desc: "Rich text / markdown", icon: FileText, category: "Content", defaultConfig: { content: "## New Section\nAdd your content here." } },
  { id: "iframe_embed", label: "Web Embed", desc: "Embed external URL", icon: Globe, category: "Content", defaultConfig: { url: "", height: 400 } },
  { id: "image_block", label: "Image", desc: "Image with caption", icon: MapPin, category: "Content", defaultConfig: { url: "", caption: "" } },
  { id: "pipeline_mini", label: "Mini Pipeline", desc: "Compact pipeline stage view", icon: Target, category: "Pipeline", defaultConfig: { entity: "Lead", stageField: "stage" } },
  { id: "kanban_mini", label: "Mini Kanban", desc: "Kanban board widget", icon: Users, category: "Pipeline", defaultConfig: { entity: "Lead", stageField: "stage", limit: 30 } },
  { id: "calendar_mini", label: "Mini Calendar", desc: "Upcoming events", icon: Calendar, category: "Activity", defaultConfig: { daysAhead: 7 } },
  { id: "activity_feed", label: "Activity Feed", desc: "Recent system activity", icon: Clock, category: "Activity", defaultConfig: { limit: 15 } },
  { id: "scrape_monitor", label: "Scrape Monitor", desc: "Live scraping status", icon: Search, category: "Activity", defaultConfig: {} },
];

export const WIDGET_CATEGORIES = [...new Set(WIDGET_REGISTRY.map(w => w.category))];

export function getWidgetDef(widgetId) {
  return WIDGET_REGISTRY.find(w => w.id === widgetId);
}

export default WIDGET_REGISTRY;