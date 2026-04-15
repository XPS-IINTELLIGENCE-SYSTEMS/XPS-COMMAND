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
        // Admin users are always owners
        if (user.role === "admin") {
          setXpsRole("owner");
        }

        // Fetch all profiles and match by email (more reliable than filter)
        const allProfiles = await base44.entities.UserProfile.list("-created_date", 50);
        const p = allProfiles.find(
          prof => prof.user_email === user.email || prof.created_by === user.email
        );

        if (p) {
          setProfile(p);
          const t = (p.title || "").toLowerCase();
          if (t.includes("owner")) setXpsRole("owner");
          else if (t.includes("admin")) setXpsRole("admin");
          else if (t.includes("manager")) setXpsRole("manager");
          else setXpsRole("team_member");
        } else if (!user.role || user.role !== "admin") {
          // No profile and not admin
          setXpsRole("team_member");
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