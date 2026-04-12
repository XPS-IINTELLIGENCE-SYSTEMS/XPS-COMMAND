import { useState } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import ContentArea from "../components/ContentArea";
import ChatPanel from "../components/ChatPanel";

export default function Home() {
  const [activeView, setActiveView] = useState("dashboard");

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-background">
      {/* Left Sidebar */}
      <Sidebar activeView={activeView} onViewChange={setActiveView} />

      {/* Center: TopBar + Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar activeView={activeView} />
        <ContentArea activeView={activeView} />
      </div>

      {/* Right Chat Panel */}
      <ChatPanel />
    </div>
  );
}