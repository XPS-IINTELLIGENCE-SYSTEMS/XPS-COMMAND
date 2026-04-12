import DashboardView from "./dashboard/DashboardView";
import LeadsView from "./dashboard/LeadsView";
import OutreachView from "./dashboard/OutreachView";
import ProposalsView from "./dashboard/ProposalsView";
import AnalyticsView from "./dashboard/AnalyticsView";
import KnowledgeView from "./dashboard/KnowledgeView";
import AdminView from "./dashboard/AdminView";
import SettingsView from "./dashboard/SettingsView";
import WorkflowView from "./workflow/WorkflowView";

const views = {
  dashboard: DashboardView,
  leads: LeadsView,
  workflows: WorkflowView,
  outreach: OutreachView,
  proposals: ProposalsView,
  analytics: AnalyticsView,
  knowledge: KnowledgeView,
  admin: AdminView,
  settings: SettingsView,
};

export default function ContentArea({ activeView }) {
  const ViewComponent = views[activeView] || DashboardView;
  return (
    <div className="flex-1 h-full overflow-hidden border-l border-[#8a8a8a]/15">
      <ViewComponent />
    </div>
  );
}