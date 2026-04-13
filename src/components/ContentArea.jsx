import StartHereView from "./phases/StartHereView";
import DashboardView from "./dashboard/DashboardView";
import DiscoverView from "./phases/DiscoverView";
import TaskSchedulerView from "./scheduler/TaskSchedulerView";
import ContactView from "./phases/ContactView";
import FollowUpView from "./phases/FollowUpView";
import CloseView from "./phases/CloseView";
import ExecuteView from "./phases/ExecuteView";
import CollectView from "./phases/CollectView";
import TipsView from "./phases/TipsView";
import SettingsView from "./dashboard/SettingsView";
import CRMView from "./dashboard/CRMView";
import LeadPipelineView from "./pipeline/LeadPipelineView";
import AnalyticsView from "./dashboard/AnalyticsView";
import AgentCommandPage from "./command/AgentCommandPage";
import AdminInlineView from "./admin/AdminInlineView";

export default function ContentArea({ activeView, onChatCommand, onNavigate, sidebarPhases }) {
  const wrapper = (children) => (
    <div className="flex-1 h-full overflow-hidden border-l border-[#8a8a8a]/15">{children}</div>
  );

  switch (activeView) {
    case "command":
      return wrapper(<DashboardView onNavigate={onNavigate} sidebarPhases={sidebarPhases} />);
    case "start_here":
      return wrapper(<StartHereView onNavigate={onNavigate} />);
    case "find_work":
      return wrapper(<DiscoverView onChatCommand={onChatCommand} />);
    case "xpress_leads":
      return wrapper(<LeadPipelineView onChatCommand={onChatCommand} forcedTab="XPress" />);
    case "job_leads":
      return wrapper(<LeadPipelineView onChatCommand={onChatCommand} forcedTab="Jobs" />);
    case "crm":
      return wrapper(<CRMView />);
    case "get_work":
      return wrapper(<ContactView onChatCommand={onChatCommand} />);
    case "follow_up":
      return wrapper(<FollowUpView onChatCommand={onChatCommand} />);
    case "win_work":
      return wrapper(<CloseView onChatCommand={onChatCommand} />);
    case "do_work":
      return wrapper(<ExecuteView onChatCommand={onChatCommand} />);
    case "get_paid":
      return wrapper(<CollectView onChatCommand={onChatCommand} />);
    case "analytics":
      return wrapper(<AnalyticsView />);
    case "tips":
      return wrapper(<TipsView />);
    case "agents":
      return wrapper(<AgentCommandPage />);
    case "task_scheduler":
      return wrapper(<TaskSchedulerView />);
    case "settings":
      return wrapper(<SettingsView />);
    case "admin":
      return wrapper(<AdminInlineView />);
    default:
      return wrapper(<DashboardView onNavigate={onNavigate} sidebarPhases={sidebarPhases} />);
  }
}