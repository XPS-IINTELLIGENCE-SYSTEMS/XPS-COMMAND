import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";

/**
 * SmartRedirect — routes authenticated users to the right dashboard
 * based on whether they've completed onboarding and their role.
 * 
 * Used for:
 * - "/" when authenticated (send to dashboard instead of landing)
 * - Post-auth redirect (after sign-in or sign-up)
 */
export default function SmartRedirect() {
  const { user } = useAuth();
  const [target, setTarget] = useState(null);

  useEffect(() => {
    if (!user) return;

    (async () => {
      // Check if user has completed onboarding
      let hasProfile = false;
      try {
        const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
        hasProfile = profiles.length > 0;

        if (!hasProfile) {
          // No profile — send to onboarding
          setTarget("/onboarding");
          return;
        }

        // Has profile — route by role
        const profile = profiles[0];
        const title = (profile.title || "").toLowerCase();

        if (title.includes("owner") || user.role === "admin") {
          setTarget("/owner-dashboard");
        } else if (title.includes("admin")) {
          setTarget("/admin-dashboard");
        } else if (title.includes("manager")) {
          setTarget("/manager-dashboard");
        } else {
          setTarget("/dashboard");
        }
      } catch {
        // Fallback — send to main dashboard
        setTarget("/dashboard");
      }
    })();
  }, [user]);

  if (!target) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-3" style={{ backgroundColor: 'hsl(240, 10%, 4%)' }}>
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <p className="text-xs text-muted-foreground">Loading your workspace...</p>
      </div>
    );
  }

  return <Navigate to={target} replace />;
}