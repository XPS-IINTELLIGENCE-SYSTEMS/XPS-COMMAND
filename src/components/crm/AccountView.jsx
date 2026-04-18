import { useState, useEffect } from "react";
import { User, LogOut, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

export default function AccountView({ theme, onThemeToggle }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  if (!user) return (
    <div className="max-w-md mx-auto py-20 text-center">
      <h2 className="text-xl font-bold text-foreground mb-2">My Account</h2>
      <div className="rounded-xl border border-border bg-card p-8">
        <h3 className="text-lg font-bold text-foreground mb-2">Create or Sign In</h3>
        <p className="text-sm text-muted-foreground mb-5">Create an account or sign in to unlock all features.</p>
        <Button onClick={() => base44.auth.redirectToLogin()} className="w-full metallic-gold-bg text-background hover:brightness-110 py-3 text-base font-bold">
          Create Account / Sign In
        </Button>
      </div>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto py-10">
      <h2 className="text-xl font-bold text-foreground mb-6">My Account</h2>

      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center">
            <User className="w-7 h-7 text-primary" />
          </div>
          <div>
            <div className="text-lg font-bold text-foreground">{user.full_name || "User"}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Role: {user.role || "user"}</div>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-foreground">Theme</span>
            <Button variant="outline" size="sm" onClick={onThemeToggle} className="gap-2">
              {theme === "dark" ? <><Sun className="w-3.5 h-3.5" /> Light</> : <><Moon className="w-3.5 h-3.5" /> Dark</>}
            </Button>
          </div>
        </div>

        <Button variant="outline" className="w-full text-destructive border-destructive/30 hover:bg-destructive/10 gap-2" onClick={() => base44.auth.logout()}>
          <LogOut className="w-4 h-4" /> Sign Out
        </Button>
      </div>
    </div>
  );
}