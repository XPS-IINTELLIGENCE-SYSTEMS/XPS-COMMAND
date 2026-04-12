import StartHereView from "./phases/StartHereView";
import CommandCenterView from "./phases/CommandCenterView";
import PhaseView from "./phases/PhaseView";
import TipsView from "./phases/TipsView";
import SettingsView from "./dashboard/SettingsView";
import LeadsView from "./dashboard/LeadsView";
import ResearchView from "./dashboard/ResearchView";
import OutreachView from "./dashboard/OutreachView";

// Phase views use the new interactive PhaseView system
const phaseViews = ["find_work", "get_work", "win_work", "do_work", "get_paid"];

// Views that don't need chat commands
const plainViews = {
  start_here: StartHereView,
  command: CommandCenterView,
  tips: TipsView,
  settings: SettingsView,
  leads: LeadsView,
  research: ResearchView,
  outreach: OutreachView,
};

export default function ContentArea({ activeView, onChatCommand }) {
  if (phaseViews.includes(activeView)) {
    return (
      <div className="flex-1 h-full overflow-hidden border-l border-[#8a8a8a]/15">
        <PhaseView phaseId={activeView} onChatCommand={onChatCommand} />
      </div>
    );
  }

  const ViewComponent = plainViews[activeView] || CommandCenterView;
  return (
    <div className="flex-1 h-full overflow-hidden border-l border-[#8a8a8a]/15">
      <ViewComponent />
    </div>
  );
}