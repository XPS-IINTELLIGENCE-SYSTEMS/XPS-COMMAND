import { Outlet } from "react-router-dom";
import BottomTabBar from "@/components/common/BottomTabBar";

export default function VisionCortexShell() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Main content area with safe area insets for notched devices */}
      <main
        className="flex-1 overflow-y-auto pb-20"
        style={{
          paddingLeft: "env(safe-area-inset-left, 0px)",
          paddingRight: "env(safe-area-inset-right, 0px)",
        }}
      >
        <Outlet />
      </main>

      {/* Mobile bottom navigation */}
      <BottomTabBar />
    </div>
  );
}