import DashboardView from "../dashboard/DashboardView";
import LeadPipelineView from "../pipeline/LeadPipelineView";
import DiscoverView from "../phases/DiscoverView";
import ContactView from "../phases/ContactView";
import FollowUpView from "../phases/FollowUpView";
import CloseView from "../phases/CloseView";
import ExecuteView from "../phases/ExecuteView";
import CollectView from "../phases/CollectView";
import AnalyticsView from "../dashboard/AnalyticsView";
// AgentCommandPage removed
import TaskSchedulerView from "../scheduler/TaskSchedulerView";
import SettingsView from "../dashboard/SettingsView";
import CRMView from "../dashboard/CRMView";
import KnowledgeView from "../knowledge/KnowledgeView";
import AdminInlineView from "../admin/AdminInlineView";
import TipsView from "../phases/TipsView";
import StartHereView from "../phases/StartHereView";
import TemplatesView from "../templates/TemplatesView";

export default function AppContent({ activeView, onChatCommand, onNavigate }) {
  const toolProps = { onChatCommand };

  const content = (() => {
    switch (activeView) {
      case "command": return <DashboardView onNavigate={onNavigate} />;
      case "xpress_leads": return <LeadPipelineView {...toolProps} forcedTab="XPress" />;
      case "job_leads": return <LeadPipelineView {...toolProps} forcedTab="Jobs" />;
      case "find_work": return <DiscoverView {...toolProps} />;
      case "crm": return <CRMView />;
      case "get_work": return <ContactView {...toolProps} />;
      case "follow_up": return <FollowUpView {...toolProps} />;
      case "win_work": return <CloseView {...toolProps} />;
      case "do_work": return <ExecuteView {...toolProps} />;
      case "get_paid": return <CollectView {...toolProps} />;
      case "analytics": return <AnalyticsView />;
      case "agents": return <KnowledgeView />;
      case "task_scheduler": return <TaskSchedulerView />;
      case "settings": return <SettingsView />;
      case "admin": return <AdminInlineView />;
      case "knowledge": return <KnowledgeView />;
      case "tips": return <TipsView />;
      case "start_here": return <StartHereView onNavigate={onNavigate} />;
      case "templates": return <TemplatesView />;
      default: return <DashboardView onNavigate={onNavigate} />;
    }
  })();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-4">
      {content}
    </div>
  );
}