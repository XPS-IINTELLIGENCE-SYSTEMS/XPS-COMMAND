import CommandCenterView from "./phases/CommandCenterView";
import FindWorkView from "./phases/FindWorkView";
import GetWorkView from "./phases/GetWorkView";
import DoWorkView from "./phases/DoWorkView";
import GetPaidView from "./phases/GetPaidView";
import TipsView from "./phases/TipsView";
import SettingsView from "./dashboard/SettingsView";

const views = {
  command: CommandCenterView,
  find_work: FindWorkView,
  get_work: GetWorkView,
  do_work: DoWorkView,
  get_paid: GetPaidView,
  tips: TipsView,
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