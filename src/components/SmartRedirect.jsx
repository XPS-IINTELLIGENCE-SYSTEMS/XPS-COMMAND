import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";

/**
 * SmartRedirect — routes authenticated users to the right dashboard
 * based on whether they've completed onboarding and their role.
 */
export default function SmartRedirect() {
  const { user } = useAuth();
  const [target, setTarget] = useState(null);

  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        // Admin users always go to owner dashboard
        if (user.role === "admin") {
          setTarget("/owner-dashboard");
          return;
        }

        // Try to find profile — check all profiles and match by email
        const allProfiles = await base44.entities.UserProfile.list("-created_date", 50);
        const profile = allProfiles.find(
          p => p.user_email === user.email || p.created_by === user.email
        );

        if (!profile) {
          setTarget("/onboarding");
          return;
        }

        // Route by title
        const title = (profile.title || "").toLowerCase();
        if (title.includes("owner")) {
          setTarget("/owner-dashboard");
        } else if (title.includes("admin")) {
          setTarget("/admin-dashboard");
        } else if (title.includes("manager")) {
          setTarget("/manager-dashboard");
        } else {
          setTarget("/dashboard");
        }
      } catch {
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