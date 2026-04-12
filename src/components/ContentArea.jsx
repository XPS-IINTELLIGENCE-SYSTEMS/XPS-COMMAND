import StartHereView from "./phases/StartHereView";
import CommandCenterView from "./phases/CommandCenterView";
import FindWorkView from "./phases/FindWorkView";
import GetWorkView from "./phases/GetWorkView";
import WinWorkView from "./phases/WinWorkView";
import DoWorkView from "./phases/DoWorkView";
import GetPaidView from "./phases/GetPaidView";
import TipsView from "./phases/TipsView";
import SettingsView from "./dashboard/SettingsView";
import LeadsView from "./dashboard/LeadsView";
import ResearchView from "./dashboard/ResearchView";
import OutreachView from "./dashboard/OutreachView";

const views = {
  start_here: StartHereView,
  command: CommandCenterView,
  find_work: FindWorkView,
  get_work: GetWorkView,
  win_work: WinWorkView,
  do_work: DoWorkView,
  get_paid: GetPaidView,
  tips: TipsView,
  settings: SettingsView,
  leads: LeadsView,
  research: ResearchView,
  outreach: OutreachView,
};

export default function ContentArea({ activeView }) {
  const ViewComponent = views[activeView] || CommandCenterView;
  return (
    <div className="flex-1 h-full overflow-hidden border-l border-[#8a8a8a]/15">
      <ViewComponent />
    </div>
  );
}