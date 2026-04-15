import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";

/**
 * Hook that resolves the user's XPS role from their UserProfile.
 * Returns { xpsRole, profile, loading }
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
        let profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
        // Fallback: match by created_by
        if (profiles.length === 0) {
          const allProfiles = await base44.entities.UserProfile.list();
          profiles = allProfiles.filter(
            (p) => p.user_email === user.email || p.created_by === user.email
          );
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
          // No profile yet — fall back to Base44 role
          if (user.role === "admin") setXpsRole("owner");
          else setXpsRole("team_member");
        }
      } catch {
        // Fallback
        if (user.role === "admin") setXpsRole("owner");
        else setXpsRole("team_member");
      }
      setLoading(false);
    })();
  }, [user]);

  return { xpsRole, profile, loading, user };
}