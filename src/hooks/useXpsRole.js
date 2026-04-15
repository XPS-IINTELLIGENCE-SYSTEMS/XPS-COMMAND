import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";

/**
 * Hook that resolves the user's XPS role from their UserProfile.
 * Returns { xpsRole, profile, loading, user }
 * xpsRole is one of: "owner", "manager", "admin", "team_member"
 */
export default function useXpsRole() {
  const { user } = useAuth();
  const [xpsRole, setXpsRole] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        // Try to find profile by user_email
        let profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
        
        // Fallback: search by created_by
        if (profiles.length === 0) {
          profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
        }

        if (profiles.length > 0) {
          const p = profiles[0];
          setProfile(p);
          const t = (p.title || "").toLowerCase();
          if (t.includes("owner")) setXpsRole("owner");
          else if (t.includes("admin")) setXpsRole("admin");
          else if (t.includes("manager")) setXpsRole("manager");
          else setXpsRole("team_member");
        } else {
          // No profile — use Base44 role as fallback
          if (user.role === "admin") setXpsRole("owner");
          else setXpsRole("team_member");
        }
      } catch {
        if (user.role === "admin") setXpsRole("owner");
        else setXpsRole("team_member");
      }
      setLoading(false);
    })();
  }, [user]);

  return { xpsRole, profile, loading, user };
}