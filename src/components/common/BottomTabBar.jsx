import { useLocation, useNavigate } from "react-router-dom";
import { Home, BarChart3, Settings, Menu } from "lucide-react";

const TABS = [
  { id: "home", label: "Home", path: "/", icon: Home },
  { id: "analytics", label: "Analytics", path: "/dashboard", icon: BarChart3 },
  { id: "settings", label: "Settings", path: "/account-settings", icon: Settings },
];

export default function BottomTabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleTabClick = (tabPath) => {
    if (location.pathname === tabPath) {
      navigate("/");
    } else {
      navigate(tabPath);
    }
  };

  const isActive = (tabPath) => location.pathname === tabPath;

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto sm:hidden">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.path)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}