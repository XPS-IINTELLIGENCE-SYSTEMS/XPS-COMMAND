import { FileText, BarChart3, Database, Columns3, LayoutGrid, Sparkles } from "lucide-react";

const PAGE_TEMPLATES = [
  {
    id: "blank",
    label: "Blank Page",
    desc: "Start from scratch",
    icon: FileText,
    widgets: []
  },
  {
    id: "dashboard",
    label: "Dashboard",
    desc: "Stats + charts + activity feed",
    icon: BarChart3,
    widgets: [
      { widgetType: "stat_card", config: { title: "Total Leads", entity: "Lead", color: "#d4af37" }, w: 3, h: 1 },
      { widgetType: "stat_card", config: { title: "Active Jobs", entity: "CommercialJob", color: "#22c55e" }, w: 3, h: 1 },
      { widgetType: "stat_card", config: { title: "Open Bids", entity: "FloorScope", color: "#6366f1" }, w: 3, h: 1 },
      { widgetType: "stat_card", config: { title: "Intel Records", entity: "IntelRecord", color: "#ec4899" }, w: 3, h: 1 },
      { widgetType: "chart_bar", config: { entity: "Lead", groupBy: "stage", color: "#d4af37" }, w: 6, h: 2 },
      { widgetType: "chart_pie", config: { entity: "Lead", groupBy: "vertical" }, w: 6, h: 2 },
      { widgetType: "entity_table", config: { entity: "Lead", columns: ["company", "contact_name", "stage", "score"], limit: 10 }, w: 12, h: 3 },
    ]
  },
  {
    id: "data_view",
    label: "Data View",
    desc: "Full data table with filters",
    icon: Database,
    widgets: [
      { widgetType: "stat_card", config: { title: "Records", entity: "Lead", color: "#06b6d4" }, w: 4, h: 1 },
      { widgetType: "entity_table", config: { entity: "Lead", columns: ["company", "contact_name", "email", "stage", "score", "vertical"], limit: 50 }, w: 12, h: 5 },
    ]
  },
  {
    id: "report",
    label: "Report Page",
    desc: "Charts + text analysis",
    icon: Columns3,
    widgets: [
      { widgetType: "text_block", config: { content: "# Monthly Report\nGenerated automatically." }, w: 12, h: 1 },
      { widgetType: "chart_bar", config: { entity: "Lead", groupBy: "stage", color: "#6366f1" }, w: 6, h: 2 },
      { widgetType: "chart_pie", config: { entity: "CommercialJob", groupBy: "project_type" }, w: 6, h: 2 },
      { widgetType: "text_block", config: { content: "## Key Insights\n- Insight 1\n- Insight 2\n- Insight 3" }, w: 12, h: 2 },
    ]
  },
  {
    id: "kanban",
    label: "Kanban Board",
    desc: "Pipeline kanban view",
    icon: LayoutGrid,
    widgets: [
      { widgetType: "kanban_mini", config: { entity: "Lead", stageField: "stage", limit: 50 }, w: 12, h: 5 },
    ]
  },
  {
    id: "ai_workspace",
    label: "AI Workspace",
    desc: "Agent chat + data widgets",
    icon: Sparkles,
    widgets: [
      { widgetType: "agent_chat", config: { agentName: "xps_assistant" }, w: 6, h: 4 },
      { widgetType: "stat_card", config: { title: "Agent Jobs", entity: "AgentJob", color: "#8b5cf6" }, w: 3, h: 1 },
      { widgetType: "stat_card", config: { title: "Activity", entity: "AgentActivity", color: "#d4af37" }, w: 3, h: 1 },
      { widgetType: "activity_feed", config: { limit: 15 }, w: 6, h: 3 },
    ]
  },
];

export default PAGE_TEMPLATES;