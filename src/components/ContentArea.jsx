import { useState } from "react";
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
import TemplatesView from "./templates/TemplatesView";
import NavButtons, { pushView } from "./shared/NavButtons";
import ToolModuleOverlay from "./tools/ToolModuleOverlay";
import { getToolById } from "./tools/toolRegistry";
import { getIconColor } from "@/lib/iconColors";
import { useEffect, useRef } from "react";

export default function ContentArea({ activeView, onChatCommand, onNavigate, sidebarPhases }) {
  const lastPushed = useRef(null);
  const [activeTool, setActiveTool] = useState(null);

  useEffect(() => {
    if (activeView && activeView !== lastPushed.current) {
      pushView(activeView);
      lastPushed.current = activeView;
    }
  }, [activeView]);

  // Close tool when view changes
  useEffect(() => { setActiveTool(null); }, [activeView]);

  const handleNavButton = (view, isHistoryNav) => {
    if (isHistoryNav) {
      lastPushed.current = view;
    }
    if (onNavigate) onNavigate(view);
  };

  // Open a tool module in the center UI
  const openTool = (toolId, workflowId) => {
    const tool = getToolById(toolId);
    if (tool) {
      setActiveTool({
        ...tool,
        workflowColor: getIconColor(workflowId || tool.workflowId),
      });
    }
  };

  // Also send to chat if needed
  const handleToolAndChat = (toolId, workflowId, chatCmd) => {
    openTool(toolId, workflowId);
    // Optionally also tell the AI
    if (chatCmd && onChatCommand) onChatCommand(chatCmd);
  };

  const wrapper = (children) => (
    <div className="flex-1 h-full overflow-hidden border-l border-[#8a8a8a]/15 relative">
      <NavButtons onNavigate={handleNavButton} />
      {children}
      {activeTool && (
        <ToolModuleOverlay
          tool={activeTool}
          onClose={() => setActiveTool(null)}
          onChatCommand={onChatCommand}
        />
      )}
    </div>
  );

  const toolProps = { onChatCommand, onOpenTool: openTool, onToolAndChat: handleToolAndChat };

  switch (activeView) {
    case "command":
      return wrapper(<DashboardView onNavigate={onNavigate} sidebarPhases={sidebarPhases} />);
    case "start_here":
      return wrapper(<StartHereView onNavigate={onNavigate} />);
    case "find_work":
      return wrapper(<DiscoverView {...toolProps} />);
    case "xpress_leads":
      return wrapper(<LeadPipelineView {...toolProps} forcedTab="XPress" />);
    case "job_leads":
      return wrapper(<LeadPipelineView {...toolProps} forcedTab="Jobs" />);
    case "crm":
      return wrapper(<CRMView />);
    case "get_work":
      return wrapper(<ContactView {...toolProps} />);
    case "follow_up":
      return wrapper(<FollowUpView {...toolProps} />);
    case "win_work":
      return wrapper(<CloseView {...toolProps} />);
    case "do_work":
      return wrapper(<ExecuteView {...toolProps} />);
    case "get_paid":
      return wrapper(<CollectView {...toolProps} />);
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
    case "templates":
      return wrapper(<TemplatesView />);
    default:
      return wrapper(<DashboardView onNavigate={onNavigate} sidebarPhases={sidebarPhases} />);
  }
}