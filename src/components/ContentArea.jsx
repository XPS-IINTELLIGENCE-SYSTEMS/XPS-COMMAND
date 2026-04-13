import StartHereView from "./phases/StartHereView";
import DashboardView from "./dashboard/DashboardView";
import DiscoverView from "./phases/DiscoverView";
import ContactView from "./phases/ContactView";
import CloseView from "./phases/CloseView";
import ExecuteView from "./phases/ExecuteView";
import CollectView from "./phases/CollectView";
import TipsView from "./phases/TipsView";
import SettingsView from "./dashboard/SettingsView";
import CRMView from "./dashboard/CRMView";
import LeadPipelineView from "./pipeline/LeadPipelineView";
import AnalyticsView from "./dashboard/AnalyticsView";
import AgentCommandPage from "./command/AgentCommandPage";

export default function ContentArea({ activeView, onChatCommand, onNavigate }) {
  const wrapper = (children) => (
    <div className="flex-1 h-full overflow-hidden border-l border-[#8a8a8a]/15">{children}</div>
  );

  switch (activeView) {
    case "command":
      return wrapper(<DashboardView onNavigate={onNavigate} />);
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
    case "settings":
      return wrapper(<SettingsView />);
    default:
      return wrapper(<DashboardView onNavigate={onNavigate} />);
  }
}