import { useState } from "react";
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from "lucide-react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import ContentArea from "../components/ContentArea";
import ChatPanel from "../components/ChatPanel";

export default function Home() {
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-background">
      {/* Left Sidebar */}
      <div className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-[180px] min-w-[180px]' : 'w-0 min-w-0'} overflow-hidden`}>
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
      </div>

      {/* Center: TopBar + Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar activeView={activeView}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-md hover:bg-secondary/50 text-muted-foreground hover:text-white transition-colors"
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="p-1.5 rounded-md hover:bg-secondary/50 text-muted-foreground hover:text-white transition-colors"
            title={chatOpen ? 'Collapse chat' : 'Expand chat'}
          >
            {chatOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
          </button>
        </TopBar>
        <ContentArea activeView={activeView} />
      </div>

      {/* Right Chat Panel */}
      <div className={`transition-all duration-300 ease-in-out ${chatOpen ? 'w-[320px] min-w-[320px]' : 'w-0 min-w-0'} overflow-hidden`}>
        <ChatPanel />
      </div>
    </div>
  );
}