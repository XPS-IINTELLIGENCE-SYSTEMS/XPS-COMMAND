import { useNavigate } from "react-router-dom";
import PageHexGlow from "../components/PageHexGlow";
import { ArrowRight, Terminal } from "lucide-react";

export default function CustomLogin() {
  const navigate = useNavigate();

  const enter = (role, path) => {
    sessionStorage.setItem("xps-role", role);
    navigate(path, { replace: true });
  };

  return (
    <div className="hex-bg min-h-screen bg-background text-foreground relative flex items-center justify-center px-4">
      <PageHexGlow />
      <div className="relative z-[1] w-full max-w-md p-8 rounded-xl bg-card/80 backdrop-blur-md border border-border animated-silver-border">
        <div className="text-center mb-8">
          <img
            src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg"
            alt="XPS"
            className="w-20 h-20 mx-auto mb-4 object-contain"
          />
          <h1
            className="text-3xl font-extrabold metallic-gold-silver-text tracking-wider"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            XPS Intelligence
          </h1>
          <p className="text-sm text-muted-foreground mt-2">Intelligence Platform</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => enter("command", "/onboarding")}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-xl metallic-gold-bg text-background font-bold text-lg hover:brightness-110 transition-all duration-300"
          >
            <Terminal className="w-6 h-6" />
            <div className="flex-1 text-left">
              <div>Command Access</div>
              <div className="text-xs font-normal opacity-70">Enter the command center</div>
            </div>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}