import CommandCenterView from "./phases/CommandCenterView";
import FindWorkView from "./phases/FindWorkView";
import GetWorkView from "./phases/GetWorkView";
import WinWorkView from "./phases/WinWorkView";
import GetPaidView from "./phases/GetPaidView";
import SettingsView from "./dashboard/SettingsView";

const views = {
  command: CommandCenterView,
  find_work: FindWorkView,
  get_work: GetWorkView,
  win_work: WinWorkView,
  get_paid: GetPaidView,
  settings: SettingsView,
};

export default function ContentArea({ activeView }) {
  const ViewComponent = views[activeView] || CommandCenterView;
  return (
    <div className="flex-1 h-full overflow-hidden border-l border-[#8a8a8a]/15">
      <ViewComponent />
    </div>
  );
}