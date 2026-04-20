import { base44 } from "@/api/base44Client";
import { Shield, LogOut } from "lucide-react";

export default function UserNotRegisteredError() {
  const handleLogout = () => {
    base44.auth.logout(window.location.origin);
  };

  return (
    <div className="min-h-screen bg-background hex-bg flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <img
            src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg"
            alt="XPS"
            className="w-12 h-12 object-contain"
          />
          <div>
            <div className="text-lg font-extrabold metallic-gold tracking-wider">XPS INTELLIGENCE</div>
            <div className="text-[9px] text-muted-foreground tracking-widest">CONTRACTOR ASSIST</div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="w-14 h-14 rounded-xl bg-orange-500/10 flex items-center justify-center mx-auto">
            <Shield className="w-7 h-7 text-orange-400" />
          </div>

          <h1 className="text-xl font-bold text-foreground">Access Required</h1>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Your account has not been registered for this app. All users must be invited by an administrator through the Admin Control panel.
          </p>

          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 text-left space-y-2">
            <p className="text-xs text-muted-foreground font-medium">To get access:</p>
            <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
              <li>Contact the XPS admin at <span className="text-primary font-medium">jeremy@shopxps.com</span></li>
              <li>Ask to be added via the Admin Control panel</li>
              <li>Once invited, sign back in here</li>
            </ul>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-colors border border-border"
          >
            <LogOut className="w-4 h-4" /> Sign Out & Try Different Account
          </button>
        </div>
      </div>
    </div>
  );
}