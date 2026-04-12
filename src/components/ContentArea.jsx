import DashboardView from "./dashboard/DashboardView";
import CRMView from "./dashboard/CRMView";
import LeadsView from "./dashboard/LeadsView";
import ResearchView from "./dashboard/ResearchView";
import OutreachView from "./dashboard/OutreachView";
import ProposalsView from "./dashboard/ProposalsView";
import AnalyticsView from "./dashboard/AnalyticsView";
import KnowledgeView from "./dashboard/KnowledgeView";
import CompetitionView from "./dashboard/CompetitionView";
import ConnectorsView from "./dashboard/ConnectorsView";
import AdminView from "./dashboard/AdminView";
import SettingsView from "./dashboard/SettingsView";
import EditorView from "./editor/EditorView";
import WorkflowView from "./workflow/WorkflowView";
import ReportingDashboard from "./reporting/ReportingDashboard";

const views = {
  dashboard: DashboardView,
  crm: CRMView,
  leads: LeadsView,
  workflows: WorkflowView,
  research: ResearchView,
  outreach: OutreachView,
  proposals: ProposalsView,
  analytics: AnalyticsView,
  reports: ReportingDashboard,
  knowledge: KnowledgeView,
  competition: CompetitionView,
  connectors: ConnectorsView,
  admin: AdminView,
  settings: SettingsView,
  editor: EditorView,
};

export default function ContentArea({ activeView }) {
  const ViewComponent = views[activeView] || DashboardView;
  return (
    <div className="flex-1 h-full overflow-hidden">
      <ViewComponent />
    </div>
  );
}